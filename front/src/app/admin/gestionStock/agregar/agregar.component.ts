import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { Insumo } from '../models/insumo.model';
import { InventarioService } from '../services/inventario.service';

@Component({
  selector: 'app-agregar',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './agregar.component.html'
})
export class AgregarComponent implements OnInit {
  
  formGroup!: FormGroup;

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

  coloresOptions = [
    { id: 1, nombre: 'Negro' },
    { id: 2, nombre: 'Blanco' }
  ];

  tallasOptions = [
    { id: 1, nombre: 'S' },
    { id: 2, nombre: 'M' },
    { id: 3, nombre: 'L' },
    { id: 4, nombre: 'XL' }
  ];

  constructor(
    private fb: FormBuilder,
    private inventarioService: InventarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.formGroup = this.initForm();
  }

  initForm(): FormGroup {
    return this.fb.group({
      nombre_insumo: [''],
      color_id: [null],
      talla_id: [null],
      cantidad: [0],
      unidad: [''],
      precio: [0],
      estado: ['Activo']
    });
  }

  guardar(): void {
    this.inventarioService.agregar(this.regInventario).subscribe({
      next: (resp) => {
        console.log("Insumo agregado:", this.regInventario);
        this.router.navigate(['/admin/inventario']);
      },
      error: (err) => {
        console.error("Error al agregar:", err);
      }
    });
  }
}