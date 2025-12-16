"""
ARM template generator for AKS Arc deployments
"""

import json
from typing import Dict
from src.models import DeploymentPlan


class ARMGenerator:
    """Generate ARM (Azure Resource Manager) templates for AKS Arc clusters"""
    
    def generate(self, plan: DeploymentPlan) -> str:
        """
        Generate an ARM template from deployment plan.
        
        Args:
            plan: Deployment plan with cluster configuration
            
        Returns:
            ARM template as JSON string
        """
        cluster = plan.cluster_config
        
        template = {
            "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
            "contentVersion": "1.0.0.0",
            "metadata": {
                "_generator": {
                    "name": "AKS Arc Deployment Tool",
                    "version": "0.1.0"
                }
            },
            "parameters": {
                "clusterName": {
                    "type": "string",
                    "defaultValue": cluster.cluster_name,
                    "metadata": {
                        "description": "Name of the AKS Arc cluster"
                    }
                },
                "location": {
                    "type": "string",
                    "defaultValue": cluster.location,
                    "metadata": {
                        "description": "Azure region"
                    }
                },
                "kubernetesVersion": {
                    "type": "string",
                    "defaultValue": cluster.kubernetes_version,
                    "metadata": {
                        "description": "Kubernetes version"
                    }
                }
            },
            "variables": {},
            "resources": [
                {
                    "type": "Microsoft.Kubernetes/connectedClusters",
                    "apiVersion": "2024-01-01",
                    "name": "[parameters('clusterName')]",
                    "location": "[parameters('location')]",
                    "properties": {
                        "agentPublicKeyCertificate": ""
                    }
                }
            ],
            "outputs": {
                "clusterName": {
                    "type": "string",
                    "value": "[parameters('clusterName')]"
                },
                "clusterId": {
                    "type": "string",
                    "value": "[resourceId('Microsoft.Kubernetes/connectedClusters', parameters('clusterName'))]"
                }
            }
        }
        
        # Add node pools as resources
        for i, pool in enumerate(cluster.node_pools):
            pool_resource = {
                "type": "Microsoft.ContainerService/managedClusters/agentPools",
                "apiVersion": "2024-01-01",
                "name": f"[concat(parameters('clusterName'), '/{pool.name}')]",
                "properties": {
                    "count": pool.node_count,
                    "vmSize": pool.vm_size,
                    "osType": pool.os_type.value.capitalize(),
                    "mode": "System" if i == 0 else "User",
                    "enableAutoScaling": pool.enable_auto_scaling,
                    "minCount": pool.min_count if pool.min_count else pool.node_count,
                    "maxCount": pool.max_count if pool.max_count else pool.node_count,
                    "maxPods": pool.max_pods,
                    "nodeLabels": pool.labels
                },
                "dependsOn": [
                    "[resourceId('Microsoft.Kubernetes/connectedClusters', parameters('clusterName'))]"
                ]
            }
            
            if pool.taints:
                pool_resource["properties"]["nodeTaints"] = pool.taints
            
            template["resources"].append(pool_resource)
        
        return json.dumps(template, indent=2)
