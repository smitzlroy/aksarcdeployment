# AKS Arc Deployment Tool - Infrastructure Hosting

This guide explains how to host and run the AKS Arc Deployment Tool infrastructure.

## Architecture

- **Frontend**: Static files served via GitHub Pages
- **Backend API**: Flask application (can be deployed to Azure Container Apps, VM, or locally)

## Local Development

### Prerequisites
- Python 3.11+
- pip

### Setup

1. **Install dependencies**:
```bash
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

2. **Run the API server**:
```bash
python src/api/app.py
```

The API will be available at `http://localhost:5000`

3. **Run tests**:
```bash
pytest tests/
```

4. **Format and lint**:
```bash
black src/
flake8 src/
```

## Deployment

### GitHub Pages (Frontend)

The frontend is automatically deployed to GitHub Pages when you push to the `main` branch.

**URL**: `https://smitzlroy.github.io/aksarcdeployment/`

To enable GitHub Pages:
1. Go to repository Settings
2. Navigate to Pages
3. Set Source to "GitHub Actions"
4. The `.github/workflows/pages.yml` workflow will handle deployment

### Backend API Options

#### Option 1: Azure Container Apps (Recommended)

```bash
# Login to Azure
az login

# Create resource group
az group create --name aksarc-tool-rg --location eastus

# Create Container Apps environment
az containerapp env create \
  --name aksarc-env \
  --resource-group aksarc-tool-rg \
  --location eastus

# Deploy the API
az containerapp create \
  --name aksarc-api \
  --resource-group aksarc-tool-rg \
  --environment aksarc-env \
  --image <your-container-registry>/aksarc-api:latest \
  --target-port 5000 \
  --ingress external \
  --query properties.configuration.ingress.fqdn
```

#### Option 2: Docker

```bash
# Build image
docker build -t aksarc-api:latest -f Dockerfile .

# Run container
docker run -p 5000:5000 aksarc-api:latest
```

#### Option 3: Azure VM

```bash
# SSH into VM
ssh user@your-vm-ip

# Clone repository
git clone https://github.com/smitzlroy/aksarcdeployment.git
cd aksarcdeployment

# Install dependencies
pip install -r requirements.txt

# Run with gunicorn (production server)
gunicorn -w 4 -b 0.0.0.0:5000 src.api.app:app
```

## Docker Compose (All-in-One Local)

For local development with all components:

```bash
docker-compose up
```

This will start:
- API server on `http://localhost:5000`
- Frontend on `http://localhost:8080` (if applicable)

## Environment Variables

Create a `.env` file for configuration:

```env
# Optional: Enable OpenAI LLM explanations
OPENAI_API_KEY=your-api-key-here

# Azure credentials (for catalog refresh)
AZURE_SUBSCRIPTION_ID=your-subscription-id
AZURE_TENANT_ID=your-tenant-id
```

## Monitoring & Health Checks

The API includes a health check endpoint:

```bash
curl http://localhost:5000/health
```

Response:
```json
{"status": "healthy"}
```

## Catalog Refresh

To refresh the catalog data:

```bash
# Via CLI
python src/cli/main.py catalog-refresh

# Via API
curl -X POST http://localhost:5000/api/catalog/refresh
```

## CI/CD Pipeline

The repository includes GitHub Actions workflows:

- **CI** (`.github/workflows/ci.yml`): Runs tests, linting on every PR
- **Pages** (`.github/workflows/pages.yml`): Deploys frontend to GitHub Pages
- **CodeQL** (`.github/workflows/codeql.yml`): Security scanning

## Troubleshooting

### Port already in use
```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process or use a different port
python src/api/app.py  # Edit app.py to change port
```

### Import errors
```bash
# Ensure you're in the right directory
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
```

### Catalog not loading
```bash
# Check catalog file exists
ls -la catalog/skus.yaml

# Refresh catalog
python src/cli/main.py catalog-refresh
```

## Support

For issues or questions:
- Open an issue: https://github.com/smitzlroy/aksarcdeployment/issues
- Review documentation: See `/docs` folder
