import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import GestionCatalogoService, { Product } from '../services/gestion_catalogo.services';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  templateUrl: './catalogo.component.html',
  imports: [CommonModule, FormsModule, RouterModule]
})
export default class CatalogoComponent implements OnInit, OnDestroy {

  filtros = {
    texto: '',
    estado: ''
  };

  datoSource: Product[] = [];
  private sub!: Subscription;

  constructor(private catalogoService: GestionCatalogoService, private router: Router) {}

  ngOnInit(): void {
    this.sub = this.catalogoService.getProductosObservable()
      .subscribe(list => this.datoSource = list);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  getStockTotal(p: Product): number {
    const blanco = p.stock?.blanco || { S: 0, M: 0, L: 0 };
    const negro  = p.stock?.negro  || { S: 0, M: 0, L: 0 };
    return blanco.S + blanco.M + blanco.L + negro.S + negro.M + negro.L;
  }

  get productosFiltrados(): Product[] {
    const texto = this.filtros.texto.toLowerCase().trim();
    const estado = this.filtros.estado.toLowerCase().trim();

    return this.datoSource.filter(p => {
      const matchesTexto =
        p.nombre.toLowerCase().includes(texto) ||
        p.descripcion?.toLowerCase().includes(texto) ||
        p.sku.toLowerCase().includes(texto) ||
        p.tipo.toLowerCase().includes(texto) ||
        String(p.precio).includes(texto) ||
        String(this.getStockTotal(p)).includes(texto);

      const matchesEstado = !estado || p.estado.toLowerCase() === estado;

      return matchesTexto && matchesEstado;
    });
  }

  irAgregar() {
    this.router.navigate(['/gestionCatalogo/agregar']);
  }

  irEditar(id: number) {
    this.router.navigate(['/gestionCatalogo/editar', id]);
  }

  irEliminar(id: number) {
    this.router.navigate(['/gestionCatalogo/eliminar', id]);
  }
}
