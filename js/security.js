/**
 * Security Validator - Compliance and security checking
 */

class SecurityValidator {
    constructor(catalog) {
        this.catalog = catalog;
        this.checks = catalog.security_baseline.checks;
        this.thresholds = catalog.security_baseline.score_thresholds;
    }

    /**
     * Validate deployment plan against security baseline
     */
    validate(plan, environment) {
        const results = [];
        let totalScore = 0;
        let maxScore = 0;

        this.checks.forEach(check => {
            maxScore += check.points;
            const passed = this.evaluateCheck(check, plan, environment);
            
            results.push({
                ...check,
                passed,
                pointsEarned: passed ? check.points : 0
            });

            if (passed) {
                totalScore += check.points;
            }
        });

        const percentageScore = Math.round((totalScore / maxScore) * 100);
        const rating = this.getRating(percentageScore);

        return {
            score: percentageScore,
            rating,
            totalPoints: totalScore,
            maxPoints: maxScore,
            checks: results,
            passed: results.filter(r => r.passed).length,
            failed: results.filter(r => !r.passed).length
        };
    }

    /**
     * Evaluate individual security check
     */
    evaluateCheck(check, plan, environment) {
        const { clusterConfig, networkConfig, storageConfig, identityConfig, monitoringConfig, securityConfig } = plan;
        
        switch (check.id) {
            case 'ha-control-plane':
                return clusterConfig.controlPlaneCount >= 3;
            
            case 'availability-sets':
                return clusterConfig.enableAvailabilitySets === true;
            
            case 'auto-scaling':
                return clusterConfig.nodePools.some(pool => pool.enableAutoScaling);
            
            case 'min-nodes':
                const totalNodes = clusterConfig.nodePools.reduce(
                    (sum, pool) => sum + pool.nodeCount, 
                    0
                );
                return totalNodes >= 3;
            
            case 'monitoring':
                return monitoringConfig?.enableAzureMonitor === true || 
                       monitoringConfig?.enablePrometheus === true;
            
            case 'backup':
                return storageConfig?.enableVolumeSnapshots === true;
            
            case 'network-policies':
                return networkConfig?.enableNetworkPolicy === true;
            
            case 'rbac':
                return identityConfig?.rbacMode === 'enabled';
            
            case 'encryption-at-rest':
                return storageConfig?.enableVolumeEncryption === true;
            
            case 'network-segmentation':
                return networkConfig?.enablePrivateCluster === true || 
                       networkConfig?.networkPlugin === 'azure';
            
            case 'audit-logging':
                return monitoringConfig?.enableAuditLogs === true && 
                       monitoringConfig?.logRetentionDays >= 90;
            
            case 'defender-enabled':
                return securityConfig?.enableDefender === true;
            
            case 'policy-enabled':
                return securityConfig?.enablePolicy === true;
            
            case 'pod-security-standards':
                return identityConfig?.enablePodSecurityStandards === true;
            
            case 'workload-identity':
                return identityConfig?.enableWorkloadIdentity === true;
            
            case 'private-cluster':
                return networkConfig?.enablePrivateCluster === true;
            
            case 'standard-load-balancer':
                return networkConfig?.loadBalancerSku === 'Standard';
            
            default:
                return false;
        }
    }

    /**
     * Get rating based on score
     */
    getRating(score) {
        if (score >= this.thresholds.excellent) return 'excellent';
        if (score >= this.thresholds.good) return 'good';
        if (score >= this.thresholds.fair) return 'fair';
        return 'poor';
    }

    /**
     * Get rating display text
     */
    getRatingText(rating) {
        const texts = {
            excellent: '🌟 Excellent',
            good: '✅ Good',
            fair: '⚠️ Fair',
            poor: '❌ Needs Improvement'
        };
        return texts[rating] || 'Unknown';
    }

    /**
     * Generate recommendations based on failed checks
     */
    generateRecommendations(validationResult) {
        const recommendations = [];
        
        validationResult.checks
            .filter(check => !check.passed)
            .forEach(check => {
                recommendations.push({
                    category: check.category,
                    severity: check.severity,
                    title: check.name,
                    description: check.description,
                    action: this.getRecommendationAction(check.id),
                    points: check.points
                });
            });

        // Sort by severity and points
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        recommendations.sort((a, b) => {
            const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
            return severityDiff !== 0 ? severityDiff : b.points - a.points;
        });

        return recommendations;
    }

    /**
     * Get specific recommendation action
     */
    getRecommendationAction(checkId) {
        const actions = {
            'ha-control-plane': 'Deploy 3 or more control plane nodes for high availability',
            'availability-sets': 'Ensure availability sets are enabled (default in AKS Arc)',
            'auto-scaling': 'Enable auto-scaling on node pools to handle variable workloads',
            'min-nodes': 'Deploy at least 3 worker nodes for proper workload distribution',
            'monitoring': 'Enable Azure Monitor for cluster observability and alerting',
            'backup': 'Configure regular backups using Azure Backup or Velero',
            'network-policies': 'Implement network policies to control pod-to-pod traffic',
            'rbac': 'Enable and configure RBAC for fine-grained access control'
        };
        return actions[checkId] || 'Review security configuration';
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityValidator;
}
