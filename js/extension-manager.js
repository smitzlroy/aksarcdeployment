/**
 * Arc Extension Configuration Manager
 * Dynamically configures Arc extensions based on selected workload/solution
 */

class ExtensionConfigManager {
    constructor(catalog) {
        this.catalog = catalog;
        this.selectedExtensions = new Map();
    }

    /**
     * Get extensions available for a workload (not necessarily all enabled by default)
     */
    getExtensionsForWorkload(workloadType) {
        const extensions = [];
        
        // Core extensions available for all workloads
        // Only Azure Policy is free and enabled by default
        extensions.push({
            ...this.catalog.arc_extensions['azure-policy'],
            defaultEnabled: true,
            optional: false
        });
        
        // Monitoring and security are optional (cost money)
        extensions.push({
            ...this.catalog.arc_extensions['azure-monitor'],
            defaultEnabled: false,
            optional: true
        });
        
        extensions.push({
            ...this.catalog.arc_extensions['defender-containers'],
            defaultEnabled: false,
            optional: true
        });

        // Add workload-specific extensions (required for that solution)
        if (workloadType === 'edge-rag-arc') {
            extensions.push({
                ...this.catalog.arc_extensions['edge-rag-arc'],
                defaultEnabled: true,
                optional: false
            });
        } else if (workloadType === 'video-indexer-arc') {
            extensions.push({
                ...this.catalog.arc_extensions['video-indexer-arc'],
                defaultEnabled: true,
                optional: false
            });
        } else if (workloadType === 'iot-operations-arc') {
            extensions.push({
                ...this.catalog.arc_extensions['iot-operations'],
                defaultEnabled: true,
                optional: false
            });
        }

        return extensions;
    }

    /**
     * Render extension list panel
     */
    renderExtensionsList(workloadType) {
        console.log('renderExtensionsList called with workloadType:', workloadType);
        const extensions = this.getExtensionsForWorkload(workloadType);
        console.log('Extensions to render:', extensions.length, extensions);
        const listContainer = document.getElementById('extensionsList');
        
        if (!listContainer) {
            console.error('extensionsList container not found!');
            return;
        }

        listContainer.innerHTML = extensions.map(ext => {
            const extId = ext.extensionType.replace(/\./g, '_');
            const isRequired = !ext.optional;
            const isEnabled = ext.defaultEnabled;
            const costBadge = ext.monthlyCost > 0 
                ? `<span style="font-size: 0.8em; color: #f57c00; font-weight: 600;">+$${ext.monthlyCost}/mo</span>`
                : `<span style="font-size: 0.8em; color: #4caf50; font-weight: 600;">FREE</span>`;
            
            return `
                <div style="background: white; padding: 12px; border-radius: 4px; border: 1px solid ${isRequired ? '#4caf50' : '#e0e0e0'};">
                    <div style="display: flex; align-items: start; gap: 8px;">
                        ${isRequired 
                            ? `<input type="checkbox" id="ext_enable_${extId}" checked disabled style="margin-top: 2px;">` 
                            : `<input type="checkbox" id="ext_enable_${extId}" ${isEnabled ? 'checked' : ''} onchange="extensionManager.updateExtensionCosts()" style="margin-top: 2px;">`
                        }
                        <div style="flex: 1;">
                            <strong style="color: ${isRequired ? '#2e7d32' : '#555'};">${ext.icon} ${ext.name}</strong>
                            ${isRequired ? '<span style="margin-left: 8px; font-size: 0.75em; background: #4caf50; color: white; padding: 2px 6px; border-radius: 3px;">REQUIRED</span>' : ''}
                            ${ext.optional && !isEnabled ? '<span style="margin-left: 8px; font-size: 0.75em; background: #ff9800; color: white; padding: 2px 6px; border-radius: 3px;">OPTIONAL</span>' : ''}
                            <div style="font-size: 0.85em; color: #666; margin-top: 4px;">${ext.description}</div>
                            <div style="margin-top: 4px;">${costBadge}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Update summary
        const summaryDiv = document.querySelector('#extensionsList').nextElementSibling;
        if (summaryDiv) {
            const extensionCount = extensions.length;
            const coreCount = 3; // Monitor, Policy, Defender
            const solutionCount = extensionCount - coreCount;
            
            summaryDiv.innerHTML = `
                <strong>📋 Generated Templates:</strong> 
                1 cluster + ${coreCount} core extensions + ${solutionCount > 0 ? solutionCount + ' solution extension(s)' : 'no solution extensions'} + 1 policy assignment
            `;
        }
    }

    /**
     * Render solution-specific configuration panel
     */
    renderSolutionConfig(workloadType) {
        const panel = document.getElementById('solutionConfigPanel');
        const title = document.getElementById('solutionConfigTitle');
        const content = document.getElementById('solutionConfigContent');
        
        if (!panel || !title || !content) return;

        // Get workload-specific extension
        let solutionExtension = null;
        let solutionName = '';
        
        if (workloadType === 'edge-rag-arc') {
            solutionExtension = this.catalog.arc_extensions['edge-rag-arc'];
            solutionName = 'Edge RAG';
        } else if (workloadType === 'video-indexer-arc') {
            solutionExtension = this.catalog.arc_extensions['video-indexer-arc'];
            solutionName = 'Video Indexer';
        } else if (workloadType === 'iot-operations-arc') {
            solutionExtension = this.catalog.arc_extensions['iot-operations'];
            solutionName = 'Azure IoT Operations';
        }

        if (!solutionExtension) {
            panel.style.display = 'none';
            return;
        }

        // Show panel
        panel.style.display = 'block';
        title.textContent = `${solutionExtension.icon} ${solutionName} Configuration`;

        // Build configuration form
        const settings = solutionExtension.configurationSettings;
        let formHtml = '<div class="form-grid">';

        for (const [key, setting] of Object.entries(settings)) {
            const fieldId = `ext_${workloadType}_${key.replace(/\./g, '_')}`;
            
            formHtml += '<div class="form-group">';
            formHtml += `<label for="${fieldId}">${this.formatLabel(key)}${setting.required ? ' *' : ''}</label>`;
            
            // Render appropriate input type
            if (setting.type === 'boolean') {
                formHtml += `
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <input type="checkbox" id="${fieldId}" ${setting.default ? 'checked' : ''}>
                        <span style="font-size: 0.9em;">${setting.description}</span>
                    </div>
                `;
            } else if (setting.options && setting.options.length > 0) {
                formHtml += `<select id="${fieldId}">`;
                for (const option of setting.options) {
                    const selected = option === setting.default ? 'selected' : '';
                    formHtml += `<option value="${option}" ${selected}>${option}</option>`;
                }
                formHtml += `</select>`;
                formHtml += `<small>${setting.description}</small>`;
            } else if (setting.type === 'array') {
                // Multi-select for arrays
                formHtml += `<div style="background: #f8f9fa; padding: 10px; border-radius: 4px;">`;
                for (const option of setting.options || []) {
                    const checked = setting.default && setting.default.includes(option) ? 'checked' : '';
                    formHtml += `
                        <label style="display: block; margin-bottom: 8px;">
                            <input type="checkbox" name="${fieldId}" value="${option}" ${checked}>
                            ${option}
                        </label>
                    `;
                }
                formHtml += `</div>`;
                formHtml += `<small>${setting.description}</small>`;
            } else {
                // Text input
                const placeholder = setting.required ? 'Required' : 'Optional';
                const value = setting.default || '';
                formHtml += `<input type="text" id="${fieldId}" placeholder="${placeholder}" value="${value}" ${setting.required ? 'required' : ''}>`;
                formHtml += `<small>${setting.description}</small>`;
            }
            
            formHtml += '</div>';
        }

        // Add workspace creation option if required
        if (solutionExtension.requiresWorkspace) {
            formHtml += `
                <div class="form-group">
                    <label for="ext_workspace">Log Analytics Workspace</label>
                    <select id="ext_workspace">
                        <option value="create-new">Create New Workspace</option>
                        <option value="existing">Use Existing Workspace</option>
                    </select>
                    <small>Extensions will share this workspace for logs and metrics</small>
                </div>
                <div class="form-group" id="ext_workspace_new_group">
                    <label for="ext_workspace_name">Workspace Name</label>
                    <input type="text" id="ext_workspace_name" placeholder="aks-arc-workspace" value="aks-arc-workspace">
                </div>
                <div class="form-group" id="ext_workspace_existing_group" style="display: none;">
                    <label for="ext_workspace_id">Workspace Resource ID</label>
                    <input type="text" id="ext_workspace_id" placeholder="/subscriptions/.../workspaces/...">
                </div>
            `;
        }

        formHtml += '</div>';

        // Add info banner about GPU requirements
        if (solutionExtension.requiresGPU) {
            formHtml += `
                <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin-top: 15px; border-radius: 4px; color: #856404;">
                    <strong>⚠️ GPU Required:</strong> This extension requires GPU nodes. A GPU node pool will be automatically added to your cluster.
                </div>
            `;
        }

        content.innerHTML = formHtml;

        // Add workspace toggle listener
        const workspaceSelect = document.getElementById('ext_workspace');
        if (workspaceSelect) {
            workspaceSelect.addEventListener('change', (e) => {
                const newGroup = document.getElementById('ext_workspace_new_group');
                const existingGroup = document.getElementById('ext_workspace_existing_group');
                if (e.target.value === 'create-new') {
                    newGroup.style.display = 'block';
                    existingGroup.style.display = 'none';
                } else {
                    newGroup.style.display = 'none';
                    existingGroup.style.display = 'block';
                }
            });
        }
    }

    /**
     * Format configuration key as label
     */
    formatLabel(key) {
        return key
            .split('.')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' - ');
    }

    /**
     * Get extension configuration values from UI
     */
    getExtensionConfig(workloadType) {
        const config = {
            extensions: [],
            workspace: null
        };

        const extensions = this.getExtensionsForWorkload(workloadType);
        
        // Core extensions (always included)
        config.extensions.push({
            name: 'azure-monitor',
            extensionType: 'microsoft.azuremonitor.containers',
            settings: {
                'prometheus.enabled': document.getElementById('ext_azure_monitor_prometheus_enabled')?.checked !== false,
                'prometheus.retention': '7d'
            }
        });

        config.extensions.push({
            name: 'azure-policy',
            extensionType: 'microsoft.policyinsights',
            settings: {
                'audit.enabled': true,
                'mutation.enabled': false
            }
        });

        config.extensions.push({
            name: 'defender-containers',
            extensionType: 'microsoft.azuredefender.kubernetes',
            settings: {
                'vulnerabilityAssessment.enabled': true,
                'runtimeProtection.enabled': true
            }
        });

        // Solution-specific extension
        const solutionExt = extensions.find(e => e.category === 'ai-solution');
        if (solutionExt) {
            const settings = {};
            for (const key of Object.keys(solutionExt.configurationSettings)) {
                const fieldId = `ext_${workloadType}_${key.replace(/\./g, '_')}`;
                const element = document.getElementById(fieldId);
                
                if (element) {
                    if (element.type === 'checkbox') {
                        settings[key] = element.checked;
                    } else if (element.name && element.type === 'checkbox') {
                        // Multi-checkbox (array)
                        const checkedBoxes = document.querySelectorAll(`input[name="${fieldId}"]:checked`);
                        settings[key] = Array.from(checkedBoxes).map(cb => cb.value);
                    } else {
                        settings[key] = element.value;
                    }
                }
            }

            config.extensions.push({
                name: solutionExt.extensionType.split('.').pop(),
                extensionType: solutionExt.extensionType,
                settings
            });
        }

        // Workspace configuration
        const workspaceMode = document.getElementById('ext_workspace')?.value;
        if (workspaceMode === 'create-new') {
            config.workspace = {
                create: true,
                name: document.getElementById('ext_workspace_name')?.value || 'aks-arc-workspace'
            };
        } else if (workspaceMode === 'existing') {
            config.workspace = {
                create: false,
                resourceId: document.getElementById('ext_workspace_id')?.value
            };
        }

        return config;
    }

    /**
     * Calculate total monthly cost including only enabled extensions
     */
    calculateTotalCost(workloadType, baseCost) {
        const extensions = this.getExtensionsForWorkload(workloadType);
        let extensionsCost = 0;
        
        extensions.forEach(ext => {
            const extId = ext.extensionType.replace(/\./g, '_');
            const checkbox = document.getElementById(`ext_enable_${extId}`);
            
            if (checkbox && checkbox.checked) {
                extensionsCost += ext.monthlyCost;
            }
        });
        
        return baseCost + extensionsCost;
    }

    /**
     * Update extension costs when checkboxes change
     */
    updateExtensionCosts() {
        // Update summary count
        const extensions = this.getExtensionsForWorkload(selectedWorkload);
        const enabledCount = extensions.filter(ext => {
            const extId = ext.extensionType.replace(/\./g, '_');
            const checkbox = document.getElementById(`ext_enable_${extId}`);
            return checkbox && checkbox.checked;
        }).length;

        // Update summary text
        const summaryDiv = document.querySelector('#extensionsList').nextElementSibling;
        if (summaryDiv) {
            const requiredCount = extensions.filter(e => !e.optional).length;
            const optionalEnabledCount = enabledCount - requiredCount;
            
            summaryDiv.innerHTML = `
                <strong>📋 Selected for Deployment:</strong> 
                1 cluster + ${requiredCount} required extension(s) + ${optionalEnabledCount} optional extension(s)
            `;
        }

        // Trigger cost recalculation if cost calculator exists
        if (typeof updateCostEstimate === 'function') {
            updateCostEstimate();
        }
    }
}

// Initialize extension manager (will be called after catalog loads)
let extensionManager = null;

function initializeExtensionManager() {
    if (typeof catalog !== 'undefined') {
        extensionManager = new ExtensionConfigManager(catalog);
    }
}
