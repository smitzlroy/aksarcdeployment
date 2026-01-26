<div align="center">

# AKS Arc Deployment Tool

**Sovereign Private Cloud & Sovereign AI Infrastructure**

Deploy AKS on Azure Local with full data residency

[![Live Demo](https://img.shields.io/badge/Live_Demo-smitzlroy.github.io/aksarcdeployment-0078d4?style=for-the-badge)](https://smitzlroy.github.io/aksarcdeployment)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

[Live Demo](https://smitzlroy.github.io/aksarcdeployment) · [Documentation](#features) · [Contributing](#contributing)

</div>

---

## Sovereign Private Cloud & AI

AKS Arc on Azure Local enables organizations to run AI workloads and containerized applications with **complete data residency** while maintaining Azure's management capabilities.

### Why AKS Arc for Sovereign Cloud?

| Capability | Benefit |
|------------|---------|
| **Data Sovereignty** | Your data never leaves your premises — only management metadata flows to Azure |
| **Foundry Local Ready** | Run Microsoft Foundry Local, SLMs, and AI models entirely on-premises |
| **Air-Gap Capable** | Arc Gateway reduces firewall endpoints from 80+ to <30 |
| **Regulatory Compliance** | Meet GDPR, data residency laws, HIPAA, FedRAMP requirements |
| **Edge AI Inference** | GPU-accelerated inference at the edge with full data isolation |
| **Zero Trust Ready** | Entra ID integration, workload identity, Pod Security Standards |

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     YOUR INFRASTRUCTURE                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Azure Local Cluster                     │  │
│  │  ┌─────────────────┐  ┌─────────────────────────────────┐ │  │
│  │  │  AKS Arc        │  │  Your Workloads                 │ │  │
│  │  │  Control Plane  │  │  • Foundry Local / SLMs         │ │  │
│  │  │  (Kubernetes)   │  │  • Edge RAG & AI Inference      │ │  │
│  │  └─────────────────┘  │  • Sovereign Applications       │ │  │
│  │                       │  • IoT & OT Data Processing     │ │  │
│  │  DATA STAYS HERE ───► └─────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │ Management Only                   │
│                              ▼ (Metadata, Telemetry)             │
└─────────────────────────────────────────────────────────────────┘
                    ┌─────────────────────┐
                    │    Azure Arc        │
                    │  (Control Plane)    │
                    └─────────────────────┘
```

---

## Quick Start

### Option 1: Live Demo (Recommended)

Visit: **[https://smitzlroy.github.io/aksarcdeployment](https://smitzlroy.github.io/aksarcdeployment)**

No installation required.

### Option 2: Run Locally

```bash
git clone https://github.com/smitzlroy/aksarcdeployment.git
cd aksarcdeployment
# Open index.html in your browser
```

---

## Features

### Wizard Interface

**Step 1: Environment & Workload**
- Industry selection (Manufacturing, Retail, Energy, Healthcare, Financial, Government)
- **Data Residency selector** with country-specific regulations (EU, Germany, France, UK, US, Canada, Australia, APAC)
- **AI/ML workload toggle** with AI compliance guidance (EU AI Act, NIST AI RMF, ISO 42001)
- Arc extension solutions (Edge RAG, Video Indexer, IoT Operations)
- Environment type (Production, Pilot, POC)

**Step 2: Cluster Configuration**
- Control plane sizing (1, 3, or 5 nodes)
- Node pool configuration with GPU support
- Network, storage, identity, and security settings
- Arc Gateway configuration

**Step 3: Review & Export**
- Security compliance scorecard (100-point scale)
- Compliance gap analysis with data sovereignty context
- Network architecture diagram
- Export: Bicep, ARM JSON, Terraform
- ZIP bundle with all templates

### Data Sovereignty & Privacy

| Region | Key Regulations | Why On-Premises Matters |
|--------|-----------------|------------------------|
| **EU** | GDPR, EU Data Boundary | Eliminates cross-border transfer concerns under Schrems II |
| **Germany** | BDSG, C5 | German regulators are strict on cloud data |
| **France** | CNIL, SecNumCloud | CNIL aggressive on US cloud transfers |
| **UK** | UK GDPR, Cyber Essentials | Future-proof against UK-EU data rule changes |
| **US** | CCPA/CPRA, FedRAMP | State privacy laws vary; on-prem simplifies compliance |
| **Australia** | Privacy Act, IRAP | IRAP PROTECTED often requires on-premises |
| **Canada** | PIPEDA, Provincial Laws | Quebec Law 25 has strict requirements |

### AI/ML Compliance

For organizations running AI workloads on-premises:

| Framework | Scope | Why Sovereign AI? |
|-----------|-------|-------------------|
| **EU AI Act** | EU AI systems (effective Aug 2025) | Complete control over AI data, training data provenance |
| **NIST AI RMF** | US voluntary framework | Full visibility into AI behavior and outputs |
| **FDA AI/ML** | Medical AI devices | PHI never leaves hospital network during inference |
| **ISO/IEC 42001** | Global AI management | Demonstrable control for certification |
| **Financial AI** | Banking/trading models | Sensitive data and models stay on-premises |

### Supported Configurations

| Component | Options |
|-----------|---------|
| **Kubernetes Versions** | 1.31.10, 1.32.6, 1.32.5, 1.31.9, 1.30.14 |
| **Control Plane** | 1, 3, or 5 nodes |
| **VM SKUs** | A2_v2, A4_v2, D4s_v3, D8s_v3, D16s_v3, D32s_v3 |
| **GPU SKUs** | NC16_A16, NC32_A16, NC4_A16, NK12, NK6 |
| **Arc Extensions** | Monitor, Policy, Defender, Edge RAG, Video Indexer, IoT Operations |

### Security & Compliance

- **Security Scorecard**: 100-point scoring across 6 categories
- **Compliance Frameworks**: ISO 27001, PCI-DSS, GDPR, HIPAA, FedRAMP, SOC 2, NIST CSF
- **Gap Analysis**: Missing controls with remediation steps

---

## Technology

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla JavaScript, HTML5, CSS3 |
| Hosting | GitHub Pages |
| Templates | Bicep, ARM JSON, Terraform HCL |
| Libraries | JSZip, FileSaver.js, jsPDF |

No build step required — pure client-side.

---

## Documentation

| Document | Description |
|----------|-------------|
| [DECISIONS.md](DECISIONS.md) | Technical decisions and architecture |
| [CHANGELOG.md](CHANGELOG.md) | Version history |
| [COMPLIANCE_SOURCES.md](COMPLIANCE_SOURCES.md) | Compliance data sources |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test in your browser
5. Commit (`git commit -m 'Add amazing feature'`)
6. Push (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">

**[Live Demo](https://smitzlroy.github.io/aksarcdeployment)** · **[Report Issue](https://github.com/smitzlroy/aksarcdeployment/issues)** · **[Request Feature](https://github.com/smitzlroy/aksarcdeployment/issues)**

</div>
