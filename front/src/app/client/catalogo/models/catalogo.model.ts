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
  descripcion?: string;   
  variaciones?: Variacion[];
}
