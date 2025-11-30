from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager

# cargar .env
load_dotenv()

# importar blueprints
from routes.auth_routes import auth_bp

def create_app():
    app = Flask(__name__)

    app.config["JWT_SECRET_KEY"] = "super-secreta-cachonda-key-2025"  
    jwt = JWTManager(app)

    # habilitar CORS
    CORS(app)

    # registrar blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
