import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { BienesService } from '../services/bienes.service';
import { Bien } from '../interfaces/bien.model';

import { DynamicField } from '../shared/components/reuzables/dynamic-form/dynamic-form.component';
import {
  ColumnaTabla,
  BotonTabla
} from '../shared/components/reuzables/tabla-dinamica/tabla-dinamica.component';

@Injectable({
  providedIn: 'root',
})
export class BienesMapper {

  /* =========================
     ESTADO GENERAL
  ========================= */
  bienes: Bien[] = [];
  totalBienes = 0;

  cargando = false;
  error: string | null = null;

  /* =========================
     FORMULARIO CRUD
  ========================= */
  mostrarFormulario = false;
  modoFormulario: 'crear' | 'editar' = 'crear';
  bienSeleccionado: Bien | null = null;

  /* =========================
     FORMULARIO DINÁMICO
  ========================= */
  fields: DynamicField[] = [];

  /* =========================
     TABLA
  ========================= */
  columnas: ColumnaTabla[] = [
    { key: 'tipo', label: 'Tipo' },
    { key: 'num_serie', label: 'N° Serie' },
    { key: 'anio_fabricacion', label: 'Año fabricación' },
    { key: 'antiguedad', label: 'Antigüedad (años)' },
  ];

  botones: BotonTabla[] = [
    { texto: '+ Nuevo bien', tipo: 'success', evento: 'crear' },
    { texto: 'Editar', tipo: 'primary', evento: 'editar' },
    { texto: 'Eliminar', tipo: 'danger', evento: 'eliminar' },
  ];

  constructor(
    private bienesService: BienesService
  ) {}

  /* =========================
     INIT
  ========================= */
  async init(): Promise<void> {
    this.definirCamposFormulario();
    await this.cargarBienes();
  }

  /* =========================
     FORMULARIO
  ========================= */
  definirCamposFormulario(): void {
    this.fields = [
      {
        type: 'text',
        name: 'tipo',
        label: 'Tipo de bien',
        required: true,
      },
      {
        type: 'text',
        name: 'num_serie',
        label: 'Número de serie',
        required: true,
      },
      {
        type: 'number',
        name: 'anio_fabricacion',
        label: 'Año de fabricación',
        required: true,
      },
      {
        type: 'number',
        name: 'antiguedad',
        label: 'Antigüedad (años)',
        required: true,
      },
    ];
  }

  /* =========================
     CRUD BIENES
  ========================= */
  async cargarBienes(): Promise<void> {
    this.cargando = true;
    this.error = null;

    try {
      const data = await this.bienesService.listar();

      this.bienes = data;
      this.totalBienes = data.length;

    } catch (err) {
      console.error(err);
      this.error = 'Error al cargar bienes';
    } finally {
      this.cargando = false;
    }
  }

  manejarAccion(e: { evento: string; fila?: any }): void {

    if (e.evento === 'crear') {
      this.crearBien();
      return;
    }

    if (!e.fila) return;

    if (e.evento === 'editar') this.editarBien(e.fila);
    if (e.evento === 'eliminar') this.eliminarBien(e.fila);
  }

  crearBien(): void {
    this.modoFormulario = 'crear';
    this.bienSeleccionado = null;
    this.mostrarFormulario = true;
  }

  editarBien(bien: Bien): void {
    this.modoFormulario = 'editar';
    this.bienSeleccionado = bien;
    this.mostrarFormulario = true;
  }

  async recibirFormulario(form: FormGroup): Promise<void> {
    const payload = form.value;

    if (this.modoFormulario === 'crear') {
      await this.bienesService.crear(payload);
    }

    if (this.modoFormulario === 'editar' && this.bienSeleccionado) {
      await this.bienesService.editar(
        this.bienSeleccionado.id,
        payload
      );
    }

    this.cerrarFormulario(true);
  }

  cerrarFormulario(recargar = false): void {
    this.mostrarFormulario = false;
    this.bienSeleccionado = null;

    if (recargar) {
      this.cargarBienes();
    }
  }

  async eliminarBien(bien: Bien): Promise<void> {
    await this.bienesService.eliminar(bien.id);
    await this.cargarBienes();
  }
}
