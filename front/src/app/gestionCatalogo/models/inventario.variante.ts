export interface InventarioVariante {
  id?: number;
  producto_id: number;
  color?: string; // Nombre del color (viene del JOIN)
  talla?: string; // Nombre de la talla (viene del JOIN)
  color_id: number | null;  // <-- permitir null
  talla_id: number | null;
  cantidad: number;
ubicacion: string;
}