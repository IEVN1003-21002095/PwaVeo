import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ReviewAdminService, ReviewPayload, ProductSimple, ClientSimple } from './services/reviewAdmin.service';

@Component({
  selector: 'app-review-user',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  providers: [ReviewAdminService],
  templateUrl: './reviewUser.component.html',
  styles: [`
    /* Estilos para las estrellas de texto */
    .star-rating {
      font-size: 2.5rem;
      cursor: pointer;
      user-select: none;
      color: #ccc;
      transition: color 0.2s, transform 0.2s;
    }
    .star-filled {
      color: #ffc107; /* Amarillo dorado */
    }
    .star-rating:hover {
      transform: scale(1.1);
    }
  `]
})
export class ReviewUserComponent implements OnInit {
  
  // Listas para los selectores
  products: ProductSimple[] = [];
  clients: ClientSimple[] = [];

  // Datos del formulario
  reviewData: ReviewPayload = {
    producto_id: 0,
    cliente_id: 0,
    calificacion: 0,
    comentario: ''
  };

  isSubmitting: boolean = false;
  successMsg: string = '';
  errorMsg: string = '';
  
  // Array para generar las 5 estrellas
  stars: number[] = [1, 2, 3, 4, 5];

  constructor(private reviewService: ReviewAdminService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    // Cargar lista de productos
    this.reviewService.getProducts().subscribe({
      next: (data) => this.products = data,
      error: (err) => console.error('Error cargando productos', err)
    });

    // Cargar lista de clientes
    this.reviewService.getClients().subscribe({
      next: (data) => this.clients = data,
      error: (err) => console.error('Error cargando clientes', err)
    });
  }

  setRating(rating: number): void {
    this.reviewData.calificacion = rating;
  }

  submitReview(): void {
    // Validaciones
    if (this.reviewData.cliente_id === 0) {
      this.errorMsg = 'Por favor selecciona quién eres (Cliente).';
      return;
    }
    if (this.reviewData.producto_id === 0) {
      this.errorMsg = 'Por favor selecciona un producto.';
      return;
    }
    if (this.reviewData.calificacion === 0) {
      this.errorMsg = 'Por favor selecciona una calificación tocando las estrellas.';
      return;
    }
    if (!this.reviewData.comentario.trim()) {
      this.errorMsg = 'Por favor escribe un comentario.';
      return;
    }

    // Enviar
    this.isSubmitting = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.reviewService.createReview(this.reviewData).subscribe({
      next: (res) => {
        this.successMsg = '¡Gracias! Tu reseña ha sido enviada y está pendiente de aprobación.';
        this.isSubmitting = false;
        
        // Resetear formulario
        this.reviewData = {
          producto_id: 0,
          cliente_id: 0,
          calificacion: 0,
          comentario: ''
        };
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Hubo un error al enviar la reseña.';
        this.isSubmitting = false;
      }
    });
  }
}