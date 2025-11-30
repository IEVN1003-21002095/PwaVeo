export interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  costo: number;
  proveedor_id: number; // FK Numérico según tu BD
  categoria: string;
  activo: number; // 1 = Activo, 0 = Inactivo
  // Opcionales para visualización
  imagen?: string; 
  creado_en?: string;
  actualizado_en?: string;
}