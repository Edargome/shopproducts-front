import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { API_BASE_URL } from './core/tokens/api-base-url.token';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),

    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes),

    { provide: API_BASE_URL, useValue: 'http://localhost:3000' },
  ],
};
