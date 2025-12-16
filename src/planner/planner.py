"""
Planner module - rack-aware deployment planning
"""

from typing import Dict, List, Optional
import logging
from src.catalog import CatalogService
from src.models import (
    WorkloadRequirements, ClusterConfig, NodePoolConfig,
    DeploymentPlan, ValidationResult, RackTopology, OSType
)

logger = logging.getLogger(__name__)


class Planner:
    """
    Plans AKS Arc deployments with rack-aware topology.
    Handles bin-packing, node placement, and topology constraints.
    """
    
    def __init__(self, catalog_service: CatalogService):
        self.catalog = catalog_service
    
    def create_plan(
        self,
        workload: WorkloadRequirements,
        cluster_name: str,
        resource_group: str,
        location: str,
        custom_location: str,
        enable_rack_awareness: bool = True,
        rack_count: Optional[int] = None
    ) -> DeploymentPlan:
        """
        Create a deployment plan based on workload requirements.
        
        Args:
            workload: Workload resource requirements
            cluster_name: Name of the AKS cluster
            resource_group: Azure resource group
            location: Azure region
            custom_location: Azure Arc custom location
            enable_rack_awareness: Enable rack-aware placement
            rack_count: Number of racks available
            
        Returns:
            DeploymentPlan with cluster configuration and validation
        """
        logger.info(f"Creating deployment plan for {workload.workload_type}")
        
        # Get latest Kubernetes version
        k8s_versions = self.catalog.get_kubernetes_versions()
        k8s_version = k8s_versions[0] if k8s_versions else '1.29.2'
        
        # Determine control plane count (1 for dev, 3 for prod)
        control_plane_count = 3 if workload.cpu_cores >= 16 else 1
        
        # Create cluster configuration
        cluster_config = ClusterConfig(
            cluster_name=cluster_name,
            resource_group=resource_group,
            location=location,
            custom_location=custom_location,
            kubernetes_version=k8s_version,
            control_plane_count=control_plane_count,
            enable_rack_awareness=enable_rack_awareness,
            rack_count=rack_count
        )
        
        # Plan node pools based on workload
        node_pools = self._plan_node_pools(workload)
        cluster_config.node_pools = node_pools
        
        # Generate rack topology if enabled
        rack_topology = None
        if enable_rack_awareness and rack_count:
            rack_topology = self._generate_rack_topology(rack_count, node_pools)
        
        # Validate the plan
        validation = self._validate_plan(cluster_config, workload)
        
        # Create deployment plan
        plan = DeploymentPlan(
            cluster_config=cluster_config,
            workload_requirements=workload,
            rack_topology=rack_topology,
            validation_result=validation
        )
        
        return plan
    
    def _plan_node_pools(self, workload: WorkloadRequirements) -> List[NodePoolConfig]:
        """Plan node pools based on workload requirements"""
        node_pools = []
        
        # Determine VM SKU based on requirements
        if workload.gpu_required:
            vm_skus = self.catalog.get_vm_skus('gpu')
            vm_size = self._select_vm_sku(vm_skus, workload.cpu_cores, workload.memory_gb)
        else:
            vm_skus = self.catalog.get_vm_skus('general_purpose')
            vm_size = self._select_vm_sku(vm_skus, workload.cpu_cores, workload.memory_gb)
        
        # Calculate node count (simple bin-packing)
        node_count = max(3, self._calculate_node_count(workload, vm_size))
        
        # Create Linux node pool
        linux_pool = NodePoolConfig(
            name='nodepool1',
            vm_size=vm_size,
            node_count=node_count,
            os_type=OSType.LINUX,
            labels={'workload': workload.workload_type.value},
            enable_auto_scaling=True,
            min_count=1,
            max_count=node_count * 2
        )
        node_pools.append(linux_pool)
        
        # Add GPU pool if needed
        if workload.gpu_required:
            gpu_vm_skus = self.catalog.get_vm_skus('gpu')
            gpu_vm_size = gpu_vm_skus[0]['name'] if gpu_vm_skus else 'Standard_NC4as_T4_v3'
            
            gpu_pool = NodePoolConfig(
                name='gpupool',
                vm_size=gpu_vm_size,
                node_count=max(1, workload.gpu_count),
                os_type=OSType.LINUX,
                labels={'workload': 'gpu', 'gpu': 'true'},
                taints=['nvidia.com/gpu=present:NoSchedule']
            )
            node_pools.append(gpu_pool)
        
        return node_pools
    
    def _select_vm_sku(self, vm_skus: List[Dict], cpu_cores: int, memory_gb: int) -> str:
        """Select appropriate VM SKU based on requirements"""
        for sku in sorted(vm_skus, key=lambda x: (x['vcpus'], x['memory_gb'])):
            if sku['vcpus'] >= cpu_cores and sku['memory_gb'] >= memory_gb:
                return sku['name']
        
        # Return largest if none fit
        return vm_skus[-1]['name'] if vm_skus else 'Standard_D4s_v5'
    
    def _calculate_node_count(self, workload: WorkloadRequirements, vm_size: str) -> int:
        """Calculate required node count"""
        # Simple calculation - in production, this would be more sophisticated
        if workload.cpu_cores <= 8:
            return 3
        elif workload.cpu_cores <= 32:
            return 5
        else:
            return 10
    
    def _generate_rack_topology(
        self,
        rack_count: int,
        node_pools: List[NodePoolConfig]
    ) -> List[RackTopology]:
        """Generate rack-aware topology configuration"""
        topologies = []
        
        for i in range(rack_count):
            rack_id = f"rack-{i+1}"
            fault_domain = f"fd-{i+1}"
            
            topology = RackTopology(
                rack_id=rack_id,
                fault_domain=fault_domain,
                node_labels={
                    'topology.kubernetes.io/zone': fault_domain,
                    'rack': rack_id
                },
                spread_constraints=[
                    {
                        'maxSkew': '1',
                        'topologyKey': 'topology.kubernetes.io/zone',
                        'whenUnsatisfiable': 'DoNotSchedule'
                    }
                ]
            )
            topologies.append(topology)
        
        return topologies
    
    def _validate_plan(
        self,
        cluster_config: ClusterConfig,
        workload: WorkloadRequirements
    ) -> ValidationResult:
        """Validate the deployment plan against Azure Local 2511 limits"""
        errors = []
        warnings = []
        recommendations = []
        
        limits = self.catalog.get_limits()
        
        # Validate control plane count
        valid_control_plane_counts = limits.get('control_plane_options', [1, 3, 5])
        if cluster_config.control_plane_count not in valid_control_plane_counts:
            errors.append(
                f"Control plane count must be one of {valid_control_plane_counts}"
            )
        
        # Validate node pool limits
        total_nodes = sum(pool.node_count for pool in cluster_config.node_pools)
        max_nodes = limits.get('max_nodes_per_cluster', 1000)
        
        if total_nodes > max_nodes:
            errors.append(
                f"Total nodes ({total_nodes}) exceeds maximum ({max_nodes})"
            )
        
        # Check pool count
        max_pools = limits.get('max_pools_per_cluster', 10)
        if len(cluster_config.node_pools) > max_pools:
            errors.append(
                f"Number of pools ({len(cluster_config.node_pools)}) exceeds maximum ({max_pools})"
            )
        
        # Recommendations for rack awareness
        if not cluster_config.enable_rack_awareness:
            recommendations.append(
                "Consider enabling rack awareness for better fault tolerance"
            )
        
        if cluster_config.control_plane_count == 1:
            warnings.append(
                "Single control plane node is not recommended for production"
            )
        
        is_valid = len(errors) == 0
        
        return ValidationResult(
            is_valid=is_valid,
            errors=errors,
            warnings=warnings,
            recommendations=recommendations
        )
