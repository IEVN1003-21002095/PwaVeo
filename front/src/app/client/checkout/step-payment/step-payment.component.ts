import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CheckoutsService } from '../checkouts.service';

@Component({
  selector: 'app-step-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step-payment.component.html',
  styleUrl: './step-payment.component.scss'
})
export class StepPaymentComponent implements OnInit {
  paymentForm!: FormGroup;
  errorMsg = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private checkoutSvc: CheckoutsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar que se completó el paso anterior
    if (!this.checkoutSvc.address$.value) {
      this.router.navigate(['/client/checkout/address']);
      return;
    }

    this.paymentForm = this.fb.group({
      metodo_id: [1, Validators.required] // Débito/Crédito por defecto
    });
  }

  onSubmit(): void {
    if (this.paymentForm.invalid) {
      this.errorMsg = 'Selecciona un método de pago.';
      return;
    }

    // Guardar en el servicio sin enviar al backend aún
    this.checkoutSvc.payment$.next({
      exito: true,
      metodo_pago_id: this.paymentForm.value.metodo_id
    });

    console.log('Método de pago guardado en servicio:', this.paymentForm.value);
    this.router.navigate(['/client/checkout/summary']);
  }

  goBack(): void {
    this.router.navigate(['/client/checkout/address']);
  }
}
