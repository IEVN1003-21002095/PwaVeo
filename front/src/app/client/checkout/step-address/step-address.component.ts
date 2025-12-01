import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CheckoutsService } from '../checkouts.service';

@Component({
  selector: 'app-step-address',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step-address.component.html',
  styleUrl: './step-address.component.scss'
})
export class StepAddressComponent implements OnInit {
  addressForm!: FormGroup;
  errorMsg = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private checkoutSvc: CheckoutsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const clienteId = localStorage.getItem('userId') || '1'; // ajusta según tu auth
    this.addressForm = this.fb.group({
      cliente_id: [clienteId, Validators.required],
      nombre_destinatario: ['', Validators.required],
      calle: ['', Validators.required],
      numero_ext: ['', Validators.required],
      numero_int: [''],
      colonia: ['', Validators.required],
      codigo_postal: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      ciudad: ['', Validators.required],
      estado: ['', Validators.required],
      telefono: ['', Validators.required],
      referencia: ['']
    });
  }

  onSubmit(): void {
    if (this.addressForm.invalid) {
      this.errorMsg = 'Por favor completa todos los campos obligatorios.';
      return;
    }

    // Guardar en el servicio sin enviar al backend aún
    this.checkoutSvc.address$.next({
      exito: true,
      direccion: this.addressForm.value
    });
    
    console.log('Dirección guardada en servicio:', this.addressForm.value);
    this.router.navigate(['/client/checkout/payment']);
  }
}
