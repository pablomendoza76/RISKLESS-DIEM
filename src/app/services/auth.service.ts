import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { UsuarioPerfilConRol } from './usuarios.service';

/* =========================
   TIPADO QUERY PERFIL
========================= */
type PerfilQuery = {
  id: string;
  nombre: string | null;
  apellido: string | null;
  correo: string | null;
  activo: boolean;
  rol: { id: string; nombre: string }[];
};

@Injectable({ providedIn: 'root' })
export class AuthService {

  private usuario: UsuarioPerfilConRol | null = null;

  constructor(private sb: SupabaseService) {}

  /* =========================
     LOGIN
  ========================= */
  async login(email: string, password: string): Promise<UsuarioPerfilConRol> {

    // 1. Autenticación real (Supabase Auth)
    const { error } = await this.sb.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error('Credenciales incorrectas');
    }

    // 2. Perfil + rol (FK explícita)
    const { data, error: perfilError } = await this.sb.client
      .from('usuarios')
      .select(`
        id,
        nombre,
        apellido,
        correo,
        activo,
        rol:roles!usuarios_rol_id_fkey(
          id,
          nombre
        )
      `)
      .eq('correo', email)
      .eq('activo', true)
      .single<PerfilQuery>();

    if (perfilError || !data) {
      throw new Error('Perfil no encontrado o inactivo');
    }

    // 3. Normalizar rol (array → objeto)
    this.usuario = {
      id: data.id,
      nombre: data.nombre,
      apellido: data.apellido,
      correo: data.correo,
      rol_id: null,
      activo: data.activo,
      rol: Array.isArray(data.rol) && data.rol.length
        ? data.rol[0]
        : null,
    };

    return this.usuario;
  }

  /* =========================
     LOGOUT
  ========================= */
  async logout(): Promise<void> {
    await this.sb.client.auth.signOut();
    this.usuario = null;
  }

  /* =========================
     USUARIO ACTUAL
  ========================= */
  getUsuarioActual(): UsuarioPerfilConRol | null {
    return this.usuario;
  }

  /* =========================
     ESTADO AUTENTICACIÓN
  ========================= */
  estaAutenticado(): boolean {
    return this.usuario !== null;
  }
}
