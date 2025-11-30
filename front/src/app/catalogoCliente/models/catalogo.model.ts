export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  imagen?: string;
  descripcion?: string;   // <-- Agregado
  stock?: { [talla: string]: number };
  variaciones?: { color: string; talla: string; cantidad: number }[];
}
