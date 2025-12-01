import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';

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
    private route: ActivatedRoute,
    private inventarioService: InventarioService,
    private router: Router
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      console.error("No se proporcionó ID");
      this.router.navigate(['/admin/inventario']);
      return;
    }
    
    const id = parseInt(idParam);
    console.log("Cargando insumo para eliminar ID: " + id);

    if (id) {
      this.inventarioService.getInventarioPorId(id).subscribe({
        next: (item) => {
          if (item) {
            this.regInventario = { ...item };
          } else {
            console.error("Insumo no encontrado");
            this.router.navigate(['/admin/inventario']);
          }
        },
        error: (err) => {
          console.error("Error cargando insumo:", err);
          this.router.navigate(['/admin/inventario']);
        }
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
        this.router.navigate(['/admin/inventario']);
      },
      error: (err) => console.error("Error al eliminar:", err)
    });
  }
}