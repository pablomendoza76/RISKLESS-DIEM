import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { AseguradosService } from '../services/asegurados.service';
import { DynamicField } from '../shared/components/reuzables/dynamic-form/dynamic-form.component';
import {
  ColumnaTabla,
  BotonTabla
} from '../shared/components/reuzables/tabla-dinamica/tabla-dinamica.component';
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
     TABLA (ESTÁNDAR RISKLESS)
     🔥 CLAVE: key = 'estado'
  ========================= */
  columnas: ColumnaTabla[] = [
    { key: 'id_display', label: 'ID', width: '60px' },
    { key: 'nombre', label: 'NOMBRE', width: '150px' },
    { key: 'apellido', label: 'APELLIDO', width: '150px' },
    { key: 'cedula', label: 'CÉDULA', width: '130px' },
    { key: 'correo', label: 'CORREO ELECTRÓNICO', width: '250px' },
    { key: 'estado', label: 'ESTADO', width: '120px' },
  ];

  botones: BotonTabla[] = [
    { texto: 'Filtros', tipo: 'secondary', evento: 'filtros' },
    { texto: '+ Nuevo asegurado', tipo: 'success', evento: 'crear' },
    { texto: 'Editar', tipo: 'primary', evento: 'editar' },
    { texto: 'Desactivar', tipo: 'danger', evento: 'desactivar' },
    { texto: 'Activar', tipo: 'activate', evento: 'activar' },
  ];

  constructor(
    private aseguradosService: AseguradosService
  ) { }

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

      /* =====================================
         MAPEO ESTÁNDAR DE ESTADO (🔥 CLAVE)
      ===================================== */
      this.asegurados = data.map((a, index) => ({
        ...a,
        id_display: (index + 1).toString().padStart(2, '0'),
        inicial: a.nombre ? a.nombre.charAt(0).toUpperCase() : '',
        estado: a.activo ? 'Activo' : 'Inactivo', // 👈 CONTRATO VISUAL
      }));

    } catch (err) {
      console.error(err);
      this.error = 'Error al cargar asegurados';
    } finally {
      this.cargando = false;
    }
  }

  /* =========================
     ACCIONES DE TABLA
  ========================= */
  manejarAccion(e: { evento: string; fila?: any }): void {

    if (e.evento === 'crear') {
      this.crearAsegurado();
      return;
    }

    if (!e.fila) return;

    switch (e.evento) {
      case 'editar':
        this.editarAsegurado(e.fila);
        break;

      case 'desactivar':
        this.desactivarAsegurado(e.fila);
        break;

      case 'activar':
        this.activarAsegurado(e.fila);
        break;
    }
  }

  /* =========================
     FORMULARIO ACTIONS
  ========================= */
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

  /* =========================
     ACTIVAR / DESACTIVAR
  ========================= */
  async desactivarAsegurado(asegurado: Asegurado): Promise<void> {
    await this.aseguradosService.editar(asegurado.id, { activo: false });
    await this.cargarAsegurados();
  }

  async activarAsegurado(asegurado: Asegurado): Promise<void> {
    await this.aseguradosService.editar(asegurado.id, { activo: true });
    await this.cargarAsegurados();
  }
}
