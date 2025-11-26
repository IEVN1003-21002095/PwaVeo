import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService, Inventario } from '../services/inventario.services';

@Component({
  selector: 'app-agregar-stock',
  templateUrl: './agregar.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AgregarComponent {

  nuevoProducto: Inventario = {
    id: 0,
    sku_base: '',
    descripcion_generica: '',
    color: 'Blanco', 
    talla: 'M',      
    gramaje: 0,
    costo_adquisicion: 0,
    stock_minimo: 0,
    cantidad_actual: 0,
    proveedor_principal: ''
  };

  constructor(
    private inventarioService: InventarioService,
    private router: Router
  ) {}

  guardar() {
    if (!this.nuevoProducto.sku_base.trim() || !this.nuevoProducto.descripcion_generica.trim()) {
      alert('Por favor completa los campos obligatorios: SKU y descripción.');
      return;
    }

    this.inventarioService.agregar(this.nuevoProducto);

    alert(`Producto "${this.nuevoProducto.descripcion_generica}" agregado exitosamente.`);

    this.router.navigate(['/gestionStock']);
  }

  cancelar() {
    this.router.navigate(['/gestionStock']);
  }
}
