import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // <--- Agregado
import GestionCatalogoService from '../../services/gestion_catalogo.services';

@Component({
  selector: 'app-editar-variante',
  standalone: true,
  imports: [FormsModule, CommonModule], // <--- Agregado CommonModule
  templateUrl: './editar-variante.component.html',
})
export class EditarVarianteComponent {
  @Input() variante: any; // variante que se edita
  @Output() varianteActualizada = new EventEmitter<void>();
  visible: boolean = false;

  constructor(private catalogoService: GestionCatalogoService) {}

  abrir(variante: any) {
    this.variante = { ...variante }; // clonar
    this.visible = true;
  }

  guardar() {
    if (!this.variante) return;
    const payload = {
      cantidad: Number(this.variante.cantidad),
      ubicacion: this.variante.ubicacion || ''
    };

    this.catalogoService.editarVariante(this.variante.id, payload).subscribe({
      next: (res) => {
        if (res.success) {
          alert('Variante actualizada');
          this.visible = false;
          this.varianteActualizada.emit();
        } else {
          alert('Error: ' + res.message);
        }
      },
      error: (err) => {
        console.error(err);
        alert('Error al actualizar variante');
      }
    });
  }

  cancelar() {
    this.visible = false;
  }
}
