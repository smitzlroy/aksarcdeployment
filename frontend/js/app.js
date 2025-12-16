/**
 * Main application logic
 */

let catalog = null;
let planner = null;
let currentStep = 1;
let selectedWorkload = null;
let deploymentPlan = null;

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    await loadCatalog();
    initializeEventListeners();
    updateCatalogBanner();
});

/**
 * Load catalog data
 */
async function loadCatalog() {
    try {
        const response = await fetch('data/catalog.json');
        catalog = await response.json();
        planner = new AKSArcPlanner(catalog);
        console.log('Catalog loaded successfully');
    } catch (error) {
        console.error('Error loading catalog:', error);
        alert('Failed to load catalog data. Please refresh the page.');
    }
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
    // GPU checkbox
    document.getElementById('gpuRequired').addEventListener('change', (e) => {
        document.getElementById('gpuCountGroup').style.display = 
            e.target.checked ? 'block' : 'none';
    });

    // Rack awareness checkbox
    document.getElementById('enableRackAwareness').addEventListener('change', (e) => {
        document.getElementById('rackCountGroup').style.display = 
            e.target.checked ? 'block' : 'none';
    });
}

/**
 * Update catalog banner
 */
function updateCatalogBanner() {
    if (!catalog) return;

    const banner = document.getElementById('catalogInfo');
    const lastUpdated = new Date(catalog.metadata.last_updated);
    const daysOld = Math.floor((Date.now() - lastUpdated) / (1000 * 60 * 60 * 24));
    
    let message = `Catalog: ${catalog.metadata.target} (v${catalog.metadata.version})`;
    message += ` • Last updated: ${daysOld} days ago`;
    
    banner.textContent = message;
    
    // Show warning if outdated
    const bannerEl = document.getElementById('catalogBanner');
    if (daysOld > 30) {
        bannerEl.classList.add('warning');
        message += ' ⚠️ Consider refreshing';
    } else {
        bannerEl.classList.remove('warning');
    }
}

/**
 * Refresh catalog (in this static version, just reload)
 */
function refreshCatalog() {
    alert('In the static version, catalog data is embedded. In production, this would fetch latest data from Azure APIs.');
    loadCatalog();
}

/**
 * Select workload type
 */
function selectWorkload(workloadType) {
    selectedWorkload = workloadType;
    
    // Apply preset values if available
    if (workloadType !== 'custom' && catalog.workload_presets[workloadType]) {
        const preset = catalog.workload_presets[workloadType];
        document.getElementById('cpuCores').value = preset.cpu_cores;
        document.getElementById('memoryGb').value = preset.memory_gb;
        document.getElementById('gpuRequired').checked = preset.gpu_required;
        document.getElementById('gpuCount').value = preset.gpu_count;
        
        // Show/hide GPU fields
        document.getElementById('gpuCountGroup').style.display = 
            preset.gpu_required ? 'block' : 'none';
    }
    
    nextStep();
}

/**
 * Navigate to next step
 */
function nextStep() {
    if (currentStep < 3) {
        document.getElementById(`step${currentStep}`).classList.remove('active');
        currentStep++;
        document.getElementById(`step${currentStep}`).classList.add('active');
    }
}

/**
 * Navigate to previous step
 */
function previousStep() {
    if (currentStep > 1) {
        document.getElementById(`step${currentStep}`).classList.remove('active');
        currentStep--;
        document.getElementById(`step${currentStep}`).classList.add('active');
    }
}

/**
 * Generate deployment plan
 */
function generatePlan() {
    // Validate required fields
    const clusterName = document.getElementById('clusterName').value.trim();
    const resourceGroup = document.getElementById('resourceGroup').value.trim();
    const customLocation = document.getElementById('customLocation').value.trim();
    
    if (!clusterName || !resourceGroup || !customLocation) {
        alert('Please fill in all required fields');
        return;
    }

    // Gather configuration
    const config = {
        workloadType: selectedWorkload,
        clusterName,
        resourceGroup,
        location: document.getElementById('location').value,
        customLocation,
        cpuCores: parseInt(document.getElementById('cpuCores').value),
        memoryGb: parseInt(document.getElementById('memoryGb').value),
        gpuRequired: document.getElementById('gpuRequired').checked,
        gpuCount: parseInt(document.getElementById('gpuCount').value) || 0,
        enableRackAwareness: document.getElementById('enableRackAwareness').checked,
        rackCount: document.getElementById('enableRackAwareness').checked 
            ? parseInt(document.getElementById('rackCount').value) 
            : null
    };

    // Create plan
    deploymentPlan = planner.createPlan(config);
    
    // Display results
    displayValidationResults(deploymentPlan.validation);
    displayPlanSummary(deploymentPlan);
    
    // Move to next step
    nextStep();
}

/**
 * Display validation results
 */
function displayValidationResults(validation) {
    const container = document.getElementById('validationResults');
    let html = '';

    if (validation.errors.length > 0) {
        html += '<div class="alert alert-error"><strong>Errors:</strong><ul>';
        validation.errors.forEach(err => {
            html += `<li>${err}</li>`;
        });
        html += '</ul></div>';
    }

    if (validation.warnings.length > 0) {
        html += '<div class="alert alert-warning"><strong>Warnings:</strong><ul>';
        validation.warnings.forEach(warn => {
            html += `<li>${warn}</li>`;
        });
        html += '</ul></div>';
    }

    if (validation.recommendations.length > 0) {
        html += '<div class="alert alert-info"><strong>Recommendations:</strong><ul>';
        validation.recommendations.forEach(rec => {
            html += `<li>${rec}</li>`;
        });
        html += '</ul></div>';
    }

    if (validation.isValid && validation.warnings.length === 0) {
        html += '<div class="alert alert-success">✓ Plan is valid and ready to deploy!</div>';
    }

    container.innerHTML = html;
}

/**
 * Display plan summary
 */
function displayPlanSummary(plan) {
    const container = document.getElementById('planSummary');
    const { clusterConfig, rackTopology } = plan;

    let html = '<div class="summary-grid">';
    
    // Cluster info
    html += '<div class="summary-section">';
    html += '<h4>Cluster Configuration</h4>';
    html += '<table class="summary-table">';
    html += `<tr><td>Name:</td><td><strong>${clusterConfig.clusterName}</strong></td></tr>`;
    html += `<tr><td>Resource Group:</td><td>${clusterConfig.resourceGroup}</td></tr>`;
    html += `<tr><td>Location:</td><td>${clusterConfig.location}</td></tr>`;
    html += `<tr><td>K8s Version:</td><td>${clusterConfig.kubernetesVersion}</td></tr>`;
    html += `<tr><td>Control Plane:</td><td>${clusterConfig.controlPlaneCount} node(s)</td></tr>`;
    html += `<tr><td>Rack Awareness:</td><td>${clusterConfig.enableRackAwareness ? `Enabled (${clusterConfig.rackCount} racks)` : 'Disabled'}</td></tr>`;
    html += '</table>';
    html += '</div>';

    // Node pools
    html += '<div class="summary-section">';
    html += '<h4>Node Pools</h4>';
    clusterConfig.nodePools.forEach(pool => {
        html += `<div class="node-pool">`;
        html += `<strong>${pool.name}</strong> (${pool.mode})`;
        html += `<ul>`;
        html += `<li>VM Size: ${pool.vmSize}</li>`;
        html += `<li>Node Count: ${pool.nodeCount}</li>`;
        html += `<li>OS Type: ${pool.osType}</li>`;
        if (pool.enableAutoScaling) {
            html += `<li>Auto-scaling: ${pool.minCount}-${pool.maxCount} nodes</li>`;
        }
        if (Object.keys(pool.labels).length > 0) {
            html += `<li>Labels: ${Object.entries(pool.labels).map(([k,v]) => `${k}=${v}`).join(', ')}</li>`;
        }
        if (pool.taints && pool.taints.length > 0) {
            html += `<li>Taints: ${pool.taints.join(', ')}</li>`;
        }
        html += `</ul>`;
        html += `</div>`;
    });
    html += '</div>';

    html += '</div>';
    container.innerHTML = html;
}

/**
 * Export template
 */
function exportTemplate(format) {
    if (!deploymentPlan) {
        alert('No deployment plan available');
        return;
    }

    const clusterName = deploymentPlan.clusterConfig.clusterName;
    let content, filename, mimeType;

    switch (format) {
        case 'bicep':
            content = TemplateGenerator.generateBicep(deploymentPlan);
            filename = `${clusterName}.bicep`;
            mimeType = 'text/plain';
            break;
        case 'arm':
            content = TemplateGenerator.generateARM(deploymentPlan);
            filename = `${clusterName}.json`;
            mimeType = 'application/json';
            break;
        case 'terraform':
            content = TemplateGenerator.generateTerraform(deploymentPlan);
            filename = `${clusterName}.tf`;
            mimeType = 'text/plain';
            break;
        default:
            alert('Unknown format');
            return;
    }

    TemplateGenerator.downloadFile(content, filename, mimeType);
}

/**
 * Start over
 */
function startOver() {
    document.getElementById(`step${currentStep}`).classList.remove('active');
    currentStep = 1;
    document.getElementById('step1').classList.add('active');
    
    // Reset form
    document.getElementById('clusterName').value = '';
    document.getElementById('resourceGroup').value = '';
    document.getElementById('customLocation').value = '';
    document.getElementById('cpuCores').value = '8';
    document.getElementById('memoryGb').value = '32';
    document.getElementById('gpuRequired').checked = false;
    document.getElementById('gpuCount').value = '1';
    document.getElementById('enableRackAwareness').checked = true;
    document.getElementById('rackCount').value = '3';
    document.getElementById('gpuCountGroup').style.display = 'none';
    
    selectedWorkload = null;
    deploymentPlan = null;
}

/**
 * Show about dialog
 */
function showAbout() {
    alert(`AKS Arc Deployment Tool v0.1.0

A production-grade tool for planning and generating deployment artifacts for Azure Kubernetes Service on Azure Local 2511.

Features:
• Rack-aware topology planning
• GPU workload support
• Bicep, ARM, and Terraform export
• Client-side processing (no backend required)

GitHub: https://github.com/smitzlroy/aksarcdeployment`);
}
