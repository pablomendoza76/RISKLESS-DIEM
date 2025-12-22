import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

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

/* =========================
   TIPO REAL QUE DEVUELVE SUPABASE
   (IMPORTANTE: rol es ARRAY)
========================= */
type UsuarioRow = {
  id: string;
  nombre: string | null;
  apellido: string | null;
  correo: string | null;
  rol_id: string | null;
  activo: boolean;
  created_at: string;
  rol: Rol[] | null;
};

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  constructor(private sb: SupabaseService) {}

  /* =========================
     LOGIN (TABLA USUARIOS)
  ========================= */
  async login(
    correo: string,
    contrasena: string
  ): Promise<UsuarioPerfilConRol> {

    const { data, error } = await this.sb.client
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
      .single<UsuarioRow>();

    if (error || !data) {
      throw new Error('Credenciales incorrectas');
    }

    return this.mapUsuario(data);
  }

  /* =========================
     LISTAR USUARIOS
  ========================= */
  async listar(): Promise<UsuarioPerfilConRol[]> {
    const { data, error } = await this.sb.client
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

    if (error) throw error;
    if (!data) return [];

    return data.map(row => this.mapUsuario(row as UsuarioRow));
  }

  /* =========================
     OBTENER POR ID
  ========================= */
  async obtenerPorId(id: string): Promise<UsuarioPerfilConRol> {
    const { data, error } = await this.sb.client
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
      .single<UsuarioRow>();

    if (error || !data) throw error;
    return this.mapUsuario(data);
  }

  /* =========================
     NORMALIZADOR CENTRAL
     (ARRAY → OBJETO)
========================= */
  private mapUsuario(row: UsuarioRow): UsuarioPerfilConRol {
    return {
      id: row.id,
      nombre: row.nombre,
      apellido: row.apellido,
      correo: row.correo,
      rol_id: row.rol_id,
      activo: row.activo,
      created_at: row.created_at,
      rol: row.rol && row.rol.length > 0
        ? row.rol[0]
        : null
    };
  }

  /* =========================
     CREAR PERFIL
  ========================= */
  async crearPerfil(
    payload: Omit<UsuarioPerfil, 'created_at'>
  ): Promise<UsuarioPerfil> {

    const { data, error } = await this.sb.client
      .from('usuarios')
      .insert(payload)
      .select()
      .single<UsuarioPerfil>();

    if (error) throw error;
    return data;
  }

  /* =========================
     EDITAR PERFIL
  ========================= */
  async editarPerfil(
    id: string,
    cambios: Partial<UsuarioPerfil>
  ): Promise<UsuarioPerfil> {

    const { data, error } = await this.sb.client
      .from('usuarios')
      .update(cambios)
      .eq('id', id)
      .select()
      .single<UsuarioPerfil>();

    if (error) throw error;
    return data;
  }

  /* =========================
     DESACTIVAR
  ========================= */
  async desactivar(id: string): Promise<void> {
    const { error } = await this.sb.client
      .from('usuarios')
      .update({ activo: false })
      .eq('id', id);

    if (error) throw error;
  }

  /* =========================
     ACTIVAR
  ========================= */
  async activar(id: string): Promise<void> {
    const { error } = await this.sb.client
      .from('usuarios')
      .update({ activo: true })
      .eq('id', id);

    if (error) throw error;
  }
}
