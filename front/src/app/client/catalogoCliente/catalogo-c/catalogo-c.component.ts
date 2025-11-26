import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DetallesComponent } from '../detalles/detalles.component';
interface StockDetail {
  S: number;
  M: number;
  L: number;
}

// Definición de la nueva interfaz de ProductoCliente, con más detalles
export interface ProductoCliente {
  id: number;
  nombre: string;
  sku: string;
  tipo: string;
  precio: number;
  estado: 'activo' | 'inactivo';
  descripcion: string;
  imagen: string; 
  stock: {
    blanco: StockDetail;
    negro: StockDetail;
  };
  rating: number; 
  reviews: number; 
  colores: string[]; 
}

// Datos de productos activos - TODOS SON PLAYERAS
export const ACTIVE_PRODUCTS: ProductoCliente[] = [
  {
    id: 1,
    nombre: 'Playera Conojo',
    sku: 'VEO-PL-001',
    tipo: 'Playera Diseño',
    precio: 450, 
    estado: 'activo',
    descripcion: 'Playera de algodón premium con el diseño exclusivo "Conojo".',
    imagen: 'https://placehold.co/400x500/A3B18A/222?text=Playera+Conojo',
    stock: { blanco: { S: 10, M: 5, L: 5 }, negro: { S: 8, M: 6, L: 6 } },
    rating: 4.2, reviews: 54, colores: ['black', 'gray', 'white'],
  },
  {
    id: 2,
    nombre: 'Playera Boca que mira',
    sku: 'VEO-PL-002',
    tipo: 'Playera Diseño',
    precio: 500, 
    estado: 'activo',
    descripcion: 'Playera de algodón premium con el diseño exclusivo "Boca que mira".',
    imagen: 'https://placehold.co/400x500/588157/222?text=Playera+Boca+que+mira',
    stock: { blanco: { S: 3, M: 4, L: 3 }, negro: { S: 4, M: 3, L: 3 } },
    rating: 4.8, reviews: 88, colores: ['black', 'blue'],
  },
  {
    id: 3,
    nombre: 'Playera Soul in Bloom',
    sku: 'VEO-PL-003',
    tipo: 'Playera Diseño',
    precio: 550, 
    estado: 'activo',
    descripcion: 'Playera de algodón premium con el diseño exclusivo "Soul in Bloom".',
    imagen: 'https://placehold.co/400x500/3A5A40/FFF?text=Playera+Soul+in+Bloom',
    stock: { blanco: { S: 0, M: 0, L: 0 }, negro: { S: 5, M: 5, L: 5 } },
    rating: 3.9, reviews: 12, colores: ['gray', 'red'],
  },
  {
    id: 4,
    nombre: 'Playera Mitosis',
    sku: 'VEO-PL-004',
    tipo: 'Playera Diseño',
    precio: 490, 
    estado: 'activo',
    descripcion: 'Playera de algodón premium con el diseño exclusivo "Mitosis".',
    imagen: 'https://placehold.co/400x500/344E41/FFF?text=Playera+Mitosis',
    stock: { blanco: { S: 15, M: 10, L: 5 }, negro: { S: 12, M: 8, L: 4 } },
    rating: 4.5, reviews: 200, colores: ['black', 'white', 'green'],
  },
  {
    id: 5,
    nombre: 'Playera Claustrophobia',
    sku: 'VEO-PL-005',
    tipo: 'Playera Diseño',
    precio: 480, 
    estado: 'activo',
    descripcion: 'Playera de algodón premium con el diseño exclusivo "Claustrophobia".',
    imagen: 'https://placehold.co/400x500/DAD7CD/222?text=Playera+Claustrophobia',
    stock: { blanco: { S: 20, M: 20, L: 20 }, negro: { S: 18, M: 18, L: 18 } },
    rating: 4.1, reviews: 30, colores: ['white'],
  },
  {
    id: 6,
    nombre: 'Playera Fight or Fly',
    sku: 'VEO-PL-006',
    tipo: 'Playera Diseño',
    precio: 520, 
    estado: 'activo',
    descripcion: 'Playera de algodón premium con el diseño exclusivo "Fight or Fly".',
    imagen: 'https://placehold.co/400x500/D4A373/222?text=Playera+Fight+or+Fly',
    stock: { blanco: { S: 2, M: 4, L: 6 }, negro: { S: 5, M: 5, L: 5 } },
    rating: 4.7, reviews: 90, colores: ['black', 'gray'],
  },
];

type View = 'catalogo' | 'detalle';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, DetallesComponent], 
  templateUrl: './catalogo-cliente.component.html', 
  styleUrls: [],
})
export class CatalogoClienteComponent implements OnInit {
  currentView = signal<View>('catalogo');
  selectedProductId = signal<number | null>(null);
  
  productos: ProductoCliente[] = [];

  ngOnInit(): void {
    this.productos = ACTIVE_PRODUCTS; 
  }
  
  verDetalle(id: number): void {
    this.selectedProductId.set(id);
    this.currentView.set('detalle');
    console.log(`Cambiando a detalle del producto ID: ${id}`);
  }

  goBackToCatalog(): void {
    this.currentView.set('catalogo');
    this.selectedProductId.set(null);
  }

  verMasProductos(): void {
    console.log('VER MÁS presionado');
  }
}