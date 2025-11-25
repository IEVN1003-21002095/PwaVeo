import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Producto } from '../models/catalogoC.model';
import { CommonModule } from '@angular/common';  // Para *ngIf, *ngFor, pipes como 'number'
import { FormsModule } from '@angular/forms';    // Para [(ngModel)]
import { RouterModule } from '@angular/router';  // Para routerLink

@Injectable({
  providedIn: 'root'
})
export class CatalogoCService {
  private productos: Producto[] = [
    {
      id: 1,
      nombre: 'Playera Roja',
      descripcion: 'Playera de algodón',
      categoria: 'Ropa',
      precio: 250,
      imagenes: ['assets/playera-roja.jpg'],
      stock: {
        Rojo: { S: 5, M: 2, L: 0 },
        Azul: { S: 0, M: 1, L: 0 }
      },
      activo: true
    },
    {
      id: 2,
      nombre: 'Pantalón Negro',
      descripcion: 'Pantalón casual',
      categoria: 'Ropa',
      precio: 450,
      imagenes: ['assets/pantalon-negro.jpg'],
      stock: {
        Negro: { S: 2, M: 3, L: 1 }
      },
      activo: true
    }
  ];

  constructor() {}

  getProductos(): Observable<Producto[]> {
    return of(this.productos);
  }

  getProductoPorId(id: number): Observable<Producto | undefined> {
    return of(this.productos.find(p => p.id === id));
  }

  crearProducto(producto: Producto) {
    this.productos.push(producto);
  }

  actualizarProducto(producto: Producto) {
    const index = this.productos.findIndex(p => p.id === producto.id);
    if (index > -1) this.productos[index] = producto;
  }

  eliminarProducto(id: number) {
    this.productos = this.productos.filter(p => p.id !== id);
  }
}
