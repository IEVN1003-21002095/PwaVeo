import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import GestionCatalogoService, { Product } from '../services/gestion_catalogo.services';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-eliminar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './eliminar.component.html'
})
export default class EliminarComponent implements OnInit {

  producto?: Product;
  id!: number;

  constructor(
    private route: ActivatedRoute,
    private catalogoService: GestionCatalogoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = +this.route.snapshot.paramMap.get('id')!;
    this.producto = this.catalogoService.obtenerProductoPorId(this.id);
  }

  confirmarEliminacion() {
    if (!this.producto) return;

    this.catalogoService.eliminarProducto(this.id);
    this.router.navigate(['/gestionCatalogo']);
  }

  cancelar() {
    this.router.navigate(['/gestionCatalogo']);
  }
}
