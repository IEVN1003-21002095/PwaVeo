import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CheckoutsService {
  private base = 'http://localhost:5000/api/checkout';

  // shared state
  address$ = new BehaviorSubject<any>(null);
  payment$ = new BehaviorSubject<any>(null);
  summary$ = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {}

  registerAddress(data: any): Observable<any> {
    return this.http.post<any>(`${this.base}/direccion`, data).pipe(
      tap(res => { if (res && res.exito) this.address$.next(res); }),
      catchError(err => throwError(() => err))
    );
  }

  selectPayment(payload: any): Observable<any> {
    return this.http.post<any>(`${this.base}/metodo-pago`, payload).pipe(
      tap(res => { if (res && res.exito) this.payment$.next(res); }),
      catchError(err => throwError(() => err))
    );
  }

  generateSummary(payload: any): Observable<any> {
    return this.http.post<any>(`${this.base}/resumen`, payload).pipe(
      tap(res => { if (res && res.exito) this.summary$.next(res); }),
      catchError(err => throwError(() => err))
    );
  }

  confirmPurchase(payload: any): Observable<any> {
    return this.http.post<any>(`${this.base}/confirmar`, payload).pipe(
      catchError(err => throwError(() => err))
    );
  }
}
