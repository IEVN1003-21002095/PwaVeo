export interface Inventario {
  id: number;
  sku_base: string;
  descripcion_generica: string;
  color: string;
  talla: string;
  gramaje: number;
  costo_adquisicion: number;
  stock_minimo: number;
  cantidad_actual: number;
  proveedor_principal: string;
  estado?: 'activo' | 'inactivo';
}
