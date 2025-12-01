import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import GestionInventarioService, { Variante } from '../../services/gestion_inventario.services';
import { HttpClientModule } from '@angular/common/http';

interface Color { id: number; nombre: string; }
interface Talla { id: number; nombre: string; }

@Component({
  selector: 'app-agregar-variante',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule, HttpClientModule],
  templateUrl: './agregar-variante.component.html'
})
export class AgregarVarianteComponent implements OnInit {

  formGroup!: FormGroup;
  productId!: number;
  mensajeError: string = ''; 

  regVariante: Variante = {
    id: 0,
    producto_id: 0,
    color_id: 0,
    color: '',
    talla_id: 0,
    talla: '',
    cantidad: 0,
    ubicacion: ''
  };

  coloresOptions: Color[] = [
    { id: 1, nombre: 'Blanco' },
    { id: 2, nombre: 'Negro' }
  ];

  tallasOptions: Talla[] = [
    { id: 1, nombre: 'S' },
    { id: 2, nombre: 'M' },
    { id: 3, nombre: 'L' },
    { id: 4, nombre: 'XL' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private inventarioService: GestionInventarioService
  ) {}

  ngOnInit(): void {
    this.productId = Number(this.route.parent?.snapshot.paramMap.get('id'));
    this.regVariante.producto_id = this.productId;

    this.formGroup = this.fb.group({
      color_id: [null, Validators.required],
      talla_id: [null, Validators.required],
      cantidad: [0, [Validators.required, Validators.min(1)]],
      ubicacion: ['', Validators.required]
    });

    this.formGroup.get('color_id')?.valueChanges.subscribe(() => this.mensajeError = '');
    this.formGroup.get('talla_id')?.valueChanges.subscribe(() => this.mensajeError = '');
  }

  onSubmit(): void {
    if (this.formGroup.invalid) return;

    const v = this.formGroup.value;
    const colorNombre = this.coloresOptions.find(c => c.id == v.color_id)?.nombre || '';
    const tallaNombre = this.tallasOptions.find(t => t.id == v.talla_id)?.nombre || '';

    this.inventarioService.getVariantsByProduct(this.productId).subscribe({
      next: (variantesExistentes: Variante[]) => {

        const yaExiste = variantesExistentes.some(
          varExist => varExist.color_id === Number(v.color_id) && varExist.talla_id === Number(v.talla_id)
        );

        if (yaExiste) {
          this.mensajeError = `La variante ${colorNombre} - ${tallaNombre} ya existe para este producto.`;
          return;
        }

        this.regVariante.color_id = Number(v.color_id);
        this.regVariante.color = colorNombre;
        this.regVariante.talla_id = Number(v.talla_id);
        this.regVariante.talla = tallaNombre;
        this.regVariante.cantidad = Number(v.cantidad);
        this.regVariante.ubicacion = v.ubicacion;

        this.inventarioService.addVariant(this.regVariante).subscribe({
          next: () => {
            this.inventarioService.triggerRefresh();
            this.router.navigate(['../'], { relativeTo: this.route });
          },
          error: (err) => console.error('Error al agregar variante:', err)
        });
      },
      error: (err) => console.error('Error verificando variantes existentes:', err)
    });
  }
}
