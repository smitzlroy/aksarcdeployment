<div align="center">

# 🚀 AKS Arc Deployment Tool

### **Production-Ready IaC Generator for Azure Kubernetes Service on Azure Local 2511**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-smitzlroy.github.io/aksarcdeployment-0078d4?style=for-the-badge)](https://smitzlroy.github.io/aksarcdeployment)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/Deployed_on-GitHub_Pages-222?style=for-the-badge&logo=github)](https://github.com/smitzlroy/aksarcdeployment)

*Plan, configure, and generate deployment artifacts for AKS Arc clusters with a modern web-based wizard*

[🎯 Try Live Demo](#-quick-start) · [📖 Documentation](#-features) · [🤝 Contributing](#-contributing)

</div>

---

## 🌟 Overview

The **AKS Arc Deployment Tool** is a comprehensive, browser-based deployment planner that generates production-ready Infrastructure as Code (IaC) for Azure Kubernetes Service on Azure Local 2511. No installation required—just open in your browser and start planning your cluster.

### ✨ What Makes This Special?

- **🖱️ Zero Installation** - Runs entirely in your browser with GitHub Pages
- **🎨 Modern UI** - Clean, intuitive wizard with light/dark themes
- **📦 Multi-Format Export** - Generate Bicep, ARM JSON, and Terraform in one click
- **🔒 Industry Compliance** - Built-in regulatory framework guidance (ISO 27001, PCI-DSS, GDPR, etc.)
- **🎯 Workload Presets** - Pre-configured templates for Video Analytics, AI/ML, and more
- **⚡ Real-Time Planning** - Intelligent availability set calculations and resource placement
- **🔐 Security Scoring** - Built-in security scorecard with compliance gap analysis
- **📊 Smart Recommendations** - CPU/GPU sizing based on workload characteristics

---

## 🚀 Quick Start

### **Option 1: Use the Live Demo (Recommended)**

Simply visit: **[https://smitzlroy.github.io/aksarcdeployment](https://smitzlroy.github.io/aksarcdeployment)**

No installation, no dependencies—just open and start planning!

### **Option 2: Run Locally**

```bash
# Clone the repository
git clone https://github.com/smitzlroy/aksarcdeployment.git
cd aksarcdeployment

# Open index.html in your browser
# That's it! No build step required.
```

---

## 🎯 Features

### 🧙‍♂️ **Intelligent Wizard Interface**

<table>
<tr>
<td width="50%">

**Step 1: Environment & Workload**
- Industry selection (Manufacturing, Retail, Energy, etc.)
- Arc extension solutions (Edge RAG, Video Indexer, IoT Operations)
- Generic workload presets (AI/ML, Video Analytics, General Purpose)
- Environment type (Production, Dev/Test, Proof of Concept)
- Compliance framework recommendations

</td>
<td width="50%">

**Step 2: Cluster Configuration**
- **🔌 Arc Extensions** - Optional/Required extension selection
  - Azure Monitor (+$150/mo - optional)
  - Defender for Containers (+$200/mo - optional)
  - Azure Policy (FREE - always included)
  - Solution-specific extensions (Edge RAG, Video Indexer, IoT Ops)
- Control plane sizing (1, 3, or 5 nodes)
- Node pool configuration (count, VM size, GPU support)
- Kubernetes version selection (1.31.10, 1.32.6, etc.)
- Azure Local-specific VM SKUs

</td>
</tr>
<tr>
<td width="50%">

**Step 3: Export & Deploy**
- **📦 ZIP Bundle Export** - All templates in one download
  - Cluster template (`aksarc-cluster.json`)
  - Extension templates (`extension-*.json`)
  - Orchestrator template (`deploy-all.json`)
  - Log Analytics workspace (if needed)
  - README with deployment instructions
- Generate Bicep templates
- Download Terraform HCL
- Security compliance scorecard
- Deployment recommendations

</td>
<td width="50%">

**Smart Features**
- Automatic availability set planning
- Anti-affinity rule validation
- Cost calculation with extension pricing
- Resource quota validation
- Dark/Light theme toggle
- POC document generation

</td>
</tr>
</table>

### 🏗️ **Architecture Highlights**

```
Client-Side Architecture (No Backend Required!)
├── 🎨 Modern Responsive UI
│   ├── CSS Variable System (spacing, shadows, colors)
│   ├── Step Progress Indicator
│   └── Enhanced Card Layouts with Animations
│
├── 🧠 Intelligent Planning Engine
│   ├── Availability Set Calculator
│   ├── Anti-Affinity Rules Engine
│   └── Resource Quota Validator
│
├── 🔌 Arc Extension Manager (NEW!)
│   ├── Dynamic Extension Configuration
│   ├── Cost-Aware Selection (opt-in for paid)
│   ├── Solution Package Bundling
│   └── Workspace Management
│
├── 📝 Multi-Format Template Generators
│   ├── Bicep (Azure-native IaC)
│   ├── ARM JSON (Portal-compatible)
│   ├── Terraform HCL (Multi-cloud ready)
│   └── Extension Templates (Arc extensions)
│
├── 📦 ZIP Bundle Generator (NEW!)
│   ├── Cluster + Extension Templates
│   ├── Orchestrator (deploy-all.json)
│   ├── Workspace Template
│   └── Deployment README
│
└── 📊 Compliance & Security
    ├── Security Scorecard (100-point scale)
    ├── Compliance Gap Analysis
    └── Framework Mapping (ISO, PCI, GDPR, etc.)
```

### 🔐 **Security & Compliance Features**

- **Security Scorecard**: 100-point scoring system across 6 categories
  - Network Security
  - Identity & Access Management
  - Data Protection
  - Workload Security
  - Platform Security
  - Operational Security

- **Compliance Frameworks**:
  - ISO 27001 (Information Security)
  - PCI-DSS (Payment Card Industry)
  - GDPR (Data Privacy)
  - TISAX (Automotive)
  - NERC CIP (Energy)
  - IEC 62443 (Industrial Control Systems)

- **Gap Analysis**: Identifies missing controls and provides remediation steps

### 📦 **Supported Configurations**

| Component | Options |
|-----------|---------|
| **Kubernetes Versions** | 1.31.10, 1.32.6, 1.32.5, 1.31.9, 1.30.14, 1.30.13 |
| **Control Plane** | 1, 3, or 5 nodes |
| **VM SKUs** | A2_v2, A4_v2, D4s_v3, D8s_v3, D16s_v3, D32s_v3, K8S3_v1 |
| **GPU SKUs** | NC16_A16, NC32_A16, NC4_A16, NC8_A16, NK12, NK6 |
| **Node Count** | 3-100 nodes per pool |
| **Authentication** | Local accounts, Azure AD |
| **Arc Extensions** | Monitor, Policy, Defender, Edge RAG, Video Indexer, IoT Operations |

---

## 🎨 UI Showcase

### Modern Design System (v2.1)

- **🎨 Modern CSS Variables**: Consistent spacing, shadows, and transitions
- **🌓 Enhanced Dark Mode**: True dark (#0d0d0d) with improved contrast
- **💳 Larger Cards**: 280px minimum with hover animations
- **🔘 Enhanced Buttons**: Ripple effects and clear states
- **📝 Better Forms**: Focus rings, error/success states
- **🎯 Progress Indicators**: Visual step tracking
- **🎭 Color-Coded Security**: Green/yellow/red status indicators
- **📱 Fully Responsive**: Mobile, tablet, and desktop optimized

---

## 🛠️ Technology Stack

<div align="center">

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vanilla JavaScript (ES6+), HTML5, CSS3 |
| **Styling** | CSS Custom Properties, CSS Grid, Flexbox |
| **Hosting** | GitHub Pages (Static) |
| **CI/CD** | GitHub Actions |
| **Templates** | Bicep, ARM JSON, Terraform HCL, Extensions |
| **Libraries** | JSZip (bundling), FileSaver.js (downloads), jsPDF, docx |
| **No Build Step** | Pure client-side, no npm/webpack required! |

</div>

---

## 📚 Usage Examples

### 🎬 Example 1: Edge RAG Solution with Extensions

```javascript
// 1. Select "Manufacturing" industry
// 2. Choose "Edge RAG Arc Extension" workload
// 3. Arc Extensions auto-populated:
//    ✓ Azure Policy (FREE - required)
//    ☐ Azure Monitor (+$150/mo - optional)
//    ☐ Defender for Containers (+$200/mo - optional)
//    ✓ Edge RAG Arc Extension (+$500/mo - required)
// 4. Configure cluster: 3 control plane, 6 workers (GPU)
// 5. Click "Generate Plan" → "Export ARM Template"
// 6. Download ZIP bundle with all templates
// 7. Deploy: az deployment group create --template-file deploy-all.json
```

### 🤖 Example 2: Video Analytics with Monitoring

```javascript
// 1. Select "Manufacturing" industry
// 2. Choose "Video Indexer Arc Extension" workload
// 3. Enable optional extensions:
//    ✓ Azure Monitor (for Container Insights)
//    ✓ Defender for Containers (for security)
// 4. Configure cluster with GPU node pool
// 5. Export ZIP bundle
// 6. Templates generated:
//    - aksarc-cluster.json
//    - extension-azure-monitor.json
//    - extension-defender-containers.json
//    - extension-video-indexer-arc.json
//    - workspace.json (Log Analytics)
//    - deploy-all.json (orchestrator)
//    - README.md (instructions)
```

### 🏭 Example 3: Simple Cluster (No Extensions)

```javascript
// 1. Select "General / Other" industry
// 2. Choose "General Purpose" workload
// 3. Only Azure Policy is enabled (free)
// 4. Export generates single aksarc-cluster.json
// 5. Deploy: az deployment group create --template-file aksarc-cluster.json
```

---

## 🚀 Extension Deployment Workflow

### Single-Command Deployment

When you export an ARM template with Arc extensions enabled, you receive a ZIP bundle:

```bash
# Extract the ZIP
unzip my-cluster-deployment.zip
cd my-cluster-deployment

# Deploy everything with one command
az deployment group create \
  --resource-group my-rg \
  --template-file deploy-all.json \
  --parameters clusterName=my-cluster
```

**What happens:**
1. `aksarc-cluster.json` deploys (cluster creation)
2. `workspace.json` deploys (Log Analytics - if needed)
3. Extension templates deploy in parallel (after cluster is ready)
   - `extension-azure-policy.json`
   - `extension-azure-monitor.json` (if selected)
   - `extension-defender-containers.json` (if selected)
   - `extension-edge-rag-arc.json` (if Edge RAG solution)

### Manual Step-by-Step Deployment

For more control, deploy templates individually:

```bash
# 1. Deploy cluster
az deployment group create \
  --resource-group my-rg \
  --template-file aksarc-cluster.json

# 2. Deploy workspace (if using Monitor or Defender)
az deployment group create \
  --resource-group my-rg \
  --template-file workspace.json

# 3. Deploy extensions one by one
az deployment group create \
  --resource-group my-rg \
  --template-file extension-azure-monitor.json \
  --parameters clusterName=my-cluster

az deployment group create \
  --resource-group my-rg \
  --template-file extension-defender-containers.json \
  --parameters clusterName=my-cluster
```

## 🏭 Production Deployments

### Validated Against

✅ **Portal-Generated Templates**: Exact structure match with Azure Portal exports  
✅ **Official ARM Schemas**: Validated against Microsoft ARM API schemas  
✅ **Azure Local 2511**: Tested with actual platform catalogs  
✅ **Arc Extensions**: Microsoft.KubernetesConfiguration/extensions API  
✅ **Multiple Deployments**: Successfully deployed clusters in production

### Deployment Success

- **ConnectedClusters API**: `2025-08-01-preview`
- **ProvisionedClusterInstances API**: `2024-01-01`
- **KubernetesConfiguration/extensions API**: `2023-05-01`
- **Availability Sets**: Automatic DifferentNode anti-affinity
- **Networking**: Integrated with Azure Local logical networks

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [DECISIONS.md](DECISIONS.md) | Technical decisions and architecture rationale |
| [CHANGELOG.md](CHANGELOG.md) | Detailed version history and changes |
| [UI-REVAMP-NOTES.md](UI-REVAMP-NOTES.md) | UI design system documentation |
| [CLIENT_SIDE_COMPLETE.md](CLIENT_SIDE_COMPLETE.md) | Implementation completion notes |

---

## 🤝 Contributing

Contributions are welcome! This project is open source under the MIT license.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly in your browser
5. Commit with clear messages (`git commit -m 'feat: add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines

- **No build step**: Keep it pure HTML/CSS/JS
- **Browser compatibility**: Test in Chrome, Firefox, Edge, Safari
- **Accessibility**: Maintain WCAG 2.1 AA compliance
- **Performance**: Keep bundle size minimal
- **Code style**: Use modern ES6+ features

---

## 🐛 Known Issues & Roadmap

### Current Limitations

- Static catalog (manual updates required for new VM SKUs)
- No backend validation (client-side only)
- Browser storage for preferences (no cloud sync)

### Recently Added ✨

- [x] **Arc Extension Support** - Dynamic extension configuration with cost awareness
- [x] **ZIP Bundle Export** - All templates packaged with orchestrator
- [x] **Extension Templates** - Microsoft.KubernetesConfiguration/extensions generation
- [x] **Log Analytics Workspace** - Automatic workspace template generation
- [x] **POC Document Generator** - Edge RAG, Video Indexer solution documents

### Planned Features

- [ ] Dynamic catalog fetching from Azure APIs
- [ ] Template validation before download
- [ ] Multi-cluster deployment planning
- [ ] Cost calculator with Azure pricing API
- [ ] Export to Azure DevOps Pipelines
- [ ] Kubernetes manifest generation
- [ ] Helm chart creation
- [ ] Policy assignment template generation

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Microsoft Azure Documentation** - Official ARM schemas and API references
- **Azure Local Team** - Platform capabilities and catalog data
- **GitHub Pages** - Free static hosting
- **Community Contributors** - Feedback and testing

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/smitzlroy/aksarcdeployment/issues)
- **Discussions**: [GitHub Discussions](https://github.com/smitzlroy/aksarcdeployment/discussions)
- **Live Demo**: [https://smitzlroy.github.io/aksarcdeployment](https://smitzlroy.github.io/aksarcdeployment)

---

<div align="center">

### ⭐ Star this repo if you find it useful!

**Made with ❤️ for the Azure Community**

[🏠 Home](https://smitzlroy.github.io/aksarcdeployment) · [📖 Docs](DECISIONS.md) · [🐛 Report Bug](https://github.com/smitzlroy/aksarcdeployment/issues) · [✨ Request Feature](https://github.com/smitzlroy/aksarcdeployment/issues)

</div>
aksarcdeployment/
├── src/
│   ├── wizard/          # Click-first UI wizard
│   ├── planner/         # Rack-aware topology planner
│   ├── catalog/         # Live AKS/SKU/OS catalog service
│   ├── generator/       # Bicep/ARM/Terraform export
│   ├── validator/       # Validation logic
│   └── cli/             # CLI interface
├── templates/           # Export templates
├── tests/               # Unit and integration tests
├── docs/                # Documentation and guides
└── .github/workflows/   # CI/CD pipelines
```

## Documentation

- [Product Goals & Requirements](./DECISIONS.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)
- [Security Policy](./SECURITY.md)

## Supported Workloads

The wizard provides presets for common scenarios:
- Video analytics
- AI inferencing
- General-purpose applications

## Rack Awareness

The tool automatically:
- Suggests rack/fault domain spread
- Applies anti-affinity rules
- Generates node/pool selectors
- Respects documented limits for Azure Local 2511

## Export Options

Generate deployment artifacts:
- **Bicep** - Infrastructure as Code
- **ARM Templates** - Azure Resource Manager JSON
- **Terraform** - Multi-cloud IaC with Azure provider

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Acknowledgments

- Official Azure Arc docs and Azure Local 2511 documentation
- Azure Verified Modules for Bicep templates
- Community feedback and contributions
