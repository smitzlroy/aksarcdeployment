"""
Flask API for AKS Arc deployment tool
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from src.catalog import CatalogService
from src.planner import Planner
from src.generator import BicepGenerator, ARMGenerator, TerraformGenerator
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Initialize services
catalog_service = CatalogService()
planner = Planner(catalog_service)


@app.route('/')
def index():
    """API root endpoint"""
    return jsonify({
        'name': 'AKS Arc Deployment Tool API',
        'version': '0.1.0',
        'endpoints': {
            'catalog': '/api/catalog',
            'catalog_refresh': '/api/catalog/refresh',
            'plan': '/api/plan',
            'export_bicep': '/api/export/bicep',
            'export_arm': '/api/export/arm',
            'export_terraform': '/api/export/terraform'
        }
    })


@app.route('/api/catalog', methods=['GET'])
def get_catalog():
    """Get catalog data with versions, SKUs, and limits"""
    try:
        catalog_info = catalog_service.get_catalog_info()
        return jsonify({
            'metadata': catalog_info,
            'kubernetes_versions': catalog_service.get_kubernetes_versions(),
            'os_images': {
                'linux': catalog_service.get_os_images('linux'),
                'windows': catalog_service.get_os_images('windows')
            },
            'vm_skus': {
                'general_purpose': catalog_service.get_vm_skus('general_purpose'),
                'gpu': catalog_service.get_vm_skus('gpu')
            },
            'limits': catalog_service.get_limits()
        })
    except Exception as e:
        logger.error(f"Error fetching catalog: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/catalog/refresh', methods=['POST'])
def refresh_catalog():
    """Refresh catalog from Azure APIs"""
    try:
        success = catalog_service.refresh()
        if success:
            return jsonify({
                'success': True,
                'message': 'Catalog refreshed successfully',
                'metadata': catalog_service.get_catalog_info()
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to refresh catalog'
            }), 500
    except Exception as e:
        logger.error(f"Error refreshing catalog: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/plan', methods=['POST'])
def create_plan():
    """Create a deployment plan based on workload requirements"""
    try:
        data = request.get_json()
        # TODO: Implement planner logic
        return jsonify({
            'message': 'Planner endpoint - coming soon',
            'received': data
        })
    except Exception as e:
        logger.error(f"Error creating plan: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/export/bicep', methods=['POST'])
def export_bicep():
    """Export deployment plan as Bicep template"""
    try:
        data = request.get_json()
        # TODO: Implement Bicep generator
        return jsonify({
            'message': 'Bicep export endpoint - coming soon',
            'format': 'bicep'
        })
    except Exception as e:
        logger.error(f"Error exporting Bicep: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/export/arm', methods=['POST'])
def export_arm():
    """Export deployment plan as ARM template"""
    try:
        data = request.get_json()
        # TODO: Implement ARM generator
        return jsonify({
            'message': 'ARM export endpoint - coming soon',
            'format': 'arm'
        })
    except Exception as e:
        logger.error(f"Error exporting ARM: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/export/terraform', methods=['POST'])
def export_terraform():
    """Export deployment plan as Terraform configuration"""
    try:
        data = request.get_json()
        # TODO: Implement Terraform generator
        return jsonify({
            'message': 'Terraform export endpoint - coming soon',
            'format': 'terraform'
        })
    except Exception as e:
        logger.error(f"Error exporting Terraform: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
