import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { SupabaseGatewayService } from './supabase-gateway.service';
import { Poliza } from '../interfaces/poliza.model';


@Injectable({ providedIn: 'root' })
export class PolizasService {

  constructor(
    private sb: SupabaseService,
    private gateway: SupabaseGatewayService
  ) {}

  /* =========================
     LISTAR
  ========================= */
  listar(): Promise<Poliza[]> {
    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('polizas')
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
  obtenerPorId(id: string): Promise<Poliza> {
    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('polizas')
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
    payload: Omit<Poliza, 'id' | 'created_at'>
  ): Promise<Poliza> {

    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('polizas')
        .insert(payload)
        .select()
        .maybeSingle<Poliza>();

      return {
        data: res.data,
        error: res.error
      };
    }, {
      successMessage: 'Póliza creada correctamente'
    });
  }

  /* =========================
     EDITAR
  ========================= */
  editar(
    id: string,
    cambios: Partial<Poliza>
  ): Promise<Poliza> {

    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('polizas')
        .update(cambios)
        .eq('id', id)
        .select()
        .maybeSingle<Poliza>();

      return {
        data: res.data,
        error: res.error
      };
    }, {
      successMessage: 'Póliza actualizada correctamente'
    });
  }

  /* =========================
     ELIMINAR
  ========================= */
  eliminar(id: string): Promise<void> {
    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('polizas')
        .delete()
        .eq('id', id);

      return {
        data: true as any,
        error: res.error
      };
    }, {
      successMessage: 'Póliza eliminada correctamente'
    });
  }
}
