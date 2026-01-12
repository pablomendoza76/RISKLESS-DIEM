import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { SupabaseGatewayService } from './supabase-gateway.service';
import { Siniestro } from '../interfaces/siniestro.model';

@Injectable({ providedIn: 'root' })
export class SiniestrosService {

  constructor(
    private sb: SupabaseService,
    private gateway: SupabaseGatewayService
  ) { }

  /* =========================
     LISTAR SINIESTROS
     (con info básica del pedido)
  ========================= */
  listar(): Promise<any[]> {
  return this.gateway.ejecutar(async () => {
    const res = await this.sb.client
      .from('siniestros')
      .select(`
        *,
        pedido:pedido_id (
          id,
          descripcion,
          estado,
          created_at,
          asegurado:asegurado_id (
            nombre,
            apellido
          ),
          bien:bien_id (
            tipo,
            num_serie
          )
        ),
        poliza:poliza_id (
          id,
          num_poliza,
          aseguradora
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
     OBTENER POR ID
  ========================= */
  obtenerPorId(id: string): Promise<Siniestro> {
    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('siniestros')
        .select('*')
        .eq('id', id)
        .maybeSingle<Siniestro>();

      return {
        data: res.data,
        error: res.error
      };
    });
  }

  /* =========================
     CREAR SINIESTRO
     (DESDE PEDIDO)
  ========================= */
 crearDesdePedido(payload: {
  pedido_id: string;
  poliza_id: string;
  fecha_siniestro: string;
  monto_danio?: number | null;
  deducible?: number | null;
  descripcion_siniestro?: string | null;

  // ===== DATOS PROVEEDOR (OPCIONALES) =====
  proveedor_nombre?: string | null;
  proveedor_direccion?: string | null;
  proveedor_telefono?: string | null;
  proveedor_correo?: string | null;

}): Promise<Siniestro> {

  return this.gateway.ejecutar(async () => {

    /* =========================
       INSERTAR SINIESTRO
    ========================= */
    const insertRes = await this.sb.client
      .from('siniestros')
      .insert({
        pedido_id: payload.pedido_id,
        poliza_id: payload.poliza_id,
        fecha_siniestro: payload.fecha_siniestro,

        monto_danio: payload.monto_danio ?? null,
        deducible: payload.deducible ?? null,
        descripcion_siniestro: payload.descripcion_siniestro ?? null,

        proveedor_nombre: payload.proveedor_nombre ?? null,
        proveedor_direccion: payload.proveedor_direccion ?? null,
        proveedor_telefono: payload.proveedor_telefono ?? null,
        proveedor_correo: payload.proveedor_correo ?? null,

        estado: 'En proceso'
      })
      .select('id')
      .maybeSingle();

    if (insertRes.error || !insertRes.data) {
      throw insertRes.error;
    }

    const siniestroId = insertRes.data.id;

    /* =========================
       OBTENER SINIESTRO COMPLETO
       (CON RELACIONES)
    ========================= */
    const res = await this.sb.client
      .from('siniestros')
      .select(`
        *,
        pedido:pedido_id (
          id,
          descripcion,
          asegurado:asegurado_id (
            nombre,
            apellido
          ),
          bien:bien_id (
            tipo,
            num_serie
          )
        ),
        poliza:poliza_id (
          num_poliza,
          aseguradora
        )
      `)
      .eq('id', siniestroId)
      .maybeSingle<Siniestro>();

    if (res.error) throw res.error;

    /* =========================
       ACTUALIZAR PEDIDO
    ========================= */
    await this.sb.client
      .from('pedidos')
      .update({ estado: 'Convertido' })
      .eq('id', payload.pedido_id);

    return {
      data: res.data,
      error: null
    };

  }, {
    successMessage: 'Siniestro creado correctamente'
  });
}




  /* =========================
     EDITAR SINIESTRO
  ========================= */
  editar(
    id: string,
    cambios: Partial<Siniestro>
  ): Promise<Siniestro> {

    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('siniestros')
        .update(cambios)
        .eq('id', id)
        .select()
        .maybeSingle<Siniestro>();

      return {
        data: res.data,
        error: res.error
      };
    }, {
      successMessage: 'Siniestro actualizado correctamente'
    });
  }

  /* =========================
     ELIMINAR SINIESTRO
  ========================= */
  eliminar(id: string): Promise<void> {
    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('siniestros')
        .delete()
        .eq('id', id);

      return {
        data: true as any,
        error: res.error
      };
    }, {
      successMessage: 'Siniestro eliminado correctamente'
    });
  }
}
