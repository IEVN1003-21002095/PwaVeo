import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaz de Reseña completa (Admin)
export interface Review {
  id: number;
  producto_id: number;
  cliente_id: number;
  calificacion: number;
  comentario: string;
  estado: string;
  fecha: string;
  producto_nombre: string;
  nombre_completo: string;
}

// Interfaz para enviar datos (Usuario)
export interface ReviewPayload {
  producto_id: number;
  cliente_id: number;
  calificacion: number;
  comentario: string;
}

// Interfaces para los selectores
export interface ProductSimple {
  id: number;
  nombre: string;
}

export interface ClientSimple {
  id: number;
  nombre_completo: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewAdminService {
  // URL base con prefijo /api para consistencia con el resto del sistema
  private baseUrl = 'http://localhost:5000/api'; 

  constructor(private http: HttpClient) { }

  // --- MÉTODOS DE ADMIN ---
  getAllReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/reviews/all`);
  }

  approveReview(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/reviews/${id}/approve`, {});
  }

  rejectReview(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/reviews/${id}/reject`, {});
  }

  deleteReview(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/reviews/${id}`);
  }

  // --- MÉTODOS DE USUARIO ---
  createReview(review: ReviewPayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/reviews`, review);
  }

  // Obtener productos para el selector
  getProducts(): Observable<ProductSimple[]> {
    return this.http.get<ProductSimple[]>(`${this.baseUrl}/products-list`);
  }

  // Obtener clientes para el selector
  getClients(): Observable<ClientSimple[]> {
    return this.http.get<ClientSimple[]>(`${this.baseUrl}/clients-list`);
  }
}