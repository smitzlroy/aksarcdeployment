"""
Unit tests for planner
"""

import pytest
from src.catalog import CatalogService
from src.planner import Planner
from src.models import WorkloadRequirements, WorkloadType


def test_planner_initialization():
    """Test planner initializes correctly"""
    catalog = CatalogService()
    planner = Planner(catalog)
    assert planner is not None


def test_create_basic_plan():
    """Test creating a basic deployment plan"""
    catalog = CatalogService()
    planner = Planner(catalog)
    
    workload = WorkloadRequirements(
        workload_type=WorkloadType.GENERAL_PURPOSE,
        cpu_cores=8,
        memory_gb=32,
        gpu_required=False
    )
    
    plan = planner.create_plan(
        workload=workload,
        cluster_name='test-cluster',
        resource_group='test-rg',
        location='eastus',
        custom_location='test-custom-location'
    )
    
    assert plan is not None
    assert plan.cluster_config.cluster_name == 'test-cluster'
    assert len(plan.cluster_config.node_pools) > 0


def test_gpu_workload_plan():
    """Test creating plan with GPU requirements"""
    catalog = CatalogService()
    planner = Planner(catalog)
    
    workload = WorkloadRequirements(
        workload_type=WorkloadType.AI_INFERENCE,
        cpu_cores=16,
        memory_gb=64,
        gpu_required=True,
        gpu_count=2
    )
    
    plan = planner.create_plan(
        workload=workload,
        cluster_name='gpu-cluster',
        resource_group='test-rg',
        location='eastus',
        custom_location='test-custom-location'
    )
    
    assert plan is not None
    # Should have at least 2 pools (general + GPU)
    assert len(plan.cluster_config.node_pools) >= 2


def test_plan_validation():
    """Test plan validation"""
    catalog = CatalogService()
    planner = Planner(catalog)
    
    workload = WorkloadRequirements(
        workload_type=WorkloadType.GENERAL_PURPOSE,
        cpu_cores=4,
        memory_gb=16
    )
    
    plan = planner.create_plan(
        workload=workload,
        cluster_name='test-cluster',
        resource_group='test-rg',
        location='eastus',
        custom_location='test-custom-location'
    )
    
    assert plan.validation_result is not None
    assert isinstance(plan.validation_result.is_valid, bool)
