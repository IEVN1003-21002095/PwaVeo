import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Insumo } from '../models/insumo.model';
import { InventarioService } from '../services/inventario.service';

@Component({
  selector: 'app-eliminar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './eliminar.component.html'
})
export class EliminarComponent implements OnInit {

  tem: any;
  regInventario: Insumo = {
    id: 0,
    nombre_insumo: '',
    color_id: 0,
    talla_id: 0,
    cantidad: 0,
    unidad: '',
    precio: 0,
    estado: 'Activo'
  };

  mapColores: any = { 1: 'Negro', 2: 'Blanco' };
  mapTallas: any = { 1: 'S', 2: 'M', 3: 'L', 4: 'XL' };

  constructor(
    private location: Location,
    private inventarioService: InventarioService,
    private router: Router
  ) {}

  ngOnInit() {
    this.tem = this.location.path().split('/');
    const id = parseInt(this.tem[3]); 

    if (id) {
      this.inventarioService.getInventarioPorId(id).subscribe({
        next: (item) => {
          if (item) {
            this.regInventario = { ...item };
          }
        },
        error: (err) => console.error(err)
      });
    }
  }

  getNombreColor(id: number): string { return this.mapColores[id] || id.toString(); }
  getNombreTalla(id: number): string { return this.mapTallas[id] || id.toString(); }

  eliminar() {
    const id = this.regInventario.id;
    if (!id) return;

    this.inventarioService.eliminar(id).subscribe({
      next: () => {
        console.log("Eliminado ID:", id);
        this.router.navigate(['/gestionStock']);
      },
      error: (err) => console.error("Error al eliminar:", err)
    });
  }
}