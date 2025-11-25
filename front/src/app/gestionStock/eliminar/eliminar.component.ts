import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InventarioService, Inventario } from '../services/inventario.services';

@Component({
  selector: 'app-eliminar-stock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './eliminar.component.html'
})
export class EliminarComponent implements OnInit {

  id = 0;
  producto?: Inventario;

  constructor(
    private route: ActivatedRoute,
    private inventarioService: InventarioService,
    private router: Router
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = Number(idParam);
      this.producto = this.inventarioService.getInventarioPorId(this.id);
    }
  }

  confirmarEliminacion() {
    if (!this.producto) return;

    this.inventarioService.eliminarProducto(this.id);
    alert('Producto eliminado del inventario.');
    this.router.navigate(['/gestionStock']);
  }

  cancelar() {
    this.router.navigate(['/gestionStock']);
  }
}
