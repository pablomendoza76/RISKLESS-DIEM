import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { SupabaseGatewayService } from './supabase-gateway.service';
import { Clausula } from '../interfaces/clausula.model';

@Injectable({ providedIn: 'root' })
export class ClausulasService {

  constructor(
    private sb: SupabaseService,
    private gateway: SupabaseGatewayService
  ) {}

  /* =========================
     LISTAR*/
  listar(): Promise<Clausula[]> {
    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('clausulas')
        .select('*')
        .order('titulo');

      return {
        data: res.data ?? [],
        error: res.error
      };
    }, { silent: true });
  }

  /* =========================
     OBTENER POR ID*/
  obtenerPorId(id: string): Promise<Clausula> {
    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('clausulas')
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
     CREAR*/
  crear(
    payload: Omit<Clausula, 'id'>
  ): Promise<Clausula> {

    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('clausulas')
        .insert(payload)
        .select()
        .maybeSingle<Clausula>();

      return {
        data: res.data,
        error: res.error
      };
    }, {
      successMessage: 'Cláusula creada correctamente'
    });
  }

  /* =========================
     EDITAR*/
  editar(
    id: string,
    cambios: Partial<Clausula>
  ): Promise<Clausula> {

    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('clausulas')
        .update(cambios)
        .eq('id', id)
        .select()
        .maybeSingle<Clausula>();

      return {
        data: res.data,
        error: res.error
      };
    }, {
      successMessage: 'Cláusula actualizada correctamente'
    });
  }

  /* =========================
     ELIMINAR*/
  eliminar(id: string): Promise<void> {
    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('clausulas')
        .delete()
        .eq('id', id);

      return {
        data: true as any,
        error: res.error
      };
    }, {
      successMessage: 'Cláusula eliminada correctamente'
    });
  }
}
