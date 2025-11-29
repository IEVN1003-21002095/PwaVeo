from flask import Blueprint, jsonify
from controllers.sales_controller import SalesController

sales_bp = Blueprint('sales_bp', __name__)
controller = SalesController()

@sales_bp.route('/admin/dashboard-stats', methods=['GET'])
def dashboard_stats():
    result = controller.get_dashboard_stats()
    if result['success']:
        return jsonify(result['data']), 200
    return jsonify({'error': result['error']}), 500