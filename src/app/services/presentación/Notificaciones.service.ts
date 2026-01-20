import { Injectable } from '@angular/core';
import { SupabaseGatewayService } from '../supabase-gateway.service';
import { SupabaseService } from '../supabase.service';

export interface NotificacionItem {
  entidad: 'poliza' | 'pedido' | 'siniestro' | 'facturacion';
  entidad_id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  prioridad: 'baja' | 'media' | 'alta';
  fecha_evento: string;
}

@Injectable({ providedIn: 'root' })
export class NotificacionesService {

  constructor(
    private sb: SupabaseService,
    private gateway: SupabaseGatewayService
  ) {}

  /* =========================
     LISTAR TODAS
  ========================= */
  listar(): Promise<NotificacionItem[]> {
    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('vw_notificaciones')
        .select('*')
        .order('fecha_evento', { ascending: false });

      return {
        data: (res.data ?? []) as NotificacionItem[],
        error: res.error
      };
    }, { silent: true });
  }

  /* =========================
     LISTAR NO LEÍDAS
     (SIN AUTH → TODAS)
  ========================= */
  listarNoLeidas(): Promise<NotificacionItem[]> {
    return this.gateway.ejecutar(async () => {

      const { data: sessionData } = await this.sb.client.auth.getSession();
      const userId = sessionData?.session?.user?.id ?? null;

      // 🔹 SIN USUARIO → TODAS
      if (!userId) {
        const res = await this.sb.client
          .from('vw_notificaciones')
          .select('*')
          .order('fecha_evento', { ascending: false });

        return {
          data: (res.data ?? []) as NotificacionItem[],
          error: res.error
        };
      }

      // 🔹 CON USUARIO → FILTRAR LEÍDAS
      const leidasRes = await this.sb.client
        .from('notificaciones_leidas')
        .select('entidad, entidad_id, tipo')
        .eq('usuario_id', userId);

      const leidas = leidasRes.data ?? [];
      const keySet = new Set(
        leidas.map(l => `${l.entidad}|${l.entidad_id}|${l.tipo}`)
      );

      const notifRes = await this.sb.client
        .from('vw_notificaciones')
        .select('*')
        .order('fecha_evento', { ascending: false });

      const todas = (notifRes.data ?? []) as NotificacionItem[];

      const noLeidas = todas.filter(
        n => !keySet.has(`${n.entidad}|${n.entidad_id}|${n.tipo}`)
      );

      return {
        data: noLeidas,
        error: notifRes.error || leidasRes.error
      };
    }, { silent: true });
  }

  /* =========================
     MARCAR COMO LEÍDA
     (SIN AUTH → NO-OP)
  ========================= */
  marcarLeida(
    n: Pick<NotificacionItem, 'entidad' | 'entidad_id' | 'tipo'>
  ): Promise<boolean> {
    return this.gateway.ejecutar(async () => {

      const { data: sessionData } = await this.sb.client.auth.getSession();
      const userId = sessionData?.session?.user?.id ?? null;

      // 🔹 SIN USUARIO → NO ROMPE
      if (!userId) {
        return { data: true, error: null };
      }

      const res = await this.sb.client
        .from('notificaciones_leidas')
        .upsert({
          usuario_id: userId,
          entidad: n.entidad,
          entidad_id: n.entidad_id,
          tipo: n.tipo,
          leido_at: new Date().toISOString()
        }, {
          onConflict: 'usuario_id,entidad,entidad_id,tipo'
        });

      return {
        data: true,
        error: res.error
      };
    }, { silent: true });
  }

  /* =========================
     CONTADOR NO LEÍDAS
  ========================= */
  async contadorNoLeidas(): Promise<number> {
    const data = await this.listarNoLeidas();
    return data.length;
  }
}
