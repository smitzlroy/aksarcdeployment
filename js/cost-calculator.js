/**
 * Cost Calculator - Real-time cost estimation
 */

const CostCalculator = {
    // Pricing (approximate as of 2025)
    pricing: {
        // Azure Local compute pricing (per vCore per month)
        computePerVCore: 15, // Approximate for Azure Local
        
        // Microsoft Defender for Containers
        defenderPerVCore: 6.87, // $6.87 per vCore per month
        
        // Azure Monitor Container Insights
        monitoringBase: 30, // Base cost per cluster
        monitoringPerNode: 10, // Per node per month
        logIngestionPerGB: 2.76, // Per GB ingested
        estimatedLogGBPerNode: 5, // Estimated logs per node per month
        
        // Prometheus (self-hosted, minimal Azure costs)
        prometheusStorage: 20 // Storage costs for metrics
    },

    /**
     * Calculate total monthly cost based on configuration
     */
    calculate(config) {
        let computeCost = 0;
        let defenderCost = 0;
        let monitoringCost = 0;
        let totalVCores = 0;
        let totalNodes = 0;

        // Calculate compute costs based on CPU cores and node count
        const cpuCores = parseInt(config.cpuCores) || 8;
        const minNodes = parseInt(config.minNodes) || 3;
        const physicalHostCount = parseInt(config.physicalHostCount) || 3;
        
        // Estimate total vCores (rough calculation)
        totalVCores = cpuCores * minNodes;
        totalNodes = minNodes;
        
        // Compute cost
        computeCost = totalVCores * this.pricing.computePerVCore;

        // Microsoft Defender cost (if enabled)
        if (config.enableDefender) {
            defenderCost = totalVCores * this.pricing.defenderPerVCore;
        }

        // Azure Monitor cost (if enabled)
        if (config.enableAzureMonitor) {
            monitoringCost = this.pricing.monitoringBase + 
                           (totalNodes * this.pricing.monitoringPerNode) +
                           (totalNodes * this.estimatedLogGBPerNode * this.pricing.logIngestionPerGB);
        }

        // Prometheus cost (if enabled, minimal storage cost)
        if (config.enablePrometheus) {
            monitoringCost += this.pricing.prometheusStorage;
        }

        const totalMonthlyCost = computeCost + defenderCost + monitoringCost;
        const totalAnnualCost = totalMonthlyCost * 12;

        return {
            compute: {
                cost: computeCost,
                vCores: totalVCores,
                nodes: totalNodes
            },
            defender: {
                cost: defenderCost,
                enabled: config.enableDefender,
                vCores: totalVCores
            },
            monitoring: {
                cost: monitoringCost,
                enabled: config.enableAzureMonitor || config.enablePrometheus,
                type: config.enableAzureMonitor ? 'Azure Monitor' : (config.enablePrometheus ? 'Prometheus' : 'None')
            },
            total: {
                monthly: totalMonthlyCost,
                annual: totalAnnualCost
            }
        };
    },

    /**
     * Format currency
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },

    /**
     * Generate cost optimization tips based on configuration
     */
    generateTips(config, costs) {
        const tips = [];

        // Tip 1: Auto-scaling
        if (!config.enableAutoScaling) {
            tips.push('Enable auto-scaling to reduce compute costs during low-traffic periods (save 20-40%)');
        } else {
            tips.push('Auto-scaling enabled - cluster will scale down automatically to save costs');
        }

        // Tip 2: Dev/Test environments
        if (config.enableDefender && costs.defender.cost > 100) {
            tips.push('Consider disabling Defender in dev/test environments to save ' + this.formatCurrency(costs.defender.cost * 12) + '/year');
        } else if (!config.enableDefender && config.environment === 'Production') {
            tips.push('Production environments should enable Defender for threat protection (adds ' + this.formatCurrency(costs.total.monthly * 0.3) + '/month)');
        } else {
            tips.push('Use Dev/Test preset for non-production environments to save 60-70%');
        }

        // Tip 3: Monitoring optimization
        if (config.enableAzureMonitor && config.enablePrometheus) {
            tips.push('You have both Azure Monitor and Prometheus enabled - consider using only one to reduce costs');
        } else {
            tips.push('Storage costs not included (depends on actual usage - typically $50-200/month)');
        }

        return tips;
    }
};

/**
 * Update cost estimate in the UI
 */
function updateCostEstimate() {
    // Gather current configuration
    const config = {
        cpuCores: document.getElementById('cpuCores')?.value || 8,
        minNodes: 3, // Default from environment template
        physicalHostCount: document.getElementById('physicalHostCount')?.value || 3,
        enableDefender: document.getElementById('enableDefender')?.checked || false,
        enableAzureMonitor: document.getElementById('enableAzureMonitor')?.checked || false,
        enablePrometheus: document.getElementById('enablePrometheus')?.checked || false,
        enableAutoScaling: true, // Assume from environment
        environment: selectedEnvironment || 'Production'
    };

    // Calculate costs
    const costs = CostCalculator.calculate(config);

    // Update UI
    document.getElementById('costCompute').textContent = CostCalculator.formatCurrency(costs.compute.cost);
    document.getElementById('costComputeDetail').textContent = `${costs.compute.vCores} vCores × ${costs.compute.nodes} nodes`;

    document.getElementById('costDefender').textContent = CostCalculator.formatCurrency(costs.defender.cost);
    document.getElementById('costDefenderDetail').textContent = costs.defender.enabled 
        ? `${costs.defender.vCores} vCores × $${CostCalculator.pricing.defenderPerVCore}/vCore`
        : 'Not enabled';

    document.getElementById('costMonitoring').textContent = CostCalculator.formatCurrency(costs.monitoring.cost);
    document.getElementById('costMonitoringDetail').textContent = costs.monitoring.enabled 
        ? costs.monitoring.type + ' enabled'
        : 'Not enabled';

    document.getElementById('costTotal').textContent = CostCalculator.formatCurrency(costs.total.monthly);
    document.getElementById('costAnnual').textContent = CostCalculator.formatCurrency(costs.total.annual) + ' /year';
    
    // Update compact cost display
    const costQuickElem = document.getElementById('costTotalQuick');
    if (costQuickElem) {
        costQuickElem.textContent = CostCalculator.formatCurrency(costs.total.monthly) + '/mo';
    }

    // Update tips
    const tips = CostCalculator.generateTips(config, costs);
    document.getElementById('costTip1').textContent = tips[0] || '';
    document.getElementById('costTip2').textContent = tips[1] || '';
    document.getElementById('costTip3').textContent = tips[2] || '';
}

// Add event listeners to update cost when inputs change
document.addEventListener('DOMContentLoaded', function() {
    // Update cost when any relevant input changes
    const costInputs = [
        'cpuCores', 'physicalHostCount', 
        'enableDefender', 'enableAzureMonitor', 'enablePrometheus'
    ];

    costInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', updateCostEstimate);
            el.addEventListener('input', updateCostEstimate);
        }
    });

    // Initial calculation
    updateCostEstimate();
});

console.log('✅ Cost Calculator loaded successfully');
