import { Injectable } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';

import { PedidosService } from '../services/pedidos.service';
import { AseguradosService } from '../services/asegurados.service';
import { BienesService } from '../services/bienes.service';

import { DynamicField } from '../shared/components/reuzables/dynamic-form/dynamic-form.component';
import {
  ColumnaTabla,
  BotonTabla
} from '../shared/components/reuzables/tabla-dinamica/tabla-dinamica.component';

import { Pedido } from '../interfaces/pedido.model';
import { DocumentosService } from '../services/documentos.service';
import { AlertService } from '../services/presentación/alert.service';

@Injectable({ providedIn: 'root' })
export class PedidosMapper {

  /* =========================
     ESTADO GENERAL
  ========================= */
  pedidos: any[] = [];
  totalPedidos = 0;
  cargando = false;
  error: string | null = null;

  /* =========================
     FORMULARIO
  ========================= */
  mostrarFormulario = false;
  modoFormulario: 'crear' | 'editar' = 'crear';
  pedidoSeleccionado: Pedido | null = null;

  /* =========================
     ARCHIVOS
  ========================= */
  archivos: File[] = [];

  /* =========================
     FORMULARIO DINÁMICO
  ========================= */
  fields: DynamicField[] = [];

  private buscandoAsegurado = false;
  private buscandoBien = false;

  /* =========================
     TABLA
  ========================= */
  columnas: ColumnaTabla[] = [
    { key: 'created_at', label: 'Fecha' },
    { key: 'asegurado_nombre', label: 'Asegurado' },
    { key: 'bien_tipo', label: 'Bien' },
    { key: 'estado', label: 'Estado' },
  ];


  botones: BotonTabla[] = [
    { texto: 'Nuevo pedido', tipo: 'success', evento: 'crear' },
    { texto: 'Editar', tipo: 'primary', evento: 'editar' },
    { texto: 'Eliminar', tipo: 'danger', evento: 'eliminar' },
  ];

  constructor(
    private pedidosService: PedidosService,
    private aseguradosService: AseguradosService,
    private bienesService: BienesService,
    private documentosService: DocumentosService,
    private alert: AlertService
  ) { }

  /* =========================
     INIT
  ========================= */
  async init(): Promise<void> {
    await this.cargarPedidos();
  }

  /* =========================
     CAMPOS
  ========================= */
  definirCamposCrear(): void {
    this.fields = [
      { type: 'text', name: 'cedula', label: 'Cédula', required: true },
      { type: 'text', name: 'nombre', label: 'Nombre', required: true },
      { type: 'text', name: 'apellido', label: 'Apellido', required: true },
      { type: 'email', name: 'correo', label: 'Correo' },

      { type: 'text', name: 'bien_tipo', label: 'Tipo de bien', required: true },
      { type: 'text', name: 'bien_num_serie', label: 'Número de serie', required: true },
      { type: 'number', name: 'anio_fabricacion', label: 'Año de fabricación', required: true },
      { type: 'number', name: 'antiguedad', label: 'Antigüedad (años)', required: true },

      { type: 'textarea', name: 'descripcion', label: 'Descripción del pedido', required: true },

      //  CAMPO DE ARCHIVOS
      {
        type: 'file',
        name: 'archivo',
        label: 'Adjuntar documento'
      }
    ];
  }


  definirCamposEditar(): void {
    this.fields = [
      { type: 'text', name: 'descripcion', label: 'Descripción del pedido', required: true },
    ];
  }

  /* =========================
     CARGA
  ========================= */
  async cargarPedidos(): Promise<void> {
    this.cargando = true;
    this.error = null;

    try {
      const data = await this.pedidosService.listar();

      this.pedidos = data.map(p => ({
        ...p,
        asegurado_nombre: p.asegurado
          ? `${p.asegurado.nombre} ${p.asegurado.apellido}`
          : '',
        bien_tipo: p.bien?.tipo ?? ''
      }));

      this.totalPedidos = this.pedidos.length;
    } catch {
      this.error = 'Error al cargar pedidos';
    } finally {
      this.cargando = false;
    }
  }

  /* =========================
     ACCIONES TABLA
  ========================= */
  manejarAccion(e: { evento: string; fila?: any }): void {
    if (e.evento === 'crear') {
      this.crearPedido();
      return;
    }

    if (!e.fila) return;

    if (e.evento === 'editar') this.editarPedido(e.fila);
    if (e.evento === 'eliminar') this.eliminarPedido(e.fila);
  }

  crearPedido(): void {
    this.modoFormulario = 'crear';
    this.pedidoSeleccionado = null;
    this.archivos = [];
    this.definirCamposCrear();
    this.mostrarFormulario = true;
  }

  editarPedido(pedido: Pedido): void {
    this.modoFormulario = 'editar';
    this.pedidoSeleccionado = pedido;
    this.archivos = [];
    this.definirCamposEditar();
    this.mostrarFormulario = true;
  }


  /* =========================
     ARCHIVOS
  ========================= */
  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    for (let i = 0; i < input.files.length; i++) {
      this.archivos.push(input.files[i]);
    }

    input.value = '';
  }

  quitarArchivo(file: File): void {
    this.archivos = this.archivos.filter(f => f !== file);
  }

  /* =========================
     AUTOCOMPLETADOS
  ========================= */
  async manejarCambioFormulario(e: {
    field: string;
    value: any;
    form: FormGroup;
  }): Promise<void> {

    if (this.modoFormulario !== 'crear') return;

    /* ================= ASEGURADO ================= */
    if (e.field === 'cedula' && e.value?.length >= 10 && !this.buscandoAsegurado) {
      this.buscandoAsegurado = true;

      try {
        const asegurado = await this.aseguradosService.obtenerPorCedula(e.value);

        if (asegurado) {
          // ✔ existe → autocompleta
          e.form.patchValue({
            nombre: asegurado.nombre,
            apellido: asegurado.apellido,
            correo: asegurado.correo,
          }, { emitEvent: false });

          // ✔ no exigir manual
          ['nombre', 'apellido'].forEach(campo => {
            e.form.get(campo)?.clearValidators();
            e.form.get(campo)?.updateValueAndValidity({ emitEvent: false });
          });

        } else {
          // ✔ no existe → exigir llenado manual
          ['nombre', 'apellido'].forEach(campo => {
            e.form.get(campo)?.setValidators([Validators.required]);
            e.form.get(campo)?.updateValueAndValidity({ emitEvent: false });
          });
        }

      } finally {
        this.buscandoAsegurado = false;
      }
    }

    /* ================= BIEN ================= */
    if (e.field === 'bien_num_serie' && e.value?.length >= 4 && !this.buscandoBien) {
      this.buscandoBien = true;

      try {
        const bien = await this.bienesService.obtenerPorNumeroSerie(e.value);

        if (bien) {
          // ✔ existe → autocompleta
          e.form.patchValue({
            bien_tipo: bien.tipo,
            anio_fabricacion: bien.anio_fabricacion,
            antiguedad: bien.antiguedad,
          }, { emitEvent: false });

          // ✔ no exigir manual
          ['bien_tipo', 'anio_fabricacion', 'antiguedad'].forEach(campo => {
            e.form.get(campo)?.clearValidators();
            e.form.get(campo)?.updateValueAndValidity({ emitEvent: false });
          });

        } else {
          // ✔ no existe → exigir llenado manual
          ['bien_tipo', 'anio_fabricacion', 'antiguedad'].forEach(campo => {
            e.form.get(campo)?.setValidators([Validators.required]);
            e.form.get(campo)?.updateValueAndValidity({ emitEvent: false });
          });
        }

      } finally {
        this.buscandoBien = false;
      }
    }
  }


  /* =========================
     RESOLVERS
  ========================= */
  private async resolverAsegurado(v: any): Promise<string> {
    const existente = await this.aseguradosService.obtenerPorCedula(v.cedula);
    if (existente) return existente.id;

    const creado = await this.aseguradosService.crear({
      cedula: v.cedula,
      nombre: v.nombre,
      apellido: v.apellido,
      correo: v.correo ?? null,
      activo: true,
    });

    return creado.id;
  }

  private async resolverBien(v: any): Promise<string> {
    const existente = await this.bienesService.obtenerPorNumeroSerie(v.bien_num_serie);
    if (existente) return existente.id;

    const creado = await this.bienesService.crear({
      tipo: v.bien_tipo,
      num_serie: v.bien_num_serie,
      anio_fabricacion: v.anio_fabricacion,
      antiguedad: v.antiguedad,
    });

    return creado.id;
  }

  /* =========================
     SUBMIT
  ========================= */
  async recibirFormulario(v: any): Promise<void> {

    console.log('INICIO recibirFormulario');
    console.log('Modo formulario:', this.modoFormulario);
    console.log('Archivos recibidos en mapper:', this.archivos);

    // CREAR PEDIDO
    if (this.modoFormulario === 'crear') {

      console.log('Entrando a CREAR');

      const usuarioRaw = localStorage.getItem('usuario');
      console.log('Usuario raw:', usuarioRaw);

      const usuario = JSON.parse(usuarioRaw!);
      console.log('Usuario parseado:', usuario);

      // resolver asegurado
      console.log('Resolviendo asegurado');
      const aseguradoId = await this.resolverAsegurado(v);
      console.log('Asegurado ID:', aseguradoId);

      // resolver bien
      console.log('Resolviendo bien');
      const bienId = await this.resolverBien(v);
      console.log('Bien ID:', bienId);

      // crear pedido
      console.log('Creando pedido');
      const pedido = await this.pedidosService.crear({
        usuario_id: usuario.id,
        asegurado_id: aseguradoId,
        bien_id: bienId,
        descripcion: v.descripcion
      });

      console.log('Pedido creado:', pedido);

      if (!pedido || !pedido.id) {
        console.error('Pedido inválido, no tiene ID');
        throw new Error('Pedido no creado');
      }

      // subir documentos
      console.log('Iniciando subida de documentos');

      if (!this.archivos.length) {
        console.warn('No hay archivos para subir');
      }

      for (const file of this.archivos) {
        console.log('Subiendo archivo:', {
          nombre: file.name,
          tipo: file.type,
          size: file.size
        });

        await this.documentosService.subirDocumento(file, {
          entidad: 'pedido',
          entidad_id: pedido.id,
          tipo_documento: 'Documento pedido'
        });

        console.log('Archivo subido:', file.name);
      }
    }

    // EDITAR PEDIDO
    if (this.modoFormulario === 'editar' && this.pedidoSeleccionado) {

      console.log('Entrando a EDITAR');
      console.log('Pedido seleccionado:', this.pedidoSeleccionado.id);

      await this.pedidosService.editar(
        this.pedidoSeleccionado.id,
        { descripcion: v.descripcion }
      );
    }

    console.log('Cerrando formulario');
    this.cerrarFormulario(true);
  }



  cerrarFormulario(recargar = false): void {
    this.mostrarFormulario = false;
    this.pedidoSeleccionado = null;
    this.archivos = [];

    if (recargar) {
      this.cargarPedidos();
    }
  }

  async eliminarPedido(pedido: Pedido): Promise<void> {
  // Regla de negocio
  if (pedido.estado !== 'Abierto') {
    this.alert.warning(
      'Pedido en uso o este pedido ya no se puede borrar'
    );
    return;
  }

  // Eliminación real
  await this.pedidosService.eliminar(pedido.id);

  // efrescar lista
  await this.cargarPedidos();
}

}
