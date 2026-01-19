import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { UsuarioPerfilConRol, UsuariosService } from '../services/usuarios.service';
import { RolesService, Rol } from '../services/roles.service';
import { DynamicField } from '../shared/components/reuzables/dynamic-form/dynamic-form.component';
import { ColumnaTabla, BotonTabla } from '../shared/components/reuzables/tabla-dinamica/tabla-dinamica.component';
import { AuthService } from '../services/presentación/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminMapper {

  /* =========================
     USUARIO LOGUEADO
  ========================= */
  nombreAdministrador = '';
  rolAdministrador = '';
  inicialesUsuario = 'AD';

  /* =========================
     ESTADO GENERAL
  ========================= */
  usuarios: UsuarioPerfilConRol[] = [];
  cargando = false;
  error: string | null = null;

  /* =========================
     FORMULARIO CRUD
  ========================= */
  mostrarFormulario = false;
  modoFormulario: 'crear' | 'editar' = 'crear';
  usuarioSeleccionado: UsuarioPerfilConRol | null = null;

  /* =========================
     MODAL LOGOUT
  ========================= */
  mostrarLogout = false;

  /* =========================
     ROLES
  ========================= */
  roles: { label: string; value: string }[] = [];

  /* =========================
     FORMULARIO DINÁMICO
  ========================= */
  fields: DynamicField[] = [];

  /* =========================
     TABLA
  ========================= */
  columnas: ColumnaTabla[] = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'apellido', label: 'Apellido' },
    { key: 'correo', label: 'Correo' },
    { key: 'rolNombre', label: 'Rol' },
    { key: 'activoTexto', label: 'Estado' },
  ];

  botones: BotonTabla[] = [
    { texto: 'Editar', tipo: 'primary', evento: 'editar' },
    { texto: 'Desactivar', tipo: 'danger', evento: 'desactivar' },
    { texto: 'Activar', tipo: 'secondary', evento: 'activar' },
  ];

  constructor(
    private usuariosService: UsuariosService,
    private rolesService: RolesService,
    private router: Router,
    private auth: AuthService
  ) {}

  /* =========================
     INIT
  ========================= */
  async init(): Promise<void> {
    this.cargarUsuarioLogueado();
    await this.cargarRoles();          // 👈 IMPORTANTE
    this.definirCamposFormulario();    // 👈 ya con roles
    this.cargarUsuarios();
  }

  /* =========================
     USUARIO LOGUEADO
  ========================= */
  cargarUsuarioLogueado(): void {
    const nombre = localStorage.getItem('nombreUsuario') ?? 'Admin';
    const apellido = localStorage.getItem('apellidoUsuario') ?? '';

    this.nombreAdministrador = apellido
      ? `${nombre} ${apellido}`
      : nombre;

    this.rolAdministrador =
      localStorage.getItem('rol') ?? 'Administrador';

    this.inicialesUsuario =
      (nombre.charAt(0) + apellido.charAt(0)).toUpperCase();
  }

  /* =========================
     ROLES
  ========================= */
  async cargarRoles(): Promise<void> {
    try {
      const roles: Rol[] = await this.rolesService.listar();

      this.roles = roles.map(r => ({
        label: r.nombre,
        value: r.id,
      }));
    } catch (e) {
      console.error('Error cargando roles', e);
    }
  }

  /* =========================
     FORMULARIO
  ========================= */
  definirCamposFormulario(): void {
    this.fields = [
      { type: 'text', name: 'nombre', label: 'Nombre', required: true },
      { type: 'text', name: 'apellido', label: 'Apellido', required: true },
      { type: 'email', name: 'correo', label: 'Correo electrónico', required: true },
      {
        type: 'select',
        name: 'rol_id',
        label: 'Rol',
        required: true,
        options: this.roles,
      },
    ];
  }

  /* =========================
     CRUD USUARIOS
  ========================= */
  async cargarUsuarios(): Promise<void> {
    this.cargando = true;
    this.error = null;

    try {
      const data = await this.usuariosService.listar();

      this.usuarios = data.map(u => ({
        ...u,
        rolNombre: u.rol?.nombre ?? '—',
        activoTexto: u.activo ? 'Activo' : 'Inactivo',
      })) as UsuarioPerfilConRol[];

    } catch (err) {
      console.error(err);
      this.error = 'Error al cargar usuarios';
    } finally {
      this.cargando = false;
    }
  }

  manejarAccion(e: { evento: string; fila?: any }): void {
    if (!e.fila) return;

    if (e.evento === 'editar') this.editarUsuario(e.fila);
    if (e.evento === 'desactivar') this.desactivarUsuario(e.fila);
    if (e.evento === 'activar') this.activarUsuario(e.fila);
  }

  crearUsuario(): void {
    this.modoFormulario = 'crear';
    this.usuarioSeleccionado = null;
    this.mostrarFormulario = true;
  }

  editarUsuario(usuario: UsuarioPerfilConRol): void {
    this.modoFormulario = 'editar';
    this.usuarioSeleccionado = usuario;
    this.mostrarFormulario = true;
  }

  async recibirFormulario(form: FormGroup): Promise<void> {
    const payload = form.value;

    if (this.modoFormulario === 'crear') {
      await this.usuariosService.crearPerfil({
        ...payload,
        activo: true,
      });
    }

    if (this.modoFormulario === 'editar' && this.usuarioSeleccionado) {
      await this.usuariosService.editarPerfil(
        this.usuarioSeleccionado.id,
        payload
      );
    }

    this.cerrarFormulario(true);
  }

  cerrarFormulario(recargar = false): void {
    this.mostrarFormulario = false;
    this.usuarioSeleccionado = null;

    if (recargar) {
      this.cargarUsuarios();
    }
  }

  async desactivarUsuario(usuario: UsuarioPerfilConRol): Promise<void> {
    await this.usuariosService.desactivar(usuario.id);
    await this.cargarUsuarios();
  }

  async activarUsuario(usuario: UsuarioPerfilConRol): Promise<void> {
    await this.usuariosService.activar(usuario.id);
    await this.cargarUsuarios();
  }

  /* =========================
     LOGOUT
  ========================= */
  abrirModalLogout(): void {
    this.mostrarLogout = true;
  }

  cerrarModalLogout(): void {
    this.mostrarLogout = false;
  }

  async cerrarSesion(): Promise<void> {
    try {
      await this.auth.logout();
      this.mostrarLogout = false;
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      this.mostrarLogout = false;
      this.router.navigate(['/login']);
    }
  }
}
