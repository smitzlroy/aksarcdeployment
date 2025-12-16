/**
 * Firewall Requirements Manager
 * Handles region-specific endpoint requirements for Azure Local + AKS Arc
 * Version: 1.0.0
 */

const FirewallManager = {
    // Region-to-GitHub mapping
    regionEndpoints: {
        'eastus': {
            name: 'East US',
            githubUrl: 'https://raw.githubusercontent.com/Azure/AzureStack-Tools/master/HCI/EastUSendpoints/eastus-hci-endpoints.md',
            totalEndpoints: 84 // Approximate
        },
        'westeurope': {
            name: 'West Europe',
            githubUrl: 'https://raw.githubusercontent.com/Azure/AzureStack-Tools/master/HCI/WestEuropeendpoints/westeurope-hci-endpoints.md',
            totalEndpoints: 84
        },
        'australiaeast': {
            name: 'Australia East',
            githubUrl: 'https://raw.githubusercontent.com/Azure/AzureStack-Tools/master/HCI/AustraliaEastendpoints/AustraliaEast-hci-endpoints.md',
            totalEndpoints: 84
        },
        'canadacentral': {
            name: 'Canada Central',
            githubUrl: 'https://raw.githubusercontent.com/Azure/AzureStack-Tools/master/HCI/CanadaCentralEndpoints/canadacentral-hci-endpoints.md',
            totalEndpoints: 84
        },
        'indiacentral': {
            name: 'India Central',
            githubUrl: 'https://raw.githubusercontent.com/Azure/AzureStack-Tools/master/HCI/IndiaCentralEndpoints/IndiaCentral-hci-endpoints.md',
            totalEndpoints: 84
        },
        'southeastasia': {
            name: 'Southeast Asia',
            githubUrl: 'https://raw.githubusercontent.com/Azure/AzureStack-Tools/master/HCI/SouthEastAsiaEndpoints/southeastasia-hci-endpoints.md',
            totalEndpoints: 84
        },
        'japaneast': {
            name: 'Japan East',
            githubUrl: 'https://raw.githubusercontent.com/Azure/AzureStack-Tools/master/HCI/JapanEastEndpoints/japaneast-hci-endpoints.md',
            totalEndpoints: 84
        },
        'southcentralus': {
            name: 'South Central US',
            githubUrl: 'https://raw.githubusercontent.com/Azure/AzureStack-Tools/master/HCI/SouthCentralUSEndpoints/southcentralus-hci-endpoints.md',
            totalEndpoints: 84
        },
        'usgovvirginia': {
            name: 'US Gov Virginia',
            githubUrl: 'https://raw.githubusercontent.com/CristianEdwards/AzureStack-Tools/master/HCI/usgovvirginia-hci-endpoints/usgovvirginia-hci-endpoints.md',
            totalEndpoints: 80
        }
    },

    // Endpoint categories for organization
    categories: {
        'Azure Local AKS infra': { icon: '☸️', color: '#326CE5' },
        'Azure Local ARB infra': { icon: '🔄', color: '#0078D4' },
        'Azure Local Arc agent': { icon: '🌐', color: '#00B7C3' },
        'Azure Local Arc gateway': { icon: '🚪', color: '#50E6FF' },
        'Azure Local authentication': { icon: '🔐', color: '#FF6B6B' },
        'Azure Local deployment': { icon: '🚀', color: '#4CAF50' },
        'Azure Local diag & billing': { icon: '📊', color: '#FF9800' },
        'Azure Local management': { icon: '⚙️', color: '#9C27B0' },
        'Azure Local monitoring': { icon: '📈', color: '#E91E63' },
        'Azure Local Updates': { icon: '🔄', color: '#00BCD4' },
        'Azure Local CRLs': { icon: '📜', color: '#795548' },
        'Microsoft Update': { icon: '🪟', color: '#0078D4' },
        'Microsoft Defender': { icon: '🛡️', color: '#107C10' },
        'Azure Local WAC': { icon: '💻', color: '#5C2D91' },
        'Azure Local benefits': { icon: '✨', color: '#FFB900' }
    },

    /**
     * Initialize firewall requirements display
     */
    async init() {
        const region = document.getElementById('azureRegion').value;
        await this.updateFirewallSummary(region);
    },

    /**
     * Update firewall summary based on selected region and Arc Gateway status
     */
    async updateFirewallSummary(region) {
        const summaryDiv = document.getElementById('firewallSummary');
        const detailsDiv = document.getElementById('firewallDetails');
        const arcGatewayEnabled = document.getElementById('enableArcGateway').checked;
        const regionInfo = this.regionEndpoints[region];

        if (!regionInfo) {
            summaryDiv.innerHTML = '<p style="color: #dc3545;">Region not found. Please select a valid region.</p>';
            return;
        }

        // Calculate endpoint counts
        const withoutGateway = regionInfo.totalEndpoints;
        const withGateway = this.calculateGatewayEndpoints(withoutGateway);
        const reduction = Math.round(((withoutGateway - withGateway) / withoutGateway) * 100);

        // Display summary
        summaryDiv.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-top: 15px;">
                <div style="background: #fff; padding: 15px; border-radius: 6px; border: 2px solid ${arcGatewayEnabled ? '#28a745' : '#dc3545'}; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <div style="font-size: 32px; font-weight: bold; color: ${arcGatewayEnabled ? '#28a745' : '#dc3545'}; margin-bottom: 8px;">
                        ${arcGatewayEnabled ? withGateway : withoutGateway}
                    </div>
                    <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Required Endpoints</div>
                    <div style="font-size: 12px; color: #999;">
                        ${arcGatewayEnabled ? 'With Arc Gateway ✅' : 'Without Arc Gateway ⚠️'}
                    </div>
                </div>

                ${arcGatewayEnabled ? `
                <div style="background: #fff; padding: 15px; border-radius: 6px; border: 2px solid #28a745; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <div style="font-size: 32px; font-weight: bold; color: #28a745; margin-bottom: 8px;">
                        ${reduction}%
                    </div>
                    <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Endpoint Reduction</div>
                    <div style="font-size: 12px; color: #999;">
                        ${withoutGateway - withGateway} fewer endpoints to manage
                    </div>
                </div>
                ` : ''}

                <div style="background: #fff; padding: 15px; border-radius: 6px; border: 2px solid #0078d4; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <div style="font-size: 14px; font-weight: bold; color: #0078d4; margin-bottom: 8px;">
                        📍 ${regionInfo.name}
                    </div>
                    <div style="font-size: 12px; color: #666; line-height: 1.5;">
                        Region-specific endpoints for:<br>
                        • Azure Local 2511+<br>
                        • AKS Arc<br>
                        • Arc Resource Bridge<br>
                        • Arc-enabled servers
                    </div>
                </div>
            </div>

            <div style="margin-top: 15px; padding: 12px; background: ${arcGatewayEnabled ? '#d4edda' : '#fff3cd'}; border-left: 4px solid ${arcGatewayEnabled ? '#28a745' : '#ffc107'}; border-radius: 4px;">
                <strong>${arcGatewayEnabled ? '✅ Arc Gateway Enabled' : '⚠️ Arc Gateway Not Enabled'}:</strong> 
                ${arcGatewayEnabled 
                    ? `You only need to allow <strong>${withGateway} endpoints</strong> in your firewall. The Arc Gateway handles the remaining ${withoutGateway - withGateway} endpoints securely through the gateway tunnel.`
                    : `You need to allow <strong>all ${withoutGateway} endpoints</strong> in your firewall. Consider enabling Arc Gateway to reduce this to ~${withGateway} endpoints (${reduction}% reduction).`
                }
            </div>
        `;

        // Load detailed endpoints
        try {
            await this.loadDetailedEndpoints(region, detailsDiv, arcGatewayEnabled);
        } catch (error) {
            console.error('Failed to load detailed endpoints:', error);
            detailsDiv.innerHTML = `
                <div style="padding: 15px; background: #f8d7da; border-left: 4px solid #dc3545; border-radius: 4px;">
                    <strong>⚠️ Unable to load endpoint details</strong><br>
                    <small>Please visit the <a href="${regionInfo.githubUrl}" target="_blank" style="color: #721c24; text-decoration: underline;">GitHub repository</a> for the complete list.</small>
                </div>
            `;
        }
    },

    /**
     * Calculate approximate endpoints with Arc Gateway enabled
     */
    calculateGatewayEndpoints(total) {
        // Arc Gateway reduces HTTPS endpoints but not HTTP/CRL endpoints
        // Approximate reduction: 60% of HTTPS endpoints go through gateway
        // Remaining: HTTP endpoints (~15), CRL endpoints (~10), Arc Gateway URL (1), regional overrides (~4)
        return Math.max(25, Math.round(total * 0.35));
    },

    /**
     * Load detailed endpoint information from GitHub
     */
    async loadDetailedEndpoints(region, containerDiv, arcGatewayEnabled) {
        const regionInfo = this.regionEndpoints[region];
        containerDiv.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #666;">
                <div style="font-size: 24px; margin-bottom: 10px;">⏳</div>
                <div>Loading ${regionInfo.name} endpoint details...</div>
            </div>
        `;

        // Since we can't easily fetch and parse the GitHub markdown in browser,
        // provide structured guidance and links
        const endpointCategories = this.getEndpointCategories(arcGatewayEnabled);

        let html = `
            <div style="margin-bottom: 20px;">
                <h5 style="color: var(--primary-color); margin-bottom: 15px;">📋 Endpoint Categories for ${regionInfo.name}</h5>
                <p style="color: #666; margin-bottom: 15px;">
                    The following categories represent the types of endpoints required for full Azure Local + AKS Arc functionality:
                </p>
        `;

        endpointCategories.forEach(category => {
            const categoryInfo = this.categories[category.name] || { icon: '📌', color: '#666' };
            const status = arcGatewayEnabled && category.gatewaySupported ? '✅ Via Gateway' : '🔓 Direct Firewall';
            
            html += `
                <div style="margin-bottom: 15px; padding: 12px; background: #fff; border-left: 4px solid ${categoryInfo.color}; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                        <div style="font-weight: bold; color: ${categoryInfo.color};">
                            ${categoryInfo.icon} ${category.name}
                        </div>
                        <div style="font-size: 12px; padding: 4px 8px; background: ${arcGatewayEnabled && category.gatewaySupported ? '#d4edda' : '#fff3cd'}; border-radius: 12px; color: ${arcGatewayEnabled && category.gatewaySupported ? '#155724' : '#856404'};">
                            ${status}
                        </div>
                    </div>
                    <div style="font-size: 13px; color: #666; line-height: 1.5;">
                        ${category.description}
                    </div>
                    <div style="font-size: 12px; color: #999; margin-top: 6px;">
                        <strong>Endpoints:</strong> ~${category.count} | <strong>Ports:</strong> ${category.ports}
                    </div>
                </div>
            `;
        });

        html += `
            </div>
            
            <div style="padding: 15px; background: #e3f2fd; border-left: 4px solid #2196F3; border-radius: 4px; margin-top: 20px;">
                <h5 style="margin-top: 0; color: #1976D2;">📚 Complete Endpoint Documentation</h5>
                <p style="margin-bottom: 12px; font-size: 14px; color: #0c5460;">
                    For the <strong>complete list of all endpoints with exact FQDNs, ports, and protocols</strong>, please visit:
                </p>
                <a href="${regionInfo.githubUrl}" target="_blank" style="display: inline-block; padding: 10px 20px; background: #2196F3; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; margin-bottom: 10px;">
                    🔗 View ${regionInfo.name} Endpoints on GitHub
                </a>
                <p style="font-size: 12px; color: #666; margin: 0;">
                    The GitHub repository contains the authoritative, regularly-updated list of all required endpoints for Azure Local, AKS Arc, Arc Resource Bridge, and Arc-enabled servers.
                </p>
            </div>

            <div style="padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; margin-top: 15px;">
                <h5 style="margin-top: 0; color: #856404;">⚠️ Important Notes</h5>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #856404; line-height: 1.8;">
                    <li><strong>HTTP Endpoints:</strong> Arc Gateway does NOT support HTTP traffic. All HTTP endpoints (Windows Update, CRLs) must be allowed directly in firewall.</li>
                    <li><strong>HTTPS Inspection:</strong> HTTPS inspection is NOT supported with Arc Gateway. Disable SSL interception for Arc endpoints.</li>
                    <li><strong>TLS Terminating Proxies:</strong> Not supported. Use forward proxy without TLS termination.</li>
                    <li><strong>Wildcard Support:</strong> Some endpoints use wildcards (e.g., *.blob.core.windows.net). Ensure your firewall supports wildcard FQDNs.</li>
                    <li><strong>Port 8084:</strong> Some AKS extensions require outbound port 8084 (in addition to 443).</li>
                    <li><strong>Time Sync:</strong> NTP (port 123 UDP) must be allowed for time synchronization.</li>
                </ul>
            </div>
        `;

        containerDiv.innerHTML = html;
    },

    /**
     * Get endpoint categories with Arc Gateway support info
     */
    getEndpointCategories(arcGatewayEnabled) {
        return [
            {
                name: 'Azure Local AKS infra',
                count: '15',
                ports: '443, 80, 123',
                description: 'Container registries (MCR, ACR), VHD image downloads, Kubernetes configuration endpoints',
                gatewaySupported: true
            },
            {
                name: 'Azure Local ARB infra',
                count: '12',
                ports: '443, 123',
                description: 'Arc Resource Bridge appliance connectivity, catalog downloads, OS images, monitoring',
                gatewaySupported: true
            },
            {
                name: 'Azure Local Arc agent',
                count: '8',
                ports: '443',
                description: 'Arc agent installation, hybrid identity services, guest configuration, service bus',
                gatewaySupported: true
            },
            {
                name: 'Azure Local Arc gateway',
                count: '1',
                ports: '443',
                description: 'Your unique Arc Gateway endpoint (yourgatewayid.gw.arc.azure.com) - only if enabled',
                gatewaySupported: false // This IS the gateway, so needs direct access
            },
            {
                name: 'Azure Local authentication',
                count: '5',
                ports: '443',
                description: 'Microsoft Entra ID, Azure AD, Microsoft Graph, Azure Resource Manager token endpoints',
                gatewaySupported: true
            },
            {
                name: 'Azure Local deployment',
                count: '7',
                ports: '443',
                description: 'Azure portal, blob storage, container registries, PowerShell Gallery, deployment scripts',
                gatewaySupported: true
            },
            {
                name: 'Azure Local diag & billing',
                count: '4',
                ports: '443',
                description: 'Diagnostics data plane, licensing, billing telemetry, Azure Front Door',
                gatewaySupported: true
            },
            {
                name: 'Azure Local management',
                count: '1',
                ports: '443',
                description: 'Azure Resource Manager (management.azure.com) for registration and operations',
                gatewaySupported: true
            },
            {
                name: 'Azure Local monitoring',
                count: '8',
                ports: '443',
                description: 'Azure Monitor, metrics, telemetry, Visual Studio insights, warm ingest endpoints',
                gatewaySupported: true
            },
            {
                name: 'Azure Local Updates',
                count: '3',
                ports: '443, 80',
                description: 'Microsoft Update delivery optimization endpoints (HTTP not supported by gateway)',
                gatewaySupported: false // HTTP endpoints
            },
            {
                name: 'Azure Local CRLs',
                count: '8',
                ports: '80',
                description: 'Certificate Revocation Lists for public authorities (HTTP only, not via gateway)',
                gatewaySupported: false // HTTP only
            },
            {
                name: 'Microsoft Update',
                count: '1',
                ports: '443',
                description: 'go.microsoft.com for Windows Update (HTTPS, can use gateway)',
                gatewaySupported: true
            },
            {
                name: 'Microsoft Defender',
                count: '1',
                ports: '443',
                description: 'Defender for Containers endpoint security (if MDE.windows extension enabled)',
                gatewaySupported: true
            },
            {
                name: 'Azure Local WAC',
                count: '1',
                ports: '443',
                description: 'Windows Admin Center post-deployment management (*.waconazure.com)',
                gatewaySupported: true
            },
            {
                name: 'Azure Local benefits',
                count: '2',
                ports: '80',
                description: 'Certificate revocation list checks for platform attestation (HTTP)',
                gatewaySupported: false // HTTP only
            }
        ];
    },

    /**
     * Check if AKS is on separated subnet and show requirements
     */
    checkAKSSubnetSeparation(infrastructureSubnet, aksSubnet) {
        const requirementsDiv = document.getElementById('aksSubnetRequirements');
        
        if (aksSubnet && infrastructureSubnet && aksSubnet !== infrastructureSubnet) {
            requirementsDiv.style.display = 'block';
        } else {
            requirementsDiv.style.display = 'none';
        }
    }
};

// Global function for toggling Arc Gateway fields
function toggleArcGatewayFields() {
    const enabled = document.getElementById('enableArcGateway').checked;
    const settingsDiv = document.getElementById('arcGatewaySettings');
    settingsDiv.style.display = enabled ? 'block' : 'none';
    
    // Update firewall summary when Arc Gateway is toggled
    const region = document.getElementById('azureRegion').value;
    FirewallManager.updateFirewallSummary(region);
}

// Global function for updating firewall endpoints
function updateFirewallEndpoints() {
    const region = document.getElementById('azureRegion').value;
    FirewallManager.updateFirewallSummary(region);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    FirewallManager.init();
});
