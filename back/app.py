from flask import Flask
from routes.auth_routes import auth_bp
from routes.customer_routes import customer_bp
from routes.product_routes import product_bp
from routes.checkout_routes import checkout_bp
from routes.orders_routes import orders_bp
from routes.review_routes import review_bp
from routes.sales_routes import sales_bp
from routes.stock_routes import stock_bp

app = Flask(__name__)

# Registrar Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(customer_bp)
app.register_blueprint(product_bp)
app.register_blueprint(checkout_bp)
app.register_blueprint(orders_bp)
app.register_blueprint(review_bp)
app.register_blueprint(sales_bp)
app.register_blueprint(stock_bp)

if __name__ == "__main__":
    app.run(debug=True)
