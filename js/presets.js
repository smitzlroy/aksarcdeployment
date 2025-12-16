/**
 * Configuration Presets - Pre-configured compliance templates
 */

const ConfigurationPresets = {
    'hipaa-healthcare': {
        name: 'HIPAA Healthcare',
        description: 'Pre-configured for healthcare PHI protection with encryption, audit logging, RBAC, and private networking. Meets HIPAA Security Rule §164.308, §164.312 requirements.',
        icon: '🏥',
        settings: {
            // Network
            networkPlugin: 'azure',
            podCidr: '10.244.0.0/16',
            serviceCidr: '10.96.0.0/16',
            dnsServiceIP: '10.96.0.10',
            loadBalancerSku: 'Standard',
            enableNetworkPolicy: true,
            enablePrivateCluster: true,
            
            // Storage
            defaultStorageClass: 'smb',
            enableVolumeEncryption: true,
            enableVolumeSnapshots: true,
            storageQuotaGb: 500,
            
            // Identity & Access
            rbacMode: 'enabled',
            enableWorkloadIdentity: true,
            enableAzureAD: true,
            enablePodSecurityStandards: true,
            
            // Monitoring
            enableAzureMonitor: true,
            enablePrometheus: false,
            logRetentionDays: 365, // HIPAA requires 6 years for some records, 365 days minimum
            enableAuditLogs: true,
            
            // Security
            enableDefender: true,
            enablePolicy: true
        },
        compliance: ['HIPAA', 'HITECH'],
        estimatedScore: 95
    },
    
    'pci-dss-payment': {
        name: 'PCI DSS Payment Processing',
        description: 'Configured for payment card data protection with network segmentation, vulnerability scanning (Defender), encryption, and comprehensive audit logging. Meets PCI DSS 4.0 requirements.',
        icon: '💳',
        settings: {
            // Network
            networkPlugin: 'azure',
            podCidr: '10.244.0.0/16',
            serviceCidr: '10.96.0.0/16',
            dnsServiceIP: '10.96.0.10',
            loadBalancerSku: 'Standard',
            enableNetworkPolicy: true,
            enablePrivateCluster: true,
            
            // Storage
            defaultStorageClass: 'iscsi',
            enableVolumeEncryption: true,
            enableVolumeSnapshots: true,
            storageQuotaGb: 200,
            
            // Identity & Access
            rbacMode: 'enabled',
            enableWorkloadIdentity: true,
            enableAzureAD: true,
            enablePodSecurityStandards: true,
            
            // Monitoring
            enableAzureMonitor: true,
            enablePrometheus: true,
            logRetentionDays: 365, // PCI DSS requires 90 days minimum, 365 recommended
            enableAuditLogs: true,
            
            // Security
            enableDefender: true, // Required for vulnerability scanning (Req 6.3, 11.5)
            enablePolicy: true
        },
        compliance: ['PCI DSS 4.0', 'PA-DSS'],
        estimatedScore: 98
    },
    
    'manufacturing-iec': {
        name: 'Manufacturing IEC 62443',
        description: 'OT/ICS security configuration with network segmentation, restricted access, and comprehensive monitoring. Designed for industrial control systems and manufacturing environments.',
        icon: '🏭',
        settings: {
            // Network
            networkPlugin: 'calico', // Better for OT network segmentation
            podCidr: '10.244.0.0/16',
            serviceCidr: '10.96.0.0/16',
            dnsServiceIP: '10.96.0.10',
            loadBalancerSku: 'Standard',
            enableNetworkPolicy: true,
            enablePrivateCluster: true,
            
            // Storage
            defaultStorageClass: 'local-path',
            enableVolumeEncryption: true,
            enableVolumeSnapshots: true,
            storageQuotaGb: 100,
            
            // Identity & Access
            rbacMode: 'enabled',
            enableWorkloadIdentity: false,
            enableAzureAD: true,
            enablePodSecurityStandards: true,
            
            // Monitoring
            enableAzureMonitor: true,
            enablePrometheus: true, // Common in OT environments
            logRetentionDays: 180,
            enableAuditLogs: true,
            
            // Security
            enableDefender: true,
            enablePolicy: true
        },
        compliance: ['IEC 62443', 'NERC CIP', 'API 1164'],
        estimatedScore: 92
    },
    
    'fedramp-government': {
        name: 'FedRAMP Government',
        description: 'Maximum security configuration for government workloads with all security controls enabled, private networking, encryption, and extensive audit logging. Meets FedRAMP High baseline.',
        icon: '🏛️',
        settings: {
            // Network
            networkPlugin: 'azure',
            podCidr: '10.244.0.0/16',
            serviceCidr: '10.96.0.0/16',
            dnsServiceIP: '10.96.0.10',
            loadBalancerSku: 'Standard',
            enableNetworkPolicy: true,
            enablePrivateCluster: true,
            
            // Storage
            defaultStorageClass: 'iscsi',
            enableVolumeEncryption: true,
            enableVolumeSnapshots: true,
            storageQuotaGb: 1000,
            
            // Identity & Access
            rbacMode: 'enabled',
            enableWorkloadIdentity: true,
            enableAzureAD: true,
            enablePodSecurityStandards: true,
            
            // Monitoring
            enableAzureMonitor: true,
            enablePrometheus: true,
            logRetentionDays: 730, // 2 years for government compliance
            enableAuditLogs: true,
            
            // Security
            enableDefender: true,
            enablePolicy: true
        },
        compliance: ['FedRAMP High', 'NIST 800-53', 'FIPS 140-2'],
        estimatedScore: 100
    },
    
    'production-best-practice': {
        name: 'Production Best Practice',
        description: 'Balanced production configuration with high availability, monitoring, encryption, and essential security controls. Suitable for general production workloads with good security posture.',
        icon: '⭐',
        settings: {
            // Network
            networkPlugin: 'azure',
            podCidr: '10.244.0.0/16',
            serviceCidr: '10.96.0.0/16',
            dnsServiceIP: '10.96.0.10',
            loadBalancerSku: 'Standard',
            enableNetworkPolicy: true,
            enablePrivateCluster: false,
            
            // Storage
            defaultStorageClass: 'local-path',
            enableVolumeEncryption: true,
            enableVolumeSnapshots: true,
            storageQuotaGb: 200,
            
            // Identity & Access
            rbacMode: 'enabled',
            enableWorkloadIdentity: false,
            enableAzureAD: false,
            enablePodSecurityStandards: true,
            
            // Monitoring
            enableAzureMonitor: true,
            enablePrometheus: false,
            logRetentionDays: 90,
            enableAuditLogs: true,
            
            // Security
            enableDefender: true,
            enablePolicy: true
        },
        compliance: ['CIS Kubernetes Benchmark', 'ISO 27001'],
        estimatedScore: 85
    },
    
    'dev-test-minimal': {
        name: 'Dev/Test Minimal',
        description: 'Cost-optimized configuration for development and testing. Minimal security controls, basic monitoring, no encryption. NOT suitable for production or sensitive data.',
        icon: '🧪',
        settings: {
            // Network
            networkPlugin: 'flannel',
            podCidr: '10.244.0.0/16',
            serviceCidr: '10.96.0.0/16',
            dnsServiceIP: '10.96.0.10',
            loadBalancerSku: 'Basic',
            enableNetworkPolicy: false,
            enablePrivateCluster: false,
            
            // Storage
            defaultStorageClass: 'local-path',
            enableVolumeEncryption: false,
            enableVolumeSnapshots: false,
            storageQuotaGb: 50,
            
            // Identity & Access
            rbacMode: 'enabled',
            enableWorkloadIdentity: false,
            enableAzureAD: false,
            enablePodSecurityStandards: false,
            
            // Monitoring
            enableAzureMonitor: false,
            enablePrometheus: false,
            logRetentionDays: 7,
            enableAuditLogs: false,
            
            // Security
            enableDefender: false,
            enablePolicy: false
        },
        compliance: [],
        estimatedScore: 45
    }
};

/**
 * Apply a preset configuration
 */
function applyPreset(presetId) {
    const preset = ConfigurationPresets[presetId];
    if (!preset) {
        console.error('Preset not found:', presetId);
        return;
    }

    console.log('Applying preset:', preset.name);

    // Show preset description
    const descDiv = document.getElementById('presetDescription');
    const titleEl = document.getElementById('presetTitle');
    const detailsEl = document.getElementById('presetDetails');
    
    if (descDiv && titleEl && detailsEl) {
        titleEl.textContent = `${preset.icon} ${preset.name} Applied`;
        detailsEl.innerHTML = `${preset.description}<br><strong>Compliance:</strong> ${preset.compliance.join(', ') || 'General best practices'} | <strong>Expected Score:</strong> ${preset.estimatedScore}/100`;
        descDiv.style.display = 'block';
    }

    // Apply all settings
    const settings = preset.settings;
    
    // Network settings
    setSelectValue('networkPlugin', settings.networkPlugin);
    setInputValue('podCidr', settings.podCidr);
    setInputValue('serviceCidr', settings.serviceCidr);
    setInputValue('dnsServiceIP', settings.dnsServiceIP);
    setSelectValue('loadBalancerSku', settings.loadBalancerSku);
    setCheckboxValue('enableNetworkPolicy', settings.enableNetworkPolicy);
    setCheckboxValue('enablePrivateCluster', settings.enablePrivateCluster);
    
    // Storage settings
    setSelectValue('defaultStorageClass', settings.defaultStorageClass);
    setCheckboxValue('enableVolumeEncryption', settings.enableVolumeEncryption);
    setCheckboxValue('enableVolumeSnapshots', settings.enableVolumeSnapshots);
    setInputValue('storageQuotaGb', settings.storageQuotaGb);
    
    // Identity & Access settings
    setSelectValue('rbacMode', settings.rbacMode);
    setCheckboxValue('enableWorkloadIdentity', settings.enableWorkloadIdentity);
    setCheckboxValue('enableAzureAD', settings.enableAzureAD);
    setCheckboxValue('enablePodSecurityStandards', settings.enablePodSecurityStandards);
    
    // Monitoring settings
    setCheckboxValue('enableAzureMonitor', settings.enableAzureMonitor);
    setCheckboxValue('enablePrometheus', settings.enablePrometheus);
    setInputValue('logRetentionDays', settings.logRetentionDays);
    setCheckboxValue('enableAuditLogs', settings.enableAuditLogs);
    
    // Security settings
    setCheckboxValue('enableDefender', settings.enableDefender);
    setCheckboxValue('enablePolicy', settings.enablePolicy);

    // Trigger security option card updates
    if (settings.enableDefender) {
        toggleSecurityOption('defender');
    }
    if (settings.enablePolicy) {
        toggleSecurityOption('policy');
    }

    // Recalculate cost
    updateCostEstimate();

    // Scroll to top of step 2 to see the confirmation
    document.getElementById('step2').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Helper functions to set form values
 */
function setInputValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
}

function setSelectValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
}

function setCheckboxValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.checked = value;
}

console.log('✅ Configuration Presets loaded successfully');
