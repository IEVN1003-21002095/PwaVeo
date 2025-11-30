import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import GestionCatalogoService from '../services/gestion_catalogo.services';
// Importamos el componente que manejará la sub-tabla de inventario

// Definición de la interfaz Producto según tu BD
export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  costo: number;
  categoria: string;
  activo: number; // 1 = Activo, 0 = Inactivo
}

@Component({
  selector: 'app-catalogo',
  standalone: true,
  // Agregamos InventarioProductoComponent a los imports
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule], 
  templateUrl: './catalogo.component.html'
})
export class CatalogoComponent implements OnInit {

  productos: Producto[] = [];
  cargando: boolean = false;

  filtros = {
    texto: '',
    categoria: '',
    activo: null as number | null 
  };

  categoriasDisponibles: string[] = ['Ropa', 'Accesorios', 'Calzado'];

  constructor(private catalogoService: GestionCatalogoService) {}

  ngOnInit(): void {
    this.cargarDatos();
    
    // Suscribirse al refresh$ del servicio para actualizar la lista de productos
    this.catalogoService.refresh$.subscribe(() => this.cargarDatos());
  }

  cargarDatos(): void {
    this.cargando = true;
    this.catalogoService.getProducts().subscribe({
      next: (data: Producto[]) => { 
        this.productos = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando productos:', err);
        this.cargando = false;
      }
    });
  }

  // === CONTROL DE TABS (ESTADO) ===
  setFiltroEstado(estado: number | null): void {
    this.filtros.activo = estado;
  }

  isActive(estado: number | null): boolean {
    return this.filtros.activo === estado;
  }

  // === FILTRADO ===
  get productosFiltrados(): Producto[] {
    return this.productos.filter(p => {
      
      const textoMatch = !this.filtros.texto || 
        p.nombre.toLowerCase().includes(this.filtros.texto.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(this.filtros.texto.toLowerCase());

      const catMatch = !this.filtros.categoria || p.categoria === this.filtros.categoria;

      const estadoMatch = this.filtros.activo === null || p.activo === this.filtros.activo;

      return textoMatch && catMatch && estadoMatch;
    });
  }

  limpiarFiltros(): void {
    this.filtros = { texto: '', categoria: '', activo: null };
  }
}