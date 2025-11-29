import pymysql
from pymysql.cursors import DictCursor
from config import Config

def get_connection():
    """Crea y retorna una conexión a TiDB Cloud usando SSL."""
    try:
        return pymysql.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME,
            cursorclass=DictCursor,
            ssl={"ca": Config.DB_SSL_CA}
        )
    except Exception as e:
        print("❌ Error conectando a TiDB Cloud:", e)
        raise ConnectionError(f"Error al conectar a TiDB Cloud: {e}")


def get_all_clientes():
    """
    Retorna todos los registros de la tabla 'clientes'.
    """
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            query = "SELECT * FROM clientes;"
            cursor.execute(query)
            return cursor.fetchall()

    except Exception as e:
        print("❌ Error consultando clientes:", e)
        raise RuntimeError(f"Error al obtener clientes: {e}")

    finally:
        connection.close()


# EXTRA: Función general de consulta (opcional pero recomendado)
def execute_query(query, params=None):
    """
    Ejecuta cualquier consulta SQL y retorna los resultados.
    Ideal para evitar repetir código.
    """
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute(query, params or ())
            return cursor.fetchall()
    except Exception as e:
        print("❌ Error ejecutando consulta:", e)
        raise RuntimeError(f"Error en la consulta: {e}")
    finally:
        connection.close()
