import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Product {
  id: number;
  nombre: string;
  sku: string;
  tipo: string;
  precio: number;
  estado: 'activo' | 'inactivo';
  descripcion: string;
  imagen: string;
  stock: {
    blanco: { S: number; M: number; L: number };
    negro: { S: number; M: number; L: number };
  };
}

@Injectable({
  providedIn: 'root'
})
export default class GestionCatalogoService {

  private _productos: Product[] = [
    { 
      id: 1,
      nombre: 'Playera VEO AR',
      sku: 'VEO-PL-001',
      tipo: 'Línea AR',
      precio: 450,
      estado: 'activo',
      descripcion: 'Playera premium con tecnología AR integrada.',
      imagen: 'assets/products/playera-veo-ar.jpg',
      stock: {
        blanco: { S: 10, M: 5, L: 5 },
        negro: { S: 8, M: 6, L: 6 }
      }
    },
    { 
      id: 2,
      nombre: 'Sudadera VEO Premium',
      sku: 'VEO-SD-002',
      tipo: 'Línea Premium',
      precio: 850,
      estado: 'activo',
      descripcion: 'Sudadera premium con alta calidad.',
      imagen: 'assets/products/sudadera-veo-premium.jpg',
      stock: {
        blanco: { S: 3, M: 4, L: 3 },
        negro: { S: 4, M: 3, L: 3 }
      }
    },
    { 
      id: 3,
      nombre: 'Gorra AR VEO',
      sku: 'VEO-GR-003',
      tipo: 'Accesorios',
      precio: 300,
      estado: 'inactivo',
      descripcion: 'Gorra con integración AR.',
      imagen: 'assets/products/gorra-ar-veo.jpg',
      stock: {
        blanco: { S: 0, M: 0, L: 0 },
        negro: { S: 5, M: 5, L: 5 }
      }
    }
  ];

  private productos$ = new BehaviorSubject<Product[]>([...this._productos]);

  // ----------------------------------------
  // 🔹 Obtener productos
  // ----------------------------------------

  getProductosObservable(): Observable<Product[]> {
    return this.productos$.asObservable();
  }

  obtenerProductos() {
    return this._productos;
  }

  obtenerProductoPorId(id: number): Product | undefined {
    return this._productos.find(p => p.id === id);
  }

  // ----------------------------------------
  // 🔹 Generar ID autoincremental seguro
  // ----------------------------------------
  getNextId(): number {
    if (this._productos.length === 0) return 1;
    return Math.max(...this._productos.map(p => p.id)) + 1;
  }

  // ----------------------------------------
  // 🔹 CRUD
  // ----------------------------------------

  agregarProducto(p: Product) {
    this._productos.push(p);
    this.productos$.next([...this._productos]);
  }

  actualizarProducto(productoActualizado: Product) {
    const index = this._productos.findIndex(p => p.id === productoActualizado.id);
    if (index !== -1) {
      this._productos[index] = productoActualizado;
      this.productos$.next([...this._productos]);
    }
  }

  eliminarProducto(id: number) {
    this._productos = this._productos.filter(p => p.id !== id);
    this.productos$.next([...this._productos]);
  }
}
