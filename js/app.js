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
    initConfigTabs();
    
    // Initialize extension manager after catalog loads
    if (typeof ExtensionConfigManager !== 'undefined') {
        extensionManager = new ExtensionConfigManager(catalog);
        console.log('Extension manager initialized');
    }
});

/**
 * Embedded catalog data (to avoid CORS issues when opening HTML directly)
 */
const EMBEDDED_CATALOG = {
  "metadata": {
    "version": "1.1",
    "last_updated": "2024-12-17T22:30:00",
    "target": "Azure Local - Environment Specific"
  },
  "kubernetes_versions": ["1.31.10", "1.32.6", "1.32.5", "1.31.9", "1.30.14", "1.30.13"],
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
      {"name": "Standard_A2_v2", "vcpus": 2, "memory_gb": 4, "gpu": false},
      {"name": "Standard_A4_v2", "vcpus": 4, "memory_gb": 8, "gpu": false},
      {"name": "Standard_D4s_v3", "vcpus": 4, "memory_gb": 16, "gpu": false},
      {"name": "Standard_D8s_v3", "vcpus": 8, "memory_gb": 32, "gpu": false},
      {"name": "Standard_D16s_v3", "vcpus": 16, "memory_gb": 64, "gpu": false},
      {"name": "Standard_D32s_v3", "vcpus": 32, "memory_gb": 128, "gpu": false},
      {"name": "Standard_K8S3_v1", "vcpus": 4, "memory_gb": 6, "gpu": false}
    ],
    "gpu": [
      {"name": "Standard_NC16_A16", "vcpus": 16, "memory_gb": 64, "gpu": true, "gpu_model": "A16", "gpu_count": 2},
      {"name": "Standard_NC16_A2", "vcpus": 16, "memory_gb": 64, "gpu": true, "gpu_model": "A2", "gpu_count": 2},
      {"name": "Standard_NC32_A16", "vcpus": 32, "memory_gb": 128, "gpu": true, "gpu_model": "A16", "gpu_count": 2},
      {"name": "Standard_NC32_A2", "vcpus": 32, "memory_gb": 128, "gpu": true, "gpu_model": "A2", "gpu_count": 2},
      {"name": "Standard_NC4_A16", "vcpus": 4, "memory_gb": 8, "gpu": true, "gpu_model": "A16", "gpu_count": 1},
      {"name": "Standard_NC4_A2", "vcpus": 4, "memory_gb": 8, "gpu": true, "gpu_model": "A2", "gpu_count": 1},
      {"name": "Standard_NC8_A16", "vcpus": 8, "memory_gb": 16, "gpu": true, "gpu_model": "A16", "gpu_count": 1},
      {"name": "Standard_NC8_A2", "vcpus": 8, "memory_gb": 16, "gpu": true, "gpu_model": "A2", "gpu_count": 1},
      {"name": "Standard_NK12", "vcpus": 12, "memory_gb": 24, "gpu": true, "gpu_model": "Tesla T4", "gpu_count": 2},
      {"name": "Standard_NK6", "vcpus": 6, "memory_gb": 12, "gpu": true, "gpu_model": "Tesla T4", "gpu_count": 1}
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
    const gpuRequired = document.getElementById('gpuRequired');
    if (gpuRequired) {
        gpuRequired.addEventListener('change', (e) => {
            const gpuCountGroup = document.getElementById('gpuCountGroup');
            if (gpuCountGroup) {
                gpuCountGroup.style.display = e.target.checked ? 'block' : 'none';
            }
        });
    }

    // Cluster name input - update extension config display
    const clusterNameInput = document.getElementById('clusterName');
    if (clusterNameInput) {
        clusterNameInput.addEventListener('input', (e) => {
            const displaySpan = document.getElementById('clusterNameDisplay');
            if (displaySpan) {
                displaySpan.textContent = e.target.value || 'my-cluster';
            }
        });
    }

    // Rack awareness checkbox (if exists)
    const rackAwareness = document.getElementById('enableRackAwareness');
    if (rackAwareness) {
        rackAwareness.addEventListener('change', (e) => {
            const rackCountGroup = document.getElementById('rackCountGroup');
            if (rackCountGroup) {
                rackCountGroup.style.display = e.target.checked ? 'block' : 'none';
            }
        });
    }

    // Identity provider dropdown
    const identityProvider = document.getElementById('identityProvider');
    if (identityProvider) {
        identityProvider.addEventListener('change', updateIdentityOptions);
    }

    // Arc Gateway checkbox (shows Azure Local Cluster IP when enabled)
    const arcGatewayCheckbox = document.getElementById('arcGateway');
    if (arcGatewayCheckbox) {
        arcGatewayCheckbox.addEventListener('change', (e) => {
            // Show Azure Local Cluster IP field only when Arc Gateway is enabled
            // (assuming AKS VMs are on different VLAN)
            const clusterIPGroup = document.getElementById('azureLocalClusterIPGroup');
            if (clusterIPGroup) {
                clusterIPGroup.style.display = e.target.checked ? 'block' : 'none';
            }
        });
    }
}

/**
 * Toggle advanced configuration sections
 */
function toggleAdvancedSection(sectionId) {
    const section = document.getElementById(sectionId);
    const button = event.target;
    
    if (section.style.display === 'none') {
        section.style.display = 'block';
        button.textContent = '▼ Hide Advanced Settings';
    } else {
        section.style.display = 'none';
        button.textContent = '⚙️ Advanced ' + 
            (sectionId.includes('network') ? 'Network' : 
             sectionId.includes('storage') ? 'Storage' : 'Identity') + ' Settings';
    }
}

/**
 * Toggle banner sections (Quick Start, Cost Estimate, etc.)
 */
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const toggleIcon = document.getElementById(sectionId.replace('Content', 'Toggle'));
    
    if (section.style.display === 'none' || section.style.display === '') {
        section.style.display = 'block';
        if (toggleIcon) toggleIcon.style.transform = 'rotate(180deg)';
    } else {
        section.style.display = 'none';
        if (toggleIcon) toggleIcon.style.transform = 'rotate(0deg)';
    }
}

/**
 * Track whether all advanced sections are expanded
 */
let allAdvancedExpanded = false;

/**
 * Toggle all advanced configuration sections in Step 2
 */
function toggleAllAdvancedSections() {
    const advancedSections = [
        'clusterSizingSection',
        'networkConfigSection', 
        'storageConfigSection',
        'identityConfigSection',
        'arcGatewayConfigSection',
        'firewallConfigSection',
        'monitoringConfigSection',
        'securityConfigSection'
    ];
    
    allAdvancedExpanded = !allAdvancedExpanded;
    
    advancedSections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        const toggleIcon = document.getElementById(sectionId.replace('Section', 'Toggle'));
        
        if (section) {
            section.style.display = allAdvancedExpanded ? 'block' : 'none';
            if (toggleIcon) {
                toggleIcon.style.transform = allAdvancedExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
            }
        }
    });
    
    // Update the toggle button
    const expandBtn = document.getElementById('expandAllBtn');
    const expandIcon = document.getElementById('expandAllIcon');
    const expandText = document.getElementById('expandAllText');
    
    if (expandIcon) expandIcon.textContent = allAdvancedExpanded ? '▲' : '▼';
    if (expandText) expandText.textContent = allAdvancedExpanded ? 'Hide All' : 'Show All';
}

/**
 * Current active configuration tab
 */
let activeConfigTab = 'sizing';

/**
 * Configuration tab content definitions
 */
const configTabContent = {
    sizing: {
        title: 'Cluster Sizing & VM Selection',
        sectionId: 'clusterSizingSection'
    },
    network: {
        title: 'Network Configuration', 
        sectionId: 'networkConfigSection'
    },
    storage: {
        title: 'Storage Configuration',
        sectionId: 'storageConfigSection'
    },
    identity: {
        title: 'Identity & Access Control',
        sectionId: 'identityConfigSection'
    },
    gateway: {
        title: 'Arc Gateway & Network Connectivity',
        sectionId: 'arcGatewayConfigSection'
    },
    firewall: {
        title: 'Firewall Requirements',
        sectionId: 'firewallConfigSection'
    },
    monitoring: {
        title: 'Monitoring & Observability',
        sectionId: 'monitoringConfigSection'
    },
    security: {
        title: 'Security & Compliance',
        sectionId: 'securityConfigSection'
    }
};

/**
 * Show a specific configuration tab
 */
function showConfigTab(tabName) {
    activeConfigTab = tabName;
    
    // Update tab buttons
    document.querySelectorAll('.config-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    const activeTabBtn = document.getElementById(`tab-${tabName}`);
    if (activeTabBtn) activeTabBtn.classList.add('active');
    
    // Get the content container
    const contentContainer = document.getElementById('config-tab-content');
    if (!contentContainer) return;
    
    // Get the source section
    const tabConfig = configTabContent[tabName];
    if (!tabConfig) return;
    
    const sourceSection = document.getElementById(tabConfig.sectionId);
    if (sourceSection) {
        // Clone the content and display it
        contentContainer.innerHTML = sourceSection.innerHTML;
    } else {
        contentContainer.innerHTML = `<p style="color: var(--text-muted);">Loading ${tabConfig.title}...</p>`;
    }
}

/**
 * Initialize configuration tabs on page load
 */
function initConfigTabs() {
    // Hide the original accordion sections
    Object.values(configTabContent).forEach(config => {
        const section = document.getElementById(config.sectionId);
        if (section) {
            section.classList.add('accordion-section-hidden');
            // Also hide the h3 trigger
            const trigger = section.previousElementSibling;
            if (trigger && trigger.tagName === 'H3') {
                trigger.classList.add('accordion-section-hidden');
            }
        }
    });
    
    // Show the first tab by default
    showConfigTab('sizing');
}

/**
 * Show a specific Step 3 tab
 */
function showStep3Tab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.step3-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    const activeTabBtn = document.getElementById(`step3-tab-${tabName}`);
    if (activeTabBtn) activeTabBtn.classList.add('active');
    
    // Hide all tab contents
    document.querySelectorAll('.step3-tab-content').forEach(content => {
        content.style.display = 'none';
        content.classList.remove('active');
    });
    
    // Show selected tab content
    const activeContent = document.getElementById(`step3-content-${tabName}`);
    if (activeContent) {
        activeContent.style.display = 'block';
        activeContent.classList.add('active');
    }
}

/**
 * Update identity provider options display
 */
function updateIdentityOptions() {
    const provider = document.getElementById('identityProvider').value;
    const entraSettings = document.getElementById('entraIdSettings');
    
    if (provider === 'entra-id') {
        entraSettings.style.display = 'block';
    } else {
        entraSettings.style.display = 'none';
    }
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
    
    // Display regulatory frameworks as compact badges
    const badgesDiv = document.getElementById('complianceFrameworksBadges');
    let badgesHtml = '';
    industry.regulatory_frameworks.forEach(framework => {
        badgesHtml += `<span style="background: var(--primary-color); color: white; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 500;">${framework.name}</span>`;
    });
    badgesDiv.innerHTML = badgesHtml;
    
    // Display full framework details (hidden by default)
    let html = '';
    industry.regulatory_frameworks.forEach(framework => {
        html += `
            <div class="framework-item" style="margin-bottom: 15px; padding: 12px; background: white; border-radius: 4px; border: 1px solid #e0e0e0;">
                <div style="font-weight: 600; color: var(--primary-color); margin-bottom: 6px; font-size: 0.95rem;">📋 ${framework.name}</div>
                <div style="font-size: 0.85rem; color: #666; margin-bottom: 6px;">${framework.description}</div>
                <div style="font-size: 0.85rem; margin-bottom: 8px;"><strong>Scope:</strong> ${framework.scope}</div>
                <details style="font-size: 0.85rem;">
                    <summary style="cursor: pointer; color: var(--primary-color); font-weight: 500;">Key Requirements (${framework.key_requirements.length})</summary>
                    <ul style="margin: 8px 0 0 20px; padding: 0;">
                        ${framework.key_requirements.map(req => `<li style="margin-bottom: 4px;">${req}</li>`).join('')}
                    </ul>
                </details>
            </div>
        `;
    });
    
    frameworksDiv.innerHTML = html;
    
    // Hide details by default
    document.getElementById('complianceFrameworksDetails').style.display = 'none';
    
    console.log(`Selected industry: ${industry.name}`);
}

/**
 * Toggle compliance framework details
 */
function toggleComplianceDetails() {
    const detailsDiv = document.getElementById('complianceFrameworksDetails');
    const btn = event.target;
    
    if (detailsDiv.style.display === 'none') {
        detailsDiv.style.display = 'block';
        btn.textContent = 'Hide Details';
    } else {
        detailsDiv.style.display = 'none';
        btn.textContent = 'View Details';
    }
}

/**
 * Select data sovereignty region
 */
let selectedRegion = null;
let aiWorkloadsEnabled = false;

function selectRegion(regionId) {
    selectedRegion = regionId;
    
    const detailsDiv = document.getElementById('sovereigntyDetails');
    const contentDiv = document.getElementById('sovereigntyContent');
    
    if (!regionId || !catalog.data_sovereignty?.regions[regionId]) {
        detailsDiv.style.display = 'none';
        return;
    }
    
    const region = catalog.data_sovereignty.regions[regionId];
    detailsDiv.style.display = 'block';
    
    let html = `
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
            <span style="font-size: 2rem;">${region.icon}</span>
            <div>
                <h4 style="margin: 0; color: var(--primary-color);">${region.name}</h4>
                <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">${region.description}</p>
            </div>
        </div>
        
        <div style="background: rgba(16,185,129,0.1); border-left: 3px solid #10b981; padding: 10px 12px; margin-bottom: 15px; border-radius: 0 6px 6px 0;">
            <strong style="color: #10b981;">📍 Data Residency Note:</strong>
            <p style="margin: 5px 0 0 0; font-size: 0.9rem;">${region.data_residency_note}</p>
        </div>
        
        <h5 style="margin: 15px 0 10px 0; color: var(--text-color);">Key Regulations:</h5>
    `;
    
    region.key_regulations.forEach(reg => {
        html += `
            <div style="background: rgba(255,255,255,0.5); border: 1px solid var(--border-color); border-radius: 6px; padding: 12px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                    <div>
                        <strong style="color: var(--primary-color);">${reg.name}</strong>
                        <span style="font-size: 0.8rem; color: var(--text-muted); margin-left: 8px;">${reg.full_name}</span>
                    </div>
                </div>
                <p style="font-size: 0.85rem; margin: 0 0 10px 0; color: var(--text-muted);">${reg.description}</p>
                
                <details style="font-size: 0.85rem;">
                    <summary style="cursor: pointer; color: var(--primary-color); font-weight: 500;">Requirements (${reg.requirements.length})</summary>
                    <ul style="margin: 8px 0 0 15px; padding: 0;">
                        ${reg.requirements.map(req => `<li style="margin-bottom: 4px;">${req}</li>`).join('')}
                    </ul>
                </details>
                
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border-color);">
                    <strong style="color: #10b981; font-size: 0.85rem;">✓ Why On-Premises Matters:</strong>
                    <p style="margin: 5px 0 0 0; font-size: 0.85rem; color: var(--text-color);">${reg.why_on_premises}</p>
                </div>
            </div>
        `;
    });
    
    // Recommended frameworks
    html += `
        <div style="margin-top: 15px;">
            <strong style="font-size: 0.9rem;">Recommended Compliance Frameworks:</strong>
            <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px;">
                ${region.recommended_frameworks.map(f => `<span style="background: var(--primary-color); color: white; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem;">${f}</span>`).join('')}
            </div>
        </div>
    `;
    
    contentDiv.innerHTML = html;
    console.log(`Selected region: ${region.name}`);
}

/**
 * Select AI workloads option
 */
function selectAIWorkloads(enabled) {
    aiWorkloadsEnabled = enabled;
    
    const detailsDiv = document.getElementById('aiComplianceDetails');
    const contentDiv = document.getElementById('aiComplianceContent');
    
    // Update radio button styling
    document.querySelectorAll('.ai-option').forEach(opt => {
        opt.style.borderColor = 'var(--border-color)';
        opt.style.background = 'transparent';
    });
    
    const selectedOption = enabled ? 
        document.querySelector('input[value="yes"]').parentElement :
        document.querySelector('input[value="no"]').parentElement;
    selectedOption.style.borderColor = 'var(--primary-color)';
    selectedOption.style.background = 'rgba(0,212,255,0.05)';
    
    if (!enabled) {
        detailsDiv.style.display = 'none';
        return;
    }
    
    detailsDiv.style.display = 'block';
    
    if (!catalog.ai_compliance) {
        contentDiv.innerHTML = '<p>AI compliance data not available.</p>';
        return;
    }
    
    // Filter frameworks based on selected industry
    let applicableFrameworks = catalog.ai_compliance.frameworks.filter(f => 
        f.applicable_industries.includes('all') || 
        f.applicable_industries.includes(selectedIndustry)
    );
    
    let html = `
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
            <span style="font-size: 2rem;">🤖</span>
            <div>
                <h4 style="margin: 0; color: #7c3aed;">AI/ML Compliance Considerations</h4>
                <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">Emerging regulations for AI systems deployed on-premises</p>
            </div>
        </div>
        
        <div style="background: rgba(124,58,237,0.1); border-left: 3px solid #7c3aed; padding: 10px 12px; margin-bottom: 15px; border-radius: 0 6px 6px 0;">
            <strong style="color: #7c3aed;">🔒 Sovereign AI Advantage:</strong>
            <p style="margin: 5px 0 0 0; font-size: 0.9rem;">Running AI on-premises with Foundry Local ensures your data never leaves your environment during inference, providing complete control for regulatory compliance.</p>
        </div>
    `;
    
    // Show relevant frameworks
    html += `<h5 style="margin: 15px 0 10px 0;">Applicable AI Regulations:</h5>`;
    
    applicableFrameworks.forEach(framework => {
        html += `
            <div style="background: rgba(255,255,255,0.5); border: 1px solid var(--border-color); border-radius: 6px; padding: 12px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.2rem;">${framework.icon}</span>
                        <div>
                            <strong style="color: #7c3aed;">${framework.name}</strong>
                            <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: 8px;">${framework.effective_date}</span>
                        </div>
                    </div>
                </div>
                <p style="font-size: 0.85rem; margin: 0 0 10px 0; color: var(--text-muted);">${framework.description}</p>
                
                <details style="font-size: 0.85rem;">
                    <summary style="cursor: pointer; color: #7c3aed; font-weight: 500;">Key Requirements (${framework.key_requirements.length})</summary>
                    <ul style="margin: 8px 0 0 15px; padding: 0;">
                        ${framework.key_requirements.map(req => `<li style="margin-bottom: 4px;">${req}</li>`).join('')}
                    </ul>
                </details>
                
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border-color);">
                    <strong style="color: #10b981; font-size: 0.85rem;">✓ Why On-Premises AI:</strong>
                    <p style="margin: 5px 0 0 0; font-size: 0.85rem; color: var(--text-color);">${framework.why_on_premises}</p>
                </div>
            </div>
        `;
    });
    
    // Show sovereign AI benefits
    html += `
        <h5 style="margin: 20px 0 10px 0;">Sovereign AI Benefits:</h5>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px;">
    `;
    
    catalog.ai_compliance.sovereign_ai_benefits.forEach(benefit => {
        html += `
            <div style="background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.2); border-radius: 6px; padding: 10px;">
                <strong style="color: #10b981; font-size: 0.85rem;">✓ ${benefit.benefit}</strong>
                <p style="font-size: 0.8rem; margin: 5px 0; color: var(--text-muted);">${benefit.description}</p>
                <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px;">
                    ${benefit.regulations_addressed.slice(0, 3).map(r => `<span style="background: rgba(16,185,129,0.2); color: #10b981; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem;">${r}</span>`).join('')}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    contentDiv.innerHTML = html;
    console.log(`AI workloads enabled: ${enabled}`);
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
        // Update cluster sizing fields with defaults from template
        document.getElementById('selectedStageName').textContent = template.name;
        document.getElementById('controlPlaneCount').value = template.control_plane_count;
        document.getElementById('workerNodeCount').value = template.min_nodes;
        
        // Update total VM count display
        updateTotalVmCount();
        
        // Store original values for change detection
        window.originalClusterSizing = {
            controlPlaneCount: template.control_plane_count,
            workerNodeCount: template.min_nodes
        };
        
        // These will be applied during plan generation
        console.log(`Selected environment: ${template.name}`);
    }
}

/**
 * Update total VM count display
 */
function updateTotalVmCount() {
    const controlPlaneCount = parseInt(document.getElementById('controlPlaneCount').value) || 3;
    const workerNodeCount = parseInt(document.getElementById('workerNodeCount').value) || 3;
    const totalVms = controlPlaneCount + workerNodeCount;
    
    document.getElementById('totalVmCount').textContent = totalVms;
    document.getElementById('totalVmBreakdown').textContent = `${controlPlaneCount} control plane + ${workerNodeCount} workers`;
}

/**
 * Check if cluster sizing has been changed from defaults
 */
function checkClusterSizingChanges() {
    updateTotalVmCount();
    
    if (!window.originalClusterSizing) return;
    
    const currentControlPlane = parseInt(document.getElementById('controlPlaneCount').value);
    const currentWorkerNodes = parseInt(document.getElementById('workerNodeCount').value);
    
    const controlPlaneChanged = currentControlPlane !== window.originalClusterSizing.controlPlaneCount;
    const workerNodesChanged = currentWorkerNodes !== window.originalClusterSizing.workerNodeCount;
    
    const warningDiv = document.getElementById('clusterSizingWarning');
    const detailSpan = document.getElementById('sizingChangeDetail');
    
    if (controlPlaneChanged || workerNodesChanged) {
        const changes = [];
        if (controlPlaneChanged) {
            changes.push(`Control plane: ${window.originalClusterSizing.controlPlaneCount} → ${currentControlPlane} VMs`);
        }
        if (workerNodesChanged) {
            changes.push(`Workers: ${window.originalClusterSizing.workerNodeCount} → ${currentWorkerNodes} VMs`);
        }
        detailSpan.textContent = changes.join(' | ');
        warningDiv.style.display = 'block';
    } else {
        warningDiv.style.display = 'none';
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
    
    // Update POC section visibility for Arc extensions
    updatePOCSection(solutionType);
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
    
    // Show/hide POC document section for Arc extensions
    updatePOCSection(workloadType);
    
    // Update extension configuration UI
    if (extensionManager) {
        extensionManager.renderExtensionsList(workloadType);
        extensionManager.renderSolutionConfig(workloadType);
    }
}

/**
 * Update POC document section visibility based on selected workload or solution
 */
function updatePOCSection(workloadType = null) {
    const pocSection = document.getElementById('pocDocumentSection');
    const pocDocumentTitle = document.getElementById('pocDocumentTitle');
    
    if (!pocSection) return; // Section not yet in DOM
    
    // Check if workload or solution is an Arc extension
    const arcExtensions = ['video-indexer-arc', 'edge-rag-arc', 'iot-operations-arc'];
    
    // Prioritize selectedSolution, fall back to workloadType parameter
    const extensionKey = (selectedSolution && arcExtensions.includes(selectedSolution)) 
        ? selectedSolution 
        : (workloadType && arcExtensions.includes(workloadType)) 
            ? workloadType 
            : null;
    
    if (extensionKey) {
        // Try to get workload data from edge_ai_solutions first, then workload_presets
        let workloadData = null;
        if (catalog.edge_ai_solutions && catalog.edge_ai_solutions[extensionKey]) {
            workloadData = catalog.edge_ai_solutions[extensionKey];
        } else if (catalog.workload_presets && catalog.workload_presets[extensionKey]) {
            workloadData = catalog.workload_presets[extensionKey];
        }
        
        pocSection.style.display = 'block';
        if (workloadData && pocDocumentTitle) {
            pocDocumentTitle.textContent = `🚀 ${workloadData.name} - POC Guide`;
        }
    } else {
        pocSection.style.display = 'none';
    }
}

/**
 * Download POC document for selected Arc extension
 */
async function downloadPOCDocument() {
    console.log('=== Download POC Document Clicked ===');
    console.log('Selected workload:', selectedWorkload);
    console.log('Selected solution:', selectedSolution);
    
    // Determine which Arc extension to use (prioritize selectedSolution for Arc extensions)
    const arcExtensions = ['video-indexer-arc', 'edge-rag-arc', 'iot-operations-arc'];
    let extensionKey = null;
    
    // Check selectedSolution first (from Edge AI solution selector)
    if (selectedSolution && arcExtensions.includes(selectedSolution)) {
        extensionKey = selectedSolution;
    }
    // Fall back to selectedWorkload
    else if (selectedWorkload && arcExtensions.includes(selectedWorkload)) {
        extensionKey = selectedWorkload;
    }
    
    if (!extensionKey) {
        alert('Please select an Azure Arc Extension first (Edge RAG, Video Indexer Arc, or IoT Operations)');
        return;
    }
    
    console.log('Using extension key:', extensionKey);

    try {
        // Validate catalog data - check edge_ai_solutions first, then workload_presets
        if (!catalog) {
            console.error('Catalog not loaded');
            alert('Configuration data not loaded. Please refresh the page.');
            return;
        }
        
        let workloadData = null;
        
        // Try edge_ai_solutions first (for Arc extensions selected via solution picker)
        if (catalog.edge_ai_solutions && catalog.edge_ai_solutions[extensionKey]) {
            workloadData = catalog.edge_ai_solutions[extensionKey];
            console.log('Found in edge_ai_solutions:', workloadData.name);
        }
        // Fall back to workload_presets
        else if (catalog.workload_presets && catalog.workload_presets[extensionKey]) {
            workloadData = catalog.workload_presets[extensionKey];
            console.log('Found in workload_presets:', workloadData.name);
        }
        
        if (!workloadData) {
            console.error('Workload data not found for:', extensionKey);
            console.log('Available in edge_ai_solutions:', catalog.edge_ai_solutions ? Object.keys(catalog.edge_ai_solutions) : 'N/A');
            console.log('Available in workload_presets:', catalog.workload_presets ? Object.keys(catalog.workload_presets) : 'N/A');
            alert('Workload configuration not found. Please try again.');
            return;
        }

        // Find and disable button during generation
        const btn = document.querySelector('#pocDocumentSection button');
        if (btn) {
            btn.disabled = true;
            btn.textContent = '⏳ Loading PDF Generator...';
        }

        // Wait for POCReportGenerator to be available (with timeout)
        let attempts = 0;
        while (typeof window.POCReportGenerator === 'undefined' && attempts < 20) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        // Check if POCReportGenerator is available after waiting
        if (typeof window.POCReportGenerator === 'undefined') {
            console.error('POCReportGenerator not loaded after waiting');
            console.log('Available POC globals:', Object.keys(window).filter(k => k.includes('POC')));
            if (btn) {
                btn.disabled = false;
                btn.textContent = '📄 Download POC Guide';
            }
            alert('POC report generator not available. Please refresh the page and try again.');
            return;
        }

        if (btn) {
            btn.textContent = '⏳ Generating Document...';
        }

        console.log('Generating POC Document for:', extensionKey, workloadData.name);

        // Generate PDF report
        const generator = new window.POCReportGenerator();
        const filename = await generator.generatePDFReport(extensionKey, workloadData.name);

        console.log('✅ POC PDF generated successfully:', filename);
        
        // Re-enable button
        if (btn) {
            btn.disabled = false;
            btn.textContent = '📄 Download POC Guide';
        }

    } catch (error) {
        console.error('Error generating POC document:', error);
        console.error('Error stack:', error.stack);
        alert(`Failed to generate POC document: ${error.message}`);
        
        // Re-enable button
        const btn = document.querySelector('#pocDocumentSection button');
        if (btn) {
            btn.disabled = false;
            btn.textContent = '📄 Download POC Guide';
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
        
        // Render extension configuration when entering Step 2
        if (currentStep === 2 && extensionManager && selectedWorkload) {
            extensionManager.renderExtensionsList(selectedWorkload);
            extensionManager.renderSolutionConfig(selectedWorkload);
        }
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
    
    // CRITICAL FIX: Declare variables OUTSIDE try block to ensure proper scope
    let clusterName = '';
    let resourceGroup = '';
    let customLocation = '';
    
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
        
        // Validate required fields - capture actual STRING values
        clusterName = String(document.getElementById('clusterName').value).trim();
        resourceGroup = String(document.getElementById('resourceGroup').value).trim();
        customLocation = String(document.getElementById('customLocation').value).trim();
        
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

    // Gather all configuration options
    const config = {
        workloadType: selectedWorkload,
        environment: selectedEnvironment,
        clusterName,
        resourceGroup,
        location: document.getElementById('location').value,
        customLocation,
        logicalNetwork: document.getElementById('logicalNetwork')?.value || '',
        azureLocalClusterIP: document.getElementById('azureLocalClusterIP')?.value || '',
        sshPublicKey: document.getElementById('sshPublicKey')?.value.trim() || '',
        cpuCores: parseInt(document.getElementById('cpuCores').value),
        memoryGb: parseInt(document.getElementById('memoryGb').value),
        gpuRequired: document.getElementById('gpuRequired').checked,
        gpuCount: parseInt(document.getElementById('gpuCount').value) || 0,
        enableAvailabilitySets: true, // Always enabled by default in AKS Arc
        physicalHostCount: 3, // Default to 3 physical hosts (field removed from UI)
        
        // Cluster sizing configuration (from Step 2 UI controls)
        controlPlaneCountOverride: parseInt(document.getElementById('controlPlaneCount').value),
        workerNodeCount: parseInt(document.getElementById('workerNodeCount').value),
        workerNodeVmSize: document.getElementById('workerNodeVmSize').value,
        controlPlaneVmSize: document.getElementById('controlPlaneVmSize').value,
        
        // Network configuration
        networkPlugin: 'calico', // Fixed: Calico VXLAN is the only CNI for AKS Arc
        podCIDR: document.getElementById('podCIDR')?.value || '10.244.0.0/16',
        serviceCIDR: '10.96.0.0/12', // Fixed: Service CIDR is not customizable in AKS Arc
        dnsServiceIP: document.getElementById('dnsServiceIP')?.value || '10.96.0.10',
        loadBalancerSku: document.getElementById('loadBalancerSku')?.value || 'Standard',
        controlPlaneIP: document.getElementById('controlPlaneIP')?.value || '',
        enableNetworkPolicy: document.getElementById('enableNetworkPolicy')?.checked || false,
        enablePrivateCluster: document.getElementById('enablePrivateCluster')?.checked || false,
        
        // Arc Gateway configuration
        enableArcGateway: document.getElementById('arcGateway')?.checked || false,
        arcGatewayResourceId: document.getElementById('arcGatewayResourceId')?.value || '',
        arcGatewayUrl: document.getElementById('arcGatewayUrl')?.value || '',
        
        // Firewall configuration
        azureRegion: document.getElementById('azureRegion')?.value || 'westeurope',
        
        // Storage configuration
        defaultStorageClass: document.getElementById('defaultStorageClass')?.value || 'local-path',
        enableVolumeEncryption: document.getElementById('enableVolumeEncryption')?.checked || false,
        enableVolumeSnapshots: document.getElementById('enableVolumeSnapshots')?.checked || false,
        storageQuotaGb: parseInt(document.getElementById('storageQuotaGb')?.value) || 100,
        
        // Identity & Access
        identityProvider: document.getElementById('identityProvider')?.value || 'local',
        rbacMode: document.getElementById('rbacMode')?.value || 'enabled',
        enableWorkloadIdentity: document.getElementById('enableWorkloadIdentity')?.checked || false,
        enableAzureAD: document.getElementById('identityProvider')?.value === 'azure-ad' || document.getElementById('identityProvider')?.value === 'entra-id',
        enableEntraID: document.getElementById('identityProvider')?.value === 'entra-id',
        entraAdminGroupIds: document.getElementById('entraAdminGroupIds')?.value || '',
        enablePodSecurityStandards: document.getElementById('enablePodSecurityStandards')?.checked || false,
        
        // Monitoring & Observability
        enableAzureMonitor: document.getElementById('enableAzureMonitor')?.checked || false,
        enablePrometheus: document.getElementById('enablePrometheus')?.checked || false,
        logRetentionDays: parseInt(document.getElementById('logRetentionDays')?.value) || 90,
        enableAuditLogs: document.getElementById('enableAuditLogs')?.checked || false,
        
        // Security & Compliance
        enableDefender: document.getElementById('enableDefender')?.checked || false,
        enablePolicy: document.getElementById('enablePolicy')?.checked !== false,
        
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
    
    // Add extension configuration
    if (extensionManager && selectedWorkload) {
        deploymentPlan.extensionConfig = extensionManager.getExtensionConfig(selectedWorkload);
        console.log('Extension config added to plan:', deploymentPlan.extensionConfig);
    }
    
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
    
    // Add data sovereignty information to plan
    if (selectedRegion && catalog.data_sovereignty?.regions[selectedRegion]) {
        deploymentPlan.dataSovereignty = {
            region: selectedRegion,
            details: catalog.data_sovereignty.regions[selectedRegion]
        };
    }
    
    // Add AI compliance information to plan
    if (aiWorkloadsEnabled && catalog.ai_compliance) {
        const applicableFrameworks = catalog.ai_compliance.frameworks.filter(f => 
            f.applicable_industries.includes('all') || 
            f.applicable_industries.includes(selectedIndustry)
        );
        deploymentPlan.aiCompliance = {
            enabled: true,
            frameworks: applicableFrameworks,
            benefits: catalog.ai_compliance.sovereign_ai_benefits
        };
    }
    
    // Display results (these always run)
    try {
        displaySecurityScore(securityResult);
        displayValidationResults(deploymentPlan.validation);
        displayPlanSummary(deploymentPlan);
        
        // Show network diagram if Arc Gateway is enabled
        displayNetworkDiagram(deploymentPlan);
        
        // Store deployment plan globally for Azure deployment
        window.currentDeploymentPlan = deploymentPlan;
        
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

    // Arc Gateway & Firewall Configuration
    if (plan.arcGatewayConfig || plan.firewallConfig) {
        html += '<div class="summary-section" style="background: linear-gradient(135deg, #43e97b15 0%, #38f9d715 100%);">';
        html += '<h4>🌐 Network Connectivity</h4>';
        html += '<table class="summary-table">';
        
        if (plan.arcGatewayConfig) {
            html += `<tr><td>Arc Gateway:</td><td><strong style="color: ${plan.arcGatewayConfig.enabled ? '#28a745' : '#dc3545'};">${plan.arcGatewayConfig.enabled ? '✅ Enabled' : '❌ Not Enabled'}</strong></td></tr>`;
            if (plan.arcGatewayConfig.enabled) {
                html += `<tr><td>Gateway URL:</td><td>${plan.arcGatewayConfig.gatewayUrl || 'Not specified'}</td></tr>`;
                html += `<tr><td>Endpoint Reduction:</td><td><strong style="color: #28a745;">${plan.arcGatewayConfig.endpointReduction}</strong></td></tr>`;
            }
        }
        
        if (plan.firewallConfig) {
            html += `<tr><td>Azure Region:</td><td>${plan.firewallConfig.regionName}</td></tr>`;
            html += `<tr><td>Required Endpoints:</td><td><strong>${plan.firewallConfig.totalEndpoints}</strong> ${plan.arcGatewayConfig?.enabled ? '(with Arc Gateway)' : '(without Arc Gateway)'}</td></tr>`;
            html += `<tr><td>Endpoint Documentation:</td><td><a href="${plan.firewallConfig.documentationUrl}" target="_blank" style="color: var(--primary-color); text-decoration: underline;">View Complete List</a></td></tr>`;
        }
        
        html += '</table>';
        
        // Show network diagram link
        html += '<div style="margin-top: 12px; padding: 10px; background: rgba(33, 150, 243, 0.1); border-left: 3px solid #2196F3; border-radius: 4px;">';
        html += '<small><strong>💡 Tip:</strong> Scroll down to view the <strong>Network Architecture & Traffic Flows</strong> diagram for detailed connectivity information.</small>';
        html += '</div>';
        
        html += '</div>';
    }

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
    
    // Data Sovereignty section (if selected)
    if (plan.dataSovereignty) {
        const sov = plan.dataSovereignty.details;
        html += '<div class="summary-section" style="background: linear-gradient(135deg, rgba(0,212,255,0.05) 0%, rgba(16,185,129,0.05) 100%); border-left: 3px solid #10b981;">';
        html += `<h4>${sov.icon} Data Residency: ${sov.name}</h4>`;
        html += `<p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 10px;">${sov.data_residency_note}</p>`;
        html += '<div style="margin-bottom: 8px;"><strong>Key Regulations:</strong></div>';
        html += '<div style="display: flex; flex-wrap: wrap; gap: 6px;">';
        sov.key_regulations.forEach(reg => {
            html += `<span style="background: #10b981; color: white; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem;">${reg.name}</span>`;
        });
        html += '</div>';
        html += '<div style="margin-top: 10px;"><strong>Recommended Frameworks:</strong></div>';
        html += '<div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 5px;">';
        sov.recommended_frameworks.forEach(f => {
            html += `<span style="background: var(--primary-color); color: white; padding: 3px 8px; border-radius: 10px; font-size: 0.75rem;">${f}</span>`;
        });
        html += '</div>';
        html += '</div>';
    }
    
    // AI Compliance section (if enabled)
    if (plan.aiCompliance?.enabled) {
        html += '<div class="summary-section" style="background: linear-gradient(135deg, rgba(124,58,237,0.05) 0%, rgba(168,85,247,0.05) 100%); border-left: 3px solid #7c3aed;">';
        html += '<h4>🤖 AI/ML Compliance</h4>';
        html += '<p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 10px;">This cluster is configured for AI workloads with sovereign AI capabilities.</p>';
        html += '<div style="margin-bottom: 8px;"><strong>Applicable AI Regulations:</strong></div>';
        html += '<div style="display: flex; flex-wrap: wrap; gap: 6px;">';
        plan.aiCompliance.frameworks.forEach(f => {
            html += `<span style="background: #7c3aed; color: white; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem;">${f.icon} ${f.name}</span>`;
        });
        html += '</div>';
        html += '<div style="margin-top: 12px; padding: 10px; background: rgba(16,185,129,0.1); border-radius: 6px;">';
        html += '<strong style="color: #10b981;">✓ Sovereign AI Benefits:</strong>';
        html += '<ul style="margin: 8px 0 0 15px; font-size: 0.85rem;">';
        html += '<li>AI inference runs entirely on-premises</li>';
        html += '<li>Training data never leaves your environment</li>';
        html += '<li>Complete model transparency and auditability</li>';
        html += '</ul>';
        html += '</div>';
        html += '</div>';
    }

    html += '</div>';
    container.innerHTML = html;
}

/**
 * Export template
 */
async function exportTemplate(format) {
    if (!deploymentPlan) {
        alert('No deployment plan available');
        return;
    }

    const clusterName = deploymentPlan.clusterConfig.clusterName;
    const hasExtensions = deploymentPlan.extensionConfig && deploymentPlan.extensionConfig.extensions && deploymentPlan.extensionConfig.extensions.length > 0;

    // For ARM format with extensions, create ZIP bundle
    if (format === 'arm' && hasExtensions) {
        await exportARMWithExtensions(clusterName, deploymentPlan);
        return;
    }

    // Single file export (no extensions or non-ARM format)
    let content, filename, mimeType;

    switch (format) {
        case 'bicep':
            content = TemplateGenerator.generateBicep(deploymentPlan);
            filename = `${clusterName}.bicep`;
            mimeType = 'text/plain';
            break;
        case 'arm':
            content = TemplateGenerator.generateARM(deploymentPlan);
            filename = `aksarc-cluster.json`;
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
 * Export ARM templates with extensions as ZIP bundle
 */
async function exportARMWithExtensions(clusterName, plan) {
    try {
        // Load JSZip dynamically
        if (typeof JSZip === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            document.head.appendChild(script);
            await new Promise(resolve => script.onload = resolve);
        }

        const zip = new JSZip();
        
        // 1. Generate main cluster template
        const clusterTemplate = TemplateGenerator.generateARM(plan);
        zip.file('aksarc-cluster.json', clusterTemplate);
        
        // 2. Generate workspace template if needed
        if (plan.extensionConfig.workspace && plan.extensionConfig.workspace.create) {
            const workspaceTemplate = TemplateGenerator.generateWorkspaceTemplate(
                plan.extensionConfig.workspace.name,
                plan.clusterConfig.location
            );
            zip.file('workspace.json', workspaceTemplate);
        }
        
        // 3. Generate extension templates
        const extensionNames = [];
        for (const ext of plan.extensionConfig.extensions) {
            const extTemplate = TemplateGenerator.generateExtensionTemplate(ext, clusterName);
            zip.file(`extension-${ext.name}.json`, extTemplate);
            extensionNames.push(ext.name);
        }
        
        // 4. Generate orchestrator template
        const orchestratorTemplate = TemplateGenerator.generateOrchestratorTemplate(clusterName, extensionNames);
        zip.file('deploy-all.json', orchestratorTemplate);
        
        // 5. Generate README
        const readme = generateDeploymentREADME(clusterName, plan);
        zip.file('README.md', readme);
        
        // Generate and download ZIP
        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${clusterName}-deployment.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        
        console.log('✅ ZIP bundle generated with', extensionNames.length, 'extensions');
    } catch (error) {
        console.error('Failed to generate ZIP bundle:', error);
        alert('Failed to generate ZIP bundle. Downloading cluster template only.');
        const clusterTemplate = TemplateGenerator.generateARM(plan);
        TemplateGenerator.downloadFile(clusterTemplate, 'aksarc-cluster.json', 'application/json');
    }
}

/**
 * Generate README for deployment bundle
 */
function generateDeploymentREADME(clusterName, plan) {
    const extensions = plan.extensionConfig?.extensions || [];
    const hasWorkspace = plan.extensionConfig?.workspace?.create;
    
    return `# AKS Arc Deployment - ${clusterName}

Generated: ${new Date().toISOString()}

## 📦 Contents

- \`aksarc-cluster.json\` - Main AKS Arc cluster template
${hasWorkspace ? '- `workspace.json` - Log Analytics workspace\n' : ''}${extensions.map(e => `- \`extension-${e.name}.json\` - ${e.extensionType} extension`).join('\n')}
- \`deploy-all.json\` - Orchestrator template (deploys everything)

## 🚀 Quick Deploy

Deploy everything with a single command:

\`\`\`bash
az deployment group create \\
  --resource-group <your-rg> \\
  --template-file deploy-all.json \\
  --parameters clusterName=${clusterName}
\`\`\`

## 📋 Manual Deploy (Step-by-Step)

### 1. Deploy Cluster

\`\`\`bash
az deployment group create \\
  --resource-group <your-rg> \\
  --template-file aksarc-cluster.json
\`\`\`

${hasWorkspace ? `### 2. Deploy Log Analytics Workspace

\`\`\`bash
az deployment group create \\
  --resource-group <your-rg> \\
  --template-file workspace.json
\`\`\`

` : ''}### ${hasWorkspace ? '3' : '2'}. Deploy Extensions

${extensions.map((e, i) => `\`\`\`bash
# ${e.name}
az deployment group create \\
  --resource-group <your-rg> \\
  --template-file extension-${e.name}.json \\
  --parameters clusterName=${clusterName}
\`\`\``).join('\n\n')}

## ℹ️ Extension Details

${extensions.map(e => `- **${e.name}**: ${e.extensionType}`).join('\n')}

## 📖 Documentation

- [AKS Arc Documentation](https://learn.microsoft.com/en-us/azure/aks/hybrid/)
- [Arc Extensions](https://learn.microsoft.com/en-us/azure/azure-arc/kubernetes/extensions)
`;
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
        // Disable button during generation
        const btn = document.getElementById('pdfReportBtn');
        if (btn) {
            btn.disabled = true;
            btn.textContent = '⏳ Loading PDF Generator...';
        }

        // Wait for ComplianceReportGenerator to be available (with timeout)
        let attempts = 0;
        while (typeof window.ComplianceReportGenerator === 'undefined' && attempts < 20) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        // Check if ComplianceReportGenerator is available after waiting
        if (typeof window.ComplianceReportGenerator === 'undefined') {
            console.error('ComplianceReportGenerator not loaded after waiting');
            console.log('Available globals:', Object.keys(window).filter(k => k.includes('Compliance')));
            if (btn) {
                btn.disabled = false;
                btn.textContent = '📑 Download PDF Compliance Report';
            }
            alert('Compliance report generator not available. Please refresh the page and try again.');
            return;
        }

        if (btn) {
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
        const generator = new window.ComplianceReportGenerator();
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
 * Toggle between light, dark, and ArcOps themes
 */
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.classList.contains('arcops-theme') ? 'arcops' :
                        (document.documentElement.getAttribute('data-theme') || 'light');
    
    // Cycle through: light -> dark -> arcops -> light
    let newTheme;
    if (currentTheme === 'light') {
        newTheme = 'dark';
    } else if (currentTheme === 'dark') {
        newTheme = 'arcops';
    } else {
        newTheme = 'light';
    }
    
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
}

/**
 * Set theme and update UI
 */
function setTheme(theme) {
    const body = document.body;
    const icon = document.getElementById('themeIcon');
    const label = document.getElementById('themeLabel');
    
    // Remove all theme classes
    body.classList.remove('arcops-theme');
    document.documentElement.removeAttribute('data-theme');
    
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (icon) icon.textContent = '🎨';
        if (label) label.textContent = 'ArcOps';
    } else if (theme === 'arcops') {
        body.classList.add('arcops-theme');
        document.documentElement.setAttribute('data-theme', 'dark');
        if (icon) icon.textContent = '☀️';
        if (label) label.textContent = 'Light';
    } else {
        // Light theme (default)
        if (icon) icon.textContent = '🌙';
        if (label) label.textContent = 'Dark';
    }
}

/**
 * Display network architecture diagram
 */
function displayNetworkDiagram(plan) {
    const diagramSection = document.getElementById('networkDiagramSection');
    const diagramContainer = document.getElementById('networkDiagram');
    
    // Check if elements exist
    if (!diagramSection || !diagramContainer) {
        console.log('Network diagram elements not found, skipping');
        return;
    }
    
    // Show diagram section if Arc Gateway is enabled or firewall config exists
    if (plan.arcGatewayConfig || plan.firewallConfig) {
        diagramSection.style.display = 'block';
        
        const arcGatewayEnabled = plan.arcGatewayConfig?.enabled || false;
        const regionName = plan.firewallConfig?.regionName || 'West Europe';
        const totalEndpoints = plan.firewallConfig?.totalEndpoints || '80+';
        const nodeCount = plan.clusterConfig?.nodePools?.reduce((sum, pool) => sum + pool.nodeCount, 0) || 3;
        const controlPlaneCount = plan.clusterConfig?.controlPlaneCount || 3;
        
        let html = `
            <div style="font-family: 'Segoe UI', system-ui, sans-serif;">
                
                <!-- Diagram Title -->
                <div style="text-align: center; margin-bottom: 24px;">
                    <h4 style="color: #00d4ff; margin: 0 0 8px 0; font-size: 1.1rem;">
                        ${arcGatewayEnabled ? 'Arc Gateway Enabled Architecture' : 'Standard Firewall Architecture'}
                    </h4>
                    <p style="color: #8aa8c8; margin: 0; font-size: 0.85rem;">
                        ${arcGatewayEnabled ? 'Simplified connectivity with reduced firewall rules' : 'All traffic routed through enterprise firewall'}
                    </p>
                </div>
                
                <!-- Main Diagram Container -->
                <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 16px; align-items: start;">
                    
                    <!-- LEFT: On-Premises Infrastructure -->
                    <div style="background: linear-gradient(180deg, rgba(20,40,70,0.8) 0%, rgba(15,30,55,0.9) 100%); border: 2px solid #1a5276; border-radius: 12px; padding: 16px; position: relative;">
                        <div style="position: absolute; top: -10px; left: 16px; background: #0a1628; padding: 2px 12px; font-size: 0.75rem; color: #3498db; font-weight: 600; letter-spacing: 0.5px;">YOUR INFRASTRUCTURE</div>
                        
                        <!-- Azure Local Cluster -->
                        <div style="background: rgba(10,22,40,0.7); border: 1px solid #2c3e50; border-radius: 8px; padding: 12px; margin-top: 8px;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #2c3e50;">
                                <span style="font-size: 1.2rem;">🖥️</span>
                                <span style="color: #fff; font-weight: 600; font-size: 0.9rem;">Azure Local Cluster</span>
                            </div>
                            
                            <!-- Control Plane -->
                            <div style="background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.4); border-radius: 6px; padding: 10px; margin-bottom: 8px;">
                                <div style="display: flex; align-items: center; justify-content: space-between;">
                                    <div style="display: flex; align-items: center; gap: 6px;">
                                        <span style="font-size: 0.9rem;">⚙️</span>
                                        <span style="color: #a78bfa; font-size: 0.8rem; font-weight: 500;">Control Plane</span>
                                    </div>
                                    <span style="background: #7c3aed; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem;">${controlPlaneCount} VMs</span>
                                </div>
                            </div>
                            
                            <!-- Worker Nodes -->
                            <div style="background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; padding: 10px; margin-bottom: 8px;">
                                <div style="display: flex; align-items: center; justify-content: space-between;">
                                    <div style="display: flex; align-items: center; gap: 6px;">
                                        <span style="font-size: 0.9rem;">☸️</span>
                                        <span style="color: #00d4ff; font-size: 0.8rem; font-weight: 500;">AKS Worker Nodes</span>
                                    </div>
                                    <span style="background: #0891b2; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem;">${nodeCount} VMs</span>
                                </div>
                            </div>
                            
                            <!-- Arc Resource Bridge -->
                            <div style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); border-radius: 6px; padding: 10px;">
                                <div style="display: flex; align-items: center; gap: 6px;">
                                    <span style="font-size: 0.9rem;">🌉</span>
                                    <span style="color: #10b981; font-size: 0.8rem; font-weight: 500;">Arc Resource Bridge</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Ports Info -->
                        <div style="margin-top: 12px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 6px;">
                            <div style="color: #8aa8c8; font-size: 0.7rem; margin-bottom: 6px; font-weight: 600;">OUTBOUND PORTS:</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                                <span style="background: #1e3a5f; color: #60a5fa; padding: 2px 6px; border-radius: 3px; font-size: 0.65rem;">443 HTTPS</span>
                                <span style="background: #1e3a5f; color: #60a5fa; padding: 2px 6px; border-radius: 3px; font-size: 0.65rem;">40343 Arc</span>
                                <span style="background: #1e3a5f; color: #60a5fa; padding: 2px 6px; border-radius: 3px; font-size: 0.65rem;">55000 gRPC</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- CENTER: Connection Flow -->
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px 8px; min-width: 100px;">
                        
                        <!-- Data Flow Indicator -->
                        <div style="text-align: center; margin-bottom: 16px;">
                            <div style="color: #10b981; font-size: 0.7rem; font-weight: 600; margin-bottom: 4px;">DATA STAYS</div>
                            <div style="color: #10b981; font-size: 0.7rem; font-weight: 600;">ON-PREM</div>
                            <div style="font-size: 1.2rem; margin-top: 4px;">🔒</div>
                        </div>
                        
                        <!-- Arrow -->
                        <div style="width: 60px; height: 2px; background: linear-gradient(90deg, #00d4ff, #7c3aed); position: relative; margin: 16px 0;">
                            <div style="position: absolute; right: -6px; top: -4px; width: 0; height: 0; border-top: 5px solid transparent; border-bottom: 5px solid transparent; border-left: 8px solid #7c3aed;"></div>
                        </div>
                        
                        <!-- Management Only -->
                        <div style="text-align: center; margin-top: 16px;">
                            <div style="color: #f59e0b; font-size: 0.65rem; font-weight: 600;">MANAGEMENT</div>
                            <div style="color: #f59e0b; font-size: 0.65rem; font-weight: 600;">ONLY</div>
                            <div style="color: #8aa8c8; font-size: 0.6rem; margin-top: 4px;">Metadata<br/>Telemetry</div>
                        </div>
                    </div>
                    
                    <!-- RIGHT: Azure & Internet -->
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        
                        <!-- Firewall/Gateway -->
                        <div style="background: ${arcGatewayEnabled ? 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(6,182,212,0.2) 100%)' : 'linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(245,158,11,0.2) 100%)'}; border: 2px solid ${arcGatewayEnabled ? '#10b981' : '#ef4444'}; border-radius: 10px; padding: 14px; text-align: center;">
                            <div style="font-size: 1.5rem; margin-bottom: 6px;">${arcGatewayEnabled ? '🚪' : '🔥'}</div>
                            <div style="color: ${arcGatewayEnabled ? '#10b981' : '#ef4444'}; font-weight: 600; font-size: 0.85rem;">${arcGatewayEnabled ? 'Arc Gateway' : 'Enterprise Firewall'}</div>
                            <div style="color: #8aa8c8; font-size: 0.7rem; margin-top: 4px;">
                                ${arcGatewayEnabled ? 'Port 40343 tunnel' : `${totalEndpoints} endpoints`}
                            </div>
                            ${arcGatewayEnabled ? `<div style="background: #10b981; color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.65rem; margin-top: 8px; display: inline-block;">~65% FEWER RULES</div>` : ''}
                        </div>
                        
                        <!-- Azure Cloud -->
                        <div style="background: linear-gradient(180deg, rgba(0,120,212,0.15) 0%, rgba(0,188,242,0.1) 100%); border: 2px solid #0078d4; border-radius: 10px; padding: 14px; position: relative;">
                            <div style="position: absolute; top: -10px; left: 16px; background: #0a1628; padding: 2px 12px; font-size: 0.75rem; color: #00bcf2; font-weight: 600;">AZURE CLOUD</div>
                            
                            <div style="text-align: center; margin-top: 8px; margin-bottom: 12px;">
                                <span style="font-size: 1.8rem;">☁️</span>
                                <div style="color: #00bcf2; font-weight: 600; font-size: 0.9rem; margin-top: 4px;">Microsoft Azure</div>
                                <div style="color: #8aa8c8; font-size: 0.7rem;">${regionName}</div>
                            </div>
                            
                            <!-- Azure Services -->
                            <div style="display: flex; flex-wrap: wrap; gap: 4px; justify-content: center;">
                                <span style="background: #0078d4; color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.65rem;">Azure Arc</span>
                                <span style="background: #0078d4; color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.65rem;">Entra ID</span>
                                <span style="background: #0078d4; color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.65rem;">Monitor</span>
                                <span style="background: #0078d4; color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.65rem;">Policy</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Traffic Flow Legend -->
                <div style="margin-top: 24px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                    <div style="background: rgba(16,185,129,0.1); border-left: 3px solid #10b981; padding: 10px 12px; border-radius: 0 6px 6px 0;">
                        <div style="color: #10b981; font-weight: 600; font-size: 0.8rem; margin-bottom: 4px;">✓ Data Sovereignty</div>
                        <div style="color: #8aa8c8; font-size: 0.7rem;">Your data never leaves your infrastructure</div>
                    </div>
                    <div style="background: rgba(0,212,255,0.1); border-left: 3px solid #00d4ff; padding: 10px 12px; border-radius: 0 6px 6px 0;">
                        <div style="color: #00d4ff; font-weight: 600; font-size: 0.8rem; margin-bottom: 4px;">⚡ Management Plane</div>
                        <div style="color: #8aa8c8; font-size: 0.7rem;">Only metadata & telemetry to Azure</div>
                    </div>
                    <div style="background: rgba(124,58,237,0.1); border-left: 3px solid #7c3aed; padding: 10px 12px; border-radius: 0 6px 6px 0;">
                        <div style="color: #a78bfa; font-weight: 600; font-size: 0.8rem; margin-bottom: 4px;">🔐 Zero Trust</div>
                        <div style="color: #8aa8c8; font-size: 0.7rem;">Entra ID + Pod Security Standards</div>
                    </div>
                </div>
                
                ${!arcGatewayEnabled ? `
                <div style="margin-top: 16px; background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3); border-radius: 8px; padding: 12px; display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 1.3rem;">💡</span>
                    <div style="flex: 1;">
                        <div style="color: #f59e0b; font-weight: 600; font-size: 0.85rem;">Enable Arc Gateway for Simplified Connectivity</div>
                        <div style="color: #8aa8c8; font-size: 0.75rem;">Reduce firewall endpoints from ${totalEndpoints} to &lt;30 and improve security posture.</div>
                    </div>
                </div>
                ` : ''}
            </div>
        `;
        
        diagramContainer.innerHTML = html;
    } else {
        diagramSection.style.display = 'none';
    }
}

/**
 * Switch between export tabs
 */
function switchExportTab(tabName) {
    // Hide all tab contents
    document.getElementById('deployTabContent').style.display = 'none';
    document.getElementById('templatesTabContent').style.display = 'none';
    document.getElementById('complianceTabContent').style.display = 'none';
    
    // Remove active state from all tabs
    document.querySelectorAll('.export-tab').forEach(tab => {
        tab.style.borderBottomColor = 'transparent';
        tab.style.color = '#666';
    });
    
    // Show selected tab content
    if (tabName === 'deploy') {
        document.getElementById('deployTabContent').style.display = 'block';
        document.getElementById('tabDeploy').style.borderBottomColor = 'var(--primary-color)';
        document.getElementById('tabDeploy').style.color = 'var(--primary-color)';
    } else if (tabName === 'templates') {
        document.getElementById('templatesTabContent').style.display = 'block';
        document.getElementById('tabTemplates').style.borderBottomColor = 'var(--primary-color)';
        document.getElementById('tabTemplates').style.color = 'var(--primary-color)';
    } else if (tabName === 'compliance') {
        document.getElementById('complianceTabContent').style.display = 'block';
        document.getElementById('tabCompliance').style.borderBottomColor = 'var(--primary-color)';
        document.getElementById('tabCompliance').style.color = 'var(--primary-color)';
    }
}

/**
 * Download complete audit package (ZIP)
 */
function downloadAuditPackage() {
    alert('Audit Package Download:\n\nThis feature will generate a ZIP file containing:\n• Compliance PDF Report\n• Configuration Export (JSON)\n• Gap Analysis Report\n• Remediation Steps\n• Framework-specific checklists\n• Control mapping matrix\n\nImplementation coming soon!');
}

/**
 * Download framework-specific checklist
 */
function downloadFrameworkChecklist(framework) {
    const frameworkNames = {
        'pci-dss': 'PCI DSS 4.0',
        'hipaa': 'HIPAA',
        'iso-27001': 'ISO 27001',
        'soc2': 'SOC 2 Type II',
        'fedramp': 'FedRAMP',
        'nist': 'NIST Cybersecurity Framework'
    };
    
    const name = frameworkNames[framework] || framework;
    alert(`${name} Checklist Download:\n\nThis will generate a framework-specific checklist showing:\n• Required controls mapped to your configuration\n• Compliance status (Met/Not Met/Partial)\n• Evidence locations\n• Remediation recommendations\n\nImplementation coming soon!`);
}
