import pymysql
from pymysql.cursors import DictCursor
from config import Config

def get_connection():
    """
    Establece y retorna una conexión a la base de datos TiDB.
    Utiliza la configuración definida en Config.
    """
    try:
        connection = pymysql.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME,
            cursorclass=DictCursor,
            ssl={"ca": Config.DB_SSL_CA}
        )
        return connection
    except Exception as e:
        print("❌ Error crítico conectando a TiDB Cloud:", e)
        raise ConnectionError(f"Error al conectar a la base de datos: {e}")

# --- AUTH & USUARIOS ---

def leer_usuario_bd(correo_o_id):
    """
    Busca un usuario por su correo electrónico o por su ID.
    Usado en: Login, Registro, Clientes.
    """
    connection = None
    try:
        connection = get_connection()
        with connection.cursor() as cursor:
            if str(correo_o_id).isdigit():
                sql = "SELECT * FROM usuarios WHERE id = %s"
                cursor.execute(sql, (correo_o_id,))
            else:
                sql = "SELECT * FROM usuarios WHERE correo = %s"
                cursor.execute(sql, (correo_o_id,))
            return cursor.fetchone()
    except Exception as ex:
        print(f"Error en leer_usuario_bd: {ex}")
        return None
    finally:
        if connection: connection.close()

def leer_cliente_por_usuario_id(usuario_id):
    """
    Obtiene los datos del perfil de cliente asociado a un usuario.
    Usado en: Auth, Clientes, Checkout.
    """
    connection = None
    try:
        connection = get_connection()
        with connection.cursor() as cursor:
            sql = "SELECT * FROM clientes WHERE usuario_id = %s"
            cursor.execute(sql, (usuario_id,))
            return cursor.fetchone()
    except Exception as ex:
        print(f"Error en leer_cliente_por_usuario_id: {ex}")
        return None
    finally:
        if connection: connection.close()

def get_all_clientes():
    """
    Retorna toda la lista de clientes.
    """
    connection = None
    try:
        connection = get_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM clientes;")
            return cursor.fetchall()
    finally:
        if connection: connection.close()

# --- PRODUCTOS & INVENTARIO ---

def leer_producto_bd(producto_id):
    """
    Obtiene un producto por ID.
    Usado en: Productos.
    """
    connection = None
    try:
        connection = get_connection()
        with connection.cursor() as cursor:
            sql = "SELECT * FROM productos WHERE id = %s"
            cursor.execute(sql, (producto_id,))
            return cursor.fetchone()
    finally:
        if connection: connection.close()

def leer_inventario_bd(inventario_id):
    """
    Obtiene detalles del inventario (SKU) incluyendo nombres de producto, color y talla.
    Usado en: Checkout, Ventas.
    """
    connection = None
    try:
        connection = get_connection()
        with connection.cursor() as cursor:
            sql = """
            SELECT i.*, p.nombre as nombre_producto, p.precio as precio_base,
                   c.color as nombre_color, t.talla as nombre_talla 
            FROM inventario i
            JOIN productos p ON i.producto_id = p.id
            LEFT JOIN colores c ON i.color_id = c.id
            LEFT JOIN tallas t ON i.talla_id = t.id
            WHERE i.id = %s
            """
            cursor.execute(sql, (inventario_id,))
            return cursor.fetchone()
    finally:
        if connection: connection.close()

def leer_materia_prima_bd(mp_id):
    """
    Obtiene materia prima por ID.
    Usado en: Stock (Admin).
    """
    connection = None
    try:
        connection = get_connection()
        with connection.cursor() as cursor:
            sql = "SELECT * FROM materia_prima WHERE id = %s"
            cursor.execute(sql, (mp_id,))
            return cursor.fetchone()
    finally:
        if connection: connection.close()

# --- VENTAS & CHECKOUT ---

def leer_venta_bd(venta_id):
    """
    Obtiene una venta por ID.
    Usado en: Pedidos (Admin/Cliente).
    """
    connection = None
    try:
        connection = get_connection()
        with connection.cursor() as cursor:
            sql = "SELECT * FROM ventas WHERE id = %s"
            cursor.execute(sql, (venta_id,))
            return cursor.fetchone()
    finally:
        if connection: connection.close()

def leer_direccion_cliente(direccion_id):
    """
    Obtiene una dirección específica.
    Usado en: Checkout.
    """
    connection = None
    try:
        connection = get_connection()
        with connection.cursor() as cursor:
            sql = "SELECT * FROM direcciones_cliente WHERE id = %s"
            cursor.execute(sql, (direccion_id,))
            return cursor.fetchone()
    finally:
        if connection: connection.close()

def leer_metodo_pago(metodo_id):
    """
    Obtiene un método de pago.
    Usado en: Checkout.
    """
    connection = None
    try:
        connection = get_connection()
        with connection.cursor() as cursor:
            sql = "SELECT * FROM metodos_pago WHERE id = %s"
            cursor.execute(sql, (metodo_id,))
            return cursor.fetchone()
    finally:
        if connection: connection.close()


def leer_review_bd(review_id):
    """
    Obtiene una reseña por ID.
    Usado en: Reviews.
    """
    connection = None
    try:
        connection = get_connection()
        with connection.cursor() as cursor:
            sql = "SELECT * FROM reviews WHERE id = %s" 
            cursor.execute(sql, (review_id,))
            return cursor.fetchone()
    finally:
        if connection: connection.close()