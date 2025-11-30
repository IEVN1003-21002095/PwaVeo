import { Component, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface Variante {
  id?: number;
  color: string;
  talla: string;
  cantidad: number;
  ubicacion: string;
}

@Component({
  selector: 'app-agregar-variante',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './agregar-variante.component.html',
})
export class AgregarVarianteComponent implements OnInit {

  @Input() variantesExistentes: Variante[] = []; // Para validar duplicados
  @Output() varianteCreada = new EventEmitter<Variante>();

  visible: boolean = false;
  formGroup!: FormGroup;
  errorMsg: string = '';

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      color: ['', Validators.required],
      talla: ['', Validators.required],
      cantidad: [0, [Validators.required, Validators.min(1)]],
      ubicacion: ['', Validators.required]
    });
  }

  abrir(): void {
    this.visible = true;
  }

  cerrar(): void {
    this.visible = false;
    this.errorMsg = '';
    this.formGroup.reset({ color: '', talla: '', cantidad: 0, ubicacion: '' });
  }

  agregar(): void {
    const nuevaVariante: Variante = this.formGroup.value;

    const existe = this.variantesExistentes.some(v =>
      v.color.toLowerCase() === nuevaVariante.color.toLowerCase() &&
      v.talla.toLowerCase() === nuevaVariante.talla.toLowerCase()
    );

    if (existe) {
      this.errorMsg = 'Ya existe una variante con ese color y talla.';
      return;
    }

    this.varianteCreada.emit(nuevaVariante); // Emitimos al componente padre
    this.cerrar();
  }
}
