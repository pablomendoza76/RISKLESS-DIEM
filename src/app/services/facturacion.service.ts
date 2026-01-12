import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { SupabaseGatewayService } from './supabase-gateway.service';

@Injectable({ providedIn: 'root' })
export class FacturacionService {

  constructor(
    private sb: SupabaseService,
    private gateway: SupabaseGatewayService
  ) { }

  /* =========================
     LISTAR FACTURACIÓN
  ========================= */
  listar(): Promise<any[]> {
    return this.gateway.ejecutar(async () => {

      const res = await this.sb.client
        .from('facturacion')
        .select(`
          *,
          siniestro:siniestro_id (
            id,
            fecha_siniestro,
            monto_danio,
            estado,
            pedido:pedido_id (
              descripcion,
              asegurado:asegurado_id (nombre, apellido),
              bien:bien_id (tipo, num_serie)
            )
          )
        `)
        .order('created_at', { ascending: false });

      return {
        data: res.data ?? [],
        error: res.error
      };
    }, { silent: true });
  }

  /* =========================
     CREAR FACTURACIÓN
  ========================= */
  crear(payload: {
    siniestro_id: string;
    fecha_pago: string;
    monto_facturado: number;
    monto_cancelado: number;
    porcentaje_descuento?: number | null;
  }): Promise<any> {

    return this.gateway.ejecutar(async () => {

      const res = await this.sb.client
        .from('facturacion')
        .insert({
          siniestro_id: payload.siniestro_id,
          fecha_pago: payload.fecha_pago,
          monto_facturado: payload.monto_facturado,
          monto_cancelado: payload.monto_cancelado,
          porcentaje_descuento: payload.porcentaje_descuento ?? null
        })
        .select()
        .single();

      return {
        data: res.data,
        error: res.error
      };

    }, {
      successMessage: 'Facturación registrada correctamente'
    });
  }

  /* =========================
     EDITAR FACTURACIÓN
     (solo lo permitido)
  ========================= */
  editar(
    id: string,
    cambios: {
      monto_cancelado?: number | null;
      porcentaje_descuento?: number | null;
    }
  ): Promise<any> {

    return this.gateway.ejecutar(async () => {

      const res = await this.sb.client
        .from('facturacion')
        .update({
          monto_cancelado: cambios.monto_cancelado ?? null,
          porcentaje_descuento: cambios.porcentaje_descuento ?? null
        })
        .eq('id', id)
        .select()
        .single();

      return {
        data: res.data,
        error: res.error
      };
    }, {
      successMessage: 'Facturación actualizada correctamente'
    });
  }

}
