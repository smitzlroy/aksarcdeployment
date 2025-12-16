"""
Unit tests for catalog service
"""

import pytest
from pathlib import Path
from src.catalog import CatalogService


def test_catalog_initialization():
    """Test catalog service initializes correctly"""
    catalog = CatalogService()
    assert catalog is not None
    assert catalog.catalog_data is not None


def test_get_kubernetes_versions():
    """Test getting Kubernetes versions"""
    catalog = CatalogService()
    versions = catalog.get_kubernetes_versions()
    assert len(versions) > 0
    assert '1.29.2' in versions


def test_get_os_images():
    """Test getting OS images"""
    catalog = CatalogService()
    
    linux_images = catalog.get_os_images('linux')
    assert len(linux_images) > 0
    
    windows_images = catalog.get_os_images('windows')
    assert len(windows_images) > 0


def test_get_vm_skus():
    """Test getting VM SKUs"""
    catalog = CatalogService()
    
    general_skus = catalog.get_vm_skus('general_purpose')
    assert len(general_skus) > 0
    
    gpu_skus = catalog.get_vm_skus('gpu')
    assert len(gpu_skus) > 0


def test_get_limits():
    """Test getting limits"""
    catalog = CatalogService()
    limits = catalog.get_limits()
    assert 'control_plane_options' in limits
    assert 'max_nodes_per_cluster' in limits


def test_catalog_info():
    """Test getting catalog info"""
    catalog = CatalogService()
    info = catalog.get_catalog_info()
    assert 'last_updated' in info
    assert 'is_outdated' in info
    assert 'version' in info
