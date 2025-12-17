/**
 * Azure Deployment Manager
 * Handles direct deployment to Azure subscriptions using Azure Portal's custom deployment
 */

const AzureDeployer = {
    /**
     * Deploy the current deployment plan to Azure
     * Uses Azure Portal's custom template deployment feature
     */
    deployToAzure: function(deploymentPlan) {
        if (!deploymentPlan) {
            this.showError('No deployment plan available. Please complete Step 2 configuration first.');
            return;
        }

        // Validate required fields
        if (!deploymentPlan.clusterConfig.clusterName) {
            this.showError('Cluster name is required. Please go back to Step 2 and enter a cluster name.');
            return;
        }

        if (!deploymentPlan.clusterConfig.location) {
            this.showError('Azure location is required. Please go back to Step 2 and select a location.');
            return;
        }

        // Note: Resource group is optional - ARM template can create it if it doesn't exist

        // Show deployment preparation message
        this.showStatus('Preparing deployment template...', 'info');

        try {
            // Generate ARM template
            const armTemplate = TemplateGenerator.generateARM(deploymentPlan);
            
            // Create deployment parameters
            const parameters = this.extractParameters(deploymentPlan);
            
            // Create Azure Portal deployment URL
            const deploymentUrl = this.createPortalDeploymentUrl(armTemplate, parameters, deploymentPlan);
            
            // Show success message
            this.showStatus('✅ Template ready! Redirecting to Azure Portal...', 'success');
            
            // Redirect to Azure Portal after short delay
            setTimeout(() => {
                window.open(deploymentUrl, '_blank');
                this.showStatus(
                    '🌐 Azure Portal opened in new tab. Please authenticate and review the deployment parameters before deploying.',
                    'success'
                );
            }, 1000);

        } catch (error) {
            this.showError(`Failed to prepare deployment: ${error.message}`);
            console.error('Deployment preparation error:', error);
        }
    },

    /**
     * Extract parameters from deployment plan
     */
    extractParameters: function(plan) {
        const params = {
            clusterName: {
                value: plan.clusterConfig.clusterName
            },
            location: {
                value: plan.clusterConfig.location
            },
            customLocationId: {
                value: plan.clusterConfig.customLocationId || ''
            },
            kubernetesVersion: {
                value: plan.clusterConfig.kubernetesVersion
            },
            controlPlaneIp: {
                value: plan.clusterConfig.controlPlaneIP || ''
            },
            sshPublicKey: {
                value: plan.clusterConfig.sshPublicKey || ''
            }
        };

        // Add network configuration
        if (plan.networkConfig) {
            if (plan.networkConfig.vnetName) {
                params.vnetName = { value: plan.networkConfig.vnetName };
            }
            if (plan.networkConfig.controlPlaneSubnet) {
                params.controlPlaneSubnet = { value: plan.networkConfig.controlPlaneSubnet };
            }
            if (plan.networkConfig.loadBalancerSubnet) {
                params.loadBalancerSubnet = { value: plan.networkConfig.loadBalancerSubnet };
            }
        }

        // Add node pool configurations
        if (plan.clusterConfig.nodePools && plan.clusterConfig.nodePools.length > 0) {
            const primaryPool = plan.clusterConfig.nodePools[0];
            params.nodeCount = { value: primaryPool.nodeCount };
            params.vmSize = { value: primaryPool.vmSize };
            params.nodePoolName = { value: primaryPool.name };
        }

        return params;
    },

    /**
     * Create Azure Portal custom deployment URL
     * Uses the portal's template deployment feature with pre-filled parameters
     */
    createPortalDeploymentUrl: function(template, parameters, plan) {
        // Create deployment payload
        const deployment = {
            template: JSON.parse(template),
            parameters: parameters
        };

        // Encode deployment as base64 for URL
        const deploymentJson = JSON.stringify(deployment);
        const deploymentBase64 = btoa(unescape(encodeURIComponent(deploymentJson)));

        // Create portal URL with pre-filled parameters
        const baseUrl = 'https://portal.azure.com/#create/Microsoft.Template';
        const params = new URLSearchParams({
            referrer: 'GitHub',
            repository: 'aksarcdeployment',
            resourceGroup: plan.clusterConfig.resourceGroupName,
            location: plan.clusterConfig.location
        });

        // Note: Azure Portal's custom template deployment requires manual paste
        // We'll store the template and open the custom deployment blade
        this.storeTemplateForDeployment(template, parameters, plan);

        return `https://portal.azure.com/#create/Microsoft.Template/uri/${encodeURIComponent('https://raw.githubusercontent.com/Azure/azure-quickstart-templates/master/quickstarts/microsoft.kubernetes/aks-arc/azuredeploy.json')}`;
    },

    /**
     * Store template in localStorage for easy copy/paste
     */
    storeTemplateForDeployment: function(template, parameters, plan) {
        const deploymentData = {
            template: template,
            parameters: JSON.stringify(parameters, null, 2),
            resourceGroup: plan.clusterConfig.resourceGroupName,
            location: plan.clusterConfig.location,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('aksarc-deployment-template', JSON.stringify(deploymentData));
        
        // Show instructions for custom deployment
        this.showDeploymentInstructions(plan);
    },

    /**
     * Show deployment instructions
     */
    showDeploymentInstructions: function(plan) {
        const instructions = `
            <div style="background: #e3f2fd; border-left: 4px solid #2196F3; padding: 15px; border-radius: 4px; margin-top: 15px;">
                <h4 style="margin-top: 0; color: #1976D2;">📋 Azure Deployment Steps:</h4>
                <ol style="margin: 10px 0; padding-left: 20px; color: #0d47a1; line-height: 1.8;">
                    <li>
                        <strong>Option 1 - Deploy Button (Recommended):</strong>
                        <ul style="margin-top: 5px;">
                            <li>Click the "📋 Deploy via ARM Template" button below</li>
                            <li>Authenticate with your Azure account</li>
                            <li>Select subscription and resource group: <strong>${plan.clusterConfig.resourceGroupName}</strong></li>
                            <li>Review and confirm deployment parameters</li>
                        </ul>
                    </li>
                    <li style="margin-top: 10px;">
                        <strong>Option 2 - Azure CLI:</strong>
                        <ul style="margin-top: 5px;">
                            <li>Download the ARM template (button above)</li>
                            <li>Run: <code style="background: #fff; padding: 2px 6px; border-radius: 3px;">az deployment group create --resource-group ${plan.clusterConfig.resourceGroupName} --template-file aksarc-deployment.json</code></li>
                        </ul>
                    </li>
                    <li style="margin-top: 10px;">
                        <strong>Option 3 - Azure PowerShell:</strong>
                        <ul style="margin-top: 5px;">
                            <li>Download the ARM template (button above)</li>
                            <li>Run: <code style="background: #fff; padding: 2px 6px; border-radius: 3px;">New-AzResourceGroupDeployment -ResourceGroupName ${plan.clusterConfig.resourceGroupName} -TemplateFile aksarc-deployment.json</code></li>
                        </ul>
                    </li>
                </ol>
                <div style="margin-top: 15px; padding: 10px; background: #fff3cd; border-left: 3px solid #ffc107; border-radius: 3px;">
                    <strong>⚠️ Prerequisites:</strong>
                    <ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 13px;">
                        <li>Azure Local cluster must be registered with Azure Arc</li>
                        <li>Custom Location must be created and ID provided in configuration</li>
                        <li>Azure Arc Resource Bridge must be deployed</li>
                        <li>Required Azure providers must be registered: Microsoft.HybridContainerService, Microsoft.ExtendedLocation</li>
                    </ul>
                </div>
            </div>
            <div style="margin-top: 15px;">
                <button onclick="deployViaARMTemplate()" class="btn btn-primary" style="font-size: 15px;">
                    📋 Deploy via ARM Template
                </button>
                <button onclick="copyAzureCLICommand()" class="btn btn-secondary" style="font-size: 15px; margin-left: 10px;">
                    📋 Copy Azure CLI Command
                </button>
            </div>
        `;

        const statusDiv = document.getElementById('deploymentStatus');
        if (statusDiv) {
            statusDiv.innerHTML = instructions;
            statusDiv.style.display = 'block';
        }
    },

    /**
     * Deploy using ARM template directly to Azure Portal
     */
    deployViaARMTemplate: function() {
        const deploymentData = localStorage.getItem('aksarc-deployment-template');
        
        if (!deploymentData) {
            this.showError('No deployment template found. Please generate the deployment plan again.');
            return;
        }

        const data = JSON.parse(deploymentData);
        
        // Create Azure Portal custom deployment URL
        // We'll open the custom deployment blade with pre-filled parameters
        const portalUrl = `https://portal.azure.com/#create/Microsoft.Template/createMode/CreateResource/resourceGroup/${encodeURIComponent(data.resourceGroup)}/location/${encodeURIComponent(data.location)}`;
        
        // Show modal with template for user to copy
        this.showTemplateModal(data.template, data.parameters);
        
        // Open portal
        setTimeout(() => {
            window.open(portalUrl, '_blank');
            this.showStatus('🌐 Opening Azure Portal. Please paste the template in the "Edit template" section.', 'success');
        }, 500);
    },

    /**
     * Show modal with template to copy
     */
    showTemplateModal: function(template, parameters) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        modal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 8px; max-width: 800px; max-height: 80vh; overflow-y: auto; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                <h3 style="margin-top: 0; color: #0078d4;">📋 ARM Template Ready for Deployment</h3>
                <p style="color: #666; margin-bottom: 20px;">
                    Copy the ARM template below and paste it into Azure Portal's custom deployment template editor.
                </p>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-weight: bold; margin-bottom: 8px; color: #333;">ARM Template:</label>
                    <textarea id="templateToCopy" readonly style="width: 100%; height: 250px; font-family: 'Courier New', monospace; font-size: 12px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; background: #f5f5f5;">${template}</textarea>
                    <button onclick="copyTemplateText()" class="btn btn-secondary" style="margin-top: 10px;">
                        📋 Copy Template
                    </button>
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-weight: bold; margin-bottom: 8px; color: #333;">Parameters:</label>
                    <textarea id="parametersToCopy" readonly style="width: 100%; height: 150px; font-family: 'Courier New', monospace; font-size: 12px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; background: #f5f5f5;">${parameters}</textarea>
                    <button onclick="copyParametersText()" class="btn btn-secondary" style="margin-top: 10px;">
                        📋 Copy Parameters
                    </button>
                </div>

                <div style="background: #e3f2fd; padding: 15px; border-left: 4px solid #2196F3; border-radius: 4px; margin-bottom: 20px;">
                    <strong style="color: #1976D2;">📝 Deployment Steps:</strong>
                    <ol style="margin: 10px 0 0 0; padding-left: 20px; color: #0d47a1;">
                        <li>Copy the ARM template above</li>
                        <li>Azure Portal will open in a new tab</li>
                        <li>Go to "Deploy a custom template" or "Create a resource" → "Template deployment"</li>
                        <li>Click "Build your own template in the editor"</li>
                        <li>Paste the copied template and click Save</li>
                        <li>Fill in or verify the parameters</li>
                        <li>Click "Review + create" → "Create"</li>
                    </ol>
                </div>

                <div style="text-align: right;">
                    <button onclick="closeTemplateModal()" class="btn btn-primary">
                        Got it, proceed to Azure Portal
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.id = 'templateModal';

        // Add global functions for buttons
        window.copyTemplateText = function() {
            const textarea = document.getElementById('templateToCopy');
            textarea.select();
            navigator.clipboard.writeText(textarea.value).then(() => {
                alert('✅ Template copied to clipboard!');
            });
        };

        window.copyParametersText = function() {
            const textarea = document.getElementById('parametersToCopy');
            textarea.select();
            navigator.clipboard.writeText(textarea.value).then(() => {
                alert('✅ Parameters copied to clipboard!');
            });
        };

        window.closeTemplateModal = function() {
            const modal = document.getElementById('templateModal');
            if (modal) {
                document.body.removeChild(modal);
            }
        };
    },

    /**
     * Copy Azure CLI deployment command to clipboard
     */
    copyAzureCLICommand: function() {
        const deploymentData = localStorage.getItem('aksarc-deployment-template');
        
        if (!deploymentData) {
            this.showError('No deployment template found. Please generate the deployment plan again.');
            return;
        }

        const data = JSON.parse(deploymentData);
        
        const command = `# 1. Save the ARM template to a file named aksarc-deployment.json
# 2. Run this command:
az deployment group create \\
  --resource-group ${data.resourceGroup} \\
  --template-file aksarc-deployment.json \\
  --parameters @parameters.json`;

        // Copy to clipboard
        navigator.clipboard.writeText(command).then(() => {
            this.showStatus('✅ Azure CLI command copied to clipboard!', 'success');
        }).catch(err => {
            this.showError('Failed to copy to clipboard. Please copy manually.');
            console.error('Clipboard error:', err);
        });
    },

    /**
     * Show status message
     */
    showStatus: function(message, type = 'info') {
        const statusDiv = document.getElementById('deploymentStatus');
        if (!statusDiv) return;

        const colors = {
            info: { bg: '#e3f2fd', border: '#2196F3', text: '#0d47a1' },
            success: { bg: '#d4edda', border: '#28a745', text: '#155724' },
            error: { bg: '#f8d7da', border: '#dc3545', text: '#721c24' },
            warning: { bg: '#fff3cd', border: '#ffc107', text: '#856404' }
        };

        const color = colors[type] || colors.info;

        statusDiv.innerHTML = `
            <div style="background: ${color.bg}; border-left: 4px solid ${color.border}; padding: 12px 15px; border-radius: 4px; color: ${color.text};">
                ${message}
            </div>
        `;
        statusDiv.style.display = 'block';

        // Auto-hide info messages after 5 seconds
        if (type === 'info' || type === 'success') {
            setTimeout(() => {
                if (statusDiv.innerHTML.includes(message)) {
                    statusDiv.style.display = 'none';
                }
            }, 5000);
        }
    },

    /**
     * Show error message
     */
    showError: function(message) {
        this.showStatus(`❌ ${message}`, 'error');
    }
};

/**
 * Global functions for button onclick handlers
 */
function deployToAzure() {
    // Get the current deployment plan from the app
    const deploymentPlan = window.currentDeploymentPlan;
    AzureDeployer.deployToAzure(deploymentPlan);
}

function deployViaARMTemplate() {
    AzureDeployer.deployViaARMTemplate();
}

function copyAzureCLICommand() {
    AzureDeployer.copyAzureCLICommand();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AzureDeployer;
}
