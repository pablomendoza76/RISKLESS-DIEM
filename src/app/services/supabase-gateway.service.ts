import { Injectable } from '@angular/core';
import { AlertService } from './presentación/alert.service';

@Injectable({ providedIn: 'root' })
export class SupabaseGatewayService {

  constructor(private alert: AlertService) {}

  async ejecutar<T>(
    operacion: () => Promise<{ data: T | null; error: any }>,
    opciones?: {
      successMessage?: string;
      silent?: boolean;
    }
  ): Promise<T> {

    try {
      const { data, error } = await operacion();

      if (error) {
        const mensaje =
          error.message ||
          error.details ||
          'Error inesperado';

        if (!opciones?.silent) {
          this.alert.error(mensaje);
        }

        throw error;
      }

      if (data === null || data === undefined) {
        throw new Error('No se obtuvo información');
      }

      if (opciones?.successMessage) {
        this.alert.success(opciones.successMessage);
      }

      return data;

    } catch (e: any) {
      if (!opciones?.silent) {
        this.alert.error(e?.message || 'Error inesperado');
      }
      throw e;
    }
  }
}

