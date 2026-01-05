import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { SupabaseGatewayService } from './supabase-gateway.service';
import { Asegurado } from '../interfaces/asegurado.model';

@Injectable({ providedIn: 'root' })
export class AseguradosService {

  constructor(
    private sb: SupabaseService,
    private gateway: SupabaseGatewayService
  ) {}

  /*  LISTAR*/
  listar(): Promise<Asegurado[]> {
    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('asegurados')
        .select('*')
        .order('created_at', { ascending: false });

      return {
        data: res.data ?? [],
        error: res.error
      };
    }, { silent: true });
  }

  /*  OBTENER POR ID*/
  obtenerPorId(id: string): Promise<Asegurado> {
    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('asegurados')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      return {
        data: res.data,
        error: res.error
      };
    });
  }

  /*  CREAR*/
  crear(
    payload: Omit<Asegurado, 'id' | 'created_at'>
  ): Promise<Asegurado> {

    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('asegurados')
        .insert(payload)
        .select()
        .maybeSingle<Asegurado>();

      return {
        data: res.data,
        error: res.error
      };
    }, {
      successMessage: 'Asegurado creado correctamente'
    });
  }

  /*  EDITAR*/
  editar(
    id: string,
    cambios: Partial<Asegurado>
  ): Promise<Asegurado> {

    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('asegurados')
        .update(cambios)
        .eq('id', id)
        .select()
        .maybeSingle<Asegurado>();

      return {
        data: res.data,
        error: res.error
      };
    }, {
      successMessage: 'Asegurado actualizado correctamente'
    });
  }

  /*  ELIMINAR*/
  eliminar(id: string): Promise<void> {
    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('asegurados')
        .delete()
        .eq('id', id);

      return {
        data: true as any,
        error: res.error
      };
    }, {
      successMessage: 'Asegurado eliminado correctamente'
    });
  }
}
