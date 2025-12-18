# Arc Extension Deployment Architecture

## Design Goals
1. **Single-Click Deployment**: User gets cluster + extensions + policies in one action
2. **Proper Dependencies**: Extensions wait for cluster to be ready
3. **Best Practice Configuration**: Pre-configured extension settings with security/monitoring defaults
4. **Template Orchestration**: Clean, maintainable multi-template approach

---

## Deployment Strategy Options

### ✅ **Option 1: Nested Templates with Dependencies (RECOMMENDED)**

**Structure:**
```
main-deployment.json
├── cluster-template.json (nested)
├── extension-monitor.json (nested, depends on cluster)
├── extension-policy.json (nested, depends on cluster)
├── extension-defender.json (nested, depends on cluster)
└── policy-assignments.json (nested, depends on extensions)
```

**Pros:**
- ✅ Single deployment operation in Portal
- ✅ Atomic: All-or-nothing deployment
- ✅ Azure handles dependency ordering automatically
- ✅ Clean rollback on failure
- ✅ Users see one deployment in Activity Log

**Cons:**
- ⚠️ Main template can get large with many extensions
- ⚠️ All templates must be accessible (blob storage or inline)

**Implementation:**
```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": { ... },
  "resources": [
    {
      "type": "Microsoft.Resources/deployments",
      "apiVersion": "2021-04-01",
      "name": "aks-arc-cluster",
      "properties": {
        "mode": "Incremental",
        "templateLink": {
          "uri": "https://[storage]/cluster-template.json",
          "contentVersion": "1.0.0.0"
        }
      }
    },
    {
      "type": "Microsoft.Resources/deployments",
      "apiVersion": "2021-04-01",
      "name": "azure-monitor-extension",
      "dependsOn": [
        "[resourceId('Microsoft.Resources/deployments', 'aks-arc-cluster')]"
      ],
      "properties": {
        "mode": "Incremental",
        "templateLink": {
          "uri": "https://[storage]/extension-monitor.json"
        }
      }
    }
  ]
}
```

---

### Option 2: Inline Nested Templates

**Structure:** Same as Option 1 but templates embedded inline

**Pros:**
- ✅ No external storage required
- ✅ Single file to download/deploy
- ✅ Portal "Edit template" works

**Cons:**
- ⚠️ Very large files (harder to read/maintain)
- ⚠️ 4MB ARM template size limit risk

---

### Option 3: Separate Sequential Deployments

**Structure:** Generate 5 separate template files, user deploys one at a time

**Pros:**
- ✅ Simple templates
- ✅ Easy to understand
- ✅ User can skip extensions

**Cons:**
- ❌ Manual dependency management (user error prone)
- ❌ No atomicity
- ❌ Poor UX (5 Portal deployments)
- ❌ This defeats the purpose of our tool

---

### Option 4: Deployment Scripts (Bicep/PowerShell)

**Structure:** Generate .bicep modules or PowerShell script

**Pros:**
- ✅ Clean separation of concerns
- ✅ Bicep handles dependencies
- ✅ Script can have logic/error handling

**Cons:**
- ❌ Requires local tooling (az cli, bicep, pwsh)
- ❌ Can't "Deploy to Azure" button from Portal
- ❌ Less accessible for non-technical users

---

## 🎯 **RECOMMENDED APPROACH: Hybrid Inline + Blob**

### Phase 1: MVP (Inline Nested Templates)
Generate single ARM template with all resources inline:
- **Main template**: Orchestrator with parameters
- **Nested deployments**: Inline templates for cluster + extensions
- **User action**: Download → Portal → Deploy

**Why:** 
- No infrastructure needed (blob storage)
- Works with "Deploy to Azure" button
- Good for POC/pilot scenarios (3-4 extensions)

### Phase 2: Production (Blob + Orchestrator)
For production deployments with many extensions:
- **Tool generates**: Orchestrator template + separate extension files
- **Upload to**: Azure Blob Storage (user's or public CDN)
- **User action**: Deploy orchestrator → References blob templates

**Why:**
- Scales to 10+ extensions without hitting size limits
- Easier to version and update individual extensions
- Better for CI/CD pipelines

---

## Extension Configuration by Solution

### Edge RAG Arc Extension Package
```json
{
  "extensions": [
    {
      "name": "azure-monitor",
      "type": "Microsoft.KubernetesConfiguration/extensions",
      "properties": {
        "extensionType": "microsoft.azuremonitor.containers",
        "configurationSettings": {
          "logAnalyticsWorkspaceResourceID": "[parameters('workspaceId')]",
          "prometheus.enabled": "true",
          "prometheus.retention": "7d"
        }
      }
    },
    {
      "name": "azure-policy",
      "type": "Microsoft.KubernetesConfiguration/extensions",
      "properties": {
        "extensionType": "microsoft.policyinsights",
        "configurationSettings": {
          "audit.enabled": "true",
          "mutation.enabled": "false"
        }
      }
    },
    {
      "name": "defender-for-containers",
      "type": "Microsoft.KubernetesConfiguration/extensions",
      "properties": {
        "extensionType": "microsoft.azuredefender.kubernetes",
        "configurationSettings": {
          "logAnalyticsWorkspaceResourceID": "[parameters('workspaceId')]",
          "vulnerabilityAssessment.enabled": "true"
        }
      }
    }
  ],
  "policyAssignments": [
    {
      "name": "cis-kubernetes-benchmark",
      "policyDefinitionId": "/providers/Microsoft.Authorization/policySetDefinitions/...",
      "scope": "[resourceId('Microsoft.Kubernetes/connectedClusters', parameters('clusterName'))]"
    }
  ]
}
```

### Video Indexer Arc Extension Package
```json
{
  "extensions": [
    "azure-monitor",
    "azure-policy", 
    "defender-for-containers",
    {
      "name": "video-indexer-arc",
      "type": "Microsoft.KubernetesConfiguration/extensions",
      "properties": {
        "extensionType": "microsoft.videoindexer.arc",
        "configurationSettings": {
          "storageAccount": "[parameters('storageAccountName')]",
          "computeType": "GPU",
          "models": "face-detection,object-tracking,ocr"
        }
      }
    }
  ]
}
```

---

## Tool UX Flow

### Step 1: User Selects Solution (Existing)
```
┌─────────────────────────────────────┐
│ Select Workload: Edge RAG Arc       │
│ ✓ Auto-includes 3 Arc extensions    │
│ ✓ Auto-includes CIS policies        │
│ ✓ Auto-configures Log Analytics     │
└─────────────────────────────────────┘
```

### Step 2: Extension Configuration (NEW)
```
┌──────────────────────────────────────────────────────┐
│ 🔌 Extensions to Deploy (3)                          │
├──────────────────────────────────────────────────────┤
│ ✓ Azure Monitor                                      │
│   └─ Workspace: [Create new ▼]                      │
│   └─ Prometheus: ☑ Enabled (7 day retention)        │
│                                                      │
│ ✓ Azure Policy                                       │
│   └─ Policy Set: [CIS Kubernetes Benchmark ▼]       │
│   └─ Enforcement: [Audit (recommended) ▼]           │
│                                                      │
│ ✓ Defender for Containers                           │
│   └─ Vulnerability Scanning: ☑ Enabled              │
│   └─ Runtime Protection: ☑ Enabled                  │
└──────────────────────────────────────────────────────┘
```

### Step 3: Generate Templates (MODIFIED)
```
┌──────────────────────────────────────────────────────┐
│ 📦 Generated Deployment Package:                     │
├──────────────────────────────────────────────────────┤
│ 🎯 Single-Click Deployment:                          │
│    └─ 📄 main-deployment.json (orchestrator)        │
│         ├─ Cluster: edge-rag-cluster                │
│         ├─ Extension: Azure Monitor                 │
│         ├─ Extension: Azure Policy                  │
│         ├─ Extension: Defender                      │
│         └─ Policy: CIS Benchmark                    │
│                                                      │
│ 🔧 Individual Templates (Advanced):                 │
│    ├─ 📄 1-cluster.json                             │
│    ├─ 📄 2-extension-monitor.json                   │
│    ├─ 📄 3-extension-policy.json                    │
│    ├─ 📄 4-extension-defender.json                  │
│    └─ 📄 5-policy-assignments.json                  │
│                                                      │
│ [🚀 Deploy to Azure] [💾 Download All]              │
└──────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Foundation (Week 1)
- [x] UI reorganization (solution-first approach)
- [ ] Extension metadata in catalog.json
- [ ] Extension configuration panel UI
- [ ] Extension ARM template generator functions

### Phase 2: Core Extensions (Week 2)
- [ ] Azure Monitor extension template
- [ ] Azure Policy extension template
- [ ] Defender extension template
- [ ] Log Analytics workspace creation
- [ ] Policy assignment template

### Phase 3: Orchestration (Week 3)
- [ ] Main orchestrator template generator
- [ ] Inline nested template approach
- [ ] Dependency chain validation
- [ ] Single "Deploy to Azure" button

### Phase 4: Solution Packages (Week 4)
- [ ] Edge RAG extension package
- [ ] Video Indexer extension package
- [ ] IoT Operations extension package
- [ ] Custom workload defaults

---

## Key Differentiators vs Portal

| Feature | Azure Portal | Our Tool |
|---------|--------------|----------|
| Cluster deployment | ✅ Good | ✅ Good |
| Extension deployment | ⚠️ Manual, one-by-one | ✅ Automated, bundled |
| Policy assignment | ⚠️ Separate process | ✅ Included in package |
| Best practice config | ❌ User must know | ✅ Pre-configured |
| Multi-cluster consistency | ❌ Manual repeat | ✅ Save/reuse profiles |
| Compliance reporting | ❌ Not available | ✅ Generated documentation |
| Extension dependencies | ⚠️ User must track | ✅ Auto-handled |

---

## Next Steps

1. ✅ **UI Refactor** (Done)
2. **Extension Catalog**: Add extension metadata to `data/catalog.json`
3. **Config UI**: Build dynamic extension configuration panels
4. **Template Generators**: Create extension ARM template generation functions
5. **Orchestrator**: Build main deployment template with nested deployments
6. **Testing**: Deploy to test subscription with all extensions

---

## Questions to Resolve

1. **Storage Strategy**: Do we host templates on public CDN or expect users to upload?
2. **Workspace Creation**: Auto-create Log Analytics workspace or require existing?
3. **Extension Versions**: Pin to specific versions or use "latest"?
4. **Error Handling**: How do we surface extension deployment failures to users?
5. **Rollback**: Should we support automated rollback on extension failure?
