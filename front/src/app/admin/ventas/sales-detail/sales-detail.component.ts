import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { SalesService } from '../services/sales.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Venta {
  venta_id?: number;
  id?: number;
  cliente_id?: number;
  clienteId?: number;
  fecha: string;
  total: number;
  estado: string;
  detalles?: any[];
  [key: string]: any;
}

@Component({
  selector: 'app-sales-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './sales-detail.component.html',
  styleUrls: ['./sales-detail.component.scss']
})
export class SalesDetailComponent implements OnInit, OnDestroy {
  venta: Venta | null = null;
  detalles: any[] = [];
  ventaId: number = 0;
  isLoading = true;
  error: string | null = null;
  isUpdatingStatus = false;
  private destroy$ = new Subject<void>();

  estadosDisponibles = [
    { value: 'pendiente', label: 'Pendiente', class: 'bg-warning' },
    { value: 'completada', label: 'Completada', class: 'bg-success' },
    { value: 'cancelada', label: 'Cancelada', class: 'bg-danger' }
  ];

  constructor(private route: ActivatedRoute, private salesService: SalesService) {}

  ngOnInit(): void {
    this.ventaId = +this.route.snapshot.params['ventaId'];
    this.loadVenta();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadVenta(): void {
    this.isLoading = true;
    this.error = null;
    this.salesService.getVentaPorId(this.ventaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.venta = res.data;
          this.detalles = res.data?.detalles || [];
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Error al cargar la venta';
          console.error('Error completo:', err);
          this.isLoading = false;
        }
      });
  }

  cambiarEstado(nuevoEstado: string): void {
    if (!this.venta || this.isUpdatingStatus) return;
    
    if (confirm(`¿Está seguro de cambiar el estado a "${nuevoEstado.toUpperCase()}"?`)) {
      this.isUpdatingStatus = true;
      
      this.salesService.updateVenta(this.ventaId, { estado: nuevoEstado })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            if (res.success && this.venta) {
              this.venta.estado = nuevoEstado;
              alert('Estado actualizado correctamente');
            }
            this.isUpdatingStatus = false;
          },
          error: (err) => {
            console.error('Error actualizando estado:', err);
            alert('Error al actualizar el estado');
            this.isUpdatingStatus = false;
          }
        });
    }
  }
}
