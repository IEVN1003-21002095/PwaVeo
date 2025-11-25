import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../services/inventario.services';
import { Inventario } from '../models/inventario.model';

@Component({
  selector: 'app-editar-stock',
  templateUrl: './editar.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class EditarComponent implements OnInit {

  item!: Inventario;
  itemNoEncontrado = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private inventarioService: InventarioService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const lista = this.inventarioService.obtenerTodo();

    this.item = lista.find((i: Inventario) => i.id === id)!;

    if (!this.item) {
      this.itemNoEncontrado = true;
    }
  }

  guardar() {
    this.inventarioService.actualizar(this.item.id, this.item);
    alert('Cambios guardados correctamente.');
    this.router.navigate(['/gestionStock']);
  }

  cancelar() {
    this.router.navigate(['/gestionStock']);
  }
}
