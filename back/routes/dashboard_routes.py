from flask import Blueprint, jsonify
from controllers.dashboard_controller import DashboardController

dashboard_bp = Blueprint('dashboard_bp', __name__)

@dashboard_bp.route('/api/dashboard/summary', methods=['GET'])
def dashboard_summary():
    return _handle_response(DashboardController.get_summary_metrics())

@dashboard_bp.route('/api/dashboard/recent-orders', methods=['GET'])
def recent_orders():
    return _handle_response(DashboardController.get_recent_orders())

@dashboard_bp.route('/api/dashboard/chart-data', methods=['GET'])
def chart_data():
    return _handle_response(DashboardController.get_sales_chart_data())

def _handle_response(result):
    if result['success']:
        return jsonify(result['data']), 200
    else:
        return jsonify({"error": result['error']}), 500