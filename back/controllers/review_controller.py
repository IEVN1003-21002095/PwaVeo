from database import get_db_connection 

class ReviewController:
    
    def get_reviews_by_product(self, producto_id):
        conn = get_db_connection()
        try:
            cursor = conn.cursor(dictionary=True)
            # Obtener reseñas aprobadas y datos del usuario
            query = """
                SELECT r.id, r.calificacion, r.comentario, r.fecha_creacion, u.nombre, u.apellido
                FROM reseñas r
                JOIN clientes c ON r.cliente_id = c.id
                JOIN usuarios u ON c.usuario_id = u.id
                WHERE r.producto_id = %s
                ORDER BY r.fecha_creacion DESC
            """
            cursor.execute(query, (producto_id,))
            reviews = cursor.fetchall()
            
            # Calcular promedio
            promedio = 0
            if reviews:
                # Calculamos promedio en Python para evitar otra consulta compleja o nulls
                total_stars = sum(r['calificacion'] for r in reviews)
                promedio = total_stars / len(reviews)
                
            return {'success': True, 'data': {'promedio': round(promedio, 1), 'reviews': reviews}}
        except Exception as e:
            return {'success': False, 'error': str(e)}
        finally:
            if conn.is_connected(): conn.close()

    def create_review(self, data):
        """
        data espera: { 'usuario_id': int, 'producto_id': int, 'calificacion': int, 'comentario': str }
        """
        conn = get_db_connection()
        try:
            cursor = conn.cursor(dictionary=True)
            
            # 1. Obtener ID de Cliente desde Usuario
            cursor.execute("SELECT id FROM clientes WHERE usuario_id = %s", (data['usuario_id'],))
            cliente = cursor.fetchone()
            if not cliente:
                return {'success': False, 'message': 'Usuario no es cliente', 'status': 404}
            
            cliente_id = cliente['id']

            # 2. VALIDACIÓN DE NEGOCIO: ¿Compró el producto?
            # Buscamos en ventas completadas/enviadas
            check_query = """
                SELECT count(*) as total
                FROM ventas v
                JOIN venta_detalle vd ON v.id = vd.venta_id
                JOIN inventario i ON vd.inventario_id = i.id
                WHERE v.cliente_id = %s 
                AND i.producto_id = %s
                AND v.estado IN ('completada', 'enviado', 'entregado')
            """
            cursor.execute(check_query, (cliente_id, data['producto_id']))
            compra = cursor.fetchone()

            if compra['total'] == 0:
                return {'success': False, 'message': 'Debes comprar el producto para poder reseñarlo.', 'status': 403}

            # 3. Crear Reseña
            insert_query = """
                INSERT INTO reseñas (producto_id, cliente_id, calificacion, comentario, fecha_creacion)
                VALUES (%s, %s, %s, %s, NOW())
            """
            cursor.execute(insert_query, (data['producto_id'], cliente_id, data['calificacion'], data['comentario']))
            conn.commit()
            
            return {'success': True, 'message': 'Reseña publicada correctamente'}
        except Exception as e:
            conn.rollback()
            return {'success': False, 'error': str(e)}
        finally:
            if conn.is_connected(): conn.close()