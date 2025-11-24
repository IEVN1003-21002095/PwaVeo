from flask import Blueprint, jsonify
from controllers.auth_controller import AuthController

auth_bp = Blueprint("auth", __name__)
controller = AuthController()

@auth_bp.route('/clientes', methods=['GET'])
def list_clientes():
    """
    GET /api/auth/clientes  
    Obtiene la lista completa de clientes registrados.
    """
    try:
        clientes = controller.list_clientes()
        
        return jsonify({
            "success": True,
            "total": len(clientes),
            "data": clientes
        }), 200

    except ConnectionError as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 503

    except Exception as e:
        print(f"Error al obtener clientes: {e}")
        return jsonify({
            "success": False,
            "message": "Error interno del servidor al consultar clientes."
        }), 500

@auth_bp.post("/create")
def create():
    """POST /api/auth/create -> crear recurso (recibe JSON)"""
    data = request.get_json(silent=True) or {}
    return jsonify(controller.create(data))

@auth_bp.put("/<int:item_id>/update")
def update(item_id: int):
    """PUT /api/auth/<id>/update -> actualizar recurso (recibe JSON)"""
    data = request.get_json(silent=True) or {}
    return jsonify(controller.update(item_id, data))

@auth_bp.delete("/<int:item_id>/delete")
def delete(item_id: int):
    """DELETE /api/auth/<id>/delete -> eliminar recurso"""
    return jsonify(controller.delete(item_id))
