from flask import Flask
from flask_cors import CORS
from .routes.auth_routes import auth_bp
from .routes.product_routes import products_bp
from .routes.customer_routes import customers_bp
from .routes.stock_routes import stock_bp
from .routes.review_routes import reviews_bp
from .routes.cart_routes import cart_bp
from .routes.checkout_routes import checkout_bp
from .routes.sales_routes import sales_bp
from .routes.orders_routes import orders_bp

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(products_bp, url_prefix="/api/products")
    app.register_blueprint(customers_bp, url_prefix="/api/customers")
    app.register_blueprint(stock_bp, url_prefix="/api/stock")
    app.register_blueprint(reviews_bp, url_prefix="/api/reviews")
    app.register_blueprint(cart_bp, url_prefix="/api/cart")
    app.register_blueprint(checkout_bp, url_prefix="/api/checkout")
    app.register_blueprint(sales_bp, url_prefix="/api/sales")
    app.register_blueprint(orders_bp, url_prefix="/api/orders")

    return app
