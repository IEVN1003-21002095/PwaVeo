// src/app/app.config.ts

import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
// 1. Importa el proveedor de HttpClient
import { provideHttpClient } from '@angular/common/http'; 

import { routes } from './app.routes'; 

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // 2. ¡CRÍTICO! Registra el proveedor de HttpClient aquí.
    provideHttpClient() 
  ]
};