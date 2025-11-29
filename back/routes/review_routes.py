from flask import Blueprint, request, jsonify
from controllers.review_controller import ReviewController

review_bp = Blueprint('review_bp', __name__)
controller = ReviewController()

@review_bp.route('/reviews/product/<int:id>', methods=['GET'])
def get_product_reviews(id):
    result = controller.get_reviews_by_product(id)
    if result['success']:
        return jsonify(result['data']), 200
    return jsonify({'error': result['error']}), 500

@review_bp.route('/reviews', methods=['POST'])
def add_review():
    data = request.json
    # Asegúrate de enviar usuario_id desde el frontend (o extraerlo del token)
    result = controller.create_review(data)
    
    if result['success']:
        return jsonify({'message': result['message']}), 201
    
    status = result.get('status', 500)
    return jsonify({'message': result.get('message', result.get('error'))}), status