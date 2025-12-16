/**
 * Enhanced Compliance Analysis Module
 * Provides detailed compliance gap analysis, category scoring, and interactive matrix
 */

class ComplianceAnalyzer {
    constructor(catalog) {
        this.catalog = catalog;
        
        // Security categories with point allocations
        this.categories = {
            'network-security': {
                name: 'Network Security',
                maxPoints: 25,
                checks: ['availability-sets', 'network-policies', 'network-segmentation']
            },
            'identity-access': {
                name: 'Identity & Access',
                maxPoints: 20,
                checks: ['rbac']
            },
            'data-protection': {
                name: 'Data Protection',
                maxPoints: 25,
                checks: ['encryption-at-rest', 'backup']
            },
            'monitoring-compliance': {
                name: 'Monitoring & Compliance',
                maxPoints: 20,
                checks: ['monitoring', 'audit-logging']
            },
            'workload-protection': {
                name: 'Workload Protection',
                maxPoints: 10,
                checks: ['ha-control-plane', 'auto-scaling', 'min-nodes']
            }
        };
        
        // Control mappings: security check → regulatory controls
        this.controlMappings = {
            'ha-control-plane': {
                'ISO 27001': ['A.17.1.1', 'A.17.1.2'],
                'PCI-DSS': ['2.2', '10.5'],
                'NIST CSF': ['PR.IP-9', 'PR.PT-5'],
                'NERC CIP': ['CIP-002-5.1', 'CIP-007-6']
            },
            'availability-sets': {
                'ISO 27001': ['A.17.2.1'],
                'NERC CIP': ['CIP-009-6'],
                'IEC 62443': ['SR 7.1', 'SR 7.2']
            },
            'auto-scaling': {
                'ISO 27001': ['A.12.1.3'],
                'NIST CSF': ['DE.AE-5']
            },
            'min-nodes': {
                'ISO 27001': ['A.17.1.1'],
                'PCI-DSS': ['12.10.1']
            },
            'monitoring': {
                'ISO 27001': ['A.12.4.1', 'A.16.1.2'],
                'PCI-DSS': ['10.1', '10.2', '10.3'],
                'GDPR': ['Article 32(1)(d)', 'Article 33'],
                'CCPA': ['1798.150'],
                'NERC CIP': ['CIP-007-6 R4'],
                'NIST CSF': ['DE.CM-1', 'DE.CM-3', 'DE.CM-7']
            },
            'backup': {
                'ISO 27001': ['A.12.3.1', 'A.17.1.2', 'A.17.1.3'],
                'PCI-DSS': ['3.1', '9.5'],
                'GDPR': ['Article 32(1)(c)'],
                'NERC CIP': ['CIP-009-6 R1'],
                'API 1164': ['Section 7.3']
            },
            'network-policies': {
                'ISO 27001': ['A.13.1.1', 'A.13.1.3'],
                'PCI-DSS': ['1.2', '1.3'],
                'IEC 62443': ['SR 3.1', 'SR 5.1'],
                'NERC CIP': ['CIP-005-6']
            },
            'rbac': {
                'ISO 27001': ['A.9.1.1', 'A.9.1.2', 'A.9.2.1'],
                'PCI-DSS': ['7.1', '7.2', '8.1'],
                'GDPR': ['Article 32(1)(b)'],
                'CCPA': ['1798.100(d)'],
                'TISAX': ['Information Security'],
                'NERC CIP': ['CIP-004-6']
            },
            'encryption-at-rest': {
                'ISO 27001': ['A.10.1.1', 'A.10.1.2'],
                'PCI-DSS': ['3.4', '3.5'],
                'GDPR': ['Article 32(1)(a)'],
                'CCPA': ['1798.150'],
                'IEC 62351': ['Part 3', 'Part 6'],
                'TISAX': ['Data Protection']
            },
            'network-segmentation': {
                'ISO 27001': ['A.13.1.3'],
                'PCI-DSS': ['1.1', '1.3', '11.3'],
                'IEC 62443': ['SR 3.1', 'SR 5.1', 'SR 5.2'],
                'NERC CIP': ['CIP-005-6 R1'],
                'API 1164': ['Section 5.2']
            },
            'audit-logging': {
                'ISO 27001': ['A.12.4.1', 'A.12.4.3'],
                'PCI-DSS': ['10.1', '10.2.1', '10.3'],
                'GDPR': ['Article 30', 'Article 32(1)(d)'],
                'CCPA': ['1798.100(d)'],
                'NERC CIP': ['CIP-007-6 R4'],
                'NIST CSF': ['PR.PT-1', 'DE.AE-3']
            }
        };
    }
    
    /**
     * Analyze compliance by breaking down into categories
     */
    analyzeCategoriesCompliance(securityResult) {
        const categoryBreakdown = {};
        
        Object.keys(this.categories).forEach(categoryKey => {
            const category = this.categories[categoryKey];
            const categoryChecks = securityResult.checks.filter(check => 
                category.checks.includes(check.id)
            );
            
            const earnedPoints = categoryChecks.reduce((sum, check) => 
                sum + (check.passed ? check.points : 0), 0
            );
            
            const possiblePoints = categoryChecks.reduce((sum, check) => 
                sum + check.points, 0
            );
            
            const percentage = possiblePoints > 0 
                ? Math.round((earnedPoints / possiblePoints) * 100)
                : 0;
            
            categoryBreakdown[categoryKey] = {
                name: category.name,
                earnedPoints,
                maxPoints: category.maxPoints,
                possiblePoints,
                percentage,
                status: this.getCategoryStatus(percentage),
                checks: categoryChecks
            };
        });
        
        return categoryBreakdown;
    }
    
    /**
     * Get category status based on percentage
     */
    getCategoryStatus(percentage) {
        if (percentage >= 90) return 'excellent';
        if (percentage >= 75) return 'good';
        if (percentage >= 50) return 'fair';
        return 'poor';
    }
    
    /**
     * Perform compliance gap analysis for selected industry
     */
    analyzeComplianceGap(securityResult, industry) {
        if (!industry || industry === 'none' || !this.catalog.industry_compliance[industry]) {
            return null;
        }
        
        const industryData = this.catalog.industry_compliance[industry];
        const gapAnalysis = {
            industry: industryData.name,
            frameworks: []
        };
        
        industryData.regulatory_frameworks.forEach(framework => {
            const frameworkGap = {
                name: framework.name,
                description: framework.description,
                scope: framework.scope,
                controls: []
            };
            
            // For each security check, see if it maps to this framework
            securityResult.checks.forEach(check => {
                const mappings = this.controlMappings[check.id];
                if (mappings && mappings[framework.name]) {
                    const controlIds = mappings[framework.name];
                    controlIds.forEach(controlId => {
                        frameworkGap.controls.push({
                            controlId,
                            checkName: check.name,
                            checkId: check.id,
                            status: check.passed ? 'compliant' : 'non-compliant',
                            severity: check.severity,
                            category: check.category,
                            remediation: check.passed ? null : this.getRemediationGuidance(check.id)
                        });
                    });
                }
            });
            
            // Calculate framework compliance percentage
            const compliantControls = frameworkGap.controls.filter(c => c.status === 'compliant').length;
            const totalControls = frameworkGap.controls.length;
            frameworkGap.compliancePercentage = totalControls > 0 
                ? Math.round((compliantControls / totalControls) * 100)
                : 0;
            frameworkGap.compliantCount = compliantControls;
            frameworkGap.totalCount = totalControls;
            frameworkGap.gapCount = totalControls - compliantControls;
            
            gapAnalysis.frameworks.push(frameworkGap);
        });
        
        return gapAnalysis;
    }
    
    /**
     * Get remediation guidance for failed check
     */
    getRemediationGuidance(checkId) {
        const guidance = {
            'ha-control-plane': {
                action: 'Deploy 3 or 5 control plane nodes',
                steps: [
                    'In your Bicep/ARM template, set controlPlaneCount to 3 or 5',
                    'Ensure control planes are distributed across availability zones',
                    'Verify etcd cluster health after deployment'
                ],
                azureLocal: 'az aksarc create --control-plane-count 3'
            },
            'availability-sets': {
                action: 'Enable availability sets (default in AKS Arc)',
                steps: [
                    'Verify your Azure Local cluster has availability sets enabled',
                    'Ensure VMs are distributed across fault domains',
                    'Check availability set configuration in Azure portal'
                ],
                azureLocal: 'Enabled by default in Azure Local 2511'
            },
            'auto-scaling': {
                action: 'Configure cluster autoscaler',
                steps: [
                    'Set minCount and maxCount on node pools',
                    'Enable autoscaling: enableAutoScaling: true',
                    'Configure scale-down parameters',
                    'Monitor scaling events in Azure Monitor'
                ],
                azureLocal: 'az aksarc nodepool update --enable-cluster-autoscaler --min-count 3 --max-count 10'
            },
            'min-nodes': {
                action: 'Deploy minimum 3 nodes',
                steps: [
                    'Increase node count to at least 3',
                    'Distribute nodes across availability sets',
                    'Verify node health and readiness'
                ],
                azureLocal: 'az aksarc nodepool scale --node-count 3'
            },
            'monitoring': {
                action: 'Enable Azure Monitor',
                steps: [
                    'Create Log Analytics workspace',
                    'Enable Container Insights on the cluster',
                    'Configure metric collection',
                    'Set up alerting rules'
                ],
                azureLocal: 'az aksarc enable-addons --addons monitoring --workspace-resource-id <workspace-id>'
            },
            'backup': {
                action: 'Configure backup solution',
                steps: [
                    'Deploy Velero or Azure Backup for Kubernetes',
                    'Configure backup schedule (daily/weekly)',
                    'Test restore procedures',
                    'Store backups in geo-redundant storage'
                ],
                azureLocal: 'Install Velero via Helm with Azure Blob backend'
            },
            'network-policies': {
                action: 'Implement network policies',
                steps: [
                    'Use Calico or Azure Network Policies',
                    'Define default deny-all policy',
                    'Create allow rules for required traffic',
                    'Test policies in non-production first'
                ],
                azureLocal: 'kubectl apply -f network-policy.yaml'
            },
            'rbac': {
                action: 'Configure RBAC',
                steps: [
                    'Enable RBAC on cluster',
                    'Create custom roles with least privilege',
                    'Use Azure AD integration for authentication',
                    'Audit role assignments regularly'
                ],
                azureLocal: 'az aksarc create --enable-rbac --enable-azure-rbac'
            },
            'encryption-at-rest': {
                action: 'Enable encryption at rest',
                steps: [
                    'Use Azure Key Vault for key management',
                    'Enable encryption on persistent volumes',
                    'Encrypt etcd data',
                    'Configure secret encryption provider'
                ],
                azureLocal: 'Enable via storage class configuration with encryption'
            },
            'network-segmentation': {
                action: 'Implement network segmentation',
                steps: [
                    'Create separate VLANs/subnets for OT and IT',
                    'Deploy firewall between segments',
                    'Implement jump box/bastion for access',
                    'Restrict east-west traffic with network policies'
                ],
                azureLocal: 'Configure at Azure Local network layer'
            },
            'audit-logging': {
                action: 'Enable audit logging',
                steps: [
                    'Enable Kubernetes audit logs',
                    'Stream logs to Azure Monitor',
                    'Configure log retention policies',
                    'Set up alerts for security events'
                ],
                azureLocal: 'az aksarc update --enable-audit-logs'
            }
        };
        
        return guidance[checkId] || {
            action: 'Review security configuration',
            steps: ['Consult Azure Local documentation'],
            azureLocal: 'See Azure documentation'
        };
    }
    
    /**
     * Generate compliance matrix for display
     */
    generateComplianceMatrix(gapAnalysis) {
        if (!gapAnalysis) return null;
        
        const matrix = {
            rows: [],
            summary: {
                totalControls: 0,
                compliantControls: 0,
                partialControls: 0,
                nonCompliantControls: 0
            }
        };
        
        gapAnalysis.frameworks.forEach(framework => {
            framework.controls.forEach(control => {
                const existingRow = matrix.rows.find(r => r.checkId === control.checkId);
                
                if (existingRow) {
                    existingRow.frameworks[framework.name] = {
                        controlId: control.controlId,
                        status: control.status
                    };
                } else {
                    const newRow = {
                        checkId: control.checkId,
                        checkName: control.checkName,
                        category: control.category,
                        severity: control.severity,
                        frameworks: {
                            [framework.name]: {
                                controlId: control.controlId,
                                status: control.status
                            }
                        }
                    };
                    matrix.rows.push(newRow);
                }
                
                // Update summary
                matrix.summary.totalControls++;
                if (control.status === 'compliant') {
                    matrix.summary.compliantControls++;
                } else {
                    matrix.summary.nonCompliantControls++;
                }
            });
        });
        
        return matrix;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComplianceAnalyzer;
}
