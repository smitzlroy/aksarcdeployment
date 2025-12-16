"""
Unit tests for template generators
"""

import pytest
from src.catalog import CatalogService
from src.planner import Planner
from src.models import WorkloadRequirements, WorkloadType
from src.generator import BicepGenerator, ARMGenerator, TerraformGenerator


@pytest.fixture
def sample_plan():
    """Create a sample deployment plan for testing"""
    catalog = CatalogService()
    planner = Planner(catalog)
    
    workload = WorkloadRequirements(
        workload_type=WorkloadType.GENERAL_PURPOSE,
        cpu_cores=8,
        memory_gb=32
    )
    
    return planner.create_plan(
        workload=workload,
        cluster_name='test-cluster',
        resource_group='test-rg',
        location='eastus',
        custom_location='test-custom-location'
    )


def test_bicep_generator(sample_plan):
    """Test Bicep template generation"""
    generator = BicepGenerator()
    template = generator.generate(sample_plan)
    
    assert template is not None
    assert 'test-cluster' in template
    assert 'resource' in template
    assert 'nodePool' in template


def test_arm_generator(sample_plan):
    """Test ARM template generation"""
    generator = ARMGenerator()
    template = generator.generate(sample_plan)
    
    assert template is not None
    assert 'test-cluster' in template
    assert '"$schema"' in template
    assert 'Microsoft.Kubernetes' in template


def test_terraform_generator(sample_plan):
    """Test Terraform configuration generation"""
    generator = TerraformGenerator()
    template = generator.generate(sample_plan)
    
    assert template is not None
    assert 'test-cluster' in template
    assert 'azapi_resource' in template
    assert 'terraform' in template
