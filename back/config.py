import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "clave_dev_segura")

    # Base de datos MySQL / TiDB
    DB_HOST = os.environ.get("DB_HOST")
    DB_PORT = int(os.environ.get("DB_PORT", 4000))
    DB_USER = os.environ.get("DB_USER")
    DB_PASSWORD = os.environ.get("DB_PASSWORD")
    DB_NAME = os.environ.get("DB_NAME", "VeoDatabase")

    DB_SSL_CA = os.environ.get("DB_SSL_CA", "certs/isrgrootx1.pem")

    DEBUG = True
    TESTING = False
