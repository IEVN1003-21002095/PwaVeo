export interface StockPorColor {
  [color: string]: {
    [talla: string]: number;
  };
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  imagenes: string[];
  stock: StockPorColor;
  activo: boolean;
}
