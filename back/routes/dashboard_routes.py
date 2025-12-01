from flask import Blueprint, jsonify
from controllers.dashboard_controller import DashboardController

dashboard_bp = Blueprint('dashboard_bp', __name__)

@dashboard_bp.route('/api/dashboard/summary', methods=['GET'])
def dashboard_summary():
    result = DashboardController.get_summary_metrics()
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 500

@dashboard_bp.route('/api/dashboard/recent-orders', methods=['GET'])
def recent_orders():
    result = DashboardController.get_recent_orders()
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 500

@dashboard_bp.route('/api/dashboard/chart-data', methods=['GET'])
def chart_data():
    result = DashboardController.get_sales_chart_data()
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 500

def _handle_response(result):
    if result['success']:
        return jsonify(result['data']), 200
    else:
        return jsonify({"error": result['error']}), 500