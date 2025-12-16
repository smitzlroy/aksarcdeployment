"""
Data models for AKS Arc deployment configurations
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional
from enum import Enum


class WorkloadType(str, Enum):
    """Workload archetype presets"""
    VIDEO_ANALYTICS = "video-analytics"
    AI_INFERENCE = "ai-inference"
    GENERAL_PURPOSE = "general-purpose"
    CUSTOM = "custom"


class ClusterSize(str, Enum):
    """Predefined cluster size options"""
    SMALL = "small"
    MEDIUM = "medium"
    LARGE = "large"
    CUSTOM = "custom"


class OSType(str, Enum):
    """Operating system types"""
    LINUX = "linux"
    WINDOWS = "windows"


class ExportFormat(str, Enum):
    """Export template formats"""
    BICEP = "bicep"
    ARM = "arm"
    TERRAFORM = "terraform"


@dataclass
class WorkloadRequirements:
    """Workload resource requirements"""
    workload_type: WorkloadType
    cpu_cores: int = 0
    memory_gb: int = 0
    gpu_required: bool = False
    gpu_count: int = 0
    storage_gb: int = 0
    cameras: Optional[int] = None
    fps: Optional[int] = None
    retention_days: Optional[int] = None
    description: Optional[str] = None


@dataclass
class NodePoolConfig:
    """Configuration for a node pool"""
    name: str
    vm_size: str
    node_count: int
    os_type: OSType
    labels: Dict[str, str] = field(default_factory=dict)
    taints: List[str] = field(default_factory=list)
    zones: List[str] = field(default_factory=list)
    max_pods: int = 110
    enable_auto_scaling: bool = False
    min_count: Optional[int] = None
    max_count: Optional[int] = None


@dataclass
class ClusterConfig:
    """AKS Arc cluster configuration"""
    cluster_name: str
    resource_group: str
    location: str
    custom_location: str
    kubernetes_version: str
    control_plane_count: int = 1  # 1, 3, or 5
    node_pools: List[NodePoolConfig] = field(default_factory=list)
    enable_rack_awareness: bool = True
    rack_count: Optional[int] = None
    tags: Dict[str, str] = field(default_factory=dict)
    network_plugin: str = "azure"
    load_balancer_sku: str = "Standard"


@dataclass
class RackTopology:
    """Rack-aware topology configuration"""
    rack_id: str
    fault_domain: str
    node_labels: Dict[str, str] = field(default_factory=dict)
    spread_constraints: List[Dict[str, str]] = field(default_factory=list)


@dataclass
class ValidationResult:
    """Result from validation checks"""
    is_valid: bool
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)


@dataclass
class DeploymentPlan:
    """Complete deployment plan"""
    cluster_config: ClusterConfig
    workload_requirements: WorkloadRequirements
    rack_topology: Optional[List[RackTopology]] = None
    validation_result: Optional[ValidationResult] = None
    estimated_cost: Optional[float] = None
    rationale: Optional[str] = None
