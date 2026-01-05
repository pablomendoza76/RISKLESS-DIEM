import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { SupabaseGatewayService } from './supabase-gateway.service';
import { Pedido } from '../interfaces/pedido.model';

@Injectable({ providedIn: 'root' })
export class PedidosService {

  constructor(
    private sb: SupabaseService,
    private gateway: SupabaseGatewayService
  ) {}

  /* =========================
     LISTAR
  ========================= */
  listar(): Promise<Pedido[]> {
    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('pedidos')
        .select('*')
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
  obtenerPorId(id: string): Promise<Pedido> {
    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('pedidos')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      return {
        data: res.data,
        error: res.error
      };
    });
  }

  /* =========================
     CREAR
  ========================= */
  crear(
    payload: Omit<Pedido, 'id' | 'created_at'>
  ): Promise<Pedido> {

    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('pedidos')
        .insert(payload)
        .select()
        .maybeSingle<Pedido>();

      return {
        data: res.data,
        error: res.error
      };
    }, {
      successMessage: 'Pedido creado correctamente'
    });
  }

  /* =========================
     EDITAR
  ========================= */
  editar(
    id: string,
    cambios: Partial<Pedido>
  ): Promise<Pedido> {

    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('pedidos')
        .update(cambios)
        .eq('id', id)
        .select()
        .maybeSingle<Pedido>();

      return {
        data: res.data,
        error: res.error
      };
    }, {
      successMessage: 'Pedido actualizado correctamente'
    });
  }

  /* =========================
     ELIMINAR
  ========================= */
  eliminar(id: string): Promise<void> {
    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('pedidos')
        .delete()
        .eq('id', id);

      return {
        data: true as any,
        error: res.error
      };
    }, {
      successMessage: 'Pedido eliminado correctamente'
    });
  }
}
