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
            environment,
            clusterName,
            resourceGroup,
            location,
            customLocation,
            cpuCores,
            memoryGb,
            gpuRequired,
            gpuCount,
            enableAvailabilitySets,
            physicalHostCount,
            enableDefender,
            enablePolicy,
            controlPlaneCountOverride,
            minNodesOverride,
            maxNodesOverride,
            enableAutoScaling,
            enableMonitoring,
            backupEnabled
        } = config;

        // Select Kubernetes version
        const k8sVersion = this.catalog.kubernetes_versions[0];

        // Determine control plane count (use override if provided)
        const controlPlaneCount = controlPlaneCountOverride || (cpuCores >= 16 ? 3 : 1);

        // Plan node pools
        const nodePools = this.planNodePools({
            cpuCores,
            memoryGb,
            gpuRequired,
            gpuCount,
            workloadType,
            minNodesOverride,
            maxNodesOverride,
            enableAutoScaling
        });

        // Generate availability set configuration (enabled by default in AKS Arc)
        const availabilitySetConfig = this.generateAvailabilitySetConfig(physicalHostCount, nodePools);

        // Validate the plan
        const validation = this.validatePlan({
            controlPlaneCount,
            nodePools,
            physicalHostCount
        });

        return {
            clusterConfig: {
                clusterName,
                resourceGroup,
                location,
                customLocation,
                logicalNetwork: config.logicalNetwork || '',
                azureLocalClusterIP: config.azureLocalClusterIP || '',
                kubernetesVersion: k8sVersion,
                controlPlaneCount,
                nodePools,
                enableAvailabilitySets: true, // Always enabled by default in AKS Arc
                physicalHostCount,
                networkPlugin: config.networkPlugin || 'azure',
                loadBalancerSku: config.loadBalancerSku || 'Standard'
            },
            networkConfig: {
                networkPlugin: config.networkPlugin || 'azure',
                podCidr: config.podCidr || '10.244.0.0/16',
                serviceCidr: config.serviceCidr || '10.96.0.0/16',
                dnsServiceIP: config.dnsServiceIP || '10.96.0.10',
                loadBalancerSku: config.loadBalancerSku || 'Standard',
                controlPlaneIP: config.controlPlaneIP || 'Auto-assigned from logical network',
                enableNetworkPolicy: config.enableNetworkPolicy || false,
                enablePrivateCluster: config.enablePrivateCluster || false
            },
            storageConfig: {
                defaultStorageClass: config.defaultStorageClass || 'local-path',
                enableVolumeEncryption: config.enableVolumeEncryption || false,
                enableVolumeSnapshots: config.enableVolumeSnapshots || false,
                storageQuotaGb: config.storageQuotaGb || 100
            },
            identityConfig: {
                rbacMode: config.rbacMode || 'enabled',
                enableWorkloadIdentity: config.enableWorkloadIdentity || false,
                enableAzureAD: config.enableAzureAD || false,
                enablePodSecurityStandards: config.enablePodSecurityStandards || false
            },
            monitoringConfig: {
                enableAzureMonitor: config.enableAzureMonitor || false,
                enablePrometheus: config.enablePrometheus || false,
                logRetentionDays: config.logRetentionDays || 90,
                enableAuditLogs: config.enableAuditLogs || false
            },
            securityConfig: {
                enableDefender: config.enableDefender || false,
                enablePolicy: config.enablePolicy !== false // Default true
            },
            availabilitySetConfig,
            validation,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Plan node pools based on workload requirements
     */
    planNodePools(requirements) {
        const { 
            cpuCores, 
            memoryGb, 
            gpuRequired, 
            gpuCount, 
            workloadType,
            minNodesOverride,
            maxNodesOverride,
            enableAutoScaling 
        } = requirements;
        const nodePools = [];

        // Select VM SKU based on requirements
        const vmSkus = gpuRequired 
            ? this.catalog.vm_skus.gpu 
            : this.catalog.vm_skus.general_purpose;

        const vmSize = this.selectVmSku(vmSkus, cpuCores, memoryGb);
        const nodeCount = this.calculateNodeCount(cpuCores, memoryGb, vmSize);
        
        // Apply environment overrides
        const finalNodeCount = minNodesOverride || Math.max(3, nodeCount);
        const finalMaxNodes = maxNodesOverride || (Math.max(3, nodeCount) * 2);

        // Create primary node pool
        nodePools.push({
            name: 'nodepool1',
            vmSize: vmSize.name,
            nodeCount: finalNodeCount,
            osType: 'Linux',
            mode: 'System',
            labels: {
                workload: workloadType || 'general-purpose'
            },
            enableAutoScaling: enableAutoScaling !== undefined ? enableAutoScaling : true,
            minCount: minNodesOverride || 1,
            maxCount: finalMaxNodes,
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
     * Generate availability set configuration
     * AKS Arc automatically creates availability sets for control plane and each node pool
     * VMs are spread across physical hosts using anti-affinity rules
     */
    generateAvailabilitySetConfig(physicalHostCount, nodePools) {
        const config = {
            enabled: true, // Always enabled by default in AKS Arc
            description: 'Availability sets ensure VMs spread evenly across physical hosts with automatic rebalancing',
            controlPlaneAvailabilitySet: {
                name: 'control-plane-as',
                antiAffinityRule: 'DifferentNode',
                description: 'Control plane VMs distributed across physical hosts'
            },
            nodePoolAvailabilitySets: [],
            podAntiAffinityRecommendation: {
                enabled: true,
                description: 'Use pod anti-affinity rules in workload deployments for additional resilience',
                example: {
                    spec: {
                        affinity: {
                            podAntiAffinity: {
                                preferredDuringSchedulingIgnoredDuringExecution: [
                                    {
                                        weight: 100,
                                        podAffinityTerm: {
                                            labelSelector: {
                                                matchExpressions: [
                                                    {
                                                        key: 'app',
                                                        operator: 'In',
                                                        values: ['your-app']
                                                    }
                                                ]
                                            },
                                            topologyKey: 'kubernetes.io/hostname'
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            physicalHostCount: physicalHostCount || 2,
            faultDomains: physicalHostCount || 2
        };

        // Create availability set config for each node pool
        nodePools.forEach(pool => {
            config.nodePoolAvailabilitySets.push({
                nodePoolName: pool.name,
                availabilitySetName: `${pool.name}-as`,
                antiAffinityRule: 'DifferentNode',
                description: `VMs in ${pool.name} distributed across ${config.faultDomains} physical hosts`
            });
        });
        
        return config;
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

        if (plan.physicalHostCount && plan.physicalHostCount < 3) {
            recommendations.push('Consider using at least 3 physical hosts for better fault tolerance with availability sets');
        }

        recommendations.push('Availability sets are enabled by default - VMs will automatically spread across physical hosts');
        recommendations.push('Use pod anti-affinity rules in your workload deployments for additional resilience');

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
