import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http'; 
import { Insumo } from '../models/insumo.model';
import { InventarioService } from '../services/inventario.services';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule]
})
export class InventarioComponent implements OnInit {

  inventario: Insumo[] = [];
  cargando: boolean = false;

  filtros = {
    texto: '',
    gramaje: null,
    color_id: null,
    talla_id: null,
    estado: '',
    stock: ''   // 👈 AGREGADO PARA EL FILTRO STOCK
  };

  mapColores: any = { 1: 'Negro', 2: 'Blanco' };
  mapTallas: any = { 1: 'S', 2: 'M', 3: 'L', 4: 'XL' };

  coloresOptions = [ { id: 1, nombre: 'Negro' }, { id: 2, nombre: 'Blanco' } ];
  tallasOptions = [ { id: 1, nombre: 'S' }, { id: 2, nombre: 'M' }, { id: 3, nombre: 'L' }, { id: 4, nombre: 'XL' } ];

  constructor(private inventarioService: InventarioService) {}

  ngOnInit(): void {
    this.cargarDatos();

    this.inventarioService.refresh$.subscribe(() => {
      this.cargarDatos();
    });
  }

  cargarDatos(): void {
    this.cargando = true;
    this.inventarioService.getInventarioObservable().subscribe({
      next: (data: any) => {
        if(data.success && data.data) {
            this.inventario = data.data;
        } else if (Array.isArray(data)) {
            this.inventario = data;
        }
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error API:', err);
        this.cargando = false;
      }
    });
  }

  getNombreColor(id: number): string { return this.mapColores[id] || 'ID: ' + id; }
  getNombreTalla(id: number): string { return this.mapTallas[id] || 'ID: ' + id; }

  setFiltroEstado(estado: string): void { this.filtros.estado = estado; }
  isActive(estado: string): boolean { return this.filtros.estado === estado; }

  // ==========================
  //   🔥 FILTRO COMPLETO
  // ==========================
  get inventarioFiltrado(): Insumo[] {
    return this.inventario.filter(item => {

      const textoMatch =
        !this.filtros.texto ||
        item.nombre_insumo.toLowerCase().includes(this.filtros.texto.toLowerCase());

      const colorMatch =
        !this.filtros.color_id || Number(item.color_id) === Number(this.filtros.color_id);

      const tallaMatch =
        !this.filtros.talla_id || Number(item.talla_id) === Number(this.filtros.talla_id);

      const itemEstado = item.estado ? item.estado.trim() : '';

      const estadoMatch =
        !this.filtros.estado || itemEstado === this.filtros.estado;

      // --------------------------
      // 🔥 NUEVO FILTRO STOCK
      // --------------------------
      const stockMatch =
        this.filtros.stock === ''
        || (this.filtros.stock === 'bajo' && item.cantidad <= 5)
        || (this.filtros.stock === 'normal' && item.cantidad > 5);

      return textoMatch && colorMatch && tallaMatch && estadoMatch && stockMatch;
    });
  }

  limpiarFiltros(): void {
    this.filtros = { texto: '', gramaje: null, color_id: null, talla_id: null, estado: '', stock: '' };
  }
}
