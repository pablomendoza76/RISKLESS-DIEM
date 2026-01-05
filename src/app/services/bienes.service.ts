import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { SupabaseGatewayService } from './supabase-gateway.service';
import { Bien } from '../interfaces/bien.model';

@Injectable({ providedIn: 'root' })
export class BienesService {

  constructor(
    private sb: SupabaseService,
    private gateway: SupabaseGatewayService
  ) {}

  /* =========================
     LISTAR
  ========================= */
  listar(): Promise<Bien[]> {
    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('bienes')
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
  obtenerPorId(id: string): Promise<Bien> {
    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('bienes')
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
    payload: Omit<Bien, 'id' | 'created_at'>
  ): Promise<Bien> {

    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('bienes')
        .insert(payload)
        .select()
        .maybeSingle<Bien>();

      return {
        data: res.data,
        error: res.error
      };
    }, {
      successMessage: 'Bien registrado correctamente'
    });
  }

  /* =========================
     EDITAR
  ========================= */
  editar(
    id: string,
    cambios: Partial<Bien>
  ): Promise<Bien> {

    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('bienes')
        .update(cambios)
        .eq('id', id)
        .select()
        .maybeSingle<Bien>();

      return {
        data: res.data,
        error: res.error
      };
    }, {
      successMessage: 'Bien actualizado correctamente'
    });
  }

  /* =========================
     ELIMINAR
  ========================= */
  eliminar(id: string): Promise<void> {
    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('bienes')
        .delete()
        .eq('id', id);

      return {
        data: true as any,
        error: res.error
      };
    }, {
      successMessage: 'Bien eliminado correctamente'
    });
  }
}
