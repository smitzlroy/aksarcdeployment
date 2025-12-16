# AKS Arc Deployment Tool

A production-grade tool that plans, recommends SKUs, and generates deployment artifacts for AKS Arc on Azure Local 2511.

## Overview

This tool helps you deploy Azure Kubernetes Service (AKS) on Azure Local 2511 with rack-aware cluster topologies, optimal resource placement, and validated configurations.

## Features

- **Click-first wizard** with sensible defaults
- **Rack-aware planning** - supports rack/fault domains, anti-affinity, spread across racks
- **Smart SKU recommendations** - CPU/GPU sizing with retention policies
- **Export formats** - Bicep, ARM, and Terraform
- **Live catalog** - Auto-refreshed AKS versions, OS images, and SKU limits
- **Validation** - Inline validations with official Azure docs and API compatibility
- **CI/CD ready** - GitHub Actions with automated testing and deployment

## Quick Start

### Prerequisites

- Azure Local 2511 (rack-aware clusters with supported K8s versions and OS images)
- Azure subscription
- Azure CLI or PowerShell with appropriate permissions

### Installation

```bash
# Clone the repository
git clone https://github.com/smitzlroy/aksarcdeployment.git
cd aksarcdeployment

# Install dependencies (Python-based)
pip install -r requirements.txt
```

### Usage

```bash
# Start the wizard
python src/wizard/main.py

# Or use CLI directly
python src/cli/main.py --workload video-analytics --cluster-size large
```

## Architecture

```
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
