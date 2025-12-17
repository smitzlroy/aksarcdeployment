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
- **CRITICAL**: Updated catalogs with environment-specific VM SKUs and Kubernetes versions
  - Kubernetes versions: 1.31.10 (default), 1.32.6, 1.32.5, 1.31.9, 1.30.14, 1.30.13
  - VM SKUs updated to match actual Azure Local environment: Standard_A2_v2, Standard_A4_v2, Standard_D4s_v3, Standard_D8s_v3, Standard_D16s_v3, Standard_D32s_v3, Standard_K8S3_v1
  - GPU SKUs updated: Standard_NC16_A16, Standard_NC32_A16, Standard_NC4_A16, Standard_NC8_A16, Standard_NK12, Standard_NK6
  - Removed generic/unsupported SKUs that caused deployment failures

### Deprecated

### Removed
- Outdated Kubernetes versions (1.27.9, 1.28.5, 1.29.2) - replaced with environment-specific versions
- Generic VM SKUs (Standard_D4s_v5, Standard_D8s_v5, Standard_D16s_v5, Standard_D32s_v5) - replaced with actual Azure Local SKUs
- Generic GPU SKUs (Standard_NC4as_T4_v3, etc.) - replaced with environment-specific GPU SKUs

### Fixed
- **CRITICAL**: ARM template structure now matches portal-generated templates exactly
  - ConnectedClusters API version changed to `2025-08-01-preview` (from `2024-01-01`)
  - Added `adminGroupObjectIDs` parameter and property in aadProfile
  - Changed provisionedClusterInstances scope from `format()` to `resourceId()` function
  - Moved `extendedLocation` to after `properties` block (portal structure)
  - `controlPlaneEndpoint` now ALWAYS included in controlPlane (portal behavior)
  - Added `dependsOn` array to provisionedClusterInstances resource
- **CRITICAL**: ARM template JSON structure - `controlPlane` property now correctly builds as JavaScript object instead of ARM expression string
- **CRITICAL**: `agentPoolProfiles` array now properly serialized in JSON instead of variable reference
- `sshPublicKey` parameter now has safe default placeholder to prevent template validation errors
- ARM template parameters now include empty string defaults where appropriate to avoid undefined serialization
- Generator metadata version updated to reflect environment-specific catalogs (2.0.5-20251217-2310)
- Added comprehensive validation test suite comparing against portal-generated templates
- Default Kubernetes version updated to 1.31.10 (from 1.27.9)

### Security

## [0.1.0] - 2024-12-16

### Added
- Project initialization
- Core documentation files
