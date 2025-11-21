from flask import Blueprint, request, jsonify
from app.controllers.auth_controller import AuthController

auth_bp = Blueprint("auth", __name__)
controller = AuthController()

@auth_bp.get("/")
def index():
    """GET /api/auth/  -> listado / prueba"""
    return jsonify(controller.index())

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
