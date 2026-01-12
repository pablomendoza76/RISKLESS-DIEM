import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { SupabaseGatewayService } from './supabase-gateway.service';
import { Pedido } from '../interfaces/pedido.model';

@Injectable({ providedIn: 'root' })
export class PedidosService {

  // ✅ bucket nuevo
  private readonly BUCKET = 'archivos';

  constructor(
    private sb: SupabaseService,
    private gateway: SupabaseGatewayService
  ) {}

  /* =========================
     LISTAR PEDIDOS
  ========================= */
  listar(): Promise<any[]> {
    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('pedidos')
        .select(`
          *,
          asegurado:asegurado_id (id, nombre, apellido, cedula),
          bien:bien_id (id, tipo, num_serie),
          usuario:usuario_id (id, nombre, apellido)
        `)
        .order('created_at', { ascending: false });

      return { data: res.data ?? [], error: res.error };
    }, { silent: true });
  }

  /* =========================
     OBTENER POR ID
  ========================= */
  obtenerPorId(id: string): Promise<Pedido> {
    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('pedidos')
        .select('*')
        .eq('id', id)
        .maybeSingle<Pedido>();

      return { data: res.data, error: res.error };
    });
  }

  /* =========================
     CREAR PEDIDO + ARCHIVOS
  ========================= */
  crear(payload: {
    usuario_id: string;
    asegurado_id: string;
    bien_id: string;
    descripcion: string;
    archivos?: File[];
  }): Promise<Pedido> {

    return this.gateway.ejecutar(async () => {

      /* ===== 1. CREAR PEDIDO ===== */
      const pedidoRes = await this.sb.client
        .from('pedidos')
        .insert({
          usuario_id: payload.usuario_id,
          asegurado_id: payload.asegurado_id,
          bien_id: payload.bien_id,
          descripcion: payload.descripcion,
          estado: 'Abierto'
        })
        .select()
        .maybeSingle<Pedido>();

      if (pedidoRes.error || !pedidoRes.data) {
        return { data: null as any, error: pedidoRes.error };
      }

      const pedido = pedidoRes.data;

      /* ===== 2. SUBIR ARCHIVOS ===== */
      if (payload.archivos?.length) {

        for (const file of payload.archivos) {

          const ruta = `pedidos/${pedido.id}/${Date.now()}_${file.name}`;

          const upload = await this.sb.client
            .storage
            .from(this.BUCKET)
            .upload(ruta, file, {
              upsert: false,
              contentType: file.type
            });

          if (upload.error) {
            return { data: pedido, error: upload.error };
          }

          const { data } = this.sb.client
            .storage
            .from(this.BUCKET)
            .getPublicUrl(ruta);

          await this.sb.client
            .from('pedido_adjuntos')
            .insert({
              pedido_id: pedido.id,
              nombre_archivo: file.name,
              tipo_archivo: file.type,
              url: data.publicUrl
            });
        }
      }

      return { data: pedido, error: null };

    }, {
      successMessage: 'Pedido creado correctamente'
    });
  }

  /* =========================
     EDITAR PEDIDO
  ========================= */
  editar(
    id: string,
    cambios: Partial<Pick<Pedido, 'descripcion'>>
  ): Promise<Pedido> {

    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('pedidos')
        .update(cambios)
        .eq('id', id)
        .select()
        .maybeSingle<Pedido>();

      return { data: res.data, error: res.error };
    }, {
      successMessage: 'Pedido actualizado correctamente'
    });
  }

  /* =========================
     CAMBIAR ESTADO
  ========================= */
  actualizarEstado(
    id: string,
    estado: 'Abierto' | 'Aprobado' | 'Rechazado' | 'Convertido'
  ): Promise<void> {

    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('pedidos')
        .update({ estado })
        .eq('id', id);

      return { data: true as any, error: res.error };
    });
  }

  /* =========================
     ELIMINAR PEDIDO
  ========================= */
  eliminar(id: string): Promise<void> {
    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('pedidos')
        .delete()
        .eq('id', id);

      return { data: true as any, error: res.error };
    }, {
      successMessage: 'Pedido eliminado correctamente'
    });
  }
}
