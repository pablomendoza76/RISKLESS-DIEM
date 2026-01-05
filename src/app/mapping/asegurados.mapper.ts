import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { AseguradosService } from '../services/asegurados.service';
import { DynamicField } from '../shared/components/reuzables/dynamic-form/dynamic-form.component';
import { ColumnaTabla, BotonTabla } from '../shared/components/reuzables/tabla-dinamica/tabla-dinamica.component';
import { Asegurado } from '../interfaces/asegurado.model';

@Injectable({ providedIn: 'root' })
export class AseguradosMapper {

  /* =========================
     ESTADO GENERAL
  ========================= */
  asegurados: any[] = [];
  totalAsegurados = 0;

  cargando = false;
  error: string | null = null;
  aseguradosFiltrados: Asegurado[] = [];


  /* =========================
     FORMULARIO
  ========================= */
  mostrarFormulario = false;
  modoFormulario: 'crear' | 'editar' = 'crear';
  aseguradoSeleccionado: Asegurado | null = null;

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
    { key: 'cedula', label: 'Cédula' },
    { key: 'correo', label: 'Correo' },
    { key: 'estadoTexto', label: 'Estado' },
  ];

  botones: BotonTabla[] = [
    { texto: '+ Nuevo asegurado', tipo: 'success', evento: 'crear' },
    { texto: 'Editar', tipo: 'primary', evento: 'editar' },
    { texto: 'Desactivar', tipo: 'danger', evento: 'desactivar' },
    { texto: 'Activar', tipo: 'activate', evento: 'activar' },
  ];

  constructor(
    private aseguradosService: AseguradosService
  ) {}

  /* =========================
     INIT
  ========================= */
  async init(): Promise<void> {
    this.definirCamposFormulario();
    await this.cargarAsegurados();
  }

  /* =========================
     FORMULARIO
  ========================= */
  definirCamposFormulario(): void {
    this.fields = [
      { type: 'text', name: 'nombre', label: 'Nombre', required: true },
      { type: 'text', name: 'apellido', label: 'Apellido', required: true },
      { type: 'text', name: 'cedula', label: 'Cédula', required: true },
      { type: 'email', name: 'correo', label: 'Correo electrónico' },
    ];
  }

  /* =========================
     CRUD ASEGURADOS
  ========================= */
  async cargarAsegurados(): Promise<void> {
    this.cargando = true;
    this.error = null;

    try {
      const data = await this.aseguradosService.listar();

      this.totalAsegurados = data.length;

      this.asegurados = data.map(a => ({
        ...a,
        estadoTexto: a.activo ? 'Activo' : 'Inactivo',
      }));

    } catch (err) {
      console.error(err);
      this.error = 'Error al cargar asegurados';
    } finally {
      this.cargando = false;
    }
  }

  manejarAccion(e: { evento: string; fila?: any }): void {
    if (e.evento === 'crear') {
      this.crearAsegurado();
      return;
    }

    if (!e.fila) return;

    if (e.evento === 'editar') this.editarAsegurado(e.fila);
    if (e.evento === 'desactivar') this.desactivarAsegurado(e.fila);
    if (e.evento === 'activar') this.activarAsegurado(e.fila);
  }

  crearAsegurado(): void {
    this.modoFormulario = 'crear';
    this.aseguradoSeleccionado = null;
    this.mostrarFormulario = true;
  }

  editarAsegurado(asegurado: Asegurado): void {
    this.modoFormulario = 'editar';
    this.aseguradoSeleccionado = asegurado;
    this.mostrarFormulario = true;
  }

  async recibirFormulario(form: FormGroup): Promise<void> {
    const payload = form.value;

    if (this.modoFormulario === 'crear') {
      await this.aseguradosService.crear({
        ...payload,
        activo: true,
      });
    }

    if (this.modoFormulario === 'editar' && this.aseguradoSeleccionado) {
      await this.aseguradosService.editar(
        this.aseguradoSeleccionado.id,
        payload
      );
    }

    this.cerrarFormulario(true);
  }

  cerrarFormulario(recargar = false): void {
    this.mostrarFormulario = false;
    this.aseguradoSeleccionado = null;

    if (recargar) {
      this.cargarAsegurados();
    }
  }

  async desactivarAsegurado(asegurado: Asegurado): Promise<void> {
    await this.aseguradosService.editar(asegurado.id, { activo: false });
    await this.cargarAsegurados();
  }

  async activarAsegurado(asegurado: Asegurado): Promise<void> {
    await this.aseguradosService.editar(asegurado.id, { activo: true });
    await this.cargarAsegurados();
  }

  filtrarAsegurados(filtro: { activos: boolean; inactivos: boolean }) {
  this.aseguradosFiltrados = this.asegurados.filter(a =>
    (filtro.activos && a.activo) ||
    (filtro.inactivos && !a.activo)
  );
}

}
