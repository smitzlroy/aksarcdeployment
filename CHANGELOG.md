# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project structure and scaffolding
- README with project overview and architecture
- DECISIONS.md documenting technical requirements and product goals
- LICENSE file (MIT)
- .gitignore for Python project
- Basic directory structure for wizard, planner, catalog, generator, validator, and CLI components
- **Client-side web wizard** - Fully functional browser-based deployment planner
- **Workload presets** - Video analytics, AI inference, and general-purpose templates
- **JavaScript planner** - Complete availability set planning logic with anti-affinity rules
- **Template generators** - Client-side Bicep, ARM, and Terraform generation
- **Modern responsive UI** - Clean, accessible design with step-by-step wizard
- **Dark/Light theme toggle** - User preference with localStorage persistence
- **Catalog JSON** - Static catalog data for Azure Local 2511
- GitHub Pages deployment workflow for static frontend

### Changed
- **BREAKING**: Replaced rack awareness with Azure-correct availability sets approach
  - AKS Arc automatically creates availability sets for control plane and each node pool
  - VMs spread across physical hosts using DifferentNode anti-affinity rules
  - Automatic rebalancing when hosts recover from outages
  - UI updated: physicalHostCount replaces rackCount
  - Based on Microsoft documentation research
- **Default Kubernetes version changed to 1.27.9** (from 1.29.2) for wider AKS Arc platform compatibility
- **Removed unsupported VM size Standard_D32s_v5** from catalogs to prevent deployment failures
- Updated VM SKU catalogs to include only commonly supported sizes (Standard_D4s_v5, Standard_D8s_v5, Standard_D16s_v5)

### Deprecated

### Removed
- Kubernetes version 1.29.2 from default catalogs (may not be supported on all Azure Local installations)
- VM size Standard_D32s_v5 from catalogs (rejected by platform admission webhooks)

### Fixed
- **CRITICAL**: ARM template JSON structure - `controlPlane` property now correctly builds as JavaScript object instead of ARM expression string
- **CRITICAL**: `agentPoolProfiles` array now properly serialized in JSON instead of variable reference
- **CRITICAL**: Added missing `securityProfile` and `oidcIssuerProfile` to ConnectedClusters resource to match official Azure/aksArc templates
- `controlPlaneIP` parameter is now truly optional - only includes `controlPlaneEndpoint` in template when IP address provided
- `sshPublicKey` parameter now has safe default placeholder to prevent template validation errors
- ARM template parameters now include empty string defaults where appropriate to avoid undefined serialization
- Generator metadata version updated to reflect structural fixes (2.0.2-20251217-2130)

### Security

## [0.1.0] - 2024-12-16

### Added
- Project initialization
- Core documentation files
