import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Variante } from '../agregar/agregar-variante.component';

@Component({
  selector: 'app-eliminar-variante',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './eliminar-variante.component.html'
})
export class EliminarVarianteComponent {
  @Input() variante!: Variante;
  @Output() varianteEliminada = new EventEmitter<Variante>();

  eliminar(): void {
    this.varianteEliminada.emit(this.variante);
  }
}
