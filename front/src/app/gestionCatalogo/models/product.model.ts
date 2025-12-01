export interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  costo: number;
  proveedor_id: number; 
  categoria: string;
  activo: number; 
  imagen?: string; 
  creado_en?: string;
  actualizado_en?: string;
}