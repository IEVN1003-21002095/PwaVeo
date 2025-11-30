export interface Insumo {
  id?: number;
  nombre_insumo: string;
  color_id: number;
  talla_id: number;
  cantidad: number;
  unidad: string;
  precio: number;
  // CORRECCIÓN: Tipos con Mayúscula para coincidir con tu BD
  estado: 'Activo' | 'Inactivo'; 
  fecha_registro?: string;
}