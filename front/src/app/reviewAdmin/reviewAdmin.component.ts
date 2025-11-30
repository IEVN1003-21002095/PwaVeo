import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReviewAdminService, Review } from './services/reviewAdmin.service';
import { StarsPipe } from './stars.pipe';

@Component({
  selector: 'app-review-admin',
  standalone: true,
  imports: [CommonModule, HttpClientModule, StarsPipe],
  providers: [ReviewAdminService, DatePipe],
  templateUrl: './reviewAdmin.component.html',
  styleUrls: [] 
})
export class ReviewAdminComponent implements OnInit {
  reviews: Review[] = [];
  isLoading: boolean = true;
  errorMsg: string = '';

  constructor(private reviewService: ReviewAdminService) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.isLoading = true;
    this.errorMsg = ''; // Limpiar errores previos
    
    this.reviewService.getAllReviews().subscribe({
      next: (data) => {
        this.reviews = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error detallado:', err);
        // Mensaje amigable para el usuario
        this.errorMsg = 'No se pudieron cargar las reseñas. Verifica que el servidor Flask esté corriendo en el puerto 5000.';
        this.isLoading = false;
      }
    });
  }

  approve(id: number): void {
    this.reviewService.approveReview(id).subscribe(() => this.loadReviews());
  }

  reject(id: number): void {
    if(confirm('¿Rechazar esta reseña?')) {
      this.reviewService.rejectReview(id).subscribe(() => this.loadReviews());
    }
  }

  delete(id: number): void {
    if(confirm('¿Eliminar permanentemente?')) {
      this.reviewService.deleteReview(id).subscribe(() => this.loadReviews());
    }
  }

  getStatusBadgeClass(estado: string): string {
    switch (estado) {
      case 'aprobado': return 'badge bg-success';
      case 'rechazado': return 'badge bg-danger';
      case 'pendiente': return 'badge bg-warning text-dark';
      default: return 'badge bg-secondary';
    }
  }
}