from database import get_db_connection

class OrdersController:

    def get_orders_by_user(self, usuario_id):
        conn = get_db_connection()
        try:
            cursor = conn.cursor(dictionary=True)
            
            # Buscar ID de cliente
            cursor.execute("SELECT id FROM clientes WHERE usuario_id = %s", (usuario_id,))
            cliente = cursor.fetchone()
            if not cliente:
                return {'success': True, 'data': []} # Usuario sin perfil de cliente aún

            # Listar pedidos
            query = """
                SELECT v.id as numeroPedido, v.fecha, v.total, v.estado, e.numero_guia
                FROM ventas v
                LEFT JOIN envios e ON v.id = e.venta_id
                WHERE v.cliente_id = %s
                ORDER BY v.fecha DESC
            """
            cursor.execute(query, (cliente['id'],))
            pedidos = cursor.fetchall()

            return {'success': True, 'data': pedidos}
        except Exception as e:
            return {'success': False, 'error': str(e)}
        finally:
            if conn.is_connected(): conn.close()

    def get_order_detail(self, venta_id):
        conn = get_db_connection()
        try:
            cursor = conn.cursor(dictionary=True)
            
            # Datos generales de la venta y envío
            header_query = """
                SELECT v.id, v.fecha, v.subtotal, v.descuento, v.total, v.estado,
                       e.direccion_entrega, e.numero_guia, e.empresa_envio, e.fecha_envio, e.fecha_entrega
                FROM ventas v
                LEFT JOIN envios e ON v.id = e.venta_id
                WHERE v.id = %s
            """
            cursor.execute(header_query, (venta_id,))
            header = cursor.fetchone()
            
            if not header:
                return {'success': False, 'message': 'Pedido no encontrado', 'status': 404}

            # Productos del pedido
            items_query = """
                SELECT vd.nombre_producto_venta as nombre, vd.cantidad, 
                       vd.precio_unitario_venta as precio, p.id as producto_id
                       -- Si tienes columna imagen en productos: , p.imagen_url 
                FROM venta_detalle vd
                JOIN inventario i ON vd.inventario_id = i.id
                JOIN productos p ON i.producto_id = p.id
                WHERE vd.venta_id = %s
            """
            cursor.execute(items_query, (venta_id,))
            items = cursor.fetchall()

            # Estructuramos la respuesta para que Angular la consuma fácil
            detalle = {
                'pedido': {
                    'numeroPedido': header['id'],
                    'estado': header['estado'],
                    'resumen': {
                        'subtotal': float(header['subtotal']),
                        'costoEnvio': 100.0, # Valor simulado o campo faltante en DB
                        'impuesto': float(header['subtotal']) * 0.16,
                        'total': float(header['total']),
                        'fechaRealizado': header['fecha']
                    },
                    'envio': {
                        'empresa': header['empresa_envio'],
                        'guia': header['numero_guia'],
                        'fechaEnvio': header['fecha_envio'],
                        'fechaEntrega': header['fecha_entrega'],
                        'direccion': header['direccion_entrega']
                    }
                },
                'productos': items
            }
            
            return {'success': True, 'data': detalle}
        except Exception as e:
            return {'success': False, 'error': str(e)}
        finally:
            if conn.is_connected(): conn.close()