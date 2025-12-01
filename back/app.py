from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager

load_dotenv()

from routes.auth_routes import auth_bp
from routes.customer_routes import customer_bp 

def create_app():
    app = Flask(__name__)

    app.config["JWT_SECRET_KEY"] = "super-secreta-cachonda-key-2025"  
    jwt = JWTManager(app)

    CORS(app)

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    

    app.register_blueprint(customer_bp)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)