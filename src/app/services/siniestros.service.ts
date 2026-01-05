import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { SupabaseGatewayService } from './supabase-gateway.service';
import { Siniestro } from '../interfaces/siniestro.model';
@Injectable({ providedIn: 'root' })
export class SiniestrosService {

  constructor(
    private sb: SupabaseService,
    private gateway: SupabaseGatewayService
  ) {}

  /* =========================
     LISTAR
  ========================= */
  listar(): Promise<Siniestro[]> {
    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('siniestros')
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
  obtenerPorId(id: string): Promise<Siniestro> {
    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('siniestros')
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
    payload: Omit<Siniestro, 'id' | 'created_at'>
  ): Promise<Siniestro> {

    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('siniestros')
        .insert(payload)
        .select()
        .maybeSingle<Siniestro>();

      return {
        data: res.data,
        error: res.error
      };
    }, {
      successMessage: 'Siniestro registrado correctamente'
    });
  }

  /* =========================
     EDITAR
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
     ELIMINAR
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
