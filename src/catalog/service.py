"""
Catalog service for AKS versions, OS images, and VM SKUs
"""

import os
import yaml
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class CatalogService:
    """
    Manages catalog of AKS versions, OS images, VM SKUs, and limits.
    Supports refresh from Azure APIs and local cache fallback.
    """
    
    def __init__(self, catalog_path: Optional[str] = None):
        """Initialize catalog service with optional custom path"""
        if catalog_path is None:
            catalog_path = Path(__file__).parent.parent.parent / "catalog" / "skus.yaml"
        self.catalog_path = Path(catalog_path)
        self.catalog_data: Optional[Dict] = None
        self.last_refresh: Optional[datetime] = None
        self._load_catalog()
    
    def _load_catalog(self) -> None:
        """Load catalog from YAML file"""
        try:
            if self.catalog_path.exists():
                with open(self.catalog_path, 'r') as f:
                    self.catalog_data = yaml.safe_load(f)
                    if self.catalog_data and 'metadata' in self.catalog_data:
                        last_updated_str = self.catalog_data['metadata'].get('last_updated')
                        if last_updated_str:
                            self.last_refresh = datetime.fromisoformat(last_updated_str)
                logger.info(f"Loaded catalog from {self.catalog_path}")
            else:
                logger.warning(f"Catalog file not found at {self.catalog_path}")
                self.catalog_data = self._default_catalog()
                self._save_catalog()
        except Exception as e:
            logger.error(f"Error loading catalog: {e}")
            self.catalog_data = self._default_catalog()
    
    def _save_catalog(self) -> None:
        """Save catalog to YAML file"""
        try:
            self.catalog_path.parent.mkdir(parents=True, exist_ok=True)
            with open(self.catalog_path, 'w') as f:
                yaml.dump(self.catalog_data, f, default_flow_style=False)
            logger.info(f"Saved catalog to {self.catalog_path}")
        except Exception as e:
            logger.error(f"Error saving catalog: {e}")
    
    def _default_catalog(self) -> Dict:
        """Return default catalog structure for Azure Local 2511"""
        return {
            'metadata': {
                'version': '1.0',
                'last_updated': datetime.now().isoformat(),
                'target': 'Azure Local 2511'
            },
            'kubernetes_versions': [
                '1.29.2',
                '1.28.5',
                '1.27.9'
            ],
            'os_images': {
                'linux': [
                    {'name': 'Azure Linux 2.0', 'version': '2.0.20240101'},
                    {'name': 'Ubuntu 22.04', 'version': '22.04.202401'}
                ],
                'windows': [
                    {'name': 'Windows Server 2022', 'version': '20348.2227'},
                    {'name': 'Windows Server 2019', 'version': '17763.5329'}
                ]
            },
            'vm_skus': {
                'general_purpose': [
                    {'name': 'Standard_D4s_v5', 'vcpus': 4, 'memory_gb': 16, 'gpu': False},
                    {'name': 'Standard_D8s_v5', 'vcpus': 8, 'memory_gb': 32, 'gpu': False},
                    {'name': 'Standard_D16s_v5', 'vcpus': 16, 'memory_gb': 64, 'gpu': False}
                ],
                'gpu': [
                    {'name': 'Standard_NC4as_T4_v3', 'vcpus': 4, 'memory_gb': 28, 'gpu': True, 'gpu_model': 'T4'},
                    {'name': 'Standard_NC8as_T4_v3', 'vcpus': 8, 'memory_gb': 56, 'gpu': True, 'gpu_model': 'T4'}
                ]
            },
            'limits': {
                'control_plane_options': [1, 3, 5],
                'max_nodes_per_pool': 100,
                'max_pools_per_cluster': 10,
                'max_nodes_per_cluster': 1000,
                'max_racks': 16,
                'min_nodes_per_rack': 1
            }
        }
    
    def get_kubernetes_versions(self) -> List[str]:
        """Get list of supported Kubernetes versions"""
        if self.catalog_data:
            return self.catalog_data.get('kubernetes_versions', [])
        return []
    
    def get_os_images(self, os_type: str = 'linux') -> List[Dict]:
        """Get list of OS images for specified OS type"""
        if self.catalog_data and 'os_images' in self.catalog_data:
            return self.catalog_data['os_images'].get(os_type, [])
        return []
    
    def get_vm_skus(self, category: str = 'general_purpose') -> List[Dict]:
        """Get list of VM SKUs for specified category"""
        if self.catalog_data and 'vm_skus' in self.catalog_data:
            return self.catalog_data['vm_skus'].get(category, [])
        return []
    
    def get_limits(self) -> Dict:
        """Get Azure Local 2511 limits"""
        if self.catalog_data:
            return self.catalog_data.get('limits', {})
        return {}
    
    def is_outdated(self, days: int = 30) -> bool:
        """Check if catalog is older than specified days"""
        if self.last_refresh is None:
            return True
        age = datetime.now() - self.last_refresh
        return age > timedelta(days=days)
    
    def refresh(self) -> bool:
        """
        Refresh catalog from Azure APIs.
        TODO: Implement actual Azure API calls
        """
        try:
            # Placeholder for Azure API integration
            # In production, this would call Azure CLI or SDK to get latest data
            logger.info("Refreshing catalog from Azure APIs...")
            
            # For now, just update the timestamp
            if self.catalog_data and 'metadata' in self.catalog_data:
                self.catalog_data['metadata']['last_updated'] = datetime.now().isoformat()
                self.last_refresh = datetime.now()
                self._save_catalog()
                return True
            
            return False
        except Exception as e:
            logger.error(f"Error refreshing catalog: {e}")
            return False
    
    def get_catalog_info(self) -> Dict:
        """Get catalog metadata and status"""
        return {
            'last_updated': self.last_refresh.isoformat() if self.last_refresh else None,
            'is_outdated': self.is_outdated(),
            'version': self.catalog_data.get('metadata', {}).get('version') if self.catalog_data else None,
            'target': self.catalog_data.get('metadata', {}).get('target') if self.catalog_data else None
        }
