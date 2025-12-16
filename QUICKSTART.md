# Quick Start Guide

## What's Been Built

I've scaffolded a complete AKS Arc deployment tool for Azure Local 2511 with:

### ✅ Core Components
- **Catalog Service**: Manages AKS versions, OS images, VM SKUs with refresh capability
- **Rack-Aware Planner**: Intelligent bin-packing with fault domain spread
- **Template Generators**: Export to Bicep, ARM, and Terraform
- **Flask API**: REST endpoints for catalog, planning, and exports
- **CLI Interface**: Command-line tool with Click
- **Validation**: Checks against Azure Local 2511 limits

### ✅ Infrastructure
- Docker & Docker Compose for local development
- GitHub Actions: CI, Pages deployment, CodeQL security
- Dependabot for dependency management
- Comprehensive testing with pytest
- Full documentation

### 📁 Project Structure
```
aksarcdeployment/
├── src/
│   ├── api/          # Flask REST API
│   ├── catalog/      # SKU/version catalog service
│   ├── planner/      # Rack-aware deployment planner
│   ├── generator/    # Bicep/ARM/Terraform generators
│   ├── cli/          # Command-line interface
│   ├── validator/    # (placeholder for validation logic)
│   └── wizard/       # (placeholder for web UI)
├── catalog/
│   └── skus.yaml     # Azure Local 2511 catalog data
├── tests/            # Unit tests
├── docs/             # Documentation
└── .github/          # CI/CD workflows

```

## Getting Started

### 1. Install Dependencies

```bash
cd c:\AI\AKSARCDEPLOYMENT\aksarcdeployment
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Try the CLI

```bash
# Check catalog status
python src/cli/main.py catalog-info

# Create a deployment plan
python src/cli/main.py plan \
  --workload video-analytics \
  --cpu 16 \
  --memory 64 \
  --cluster-name my-aks-cluster \
  --resource-group my-rg \
  --custom-location my-custom-location \
  --output plan.json
```

### 3. Start the API Server

```bash
python src/api/app.py
```

Visit: http://localhost:5000

**API Endpoints:**
- `GET /api/catalog` - Get catalog data
- `POST /api/catalog/refresh` - Refresh catalog
- `POST /api/plan` - Create deployment plan
- `POST /api/export/bicep` - Export as Bicep
- `POST /api/export/arm` - Export as ARM
- `POST /api/export/terraform` - Export as Terraform

### 4. Run Tests

```bash
pytest tests/ -v
```

### 5. Docker (All-in-One)

```bash
docker-compose up
```

## What's Next

### Immediate TODOs:
1. **Web UI Wizard**: Build the click-first wizard interface
2. **Azure API Integration**: Connect catalog refresh to real Azure APIs
3. **Enhanced Validation**: Add more comprehensive validation logic
4. **LLM Explanations**: Optional OpenAI integration for plan rationale
5. **Frontend**: Create React/Vue wizard for GitHub Pages

### Testing Locally

```bash
# Example: Create a plan for video analytics workload
python src/cli/main.py plan \
  --workload video-analytics \
  --cpu 32 \
  --memory 128 \
  --gpu \
  --cluster-name video-cluster \
  --resource-group prod-rg \
  --location eastus \
  --custom-location arc-custom-location \
  --output deployment-plan.json

# Check the generated plan
cat deployment-plan.json
```

### Next Development Steps

1. **Enable GitHub Pages**:
   - Go to repo Settings → Pages
   - Set source to "GitHub Actions"
   - The workflow will auto-deploy

2. **Build the Web Wizard**:
   - Create frontend in `frontend/` directory
   - Step-by-step form with workload presets
   - Connect to API endpoints

3. **Enhance Planner**:
   - More sophisticated bin-packing algorithms
   - Real-time SKU pricing integration
   - Cost estimation

4. **Azure Integration**:
   - Use Azure SDK to fetch live catalog data
   - Validate against actual subscription quotas
   - Deploy directly from tool

## Repository
https://github.com/smitzlroy/aksarcdeployment

## Next Commands

```bash
# Create a feature branch
git checkout -b feat/add-web-wizard

# Install dev dependencies
pip install -r requirements-dev.txt

# Format code
black src/

# Run linter
flake8 src/

# Run tests with coverage
pytest tests/ --cov=src --cov-report=html
```

## Architecture Decisions

Per the SOP, I've chosen:
- **Backend**: Python + Flask (lightweight, great for APIs)
- **Frontend**: TBD - suggest React or Vue for wizard
- **IaC**: Bicep (preferred), ARM, Terraform via AzAPI
- **Hosting**: GitHub Pages (frontend) + Azure Container Apps (backend)
- **Testing**: pytest with >80% coverage goal
- **CI/CD**: GitHub Actions

## Key Features Implemented

✅ Rack-aware topology planning  
✅ Control plane HA (1/3/5 nodes)  
✅ Node pool bin-packing  
✅ GPU workload support  
✅ Anti-affinity and spread constraints  
✅ Validation against Azure Local 2511 limits  
✅ Exportable templates (Bicep/ARM/Terraform)  
✅ Catalog with refresh capability  
✅ CLI and API interfaces  
✅ Docker support  
✅ Full CI/CD pipeline  
✅ Comprehensive documentation  

## Help & Support

- **Documentation**: See `docs/` folder
- **Issues**: https://github.com/smitzlroy/aksarcdeployment/issues
- **Contributing**: See `CONTRIBUTING.md`
