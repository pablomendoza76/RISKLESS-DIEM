import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { SupabaseGatewayService } from './supabase-gateway.service';

/* =========================
   INTERFACES DE DOMINIO
========================= */
export interface UsuarioPerfil {
  id: string;
  nombre: string | null;
  apellido: string | null;
  correo: string | null;
  rol_id: string | null;
  activo: boolean;
  created_at?: string;
}

export interface Rol {
  id: string;
  nombre: string;
}

export interface UsuarioPerfilConRol extends UsuarioPerfil {
  rol: Rol | null;
}

@Injectable({ providedIn: 'root' })
export class UsuariosService {

  constructor(
    private sb: SupabaseService,
    private gateway: SupabaseGatewayService
  ) {}

  /*  LOGIN*/
  login(
    correo: string,
    contrasena: string
  ): Promise<UsuarioPerfilConRol> {

    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('usuarios')
        .select(`
          id,
          nombre,
          apellido,
          correo,
          rol_id,
          activo,
          created_at,
          rol:roles!usuarios_rol_id_fkey (
            id,
            nombre
          )
        `)
        .eq('correo', correo)
        .eq('contrasena', contrasena)
        .eq('activo', true)
        .maybeSingle();

      return {
        data: res.data ? this.mapUsuario(res.data) : null,
        error: res.error ?? (!res.data ? { message: 'Credenciales incorrectas' } : null),
      };
    });
  }

  /*  LISTAR*/
  listar(): Promise<UsuarioPerfilConRol[]> {
    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('usuarios')
        .select(`
          id,
          nombre,
          apellido,
          correo,
          rol_id,
          activo,
          created_at,
          rol:roles!usuarios_rol_id_fkey (
            id,
            nombre
          )
        `)
        .order('created_at', { ascending: false });

      return {
        data: (res.data ?? []).map(row => this.mapUsuario(row)),
        error: res.error,
      };
    }, { silent: true });
  }

  /*  OBTENER POR ID*/
  obtenerPorId(id: string): Promise<UsuarioPerfilConRol> {
    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('usuarios')
        .select(`
          id,
          nombre,
          apellido,
          correo,
          rol_id,
          activo,
          created_at,
          rol:roles!usuarios_rol_id_fkey (
            id,
            nombre
          )
        `)
        .eq('id', id)
        .maybeSingle();

      return {
        data: res.data ? this.mapUsuario(res.data) : null,
        error: res.error,
      };
    });
  }

  /*  CREAR PERFIL*/
  crearPerfil(
  payload: Omit<UsuarioPerfil, 'created_at'>
): Promise<UsuarioPerfil> {

  return this.gateway.ejecutar(async () => {

    // ✅ generar contraseña: nombre + 123
    const contrasenaGenerada =
      payload.nombre
        ? `${payload.nombre.toLowerCase()}123`
        : 'usuario123';

    const res = await this.sb.client
      .from('usuarios')
      .insert({
        ...payload,
        contrasena: contrasenaGenerada,
        activo: true
      })
      .select()
      .maybeSingle<UsuarioPerfil>();

    return { data: res.data, error: res.error };

  }, {
    successMessage: 'Usuario creado correctamente (contraseña: nombre123)'
  });
}


  /*  EDITAR PERFIL*/
  editarPerfil(
    id: string,
    cambios: Partial<UsuarioPerfil>
  ): Promise<UsuarioPerfil> {

    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('usuarios')
        .update(cambios)
        .eq('id', id)
        .select()
        .maybeSingle<UsuarioPerfil>();

      return { data: res.data, error: res.error };
    }, { successMessage: 'Usuario actualizado correctamente' });
  }

  /*  DESACTIVAR*/
  desactivar(id: string): Promise<void> {
    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('usuarios')
        .update({ activo: false })
        .eq('id', id);

      return { data: true as any, error: res.error };
    }, { successMessage: 'Usuario desactivado' });
  }

  /*  ACTIVAR*/
  activar(id: string): Promise<void> {
    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('usuarios')
        .update({ activo: true })
        .eq('id', id);

      return { data: true as any, error: res.error };
    }, { successMessage: 'Usuario activado' });
  }

  /*  NORMALIZADOR CENTRAL*/
  private mapUsuario(row: any): UsuarioPerfilConRol {
    return {
      id: row.id,
      nombre: row.nombre,
      apellido: row.apellido,
      correo: row.correo,
      rol_id: row.rol_id,
      activo: row.activo,
      created_at: row.created_at,
      rol: Array.isArray(row.rol) ? row.rol[0] ?? null : row.rol ?? null,
    };
  }
}
