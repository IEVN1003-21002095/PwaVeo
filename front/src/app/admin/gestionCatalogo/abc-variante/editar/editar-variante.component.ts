import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import GestionInventarioService, { Variante } from '../../services/gestion_inventario.service';

@Component({
  selector: 'app-editar-variante',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './editar-variante.component.html'
})
export class EditarVarianteComponent implements OnInit {

  formGroup!: FormGroup;
  inventoryId!: number;
  regVariante!: Variante;

  loaded = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private inventarioService: GestionInventarioService
  ) {}

  ngOnInit(): void {
    this.inventoryId = Number(this.route.snapshot.paramMap.get('id'));

    this.formGroup = this.fb.group({
      cantidad: [0, [Validators.required, Validators.min(0)]],
      ubicacion: ['', Validators.required]
    });

    this.inventarioService.getInventory(this.inventoryId).subscribe({
      next: (v: Variante) => {
        if (!v) {
          this.router.navigate(['../'], { relativeTo: this.route });
          return;
        }
        this.regVariante = { ...v };
        this.formGroup.patchValue({
          cantidad: v.cantidad,
          ubicacion: v.ubicacion
        });
        this.loaded = true;
      },
      error: (err) => {
        console.error('Error cargando variante:', err);
        this.router.navigate(['../'], { relativeTo: this.route });
      }
    });
  }

  onSubmit(): void {
    if (this.formGroup.invalid) return;

    const v = this.formGroup.value;

    this.regVariante.cantidad = Number(v.cantidad);
    this.regVariante.ubicacion = v.ubicacion;

    this.inventarioService.updateVariant(this.inventoryId, this.regVariante).subscribe({
      next: () => {
        this.inventarioService.triggerRefresh();
        this.router.navigate(['/admin/catalogo/inventario', this.regVariante.producto_id]);
      },
      error: (err) => {
        console.error('Error actualizando variante:', err);
      }
    });
  }
}
