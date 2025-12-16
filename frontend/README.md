# Frontend - Client-Side Wizard

The frontend is a fully static web application that runs entirely in the browser with no backend required.

## Features

- ✅ **Step-by-step wizard** with workload presets
- ✅ **Client-side planning** - All logic runs in JavaScript
- ✅ **Template generation** - Download Bicep, ARM, or Terraform
- ✅ **Rack-aware topology** - Fault domain planning
- ✅ **GPU workload support** - Auto-configure GPU pools
- ✅ **Responsive design** - Works on desktop and mobile
- ✅ **No backend needed** - Hosted on GitHub Pages

## Architecture

```
frontend/
├── index.html          # Main wizard interface
├── css/
│   └── style.css      # Responsive styling
├── js/
│   ├── app.js         # Main application logic
│   ├── planner.js     # Deployment planning engine
│   └── generator.js   # Template generators
└── data/
    └── catalog.json   # Azure Local 2511 catalog
```

## How It Works

1. **Workload Selection**: Choose from presets or customize
2. **Configuration**: Enter cluster details and requirements
3. **Planning**: JavaScript calculates optimal VM SKUs and node pools
4. **Validation**: Check against Azure Local 2511 limits
5. **Export**: Download generated templates

## Local Testing

```bash
# Simple HTTP server
cd frontend
python -m http.server 8000

# Or using Node.js
npx http-server -p 8000
```

Visit: http://localhost:8000

## Deployment

The frontend is automatically deployed to GitHub Pages via `.github/workflows/pages.yml`.

**Live URL**: `https://smitzlroy.github.io/aksarcdeployment/`

## Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript** - No framework dependencies
- **ES6+** - Classes, async/await, modules

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Extending

### Adding New Workload Presets

Edit `data/catalog.json`:

```json
"workload_presets": {
  "my-workload": {
    "name": "My Workload",
    "description": "Description here",
    "cpu_cores": 16,
    "memory_gb": 64,
    "gpu_required": false
  }
}
```

### Customizing Templates

Edit generator functions in `js/generator.js`:
- `generateBicep()`
- `generateARM()`
- `generateTerraform()`

### Styling

Modify CSS variables in `css/style.css`:

```css
:root {
  --primary-color: #0078d4;
  --success-color: #107c10;
  /* ... */
}
```

## Future Enhancements

- [ ] Save/load configurations
- [ ] Cost estimation
- [ ] Multi-language support
- [ ] Dark mode
- [ ] PWA support (offline capability)
- [ ] Template preview with syntax highlighting
