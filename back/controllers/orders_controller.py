# orders_controller.py
from flask import jsonify, request
from database import get_connection
from pymysql import Error as PyMySQLError
from flask_jwt_extended import jwt_required, get_jwt_identity

def get_orders_history():
    """
    Retorna el historial de pedidos del cliente autenticado.
    Cumple con el Criterio 2, 3, 6 y 8.
    """
    # Obtener el ID del usuario autenticado desde el JWT
    current_user_id = get_jwt_identity()
    
    connection = None
    try:
        connection = get_connection()
        with connection.cursor() as cursor:
            # Primero obtener el cliente_id asociado al usuario
            cursor.execute("""
                SELECT id FROM clientes WHERE usuario_id = %s
            """, (current_user_id,))
            cliente_result = cursor.fetchone()
            
            if not cliente_result:
                return jsonify({
                    "message": "No se encontró información del cliente.",
                    "total_pedidos": 0,
                    "pedidos": []
                }), 200
            
            cliente_id = cliente_result['id'] if isinstance(cliente_result, dict) else cliente_result[0]
            
            # Obtener historial de pedidos
            query = """
                SELECT
                    v.id AS pedido_id,
                    v.fecha AS fecha_pedido,
                    v.total,
                    v.estado AS estado_venta,
                    e.estado_envio
                FROM ventas v
                LEFT JOIN envios e ON v.id = e.venta_id
                WHERE v.cliente_id = %s
                ORDER BY v.fecha DESC;
            """
            cursor.execute(query, (cliente_id,))
            pedidos = cursor.fetchall()
            
            total_pedidos = len(pedidos)

            if not pedidos:
                return jsonify({
                    "message": "No hay pedidos para mostrar.",
                    "total_pedidos": 0,
                    "pedidos": []
                }), 200

            # Procesar el estado de cada pedido
            for pedido in pedidos:
                pedido['estado_display'] = pedido['estado_envio'] if pedido.get('estado_envio') else pedido['estado_venta']
                if 'estado_venta' in pedido:
                    del pedido['estado_venta']
                if 'estado_envio' in pedido:
                    del pedido['estado_envio']

            return jsonify({
                "message": "Historial de pedidos recuperado con éxito.",
                "total_pedidos": total_pedidos,
                "pedidos": pedidos
            }), 200

    except ConnectionError as e:
        return jsonify({"error": str(e)}), 500
    except PyMySQLError as e:
        return jsonify({"error": f"Error de base de datos: {e}"}), 500
    finally:
        if connection:
            connection.close()


def get_order_details(order_id):
    """
    Retorna el detalle completo de un pedido del usuario autenticado.
    Cumple con Criterio 4 y 5.
    """
    # Obtener el ID del usuario autenticado desde el JWT
    current_user_id = get_jwt_identity()
    
    connection = None
    try:
        connection = get_connection()
        
        with connection.cursor() as cursor:
            # Obtener el cliente_id del usuario
            cursor.execute("""
                SELECT id FROM clientes WHERE usuario_id = %s
            """, (current_user_id,))
            cliente_result = cursor.fetchone()
            
            if not cliente_result:
                return jsonify({"error": "Usuario no encontrado."}), 404
            
            cliente_id = cliente_result['id'] if isinstance(cliente_result, dict) else cliente_result[0]
            
            # Consulta principal del pedido
            cursor.execute("""
                SELECT
                    v.id, v.fecha, v.total, v.estado AS estado_venta,
                    e.estado_envio, e.numero_guia, e.direccion_envio_id
                FROM ventas v
                LEFT JOIN envios e ON v.id = e.venta_id
                WHERE v.id = %s AND v.cliente_id = %s;
            """, (order_id, cliente_id))
            pedido = cursor.fetchone()

            if not pedido:
                return jsonify({"error": "Pedido no encontrado o no pertenece a este usuario."}), 404

            # Estado claro para el cliente
            pedido['estado_display'] = pedido['estado_envio'] if pedido.get('estado_envio') else pedido['estado_venta']
            
            # Mostrar número de seguimiento si está 'enviado'
            if pedido['estado_display'] != 'enviado':
                pedido['numero_guia'] = 'N/A'

            # Obtener los ítems con imágenes
            cursor.execute("""
                SELECT
                    vd.nombre_producto_venta, 
                    vd.cantidad, 
                    vd.precio_unitario_venta,
                    COALESCE(
                        (SELECT img.imagen_data 
                         FROM imagenes_producto img 
                         WHERE img.producto_id = inv.producto_id 
                         AND img.es_principal = 1 
                         LIMIT 1),
                        (SELECT img.imagen_data 
                         FROM imagenes_producto img 
                         WHERE img.producto_id = inv.producto_id 
                         LIMIT 1)
                    ) as imagen
                FROM venta_detalle vd
                LEFT JOIN inventario inv ON vd.inventario_id = inv.id
                WHERE vd.venta_id = %s;
            """, (order_id,))
            items_raw = cursor.fetchall()
            
            # Convertir imagen de bytes a string si es necesario
            items = []
            for item in items_raw:
                item_dict = dict(item)
                if item_dict.get('imagen'):
                    if isinstance(item_dict['imagen'], bytes):
                        item_dict['imagen'] = item_dict['imagen'].decode('utf-8')
                items.append(item_dict)

            # Obtener la dirección de envío
            direccion_id = pedido.pop('direccion_envio_id', None)
            direccion = None
            if direccion_id:
                cursor.execute("""
                    SELECT
                        nombre_destinatario, calle, codigo_postal, ciudad, estado
                    FROM direcciones_cliente
                    WHERE id = %s;
                """, (direccion_id,))
                direccion = cursor.fetchone()
            
            # Limpiar campos internos
            pedido.pop('estado_venta', None)
            pedido.pop('estado_envio', None)
            
            return jsonify({
                "message": f"Detalles del pedido {order_id} recuperados.",
                "pedido": pedido,
                "items": items,
                "direccion_entrega": direccion
            }), 200

    except ConnectionError as e:
        return jsonify({"error": str(e)}), 500
    except PyMySQLError as e:
        return jsonify({"error": f"Error de base de datos: {e}"}), 500
    finally:
        if connection:
            connection.close()


def update_user_profile():
    """
    Permite al cliente autenticado editar su información de contacto personal.
    Cumple con Criterio 7.
    """
    # Obtener el ID del usuario autenticado desde el JWT
    current_user_id = get_jwt_identity()
    
    data = request.json
    telefono = data.get('telefono')
    direccion = data.get('direccion', '')

    if not telefono:
        return jsonify({"error": "Falta el campo 'telefono' requerido."}), 400

    connection = None
    try:
        connection = get_connection()
        with connection.cursor() as cursor:
            # Obtener el cliente_id del usuario
            cursor.execute("""
                SELECT id FROM clientes WHERE usuario_id = %s
            """, (current_user_id,))
            cliente_result = cursor.fetchone()
            
            if not cliente_result:
                return jsonify({"error": "Cliente no encontrado."}), 404
            
            cliente_id = cliente_result['id'] if isinstance(cliente_result, dict) else cliente_result[0]
            
            # Actualizar información del cliente
            update_query = """
                UPDATE clientes
                SET telefono = %s, direccion = %s
                WHERE id = %s;
            """
            cursor.execute(update_query, (telefono, direccion, cliente_id))
            connection.commit()

            if cursor.rowcount == 0:
                return jsonify({"error": "No se pudo actualizar la información."}), 404
                
            return jsonify({
                "message": "Información de contacto actualizada con éxito.",
                "telefono_actualizado": telefono,
                "direccion_actualizada": direccion
            }), 200

    except ConnectionError as e:
        return jsonify({"error": str(e)}), 500
    except PyMySQLError as e:
        if connection:
            connection.rollback()
        return jsonify({"error": f"Error de base de datos al actualizar: {e}"}), 500
    finally:
        if connection:
            connection.close()