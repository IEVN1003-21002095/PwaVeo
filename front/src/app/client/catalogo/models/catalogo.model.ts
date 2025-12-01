export interface Variacion {
  color: string;
  talla: string;
  cantidad: number;
}

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  imagen?: string;
  imagen_principal?: string | null;  // Nueva propiedad para imagen principal
  imagenes?: any[];  // Array de todas las imágenes
  descripcion?: string;   
  variaciones?: Variacion[];
  categoria?: string;
  activo?: number;
}
