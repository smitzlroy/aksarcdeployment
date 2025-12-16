/**
 * Main application logic
 */

let catalog = null;
let planner = null;
let securityValidator = null;
let currentStep = 1;
let selectedWorkload = null;
let selectedEnvironment = 'production'; // Default to production
let selectedIndustry = null; // No default industry
let selectedSolution = null; // No default Edge AI solution
let deploymentPlan = null;

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    await loadCatalog();
    initializeEventListeners();
    updateCatalogBanner();
    initializeTheme();
});

/**
 * Embedded catalog data (to avoid CORS issues when opening HTML directly)
 */
const EMBEDDED_CATALOG = {
  "metadata": {
    "version": "1.0",
    "last_updated": "2024-12-16T00:00:00",
    "target": "Azure Local 2511"
  },
  "kubernetes_versions": ["1.29.2", "1.28.5", "1.27.9"],
  "os_images": {
    "linux": [
      {"name": "Azure Linux 2.0", "version": "2.0.20240101"},
      {"name": "Ubuntu 22.04", "version": "22.04.202401"}
    ],
    "windows": [
      {"name": "Windows Server 2022", "version": "20348.2227"},
      {"name": "Windows Server 2019", "version": "17763.5329"}
    ]
  },
  "vm_skus": {
    "general_purpose": [
      {"name": "Standard_D4s_v5", "vcpus": 4, "memory_gb": 16, "gpu": false},
      {"name": "Standard_D8s_v5", "vcpus": 8, "memory_gb": 32, "gpu": false},
      {"name": "Standard_D16s_v5", "vcpus": 16, "memory_gb": 64, "gpu": false},
      {"name": "Standard_D32s_v5", "vcpus": 32, "memory_gb": 128, "gpu": false}
    ],
    "gpu": [
      {"name": "Standard_NC4as_T4_v3", "vcpus": 4, "memory_gb": 28, "gpu": true, "gpu_model": "T4", "gpu_count": 1},
      {"name": "Standard_NC8as_T4_v3", "vcpus": 8, "memory_gb": 56, "gpu": true, "gpu_model": "T4", "gpu_count": 1},
      {"name": "Standard_NC16as_T4_v3", "vcpus": 16, "memory_gb": 110, "gpu": true, "gpu_model": "T4", "gpu_count": 1}
    ]
  },
  "limits": {
    "control_plane_options": [1, 3, 5],
    "max_nodes_per_pool": 100,
    "max_pools_per_cluster": 10,
    "max_nodes_per_cluster": 1000,
    "max_racks": 16,
    "min_nodes_per_rack": 1
  },
  "workload_presets": {
    "video-analytics": {
      "name": "Video Analytics",
      "description": "Optimized for camera feeds, video processing, and analytics",
      "cpu_cores": 32,
      "memory_gb": 128,
      "gpu_required": true,
      "gpu_count": 2,
      "storage_gb": 1000
    },
    "ai-inference": {
      "name": "AI Inference",
      "description": "Machine learning model serving and inference workloads",
      "cpu_cores": 16,
      "memory_gb": 64,
      "gpu_required": true,
      "gpu_count": 1,
      "storage_gb": 500
    },
    "general-purpose": {
      "name": "General Purpose",
      "description": "Balanced compute for web apps and microservices",
      "cpu_cores": 8,
      "memory_gb": 32,
      "gpu_required": false,
      "gpu_count": 0,
      "storage_gb": 200
    }
  },
  "environment_templates": {
    "poc": {"name":"POC / Development","control_plane_count":1,"min_nodes":2,"max_nodes":3,"enable_auto_scaling":false,"enable_monitoring":false,"backup_enabled":false,"estimated_monthly_cost":247},
    "pilot": {"name":"Pilot / Testing","control_plane_count":3,"min_nodes":3,"max_nodes":10,"enable_auto_scaling":true,"enable_monitoring":true,"backup_enabled":true,"estimated_monthly_cost":1834},
    "production": {"name":"Production","control_plane_count":3,"min_nodes":3,"max_nodes":100,"enable_auto_scaling":true,"enable_monitoring":true,"backup_enabled":true,"estimated_monthly_cost":4291}
  },
  "security_baseline": {
    "checks": [
      {"id":"ha-control-plane","name":"High Availability Control Plane","description":"Control plane should have 3+ nodes for production","category":"availability","severity":"high","points":15},
      {"id":"availability-sets","name":"Availability Sets Enabled","description":"VMs spread across physical hosts with anti-affinity","category":"availability","severity":"high","points":10},
      {"id":"auto-scaling","name":"Node Pool Auto-scaling","description":"Enable auto-scaling to handle variable workloads","category":"resilience","severity":"medium","points":8},
      {"id":"min-nodes","name":"Minimum Node Count","description":"At least 3 worker nodes for workload distribution","category":"availability","severity":"medium","points":10},
      {"id":"monitoring","name":"Monitoring Enabled","description":"Azure Monitor for observability and alerting","category":"operations","severity":"high","points":12},
      {"id":"backup","name":"Backup Configuration","description":"Regular backups for disaster recovery","category":"data-protection","severity":"high","points":10},
      {"id":"network-policies","name":"Network Policies","description":"Network policies for pod-to-pod communication control","category":"security","severity":"high","points":15},
      {"id":"rbac","name":"RBAC Configuration","description":"Role-based access control for cluster security","category":"security","severity":"critical","points":20},
      {"id":"encryption-at-rest","name":"Encryption at Rest","description":"Data encrypted at rest for compliance","category":"security","severity":"high","points":12,"compliance":["ISO 27001","PCI-DSS","GDPR","NERC CIP"]},
      {"id":"network-segmentation","name":"Network Segmentation","description":"Network isolation between production workloads","category":"security","severity":"high","points":10,"compliance":["IEC 62443","NERC CIP","ISO 27001"]},
      {"id":"audit-logging","name":"Audit Logging","description":"Comprehensive audit logs for compliance reporting","category":"security","severity":"medium","points":8,"compliance":["PCI-DSS","GDPR","NERC CIP","ISO 27001"]}
    ],
    "score_thresholds": {"excellent":90,"good":70,"fair":50,"poor":0}
  },
  "industry_compliance": {
    "manufacturing": {
      "name":"Manufacturing & Industrial Automation","regulatory_frameworks":[{"name":"ISO 27001","description":"Information Security Management System (ISMS)","scope":"Global standard for information security","key_requirements":["Risk assessment","Access controls","Incident management","Business continuity"]},{"name":"IEC 62443","description":"Industrial Automation and Control Systems Security","scope":"OT/ICS security standards","key_requirements":["Network segmentation","Secure remote access","Patch management","Security monitoring"]},{"name":"TISAX","description":"Trusted Information Security Assessment Exchange","scope":"Automotive industry security","key_requirements":["Data protection","Prototype protection","Supply chain security"]}],"security_pillars":["OT/IT Convergence Security","Supply Chain Protection","Industrial IoT Security","Physical Access Controls"],"azure_security_services":["Azure Defender for IoT","Network Security Groups","Azure Private Link","Azure Key Vault"]
    },
    "retail": {
      "name":"Retail & E-Commerce","regulatory_frameworks":[{"name":"PCI-DSS","description":"Payment Card Industry Data Security Standard","scope":"Payment card data protection","key_requirements":["Cardholder data encryption","Network segmentation","Access control","Security testing","Incident response"]},{"name":"GDPR","description":"General Data Protection Regulation","scope":"EU customer data privacy","key_requirements":["Data minimization","Consent management","Right to erasure","Data breach notification"]},{"name":"CCPA","description":"California Consumer Privacy Act","scope":"California resident data rights","key_requirements":["Disclosure of data collection","Right to opt-out","Data deletion rights"]}],"security_pillars":["Payment Security","Customer Data Protection","E-commerce Platform Security","POS System Security"],"azure_security_services":["Azure Key Vault","Azure Private Link","Azure DDoS Protection","Microsoft Defender for Cloud"]
    },
    "energy": {
      "name":"Energy & Resources","regulatory_frameworks":[{"name":"NERC CIP","description":"North American Electric Reliability Corporation Critical Infrastructure Protection","scope":"Bulk Electric System protection","key_requirements":["Physical security","Electronic security perimeters","Incident reporting","Recovery plans"]},{"name":"IEC 62351","description":"Power Systems Management and Information Exchange Security","scope":"Energy sector communications security","key_requirements":["Authentication","Encryption","Intrusion detection","Key management"]},{"name":"NIST Cybersecurity Framework","description":"Framework for Critical Infrastructure Cybersecurity","scope":"Risk-based security approach","key_requirements":["Identify assets","Protect systems","Detect threats","Respond to incidents","Recover operations"]},{"name":"API 1164","description":"Pipeline SCADA Security","scope":"Pipeline infrastructure protection","key_requirements":["SCADA access controls","Network monitoring","Change management"]}],"security_pillars":["SCADA/ICS Security","Critical Infrastructure Protection","Operational Continuity","Regulatory Compliance"],"azure_security_services":["Azure Defender for IoT","Azure Firewall","Azure Sentinel","Azure Backup"]
    }
  }
};

/**
 * Load catalog data
 */
async function loadCatalog() {
    try {
        // Try to fetch from JSON file first (for web server)
        const response = await fetch('data/catalog.json?v=180101');
        catalog = await response.json();
        planner = new AKSArcPlanner(catalog);
        securityValidator = new SecurityValidator(catalog);
        console.log('Catalog loaded from JSON file');
    } catch (error) {
        // Fallback to embedded catalog (for file:// protocol)
        console.log('Using embedded catalog data');
        catalog = EMBEDDED_CATALOG;
        planner = new AKSArcPlanner(catalog);
        securityValidator = new SecurityValidator(catalog);
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

    const notification = document.getElementById('catalogNotification');
    const banner = document.getElementById('catalogInfo');
    const lastUpdated = new Date(catalog.metadata.last_updated);
    const daysOld = Math.floor((Date.now() - lastUpdated) / (1000 * 60 * 60 * 24));
    
    // Only show notification if catalog is outdated (>30 days) and not dismissed
    const dismissed = localStorage.getItem('catalogNotificationDismissed');
    
    if (daysOld > 30 && !dismissed) {
        let message = `Catalog data is ${daysOld} days old. Consider refreshing for latest Azure Local 2511 configurations.`;
        banner.textContent = message;
        notification.style.display = 'flex';
    } else {
        notification.style.display = 'none';
    }
}

/**
 * Dismiss catalog notification
 */
function dismissCatalogNotification() {
    const notification = document.getElementById('catalogNotification');
    notification.style.display = 'none';
    localStorage.setItem('catalogNotificationDismissed', 'true');
}

/**
 * Refresh catalog (in this static version, just reload)
 */
function refreshCatalog() {
    localStorage.removeItem('catalogNotificationDismissed');
    alert('In the static version, catalog data is embedded. In production, this would fetch latest data from Azure APIs.');
    loadCatalog();
    updateCatalogBanner();
}

/**
 * Reset wizard to start
 */
function resetWizard() {
    console.log('resetWizard called');
    
    // Reset state
    selectedIndustry = null;
    selectedEnvironment = 'production';
    selectedSolution = null;
    selectedWorkload = null;
    deploymentPlan = null;
    
    // Clear form
    try {
        document.getElementById('clusterForm').reset();
    } catch (e) {
        console.log('Error resetting form:', e);
    }
    
    // Clear industry selection
    document.querySelectorAll('.industry-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.getElementById('complianceDetails').style.display = 'none';
    
    // Clear environment selection
    document.querySelectorAll('.env-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Clear solution selection
    document.querySelectorAll('.solution-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.getElementById('solutionDetails').style.display = 'none';
    
    // Clear workload selection
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Go to step 1
    console.log('Navigating to step 1, current step was:', currentStep);
    document.querySelectorAll('.wizard-step').forEach(step => {
        step.classList.remove('active');
    });
    currentStep = 1;
    document.getElementById('step1').classList.add('active');
    console.log('Navigation complete, current step now:', currentStep);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    console.log('resetWizard completed');
}

/**
 * Select industry
 */
function selectIndustry(industryType) {
    selectedIndustry = industryType;
    
    // Update visual selection
    document.querySelectorAll('.industry-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.getElementById(`industry-${industryType}`).classList.add('selected');
    
    // Show compliance details if industry selected
    const detailsDiv = document.getElementById('complianceDetails');
    const frameworksDiv = document.getElementById('complianceFrameworks');
    
    if (industryType === 'none' || !catalog.industry_compliance[industryType]) {
        detailsDiv.style.display = 'none';
        return;
    }
    
    const industry = catalog.industry_compliance[industryType];
    detailsDiv.style.display = 'block';
    
    // Display regulatory frameworks
    let html = '';
    industry.regulatory_frameworks.forEach(framework => {
        html += `
            <div class="framework-item">
                <div class="framework-name">📋 ${framework.name}</div>
                <div class="framework-description">${framework.description}</div>
                <div class="framework-scope"><strong>Scope:</strong> ${framework.scope}</div>
                <details class="framework-requirements">
                    <summary>Key Requirements (${framework.key_requirements.length})</summary>
                    <ul>
                        ${framework.key_requirements.map(req => `<li>${req}</li>`).join('')}
                    </ul>
                </details>
            </div>
        `;
    });
    
    frameworksDiv.innerHTML = html;
    console.log(`Selected industry: ${industry.name}`);
}

/**
 * Select environment template
 */
function selectEnvironment(envType) {
    selectedEnvironment = envType;
    
    // Update visual selection
    document.querySelectorAll('.env-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.getElementById(`env-${envType}`).classList.add('selected');
    
    // Apply environment template settings
    const template = catalog.environment_templates[envType];
    if (template) {
        // These will be applied during plan generation
        console.log(`Selected environment: ${template.name}`);
    }
}

/**
 * Select Edge AI solution
 */
function selectSolution(solutionType) {
    // Toggle if clicking the same solution again (deselect)
    if (selectedSolution === solutionType && solutionType !== 'custom') {
        selectedSolution = null;
        document.querySelectorAll('.solution-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.getElementById('solutionDetails').style.display = 'none';
        return;
    }
    
    selectedSolution = solutionType;
    
    // Update UI
    document.querySelectorAll('.solution-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    document.getElementById(`solution-${solutionType}`).classList.add('selected');
    
    // Show solution details
    const detailsPanel = document.getElementById('solutionDetails');
    if (solutionType === 'custom' || solutionType === 'none') {
        detailsPanel.style.display = 'none';
        return;
    }
    
    const solution = catalog.edge_ai_solutions[solutionType];
    if (!solution) {
        console.error('Solution not found in catalog:', solutionType);
        return;
    }
    
    // Populate details
    document.getElementById('solutionName').textContent = solution.name;
    document.getElementById('solutionDescription').textContent = solution.description;
    
    // Requirements
    const reqsContainer = document.getElementById('solutionRequirements');
    let reqsHtml = '<ul>';
    
    if (solution.requirements.gpu_setup) {
        const gpu = solution.requirements.gpu_setup;
        reqsHtml += `<li><strong>GPU Setup:</strong> ${gpu.gpu_vms} GPU VMs (${gpu.gpu_vm_size}) + ${gpu.cpu_vms} CPU VMs</li>`;
        reqsHtml += `<li><strong>Total Resources:</strong> ${gpu.total_cores} cores, ${gpu.total_memory_gb}GB RAM</li>`;
    } else {
        reqsHtml += `<li><strong>Cores:</strong> ${solution.requirements.min_cores} (min) - ${solution.requirements.recommended_cores} (recommended)</li>`;
        reqsHtml += `<li><strong>Memory:</strong> ${solution.requirements.min_memory_gb}GB (min) - ${solution.requirements.recommended_memory_gb}GB (recommended)</li>`;
    }
    
    reqsHtml += `<li><strong>Storage:</strong> ${solution.requirements.min_storage_gb}GB minimum</li>`;
    reqsHtml += `<li><strong>Kubernetes:</strong> v${solution.requirements.kubernetes_version}</li>`;
    
    if (solution.requirements.storage_class_requirements) {
        reqsHtml += `<li><strong>Storage Classes:</strong> ${solution.requirements.storage_class_requirements.join(', ')}</li>`;
    }
    
    reqsHtml += '</ul>';
    reqsContainer.innerHTML = reqsHtml;
    
    // Use cases for selected industry
    const useCasesContainer = document.getElementById('solutionUseCases');
    let useCasesHtml = '<ul>';
    
    const industryKey = selectedIndustry || 'manufacturing';
    if (solution.industry_use_cases && solution.industry_use_cases[industryKey]) {
        solution.industry_use_cases[industryKey].forEach(useCase => {
            useCasesHtml += `<li>${useCase}</li>`;
        });
    }
    
    useCasesHtml += '</ul>';
    useCasesContainer.innerHTML = useCasesHtml;
    
    detailsPanel.style.display = 'block';
    
    // Auto-configure based on solution
    if (solutionType === 'video-indexer-arc') {
        // Auto-fill for Video Indexer
        document.getElementById('cpuCores').value = solution.requirements.recommended_cores || 64;
        document.getElementById('memoryGb').value = solution.requirements.recommended_memory_gb || 256;
        document.getElementById('gpuRequired').checked = solution.requirements.gpu_recommended || false;
        document.getElementById('gpuCount').value = solution.requirements.gpu_recommended ? 2 : 0;
        document.getElementById('gpuCountGroup').style.display = solution.requirements.gpu_recommended ? 'block' : 'none';
    } else if (solutionType === 'edge-rag-arc') {
        // Auto-fill for Edge RAG with GPU setup
        const gpu = solution.requirements.gpu_setup;
        document.getElementById('cpuCores').value = gpu.total_cores;
        document.getElementById('memoryGb').value = gpu.total_memory_gb;
        document.getElementById('gpuRequired').checked = true;
        document.getElementById('gpuCount').value = gpu.gpu_vms;
        document.getElementById('gpuCountGroup').style.display = 'block';
    }
}

/**
 * Select workload type
 */
function selectWorkload(workloadType) {
    selectedWorkload = workloadType;
    
    // Update visual selection
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('selected');
    });
    // Find and select the clicked workload card
    const workloadCards = document.querySelectorAll('.workload-cards .card');
    workloadCards.forEach(card => {
        if (card.onclick && card.onclick.toString().includes(`'${workloadType}'`)) {
            card.classList.add('selected');
        }
    });
    
    // Apply preset values if available (only if no solution selected)
    if (!selectedSolution || selectedSolution === 'custom') {
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
    }
}

/**
 * Navigate to next step
 */
function nextStep() {
    if (currentStep < 3) {
        document.getElementById(`step${currentStep}`).classList.remove('active');
        currentStep++;
        document.getElementById(`step${currentStep}`).classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * Generate deployment plan
 */
function generatePlan() {
    // Get button and add loading state
    const generateBtn = event?.target || document.querySelector('button[onclick="generatePlan()"]');
    const originalText = generateBtn?.textContent;
    
    try {
        // Add loading state
        if (generateBtn) {
            generateBtn.classList.add('loading');
            generateBtn.disabled = true;
        }
        
        console.log('=== Generate Plan Clicked ===');
        console.log('Selected Industry:', selectedIndustry);
        console.log('Selected Environment:', selectedEnvironment);
        console.log('Selected Solution:', selectedSolution);
        console.log('Selected Workload:', selectedWorkload);
        console.log('Planner available:', !!planner);
        console.log('Catalog available:', !!catalog);
        console.log('SecurityValidator available:', !!securityValidator);
        console.log('ComplianceAnalyzer available:', typeof ComplianceAnalyzer !== 'undefined');
        
        // Validate required fields
        const clusterName = document.getElementById('clusterName').value.trim();
        const resourceGroup = document.getElementById('resourceGroup').value.trim();
        const customLocation = document.getElementById('customLocation').value.trim();
        
        console.log('Form values - Cluster:', clusterName, 'RG:', resourceGroup, 'CL:', customLocation);
        
        if (!clusterName || !resourceGroup || !customLocation) {
            // Remove loading state before showing alert
            if (generateBtn) {
                generateBtn.classList.remove('loading');
                generateBtn.disabled = false;
            }
            alert('Please fill in all required fields (Cluster Name, Resource Group, Custom Location)');
            return;
        }
    } catch (error) {
        console.error('ERROR in generatePlan (early):', error);
        // Remove loading state
        if (generateBtn) {
            generateBtn.classList.remove('loading');
            generateBtn.disabled = false;
        }
        alert('An error occurred at the start of generatePlan: ' + error.message);
        return;
    }

    // Get environment template
    const envTemplate = catalog.environment_templates[selectedEnvironment];
    
    if (!envTemplate) {
        console.error('Environment template not found for:', selectedEnvironment);
        alert('Environment template not found. Please select an environment in Step 1.');
        return;
    }

    // Gather security options
    const enableDefender = document.getElementById('enableDefender')?.checked || false;
    const enablePolicy = document.getElementById('enablePolicy')?.checked !== false; // Default true if element not found

    // Gather configuration with environment overrides
    const config = {
        workloadType: selectedWorkload,
        environment: selectedEnvironment,
        clusterName,
        resourceGroup,
        location: document.getElementById('location').value,
        customLocation,
        cpuCores: parseInt(document.getElementById('cpuCores').value),
        memoryGb: parseInt(document.getElementById('memoryGb').value),
        gpuRequired: document.getElementById('gpuRequired').checked,
        gpuCount: parseInt(document.getElementById('gpuCount').value) || 0,
        enableAvailabilitySets: true, // Always enabled by default in AKS Arc
        physicalHostCount: parseInt(document.getElementById('physicalHostCount').value) || 2,
        // Security configuration
        enableDefender,
        enablePolicy,
        // Environment-specific overrides
        controlPlaneCountOverride: envTemplate.control_plane_count,
        minNodesOverride: envTemplate.min_nodes,
        maxNodesOverride: envTemplate.max_nodes,
        enableAutoScaling: envTemplate.enable_auto_scaling,
        enableMonitoring: envTemplate.enable_monitoring,
        backupEnabled: envTemplate.backup_enabled
    };

    // Create plan
    deploymentPlan = planner.createPlan(config);
    
    // Add environment and industry info to plan
    deploymentPlan.environment = envTemplate;
    deploymentPlan.industry = selectedIndustry;
    deploymentPlan.industryDetails = selectedIndustry && selectedIndustry !== 'none' 
        ? catalog.industry_compliance[selectedIndustry] 
        : null;
    
    // Add Edge AI solution info
    deploymentPlan.edgeAISolution = selectedSolution;
    deploymentPlan.solutionDetails = selectedSolution && selectedSolution !== 'custom' 
        ? catalog.edge_ai_solutions[selectedSolution]
        : null;
    
    // Run security validation
    const securityResult = securityValidator.validate(deploymentPlan, envTemplate);
    deploymentPlan.securityScore = securityResult;
    deploymentPlan.securityResult = securityResult; // Store for PDF report
    
    // Initialize and run compliance analyzer (with error handling)
    try {
        if (typeof ComplianceAnalyzer !== 'undefined') {
            if (!window.complianceAnalyzer) {
                window.complianceAnalyzer = new ComplianceAnalyzer(catalog);
            }
            
            // Analyze compliance with enhanced features
            const categoryBreakdown = complianceAnalyzer.analyzeCategoriesCompliance(securityResult);
            const gapAnalysis = complianceAnalyzer.analyzeComplianceGap(securityResult, selectedIndustry);
            const complianceMatrix = complianceAnalyzer.generateComplianceMatrix(gapAnalysis);
            
            // Store in deployment plan
            deploymentPlan.categoryBreakdown = categoryBreakdown;
            deploymentPlan.gapAnalysis = gapAnalysis;
            deploymentPlan.complianceMatrix = complianceMatrix;
            
            // Display compliance results
            displayCategoryBreakdown(categoryBreakdown);
            displayComplianceGapAnalysis(gapAnalysis);
            displayComplianceMatrix(complianceMatrix);
        } else {
            console.warn('ComplianceAnalyzer not loaded, skipping enhanced compliance features');
        }
    } catch (error) {
        console.error('Error in compliance analysis:', error);
        // Continue without compliance features
    }
    
    // Display results (these always run)
    try {
        displaySecurityScore(securityResult);
        displayValidationResults(deploymentPlan.validation);
        displayPlanSummary(deploymentPlan);
        
        // Remove loading state
        if (generateBtn) {
            generateBtn.classList.remove('loading');
            generateBtn.disabled = false;
        }
        
        // Move to next step
        nextStep();
        console.log('✅ Generate Plan completed successfully');
    } catch (error) {
        console.error('ERROR in generatePlan (display):', error);
        // Remove loading state
        if (generateBtn) {
            generateBtn.classList.remove('loading');
            generateBtn.disabled = false;
        }
        alert('An error occurred while displaying results: ' + error.message + '\n\nCheck the console for details.');
        throw error;
    }
}

/**
 * Display security score
 */
function displaySecurityScore(securityResult) {
    const scoreNumber = document.getElementById('scoreNumber');
    const scoreCircle = document.getElementById('scoreCircle');
    const scoreRating = document.getElementById('scoreRating');
    const checksContainer = document.getElementById('securityChecks');
    
    // Update score display
    scoreNumber.textContent = securityResult.score;
    
    // Update rating and circle color
    scoreCircle.className = `score-circle ${securityResult.rating}`;
    scoreRating.className = `score-rating ${securityResult.rating}`;
    scoreRating.textContent = securityValidator.getRatingText(securityResult.rating);
    
    // Add industry compliance badge if applicable
    let industryBadge = '';
    if (deploymentPlan && deploymentPlan.industryDetails) {
        const industryName = selectedIndustry.charAt(0).toUpperCase() + selectedIndustry.slice(1);
        const frameworks = deploymentPlan.industryDetails.regulatory_frameworks.map(f => f.name).join(', ');
        industryBadge = `
            <div class="compliance-badge">
                <strong>🏭 Industry: ${industryName}</strong><br>
                <span class="compliance-frameworks">Frameworks: ${frameworks}</span>
            </div>
        `;
    }
    
    // Display individual checks
    let checksHtml = industryBadge;
    securityResult.checks.forEach(check => {
        const icon = check.passed ? '✅' : '❌';
        const statusClass = check.passed ? 'passed' : 'failed';
        const recommendation = check.passed ? '' : 
            `<div class="check-recommendation">💡 ${securityValidator.getRecommendationAction(check.id)}</div>`;
        
        // Add compliance tags if check has compliance mappings
        let complianceTags = '';
        if (check.compliance && check.compliance.length > 0) {
            complianceTags = '<div class="compliance-tags">' + 
                check.compliance.map(c => `<span class="tag">${c}</span>`).join('') + 
                '</div>';
        }
        
        checksHtml += `
            <div class="security-check ${statusClass}">
                <div class="check-icon">${icon}</div>
                <div class="check-content">
                    <div class="check-name">${check.name}</div>
                    <div class="check-description">${check.description}</div>
                    ${complianceTags}
                    ${recommendation}
                </div>
                <div class="check-points">${check.pointsEarned}/${check.points} pts</div>
            </div>
        `;
    });
    
    checksContainer.innerHTML = checksHtml;
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
    const { clusterConfig, availabilitySetConfig } = plan;

    let html = '<div class="summary-grid">';
    
    // Edge AI Solution info (if selected)
    if (plan.solutionDetails) {
        html += '<div class="summary-section solution-summary">';
        html += '<h4>🎯 Edge AI Solution</h4>';
        html += `<div class="solution-badge">${plan.solutionDetails.icon} ${plan.solutionDetails.name}</div>`;
        html += `<p>${plan.solutionDetails.description}</p>`;
        html += '<div class="solution-deployment">';
        html += '<strong>Deployment Command:</strong>';
        html += `<pre style="background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto; font-size: 0.85rem;">${plan.solutionDetails.deployment.extension_install_command.replace(/\{cluster_name\}/g, clusterConfig.clusterName).replace(/\{resource_group\}/g, clusterConfig.resourceGroup)}</pre>`;
        html += '</div>';
        html += '</div>';
    }
    
    // Cluster info
    html += '<div class="summary-section">';
    html += '<h4>Cluster Configuration</h4>';
    html += '<table class="summary-table">';
    html += `<tr><td>Name:</td><td><strong>${clusterConfig.clusterName}</strong></td></tr>`;
    html += `<tr><td>Resource Group:</td><td>${clusterConfig.resourceGroup}</td></tr>`;
    html += `<tr><td>Location:</td><td>${clusterConfig.location}</td></tr>`;
    html += `<tr><td>K8s Version:</td><td>${clusterConfig.kubernetesVersion}</td></tr>`;
    html += `<tr><td>Control Plane:</td><td>${clusterConfig.controlPlaneCount} node(s)</td></tr>`;
    html += `<tr><td>Availability Sets:</td><td>Enabled (${availabilitySetConfig.faultDomains} physical hosts)</td></tr>`;
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
 * Download compliance attestation report
 */
async function downloadComplianceReport() {
    console.log('=== Download Compliance Report Clicked ===');

    if (!deploymentPlan) {
        alert('No deployment plan available. Please generate a plan first.');
        return;
    }

    try {
        // Check if ComplianceReportGenerator is available
        if (typeof ComplianceReportGenerator === 'undefined') {
            console.error('ComplianceReportGenerator not loaded');
            alert('Compliance report generator not available. Please refresh the page and try again.');
            return;
        }

        // Disable button during generation
        const btn = document.getElementById('pdfReportBtn');
        if (btn) {
            btn.disabled = true;
            btn.textContent = '⏳ Generating PDF Report...';
        }

        // Get the stored data from the last plan generation
        const securityResult = deploymentPlan.securityResult || null;
        const categoryBreakdown = deploymentPlan.categoryBreakdown || null;
        const gapAnalysis = deploymentPlan.gapAnalysis || null;

        if (!securityResult) {
            alert('Security analysis data not available. Please regenerate the deployment plan.');
            if (btn) {
                btn.disabled = false;
                btn.textContent = '📑 Download PDF Compliance Report';
            }
            return;
        }

        console.log('Generating PDF with data:', {
            securityScore: securityResult.score,
            hasCategories: !!categoryBreakdown,
            hasGapAnalysis: !!gapAnalysis
        });

        // Generate report
        const generator = new ComplianceReportGenerator();
        const filename = await generator.generateReport(
            deploymentPlan,
            securityResult,
            categoryBreakdown,
            gapAnalysis
        );

        console.log('✅ PDF generated successfully:', filename);
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'alert alert-success';
        successMsg.style.marginTop = '10px';
        successMsg.textContent = `✅ Compliance report downloaded: ${filename}`;
        
        const exportSection = btn.closest('.export-section');
        if (exportSection) {
            exportSection.appendChild(successMsg);
            setTimeout(() => successMsg.remove(), 5000);
        }

        // Re-enable button
        if (btn) {
            btn.disabled = false;
            btn.textContent = '📑 Download PDF Compliance Report';
        }

    } catch (error) {
        console.error('Error generating compliance report:', error);
        alert(`Failed to generate compliance report: ${error.message}`);
        
        // Re-enable button
        const btn = document.getElementById('pdfReportBtn');
        if (btn) {
            btn.disabled = false;
            btn.textContent = '📑 Download PDF Compliance Report';
        }
    }
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
    document.getElementById('physicalHostCount').value = '3';
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
• Availability set configuration with anti-affinity rules
• GPU workload support
• Bicep, ARM, and Terraform export
• Client-side processing (no backend required)
• Dark/Light theme

GitHub: https://github.com/smitzlroy/aksarcdeployment`);
}

/**
 * Display security category breakdown
 */
function displayCategoryBreakdown(categoryBreakdown) {
    const container = document.getElementById('categoryBreakdown');
    if (!container) return;
    
    // Clear container if no data
    if (!categoryBreakdown) {
        container.innerHTML = '';
        return;
    }
    
    let html = '<div class="category-breakdown-container">';
    html += '<h3 class="category-title">📊 Security Category Breakdown</h3>';
    html += '<div class="category-cards">';
    
    Object.keys(categoryBreakdown).forEach(key => {
        const category = categoryBreakdown[key];
        const icon = catalog.security_baseline.categories[key]?.icon || '📊';
        const statusClass = category.status;
        
        html += `
            <div class="category-card ${statusClass}">
                <div class="category-header">
                    <span class="category-icon">${icon}</span>
                    <span class="category-name">${category.name}</span>
                </div>
                <div class="category-score">
                    <div class="category-points">${category.earnedPoints}/${category.maxPoints}</div>
                    <div class="category-percentage">${category.percentage}%</div>
                </div>
                <div class="category-progress">
                    <div class="progress-bar">
                        <div class="progress-fill ${statusClass}" style="width: ${category.percentage}%"></div>
                    </div>
                </div>
                <div class="category-checks-count">${category.checks.filter(c => c.passed).length}/${category.checks.length} checks passed</div>
            </div>
        `;
    });
    
    html += '</div></div>';
    container.innerHTML = html;
}

/**
 * Display compliance gap analysis
 */
function displayComplianceGapAnalysis(gapAnalysis) {
    const container = document.getElementById('complianceGapAnalysis');
    if (!container || !gapAnalysis) {
        if (container) container.innerHTML = '';
        return;
    }
    
    let html = '<div class="gap-analysis-container">';
    html += `<h3 class="gap-title">🔍 Compliance Gap Analysis for ${gapAnalysis.industry}</h3>`;
    
    gapAnalysis.frameworks.forEach(framework => {
        const statusClass = framework.compliancePercentage >= 90 ? 'excellent' :
                           framework.compliancePercentage >= 75 ? 'good' :
                           framework.compliancePercentage >= 50 ? 'fair' : 'poor';
        
        html += `
            <div class="framework-gap">
                <div class="framework-header">
                    <div class="framework-info">
                        <h4>${framework.name}</h4>
                        <p class="framework-description">${framework.description}</p>
                        <span class="framework-scope">${framework.scope}</span>
                    </div>
                    <div class="framework-compliance">
                        <div class="compliance-percentage ${statusClass}">${framework.compliancePercentage}%</div>
                        <div class="compliance-count">${framework.compliantCount}/${framework.totalCount} controls</div>
                    </div>
                </div>
                <div class="gap-details">
                    <div class="gap-summary">
                        <span class="gap-count ${framework.gapCount > 0 ? 'has-gaps' : 'no-gaps'}">
                            ${framework.gapCount > 0 ? `⚠️ ${framework.gapCount} gap${framework.gapCount > 1 ? 's' : ''} found` : '✅ Fully compliant'}
                        </span>
                    </div>
                    ${framework.gapCount > 0 ? `
                        <div class="gap-items">
                            <h5>Missing Controls:</h5>
                            ${framework.controls.filter(c => c.status === 'non-compliant').map(control => `
                                <div class="gap-item">
                                    <div class="gap-control-id">${control.controlId}</div>
                                    <div class="gap-control-details">
                                        <strong>${control.checkName}</strong>
                                        <div class="gap-remediation">
                                            <strong>Action:</strong> ${control.remediation.action}
                                            <ul class="remediation-steps">
                                                ${control.remediation.steps.map(step => `<li>${step}</li>`).join('')}
                                            </ul>
                                            <div class="remediation-command"><code>${control.remediation.azureLocal}</code></div>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

/**
 * Display interactive compliance matrix
 */
function displayComplianceMatrix(complianceMatrix) {
    const container = document.getElementById('complianceMatrix');
    if (!container || !complianceMatrix) {
        if (container) container.innerHTML = '';
        return;
    }
    
    // Get unique frameworks
    const frameworks = new Set();
    complianceMatrix.rows.forEach(row => {
        Object.keys(row.frameworks).forEach(fw => frameworks.add(fw));
    });
    const frameworkList = Array.from(frameworks);
    
    let html = '<div class="compliance-matrix-container">';
    html += '<h3 class="matrix-title">📋 Interactive Compliance Matrix</h3>';
    html += `<div class="matrix-summary">
        <span class="summary-item compliant">✅ ${complianceMatrix.summary.compliantControls} Compliant</span>
        <span class="summary-item non-compliant">❌ ${complianceMatrix.summary.nonCompliantControls} Non-compliant</span>
        <span class="summary-item total">📊 ${complianceMatrix.summary.totalControls} Total Controls</span>
    </div>`;
    
    html += '<div class="matrix-table-wrapper"><table class="compliance-matrix-table">';
    
    // Header
    html += '<thead><tr>';
    html += '<th class="matrix-header-check">Security Check</th>';
    html += '<th class="matrix-header-category">Category</th>';
    frameworkList.forEach(fw => {
        html += `<th class="matrix-header-framework">${fw}</th>`;
    });
    html += '</tr></thead>';
    
    // Body
    html += '<tbody>';
    complianceMatrix.rows.forEach((row, index) => {
        const rowClass = `matrix-row-${row.severity}`;
        html += `<tr class="${rowClass}" data-row-id="${index}">`;
        html += `<td class="matrix-cell-check"><strong>${row.checkName}</strong></td>`;
        html += `<td class="matrix-cell-category"><span class="category-tag">${row.category}</span></td>`;
        
        frameworkList.forEach(fw => {
            const mapping = row.frameworks[fw];
            if (mapping) {
                const statusIcon = mapping.status === 'compliant' ? '✅' : '❌';
                const statusClass = mapping.status === 'compliant' ? 'status-compliant' : 'status-noncompliant';
                html += `<td class="matrix-cell-status ${statusClass}" title="${mapping.controlId}">
                    <span class="status-icon">${statusIcon}</span>
                    <span class="control-id">${mapping.controlId}</span>
                </td>`;
            } else {
                html += '<td class="matrix-cell-na">—</td>';
            }
        });
        
        html += '</tr>';
    });
    html += '</tbody></table></div></div>';
    
    container.innerHTML = html;
}

/**
 * Toggle security option (Defender, Policy)
 */
function toggleSecurityOption(option) {
    const checkbox = document.getElementById(`enable${option.charAt(0).toUpperCase() + option.slice(1)}`);
    const card = document.getElementById(`${option}Card`);
    
    if (checkbox.checked) {
        card.style.borderColor = 'var(--success-color)';
        card.style.background = 'var(--card-bg)';
    } else {
        card.style.borderColor = 'var(--border-color)';
        card.style.background = 'var(--card-bg)';
    }
}

/**
 * Initialize theme from localStorage or system preference
 */
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    setTheme(theme);

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

/**
 * Toggle between light and dark theme
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
}

/**
 * Set theme and update UI
 */
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    const icon = document.getElementById('themeIcon');
    const label = document.getElementById('themeLabel');
    
    if (theme === 'dark') {
        icon.textContent = '☀️';
        label.textContent = 'Light';
    } else {
        icon.textContent = '🌙';
        label.textContent = 'Dark';
    }
}
