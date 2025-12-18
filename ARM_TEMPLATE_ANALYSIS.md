# ARM Template Analysis & Improvement Plan
**Date:** December 18, 2025  
**Status:** Research Phase - DO NOT IMPLEMENT YET

---

## Executive Summary

This document analyzes the current ARM template generation system and provides recommendations for ensuring all configurable options are reflected in deployments and Arc extensions are properly installed.

---

## 1. QUESTION: Are Configurable Options Reflected in Templates?

### Current State Analysis

#### ✅ **Options Currently Reflected in ARM Template:**

1. **Cluster Configuration**
   - Cluster name, location, resource group ✅
   - Kubernetes version ✅
   - Control plane count (1, 3, or 5) ✅
   - Control plane VM size ✅
   - Custom Location ✅
   - Logical Network ✅
   - SSH public key ✅

2. **Node Pools**
   - Node count per pool ✅
   - VM size per pool ✅
   - OS type (Linux/Windows) ✅

3. **Networking**
   - Pod CIDR ✅
   - Control plane IP (optional) ✅
   - Network policy: Calico (hardcoded) ✅

4. **Storage**
   - NFS CSI driver (optional) ✅
   - SMB CSI driver (optional) ✅

#### ❌ **Options NOT Reflected in ARM Template:**

1. **Private Cluster**
   - ❌ Checkbox exists: `enablePrivateCluster`
   - ❌ Captured in config: `config.enablePrivateCluster`
   - ❌ **MISSING in ARM template** - No `apiServerAccessProfile` property
   - **Required ARM property:**
     ```json
     "properties": {
       "apiServerAccessProfile": {
         "enablePrivateCluster": true,
         "privateDNSZone": "system" // or custom resource ID
       }
     }
     ```

2. **Arc Gateway Configuration**
   - ❌ Checkboxes exist: `enableArcGateway`, `arcGatewayResourceId`, `arcGatewayUrl`
   - ❌ Captured in config but **NOT ADDED TO ARM TEMPLATE**
   - **Required ARM properties:**
     ```json
     "properties": {
       "arcAgentProfile": {
         "gatewayResourceId": "<gateway-resource-id>",
         "gatewayUrl": "<gateway-url>"
       }
     }
     ```

3. **Azure Policy for Kubernetes**
   - ❌ Checkbox exists: `enablePolicy`
   - ❌ Captured in config: `securityConfig.enablePolicy`
   - ❌ **NOT DEPLOYED** - Only referenced in Bicep comments
   - **Deployment method:** Must be deployed as **SEPARATE EXTENSION** (see section 2)

4. **Microsoft Defender for Containers**
   - ❌ Checkbox exists: `enableDefender`
   - ❌ Captured in config: `securityConfig.enableDefender`
   - ❌ **NOT DEPLOYED** - Only referenced in Bicep comments
   - **Deployment method:** Must be deployed as **SEPARATE EXTENSION** (see section 2)

5. **Advanced Networking Options**
   - ❌ Load balancer SKU: Captured but not used (always Standard)
   - ❌ Network policy enablement: Checkbox exists but Calico is hardcoded
   - ❌ DNS service IP: Captured but not in template

6. **Identity & Access**
   - ❌ Identity provider (local, Entra ID, Azure AD): Captured but not in template
   - ❌ RBAC mode: Captured but not in template
   - ❌ Workload identity: Checkbox exists but not deployed
   - ❌ Entra ID admin group IDs: Parameter exists but not properly configured
   - ❌ Pod Security Standards: Checkbox exists but not enforced

7. **Monitoring & Observability**
   - ❌ Azure Monitor: Checkbox exists but **NOT DEPLOYED AS EXTENSION**
   - ❌ Prometheus: Checkbox exists but not deployed
   - ❌ Log retention days: Captured but not configured
   - ❌ Audit logs: Checkbox exists but not enabled

8. **Storage Configuration**
   - ❌ Default storage class: Dropdown exists but not in template
   - ❌ Volume encryption: Checkbox exists but not configured
   - ❌ Volume snapshots: Checkbox exists but not enabled
   - ❌ Storage quotas: Input field exists but not applied

9. **GPU Configuration**
   - ❌ GPU required: Checkbox exists but not reflected in node pool profiles
   - ❌ GPU count: Input field exists but not used to configure node pools
   - ❌ GPU VM sizes: Not automatically selected based on GPU requirements

10. **Availability & Resilience**
    - ⚠️ Availability sets: Mentioned in comments as "enabled by default" but no explicit ARM configuration
    - ❌ Fault domains: Captured (`physicalHostCount`) but not in template

---

## 2. QUESTION: How to Install Arc Extensions?

### Arc Extension Deployment Architecture

Based on Microsoft Learn documentation, **Arc extensions CANNOT be deployed in the same ARM template as the cluster**. They must be deployed **AFTER** the cluster is created.

#### Extension Deployment Resource Type

```json
{
  "type": "Microsoft.KubernetesConfiguration/extensions",
  "apiVersion": "2023-05-01",
  "name": "<extension-name>",
  "scope": "[resourceId('Microsoft.Kubernetes/connectedClusters', parameters('clusterName'))]",
  "dependsOn": [
    "[resourceId('Microsoft.Kubernetes/connectedClusters', parameters('clusterName'))]"
  ],
  "properties": {
    "extensionType": "<extension-type>",
    "autoUpgradeMinorVersion": true,
    "releaseTrain": "Stable",
    "scope": {
      "cluster": {
        "releaseNamespace": "<namespace>"
      }
    },
    "configurationSettings": {
      // Extension-specific settings
    },
    "configurationProtectedSettings": {
      // Sensitive settings (secrets, keys)
    }
  }
}
```

### Available Extension Types for Your Tool

Based on your screenshots and requirements:

| Extension | Extension Type | Purpose | Configuration Required |
|-----------|---------------|---------|------------------------|
| **Azure Policy** | `microsoft.policyinsights` | Enforce compliance policies (PCI DSS, ISO 27001, etc.) | Initiative assignments, policy definitions |
| **Microsoft Defender** | `microsoft.azuredefender.kubernetes` | Container security scanning, threat detection | Log Analytics workspace ID |
| **Azure Monitor** | `Microsoft.AzureMonitor.Containers` | Monitoring, metrics, logs | Log Analytics workspace ID |
| **Edge RAG** | `microsoft.edgeai.rag` (Preview) | LLM inference, vector search, document Q&A | Model config, storage, compute resources |
| **Video Indexer Arc** | `microsoft.videoindexer.arcextension` (Preview) | Video analytics, YOLO v8, Whisper transcription | Storage account, processing config |
| **Azure IoT Operations** | `microsoft.iotoperations` | MQTT broker, OPC UA connector, data flows | Namespace, broker config, data endpoints |
| **Key Vault Secrets Provider** | `microsoft.azurekeyvaultsecretsprovider` | Sync secrets from Key Vault to cluster | Key Vault resource ID, managed identity |
| **Azure connected registry** | `microsoft.containerregistry.connectedregistry` | Local container image cache | ACR resource ID, sync rules |
| **Dapr** | `microsoft.dapr` | Distributed application runtime | Dapr config |

### Extension Deployment Strategy

**Two Approaches:**

#### **Approach A: Separate ARM Template for Extensions (RECOMMENDED)**

**Pros:**
- Clean separation of cluster vs extensions
- Extensions can be deployed/updated independently
- Easier troubleshooting
- Matches Azure Portal workflow

**Cons:**
- Requires two deployment steps
- More complex automation scripts

**Implementation:**
1. Deploy cluster ARM template (existing logic)
2. Generate second ARM template with extensions
3. Provide deployment script that chains both templates

#### **Approach B: Single ARM Template with Dependencies**

**Pros:**
- One deployment command
- Single source of truth

**Cons:**
- More complex template structure
- Extensions must wait for cluster to be fully ready
- Harder to debug failures
- May hit ARM template size limits with many extensions

**Implementation:**
- Add extension resources to existing template
- Use `dependsOn` to ensure cluster deploys first
- May require `deploymentScripts` resource to wait for cluster readiness

---

## 3. Arc Extension Configuration Details

### 3.1 Azure Policy for Kubernetes

**Extension Type:** `microsoft.policyinsights`

**Configuration Steps:**

1. **Deploy Policy Extension:**
   ```json
   {
     "type": "Microsoft.KubernetesConfiguration/extensions",
     "apiVersion": "2023-05-01",
     "name": "azure-policy",
     "scope": "[resourceId('Microsoft.Kubernetes/connectedClusters', parameters('clusterName'))]",
     "properties": {
       "extensionType": "microsoft.policyinsights",
       "autoUpgradeMinorVersion": true,
       "releaseTrain": "Stable",
       "scope": {
         "cluster": {
           "releaseNamespace": "kube-system"
         }
       }
     }
   }
   ```

2. **Assign Policy Initiatives (SEPARATE STEP):**
   - **Resource Type:** `Microsoft.Authorization/policyAssignments`
   - **Scope:** Subscription or resource group level
   - **Example Initiatives:**
     - **PCI DSS 4.0:** `/providers/Microsoft.Authorization/policySetDefinitions/496eeda9-8f2f-4d5e-8dfd-204f0a92ed41`
     - **ISO 27001:2013:** `/providers/Microsoft.Authorization/policySetDefinitions/89c6cddc-1c73-4ac1-b19c-54d1a15a42f2`
     - **Kubernetes Pod Security Standards:** `/providers/Microsoft.Authorization/policySetDefinitions/a8640138-9b0a-4a28-b8cb-1666c838647d`

**ARM Template for Policy Assignment:**
```json
{
  "type": "Microsoft.Authorization/policyAssignments",
  "apiVersion": "2023-04-01",
  "name": "pci-dss-assignment",
  "scope": "[resourceGroup().id]",
  "dependsOn": [
    "azure-policy-extension"
  ],
  "properties": {
    "policyDefinitionId": "/providers/Microsoft.Authorization/policySetDefinitions/496eeda9-8f2f-4d5e-8dfd-204f0a92ed41",
    "displayName": "PCI DSS 4.0 Compliance",
    "description": "Enforce PCI DSS 4.0 controls on AKS Arc cluster",
    "parameters": {
      "effect": {
        "value": "Audit" // or "Deny" for enforcement
      }
    }
  }
}
```

**Key Points:**
- Policy extension must be installed BEFORE assigning initiatives
- Policy initiatives are assigned at **subscription or resource group scope**, NOT cluster scope
- Multiple initiatives can be assigned (PCI DSS + ISO 27001 + Pod Security)
- Effect can be "Audit" (report violations) or "Deny" (block non-compliant resources)

---

### 3.2 Microsoft Defender for Containers

**Extension Type:** `microsoft.azuredefender.kubernetes`

**Prerequisites:**
- Log Analytics workspace (for security alerts)
- Microsoft Defender for Cloud subscription

**Configuration:**
```json
{
  "type": "Microsoft.KubernetesConfiguration/extensions",
  "apiVersion": "2023-05-01",
  "name": "microsoft-defender",
  "scope": "[resourceId('Microsoft.Kubernetes/connectedClusters', parameters('clusterName'))]",
  "properties": {
    "extensionType": "microsoft.azuredefender.kubernetes",
    "autoUpgradeMinorVersion": true,
    "releaseTrain": "Stable",
    "scope": {
      "cluster": {
        "releaseNamespace": "mdc"
      }
    },
    "configurationSettings": {
      "logAnalyticsWorkspaceResourceId": "[parameters('logAnalyticsWorkspaceId')]"
    }
  }
}
```

**Cost:** ~$6.87 per vCore per month (as documented in tool)

---

### 3.3 Azure Monitor (Container Insights)

**Extension Type:** `Microsoft.AzureMonitor.Containers`

**Prerequisites:**
- Log Analytics workspace

**Configuration:**
```json
{
  "type": "Microsoft.KubernetesConfiguration/extensions",
  "apiVersion": "2023-05-01",
  "name": "azuremonitor-containers",
  "scope": "[resourceId('Microsoft.Kubernetes/connectedClusters', parameters('clusterName'))]",
  "properties": {
    "extensionType": "Microsoft.AzureMonitor.Containers",
    "autoUpgradeMinorVersion": true,
    "releaseTrain": "Stable",
    "scope": {
      "cluster": {
        "releaseNamespace": "kube-system"
      }
    },
    "configurationSettings": {
      "logAnalyticsWorkspaceResourceID": "[parameters('logAnalyticsWorkspaceId')]",
      "omsagent.resources.daemonset.limits.cpu": "150m",
      "omsagent.resources.daemonset.limits.memory": "600Mi"
    }
  }
}
```

---

### 3.4 Edge RAG Arc Extension

**Extension Type:** `microsoft.edgeai.rag` (Preview - may vary)

**Requirements from your POC templates:**
- GPU nodes (2x Standard_NC4as_T4_v3 recommended)
- 64 cores, 256GB RAM total
- Local storage for vector database
- Model artifacts (embedding model + LLM)

**Estimated Configuration:**
```json
{
  "type": "Microsoft.KubernetesConfiguration/extensions",
  "apiVersion": "2023-05-01",
  "name": "edge-rag",
  "scope": "[resourceId('Microsoft.Kubernetes/connectedClusters', parameters('clusterName'))]",
  "properties": {
    "extensionType": "microsoft.edgeai.rag",
    "autoUpgradeMinorVersion": false, // Pin version for stability
    "releaseTrain": "Preview",
    "scope": {
      "namespace": {
        "targetNamespace": "edge-rag"
      }
    },
    "configurationSettings": {
      "inference.gpu.enabled": "true",
      "inference.gpu.count": "2",
      "embedding.model": "all-MiniLM-L6-v2",
      "llm.model": "llama-2-7b-chat",
      "vectordb.type": "qdrant",
      "vectordb.storage.size": "100Gi",
      "api.replicas": "2"
    },
    "configurationProtectedSettings": {
      "storage.connectionString": "<azure-storage-connection-string>",
      "api.key": "<generated-api-key>"
    }
  }
}
```

**NOTE:** Actual parameter names need verification from Microsoft documentation - these are estimates based on typical Edge AI patterns.

---

### 3.5 Video Indexer Arc Extension

**Extension Type:** `microsoft.videoindexer.arcextension` (Preview - may vary)

**Requirements from your POC templates:**
- 64 cores, 256GB RAM (recommended)
- Storage for video ingestion and processed artifacts
- Optional GPU for YOLO v8 inference acceleration

**Estimated Configuration:**
```json
{
  "type": "Microsoft.KubernetesConfiguration/extensions",
  "apiVersion": "2023-05-01",
  "name": "video-indexer",
  "scope": "[resourceId('Microsoft.Kubernetes/connectedClusters', parameters('clusterName'))]",
  "properties": {
    "extensionType": "microsoft.videoindexer.arcextension",
    "autoUpgradeMinorVersion": false,
    "releaseTrain": "Preview",
    "scope": {
      "namespace": {
        "targetNamespace": "video-indexer"
      }
    },
    "configurationSettings": {
      "processing.yolo.version": "v8",
      "processing.transcription.engine": "whisper",
      "storage.local.path": "/mnt/video-cache",
      "storage.local.size": "500Gi",
      "api.replicas": "2"
    },
    "configurationProtectedSettings": {
      "azure.storage.connectionString": "<connection-string>",
      "api.subscriptionKey": "<subscription-key>"
    }
  }
}
```

---

### 3.6 Azure IoT Operations

**Extension Type:** `microsoft.iotoperations`

**Requirements:**
- MQTT broker configuration
- OPC UA connector settings
- Data pipeline endpoints

**Configuration:**
```json
{
  "type": "Microsoft.KubernetesConfiguration/extensions",
  "apiVersion": "2023-05-01",
  "name": "azure-iot-operations",
  "scope": "[resourceId('Microsoft.Kubernetes/connectedClusters', parameters('clusterName'))]",
  "properties": {
    "extensionType": "microsoft.iotoperations",
    "autoUpgradeMinorVersion": true,
    "releaseTrain": "Stable",
    "scope": {
      "namespace": {
        "targetNamespace": "azure-iot-operations"
      }
    },
    "configurationSettings": {
      "mqttBroker.replicas": "3",
      "mqttBroker.resources.limits.memory": "512Mi",
      "opcua.enabled": "true",
      "dataflow.enabled": "true"
    },
    "configurationProtectedSettings": {
      "eventHub.connectionString": "<event-hub-connection-string>"
    }
  }
}
```

---

## 4. Recommended Implementation Plan

### Phase 1: Fix Missing Cluster Properties (HIGH PRIORITY)

**Immediate fixes to ARM template generation:**

1. **Add Private Cluster Support**
   - File: `js/generator-v2-hotfix.js`
   - Location: `resources[1].properties` (provisionedClusterInstance)
   - Add:
     ```javascript
     if (networkConfig.enablePrivateCluster) {
         resources[1].properties.apiServerAccessProfile = {
             enablePrivateCluster: true,
             privateDNSZone: 'system'
         };
     }
     ```

2. **Add Arc Gateway Configuration**
   - File: `js/generator-v2-hotfix.js`
   - Location: `resources[0].properties` (ConnectedCluster) or `resources[1].properties`
   - Add:
     ```javascript
     if (clusterConfig.enableArcGateway) {
         resources[0].properties.arcAgentProfile = {
             gatewayResourceId: clusterConfig.arcGatewayResourceId,
             gatewayUrl: clusterConfig.arcGatewayUrl
         };
     }
     ```

3. **Add Entra ID Admin Groups**
   - Already has parameter `adminGroupObjectIDs` but defaultValue is empty array
   - Parse `clusterConfig.entraAdminGroupIds` (comma-separated string) into array

4. **Add GPU Node Pool Configuration**
   - Check if `config.gpuRequired === true`
   - Ensure GPU node pools use appropriate VM sizes (e.g., `Standard_NC4as_T4_v3`)
   - Add GPU-specific taints and labels

### Phase 2: Generate Separate Extensions Template (MEDIUM PRIORITY)

**Create new function:** `TemplateGenerator.generateExtensionsARM(plan, clusterName)`

**Returns:** Second ARM template with:
- Azure Policy extension (if `securityConfig.enablePolicy`)
- Policy initiative assignments (based on `selectedIndustry`)
- Microsoft Defender extension (if `securityConfig.enableDefender`)
- Azure Monitor extension (if monitoring enabled)
- Edge AI extensions (if `selectedSolution` is Edge RAG, Video Indexer, IoT Operations)

**UI Changes:**
- Add second download button: "📦 Download Extensions Template"
- Update deployment instructions to deploy cluster first, then extensions
- Provide combined PowerShell/Bash script for sequential deployment

### Phase 3: Add Post-Deployment Script Generation (LOW PRIORITY)

**Create deployment orchestration scripts:**

**PowerShell:**
```powershell
# 1. Deploy cluster
az deployment group create --template-file cluster-template.json --parameters cluster-parameters.json

# 2. Wait for cluster to be ready
az connectedk8s show -n $clusterName -g $resourceGroup --query "provisioningState" -o tsv

# 3. Deploy extensions
az deployment group create --template-file extensions-template.json --parameters extensions-parameters.json

# 4. Assign policy initiatives (if applicable)
az policy assignment create --name "pci-dss" --policy-set-definition "496eeda9-8f2f-4d5e-8dfd-204f0a92ed41" --scope $scope
```

**Bash:**
```bash
#!/bin/bash
# Full deployment automation
```

---

## 5. Testing Checklist

Before implementing changes, validate:

- [ ] Private cluster checkbox actually sets `apiServerAccessProfile` in generated ARM
- [ ] Arc Gateway fields populate `arcAgentProfile` correctly
- [ ] Policy extension deploys successfully after cluster
- [ ] Policy initiatives can be assigned and enforced
- [ ] Defender extension connects to Log Analytics workspace
- [ ] Azure Monitor extension collects metrics
- [ ] Edge RAG extension deploys on GPU nodes
- [ ] Video Indexer extension processes test video
- [ ] IoT Operations extension establishes MQTT broker

---

## 6. Key Findings Summary

| Area | Current State | Required Fix |
|------|---------------|--------------|
| **Private Cluster** | ❌ Not in template | Add `apiServerAccessProfile` |
| **Arc Gateway** | ❌ Not in template | Add `arcAgentProfile` |
| **Azure Policy** | ❌ Only in comments | Deploy as extension + assign initiatives |
| **Defender** | ❌ Only in comments | Deploy as extension with Log Analytics |
| **Azure Monitor** | ❌ Checkbox exists but not deployed | Deploy as extension |
| **GPU Configuration** | ⚠️ Partial | Ensure GPU VM sizes selected for GPU node pools |
| **Identity (Entra ID)** | ⚠️ Partial | Parse admin group IDs into array |
| **Arc Extensions** | ❌ Not deployed | Create separate extensions template |

---

## 7. Next Steps

**Before making ANY changes:**

1. ✅ Review this document with team
2. ✅ Decide on extension deployment approach (separate template vs single template)
3. ✅ Verify actual extension type names from Azure Portal or Microsoft Learn
4. ✅ Test extension deployment manually via Azure CLI first
5. ✅ Create test ARM templates for validation
6. ✅ Update UI to show which options require extensions (vs cluster properties)

**DO NOT proceed with implementation until:**
- Architecture decision made (separate vs combined template)
- Extension parameter names verified from official docs
- Test deployment validated in your Azure Local 2511 environment

---

## 8. Questions Needing Answers

1. **Can Arc extensions be included in same ARM template as cluster?**
   - **Answer:** NO - Must deploy separately with `dependsOn` cluster creation
   - Extensions must wait for cluster to be fully provisioned

2. **What are exact extension type names for Edge RAG, Video Indexer Arc?**
   - **Status:** NEEDS VERIFICATION from Azure Portal marketplace
   - May be in preview with different names than assumed

3. **Can policy initiatives be assigned in same template as extension?**
   - **Answer:** YES - But scope must be subscription/resource group level
   - Use `Microsoft.Authorization/policyAssignments` resource

4. **Do we need to create Log Analytics workspace in template?**
   - **Recommendation:** YES - Add as optional resource for Defender + Monitor
   - Or allow user to provide existing workspace ID

5. **Should GPU node pools be created automatically when GPU selected?**
   - **Current:** User manually configures node pools
   - **Recommendation:** Auto-add GPU node pool when `gpuRequired === true`

---

**END OF ANALYSIS - AWAITING DECISIONS BEFORE IMPLEMENTATION**
