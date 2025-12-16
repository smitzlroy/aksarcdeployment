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

### Deprecated

### Removed

### Fixed

### Security

## [0.1.0] - 2024-12-16

### Added
- Project initialization
- Core documentation files
