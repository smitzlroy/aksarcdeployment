# Technical Decisions & Product Requirements

## Overview

You are my senior engineer. Build and maintain a production-grade tool that plans, recommends SKUs, and generates deployment artifacts for AKS Arc on Azure Local 2511.

## What's new vs prior spec

- **Baseline on Azure Local 2511** (not 2505)
- **Support rack-aware cluster topologies**: racks/fault domains, anti-affinity, spread across racks where available
- You choose the tech stack; document it below in DECISIONS.md
- **Export Bicep alongside ARM and Terraform (AzAPI)**
- UX is a **guided wizard**; in initial option (e.g., "workload type"), then step-by-step screens; each step's options depend on earlier choices; submit button at the end

## Product goals

- **Inputs**: workload scenarios (e.g., cameras, FPS, GPU, retention) in a **click-first wizard** with sensible defaults. I also want you to have an option where I can, in natural language, tell / ask the tool to do what I want it to do and it creates the ULM
- **Planner**: use workload + CPU/GPU + placement hints; node splits (Linux + optional Windows, CPU/GPU), and exportable Bicep, ARM, Terraform
- Must validate with the NEWEST official AzAPI for the rack-aware variant; fail fast if any SKUs, limits). Failed to use local catalog with a refresh job
- **Modern, accessible design**: clean to use

## Authoritative sources (must use)

1. Official Azure Arc docs and Azure Local AKS Arc docs
2. **Azure Local 2511 docs** (rack-aware, supported K8s versions, OS images, limits)
3. If Copilot has one, check latest internal resources for Azure Local; prefer official primary sources
4. If conflict, prefer **current official Azure docs** and note caveats inline

## Tech stack (you choose)

- Choose a stack (frontend + backend): reliability, DX, hosting on GitHub Pages (frontend) and a simple deploy for the backend (e.g., Container Apps, VM, or Actions runner)
- Include linting/formatting and tests appropriate to your chosen stack
- Provide rationale in DECISIONS.md
- If you choose a different stack (e.g., no Vue), explain why and ship behind a feature flag

## Repo & version control (automate)

- **Create GitHub repository**: `https://github.com/smitzlroy/aksarcdeployment`
- Use **Conventional Commits**, semantic versioning, **CHANGELOG.md**, **MIT LICENSE**
- Protect main: work on feature branches
- Use PR templates, CODEOWNERS
- **Never break working features**: 
  - New features/improvements go behind **feature flags** or as parallel modules
  - Old stable flows remain untouched unless copy-on-write with full tests
  - On each change: run existing tests/linters; update CHANGELOG and appropriate docs; auto-push
- **Status flows**: remain untouched unless fully tested

## CI/CD & Hosting

### GitHub Actions:
- **CI**: yml: install, lint, build (frontend/backend)
  - pages.yml: deploy frontend to **GitHub Pages** (or relative API /api)
  - deploy.yml: deploy backend to chosen backend (e.g., Container Apps, VM, or Actions runner)
- **codequal.yml**: CodeQL scan
- **dependabot.yml**: keep deps fresh

### Optionally provide `docker-compose.yml` for local all-in-one

### Provide an **Infra README** file showing how hosting to both servers + open browser

## Live data & APIs

Implement a **CatalogService** hosting that can:
- Query **Azure/AKS Arc APIs/CLI/SDKs** for latest supported **Kubernetes versions**, **OS images** (Azure Linux/Windows), vendor ARC limits. Fall back to catalog/skus.yaml if a one-click refresh admin UI + CLI task)
- Surface a **UI banner** if "catalog is older than 30 days"
- Expose GET `/api/catalog` (shows versions/SKUs/limits/timestamps)
- Expose GET `/api/catalog/refresh` (shows versions/SKUs/limits/timestamps)

### Surface a UI banner or catalog/sku.yaml is older than 30 days

### UX standard wizard

**Deterministic first (no LLM required) to plan**:
1. **Aggregate workload** → 3 vCPU → smallest fitting VM; respect **nodes/pool, pools/cluster, nodes/cluster** limits documented for **2511**
2. Bin-pack into smallest fitting VM; respect **nodes/pool** specified by **2511** → cluster → pools → topology via taints/nodeSelectors
3. **Control plane** counts allowed: **1/3/5**
4. **Rack awareness**: recommend pools spread across racks/fault domains; generate labels/taints/topology keys and **nodeSelector(s)** (specified according to **2511** docs)
5. Optional **LLM Explain Mode**: if `OPENAI_API_KEY` present, add rationale in UI (default off)

### UX wizard (click first)

**Step 1 (entry option)**: "What do you want to size for..." → pick a **workload archetype** (Video analytics, AI inferencing, general app, etc.)

**Step 2**: expand details **only as needed**, with presets for common scenarios
- Inline validations with **valid K8s or ARM** / Terraform, POST `/api/export/bicep`, POST `/api/export/arm`, POST `/api/export/terraform`
- Help drawer with citations to sources you used
- **Keyboard accessible**; screen-reader labels; responsive

### Templates

#### ARM: **same as above**

#### Frontend/Windows: parameters
- **Bicep**: cluster + pools → Windows optional
- **Terraform (AzAPI)**: cluster + pools → Windows optional

#### Catalog: `catalog/skus.yaml` seeded for **2511**; refresh script/command and small admin panel to trigger it
- **Docker**: provide `.dockerignore`, `Dockerfile` (or Docker), `.docker-compose.yml` (optional)

### Catalog state banner: if replicas > when catalog UI "Catalog last refreshed: [timestamp]" ("Refresh now" admin U + CLI) outdated > 30 days*

## Planner logic (rack-aware)

**Deterministic first (no LLM required plan)**:
1. **Aggregate workload** → aggregate vCPU/RAM
2. **Bin-pack into smallest fitting VM**; respect **nodes/pool** limits
3. **Control-plane** HA cluster for prod is older than 30 days

## Housekeeping

- Include sample **anti-affinity and topology spread constraints** snippets using rack labels
- **Telemetry toggle** (off by default), if added
- Accessibility checks

## Do it now

1. Scaffold; push initial commit to GitHub, open PR with the first vertical slice
2. Wire-up pages (URL, Pages URL, instructions for catalog refresh), and a summary of decisions
3. Issue/PR templates, CODEOWNERS

### Repository settings:
- **Org**: `<YOUR_ORG>`
- **Names**: `<REPO_NAME>`
- **URL**: `https://github.com/smitzlroy/aksarcdeployment`
