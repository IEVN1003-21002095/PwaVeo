import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class ReviewAdminService {
  // CORRECCIÓN: 'reviews' en plural
  private apiUrl = 'http://localhost:5000/reviews'; 

  constructor(private http: HttpClient) { }

  getAllReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/all`);
  }

  approveReview(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectReview(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/reject`, {});
  }

  deleteReview(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}