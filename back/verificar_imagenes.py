"""
Script para verificar y crear la tabla imagenes_producto
"""
from database import get_connection

def verificar_y_crear_tabla():
    connection = None
    try:
        connection = get_connection()
        cursor = connection.cursor()
        
        # Verificar si la tabla existe
        cursor.execute("""
            SELECT COUNT(*)
            FROM information_schema.tables 
            WHERE table_schema = DATABASE() 
            AND table_name = 'imagenes_producto'
        """)
        
        existe = cursor.fetchone()
        
        if existe and existe['COUNT(*)'] > 0:
            print("✅ La tabla 'imagenes_producto' ya existe")
            
            # Mostrar estructura
            cursor.execute("DESCRIBE imagenes_producto")
            columns = cursor.fetchall()
            print("\n📋 Estructura de la tabla:")
            for col in columns:
                print(f"  - {col['Field']}: {col['Type']} {'NULL' if col['Null'] == 'YES' else 'NOT NULL'}")
            
            # Contar imágenes
            cursor.execute("SELECT COUNT(*) as total FROM imagenes_producto")
            total = cursor.fetchone()
            print(f"\n📸 Total de imágenes: {total['total']}")
            
            # Mostrar algunas imágenes
            cursor.execute("""
                SELECT ip.id, ip.producto_id, p.nombre, ip.es_principal, 
                       LEFT(ip.imagen_data, 50) as preview
                FROM imagenes_producto ip
                LEFT JOIN productos p ON ip.producto_id = p.id
                LIMIT 5
            """)
            imagenes = cursor.fetchall()
            if imagenes:
                print("\n🖼️ Primeras imágenes:")
                for img in imagenes:
                    principal = "⭐" if img['es_principal'] else "  "
                    print(f"  {principal} ID: {img['id']} - Producto: {img['nombre']} ({img['producto_id']})")
            
        else:
            print("⚠️ La tabla 'imagenes_producto' NO existe")
            print("🔧 Creando tabla...")
            
            cursor.execute("""
                CREATE TABLE imagenes_producto (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    producto_id INT NOT NULL,
                    es_principal TINYINT(1) DEFAULT 0,
                    color_id INT NULL,
                    imagen_data LONGTEXT NOT NULL,
                    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
                    INDEX idx_producto (producto_id),
                    INDEX idx_principal (es_principal)
                )
            """)
            connection.commit()
            print("✅ Tabla creada exitosamente")
        
        cursor.close()
        connection.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        if connection:
            connection.close()

if __name__ == "__main__":
    print("="*60)
    print("VERIFICACIÓN DE TABLA imagenes_producto")
    print("="*60)
    verificar_y_crear_tabla()
    print("="*60)
