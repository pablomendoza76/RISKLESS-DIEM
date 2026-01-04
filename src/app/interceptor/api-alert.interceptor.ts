import { inject, NgZone } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
  HttpResponse,
  HttpEvent,
} from '@angular/common/http';
import { catchError, mergeMap, of, throwError } from 'rxjs';
import { AlertService } from '../services/presentación/alert.service';
import { Router } from '@angular/router';

/* =========================
   URLS A INTERCEPTAR
========================= */
const URLS_INTERCEPTADAS = [
  'https://mjqrcgfgwbqkikzzymwl.supabase.co/rest/v1',
  'https://api.billagenda.com',
];

/* =========================
   CONTROL DE ALERTA
========================= */
let alertaBloqueada = false;

/* =========================
   INTERCEPTOR
========================= */
export const apiAlertInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {
  const alertService = inject(AlertService);
  const ngZone = inject(NgZone);
  const router = inject(Router);

  console.log('LANZANDO INTERCEPTOR →', req.method, req.url);

  // reinicia bloqueo al cambiar de ruta
  router.events.subscribe(() => {
    alertaBloqueada = false;
  });

  const url = req.url.toLowerCase();
  const esInterceptada = URLS_INTERCEPTADAS.some(p =>
    url.startsWith(p.toLowerCase())
  );

  if (!esInterceptada) {
    return next(req);
  }

  return next(req).pipe(

    /* =========================
       RESPUESTAS 200 CON ERROR
    ========================= */
    mergeMap((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        const body: any = event.body;

        // backend devuelve error dentro de 200
        if (body?.error || body?.code) {
          const mensaje =
            body?.message ||
            body?.error?.message ||
            body?.details ||
            'Ocurrió un error inesperado';

          if (!alertaBloqueada) {
            ngZone.run(() => {
              console.warn('ERROR 200 DETECTADO:', body);
              alertService.error(mensaje, 'Error');
            });
            alertaBloqueada = true;
          }

          const err = new HttpErrorResponse({
            status: 400,
            statusText: 'AppError',
            url: req.urlWithParams,
            error: body,
          });

          return throwError(() => err);
        }
      }

      return of(event);
    }),

    /* =========================
       ERRORES HTTP REALES
    ========================= */
    catchError((error: HttpErrorResponse) => {

      console.error('ERROR CAPTURADO POR INTERCEPTOR:', error);

      let mensaje = 'Error inesperado';

      const backend = error.error;

      // errores Supabase / PostgREST
      if (backend) {
        mensaje =
          backend.message ||
          backend.details ||
          backend.error ||
          mensaje;
      } else if (error.message) {
        mensaje = error.message;
      }

      if (!alertaBloqueada) {
        ngZone.run(() => {
          alertService.error(mensaje, 'Error');
        });
        alertaBloqueada = true;
      }

      return throwError(() => error);
    })
  );
};
