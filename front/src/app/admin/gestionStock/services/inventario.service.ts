import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Insumo } from '../models/insumo.model';

interface ApiResponse {
  success: boolean;
  total?: number;
  data?: Insumo[];
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventarioService {

  private apiUrl = 'http://localhost:5000/api/stock'; 

  // 1. CREAMOS EL SUBJECT DE NOTIFICACIÓN
  private _refresh$ = new Subject<void>();

  private alertasStock$ = new BehaviorSubject<string[]>([]);

  constructor(private http: HttpClient) {}

  // 2. GETTER PARA QUE LOS COMPONENTES SE SUSCRIBAN
  get refresh$() {
    return this._refresh$;
  }

  getInventarioObservable(): Observable<Insumo[]> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/list`).pipe(
      map(response => {
        if (response && response.success && response.data) {
          return response.data;
        } else {
          console.error('Error en respuesta API:', response?.message || 'Respuesta inválida');
          return [];
        }
      }),
      catchError(error => {
        console.error('Error en petición HTTP:', error);
        if (error.status === 0) {
          console.error('No se puede conectar al servidor. Verifica que el backend esté corriendo en http://localhost:5000');
        }
        return of([]);
      }),
      tap(lista => this.evaluarAlertasMasivas(lista))
    );
  }

  getInventarioPorId(id: number): Observable<Insumo | undefined> {
    return this.getInventarioObservable().pipe(
      map(lista => lista.find(item => item.id === id))
    );
  }

  agregar(item: Insumo): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/create`, item).pipe(
      // 3. AL TERMINAR LA PETICIÓN, AVISAMOS QUE HUBO CAMBIOS
      tap(() => this._refresh$.next())
    );
  }

  actualizar(id: number, item: Insumo): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/${id}/update`, item).pipe(
      tap(() => this._refresh$.next()) // Avisamos
    );
  }

  eliminar(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${id}/delete`).pipe(
      tap(() => this._refresh$.next()) // Avisamos
    );
  }

  obtenerAlertas(): Observable<string[]> {
    return this.alertasStock$.asObservable();
  }

  private evaluarAlertasMasivas(lista: Insumo[]) {
    const alertas: string[] = [];
    const STOCK_MINIMO_GLOBAL = 10; 

    lista.forEach(item => {
      if (item.estado === 'Activo' && item.cantidad <= STOCK_MINIMO_GLOBAL) {
        alertas.push(
          `Stock BAJO: ${item.nombre_insumo} (ID Color: ${item.color_id}, ID Talla: ${item.talla_id}) - Quedan: ${item.cantidad} ${item.unidad}`
        );
      }
    });

    this.alertasStock$.next(alertas);
  }
}