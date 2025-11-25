import { Component, OnInit } from '@angular/core';
import { InventarioService, Inventario } from '../services/inventario.services';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class InventarioComponent implements OnInit {

  inventario: Inventario[] = [];

  // Filtros
  filtros = {
    texto: '',
    gramaje: '',
    color: '',
    talla: '',
    estado: ''
  };

  // Opciones disponibles
  gramajesDisponibles: number[] = [150, 180, 200, 220];
  coloresDisponibles: string[] = ['Blanco', 'Negro', 'Azul', 'Rojo'];
  tallasDisponibles: string[] = ['S', 'M', 'L', 'XL'];
  estadosDisponibles: string[] = ['OK', 'Bajo'];

  constructor(private inventarioService: InventarioService) {}

  ngOnInit(): void {
    this.inventarioService.getInventarioObservable().subscribe(lista => {
      this.inventario = lista;
    });
  }

  // Determina el estado actual del producto
  estadoItem(item: Inventario): 'OK' | 'Bajo' {
    return item.cantidad_actual >= item.stock_minimo ? 'OK' : 'Bajo';
  }

  // Getter para filtrar inventario según criterios
  get inventarioFiltrado(): Inventario[] {
    return this.inventario.filter(item => {

      // Filtro por texto (SKU, descripción, proveedor)
      const textoMatch =
        item.sku_base.toLowerCase().includes(this.filtros.texto.toLowerCase()) ||
        item.descripcion_generica.toLowerCase().includes(this.filtros.texto.toLowerCase()) ||
        item.proveedor_principal.toLowerCase().includes(this.filtros.texto.toLowerCase());

      // Filtro por gramaje
      const gramajeMatch =
        !this.filtros.gramaje || item.gramaje === +this.filtros.gramaje;

      // Filtro por color
      const colorMatch =
        !this.filtros.color || item.color.toLowerCase() === this.filtros.color.toLowerCase();

      // Filtro por talla
      const tallaMatch =
        !this.filtros.talla || item.talla.toLowerCase() === this.filtros.talla.toLowerCase();

      // Filtro por estado
      const estadoMatch =
        !this.filtros.estado || this.estadoItem(item) === this.filtros.estado;

      return textoMatch && gramajeMatch && colorMatch && tallaMatch && estadoMatch;
    });
  }

  // Método para limpiar todos los filtros
  limpiarFiltros(): void {
    this.filtros = {
      texto: '',
      gramaje: '',
      color: '',
      talla: '',
      estado: ''
    };
  }
}
