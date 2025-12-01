-- Script para crear/verificar tabla de imágenes de productos

-- Tabla de imágenes (si no existe)
CREATE TABLE IF NOT EXISTS imagenes_producto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    es_principal TINYINT(1) DEFAULT 0,
    color_id INT NULL,
    imagen_data LONGTEXT NOT NULL,  -- Base64 de la imagen
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (color_id) REFERENCES colores(id) ON DELETE SET NULL,
    INDEX idx_producto (producto_id),
    INDEX idx_principal (es_principal)
);

-- Verificar estructura
DESCRIBE imagenes_producto;
