from flask import Blueprint, jsonify, request
from controllers.stock_controller import StockController

stock_bp = Blueprint("stock", __name__)  # 🔹 Esto debe llamarse exactamente stock_bp
controller = StockController()

# GET /api/stock/list
@stock_bp.route('/list', methods=['GET'])
def list_stock():
    try:
        result = controller.list_stock()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# POST /api/stock/create
@stock_bp.route('/create', methods=['POST'])
def create_stock():
    data = request.get_json(silent=True) or {}
    try:
        result = controller.create(data)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# PUT /api/stock/<id>/update
@stock_bp.route('/<int:item_id>/update', methods=['PUT'])
def update_stock(item_id):
    data = request.get_json(silent=True) or {}
    try:
        result = controller.update(item_id, data)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# DELETE /api/stock/<id>/delete
@stock_bp.route('/<int:item_id>/delete', methods=['DELETE'])
def delete_stock(item_id):
    try:
        result = controller.delete(item_id)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
