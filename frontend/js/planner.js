/**
 * AKS Arc Planner - Client-side deployment planning logic
 */

class AKSArcPlanner {
    constructor(catalog) {
        this.catalog = catalog;
    }

    /**
     * Create a deployment plan based on workload requirements
     */
    createPlan(config) {
        const {
            workloadType,
            clusterName,
            resourceGroup,
            location,
            customLocation,
            cpuCores,
            memoryGb,
            gpuRequired,
            gpuCount,
            enableRackAwareness,
            rackCount
        } = config;

        // Select Kubernetes version
        const k8sVersion = this.catalog.kubernetes_versions[0];

        // Determine control plane count
        const controlPlaneCount = cpuCores >= 16 ? 3 : 1;

        // Plan node pools
        const nodePools = this.planNodePools({
            cpuCores,
            memoryGb,
            gpuRequired,
            gpuCount,
            workloadType
        });

        // Generate rack topology if enabled
        const rackTopology = enableRackAwareness && rackCount 
            ? this.generateRackTopology(rackCount, nodePools)
            : null;

        // Validate the plan
        const validation = this.validatePlan({
            controlPlaneCount,
            nodePools,
            rackCount
        });

        return {
            clusterConfig: {
                clusterName,
                resourceGroup,
                location,
                customLocation,
                kubernetesVersion: k8sVersion,
                controlPlaneCount,
                nodePools,
                enableRackAwareness,
                rackCount,
                networkPlugin: 'azure',
                loadBalancerSku: 'Standard'
            },
            rackTopology,
            validation,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Plan node pools based on workload requirements
     */
    planNodePools(requirements) {
        const { cpuCores, memoryGb, gpuRequired, gpuCount, workloadType } = requirements;
        const nodePools = [];

        // Select VM SKU based on requirements
        const vmSkus = gpuRequired 
            ? this.catalog.vm_skus.gpu 
            : this.catalog.vm_skus.general_purpose;

        const vmSize = this.selectVmSku(vmSkus, cpuCores, memoryGb);
        const nodeCount = this.calculateNodeCount(cpuCores, memoryGb, vmSize);

        // Create primary node pool
        nodePools.push({
            name: 'nodepool1',
            vmSize: vmSize.name,
            nodeCount: Math.max(3, nodeCount),
            osType: 'Linux',
            mode: 'System',
            labels: {
                workload: workloadType || 'general-purpose'
            },
            enableAutoScaling: true,
            minCount: 1,
            maxCount: Math.max(3, nodeCount) * 2,
            maxPods: 110
        });

        // Add GPU pool if needed
        if (gpuRequired && gpuCount > 0) {
            const gpuSku = this.catalog.vm_skus.gpu[0];
            nodePools.push({
                name: 'gpupool',
                vmSize: gpuSku.name,
                nodeCount: Math.max(1, gpuCount),
                osType: 'Linux',
                mode: 'User',
                labels: {
                    workload: 'gpu',
                    gpu: 'true'
                },
                taints: ['nvidia.com/gpu=present:NoSchedule'],
                enableAutoScaling: false,
                maxPods: 110
            });
        }

        return nodePools;
    }

    /**
     * Select appropriate VM SKU
     */
    selectVmSku(skus, cpuCores, memoryGb) {
        // Sort by resources
        const sorted = [...skus].sort((a, b) => {
            if (a.vcpus !== b.vcpus) return a.vcpus - b.vcpus;
            return a.memory_gb - b.memory_gb;
        });

        // Find first SKU that fits
        for (const sku of sorted) {
            if (sku.vcpus >= cpuCores && sku.memory_gb >= memoryGb) {
                return sku;
            }
        }

        // Return largest if none fit
        return sorted[sorted.length - 1];
    }

    /**
     * Calculate required node count
     */
    calculateNodeCount(cpuCores, memoryGb, vmSize) {
        const cpuNodes = Math.ceil(cpuCores / vmSize.vcpus);
        const memNodes = Math.ceil(memoryGb / vmSize.memory_gb);
        return Math.max(cpuNodes, memNodes);
    }

    /**
     * Generate rack-aware topology
     */
    generateRackTopology(rackCount, nodePools) {
        const topologies = [];
        
        for (let i = 0; i < rackCount; i++) {
            const rackId = `rack-${i + 1}`;
            const faultDomain = `fd-${i + 1}`;
            
            topologies.push({
                rackId,
                faultDomain,
                nodeLabels: {
                    'topology.kubernetes.io/zone': faultDomain,
                    'rack': rackId
                },
                spreadConstraints: [
                    {
                        maxSkew: 1,
                        topologyKey: 'topology.kubernetes.io/zone',
                        whenUnsatisfiable: 'DoNotSchedule'
                    }
                ]
            });
        }
        
        return topologies;
    }

    /**
     * Validate deployment plan
     */
    validatePlan(plan) {
        const errors = [];
        const warnings = [];
        const recommendations = [];

        const limits = this.catalog.limits;

        // Validate control plane count
        if (!limits.control_plane_options.includes(plan.controlPlaneCount)) {
            errors.push(
                `Control plane count must be one of ${limits.control_plane_options.join(', ')}`
            );
        }

        // Validate node pool limits
        const totalNodes = plan.nodePools.reduce((sum, pool) => sum + pool.nodeCount, 0);
        
        if (totalNodes > limits.max_nodes_per_cluster) {
            errors.push(
                `Total nodes (${totalNodes}) exceeds maximum (${limits.max_nodes_per_cluster})`
            );
        }

        // Check pool count
        if (plan.nodePools.length > limits.max_pools_per_cluster) {
            errors.push(
                `Number of pools (${plan.nodePools.length}) exceeds maximum (${limits.max_pools_per_cluster})`
            );
        }

        // Recommendations
        if (plan.controlPlaneCount === 1) {
            warnings.push('Single control plane node is not recommended for production');
        }

        if (plan.rackCount && plan.rackCount < 3) {
            recommendations.push('Consider using at least 3 racks for better fault tolerance');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            recommendations
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AKSArcPlanner;
}
