from flask import jsonify, request
from database import get_connection

# ------------------------------
# Crear reseña (Usuario)
# ------------------------------
def create_review():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Content-Type debe ser application/json"}), 415

    producto_id = data.get("producto_id")
    cliente_id = data.get("cliente_id")
    calificacion = data.get("calificacion")
    comentario = data.get("comentario")

    # Validaciones básicas
    if not all([producto_id, cliente_id, calificacion]):
        return jsonify({"error": "Faltan campos obligatorios"}), 400

    if not (1 <= calificacion <= 5):
        return jsonify({"error": "La calificación debe ser entre 1 y 5"}), 400

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO reseñas (producto_id, cliente_id, calificacion, comentario, estado, fecha)
            VALUES (%s, %s, %s, %s, 'pendiente', NOW())
        """, (producto_id, cliente_id, calificacion, comentario))
        
        conn.commit()
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({"error": str(e)}), 500

    cursor.close()
    conn.close()

    return jsonify({"message": "Reseña enviada correctamente"}), 201

# ------------------------------
# Reseñas aprobadas por producto
# ------------------------------
def get_reviews_by_product(producto_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT r.id, r.calificacion, r.comentario, r.fecha,
               u.nombre, u.apellido
        FROM reseñas r
        INNER JOIN clientes c ON r.cliente_id = c.id
        INNER JOIN usuarios u ON c.usuario_id = u.id
        WHERE r.producto_id = %s AND r.estado = 'aprobado'
        ORDER BY r.fecha DESC
    """, (producto_id,))

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    reviews = []
    for row in rows:
        reviews.append({
            "id": row["id"],
            "calificacion": row["calificacion"],
            "comentario": row["comentario"],
            "fecha": row["fecha"],
            "nombre_completo": f"{row['nombre']} {row['apellido']}"
        })

    return jsonify(reviews)

# ------------------------------
# Todas las reseñas (ADMIN)
# ------------------------------
def get_all_reviews():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT r.id, r.producto_id, r.cliente_id, r.calificacion,
               r.comentario, r.estado, r.fecha,
               p.nombre AS producto_nombre,
               u.nombre, u.apellido
        FROM reseñas r
        INNER JOIN productos p ON r.producto_id = p.id
        INNER JOIN clientes c ON r.cliente_id = c.id
        INNER JOIN usuarios u ON c.usuario_id = u.id
        ORDER BY r.fecha DESC
    """)

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    reviews = []
    for row in rows:
        reviews.append({
            "id": row["id"],
            "producto_id": row["producto_id"],
            "cliente_id": row["cliente_id"],
            "calificacion": row["calificacion"],
            "comentario": row["comentario"],
            "estado": row["estado"],
            "fecha": row["fecha"],
            "producto_nombre": row["producto_nombre"],
            "nombre_completo": f"{row['nombre']} {row['apellido']}"
        })

    return jsonify(reviews)

# ------------------------------
# Aprobar reseña
# ------------------------------
def approve_review(review_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE reseñas SET estado='aprobado' WHERE id=%s", (review_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Reseña aprobada"})

# ------------------------------
# Rechazar reseña
# ------------------------------
def reject_review(review_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE reseñas SET estado='rechazado' WHERE id=%s", (review_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Reseña rechazada"})

# ------------------------------
# Eliminar reseña
# ------------------------------
def delete_review(review_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM reseñas WHERE id=%s", (review_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Reseña eliminada"})

# ------------------------------
# Obtener lista de productos (SELECTOR)
# ------------------------------
def get_products_list():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Solo necesitamos ID y Nombre para el selector
    cursor.execute("SELECT id, nombre FROM productos")
    rows = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    products = []
    for row in rows:
        products.append({"id": row["id"], "nombre": row["nombre"]})
        
    return jsonify(products)

# ------------------------------
# Obtener lista de clientes (SELECTOR)
# ------------------------------
def get_clients_list():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Join para obtener el nombre real del usuario asociado al cliente
    cursor.execute("""
        SELECT c.id, u.nombre, u.apellido 
        FROM clientes c
        INNER JOIN usuarios u ON c.usuario_id = u.id
    """)
    rows = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    clients = []
    for row in rows:
        clients.append({
            "id": row["id"],
            "nombre_completo": f"{row['nombre']} {row['apellido']}"
        })
        
    return jsonify(clients)