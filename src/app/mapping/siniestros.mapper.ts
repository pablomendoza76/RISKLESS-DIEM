  import { Injectable } from '@angular/core';
  import { FormGroup } from '@angular/forms';

  import { SiniestrosService } from '../services/siniestros.service';
  import { PedidosService } from '../services/pedidos.service';

  import { DynamicField } from '../shared/components/reuzables/dynamic-form/dynamic-form.component';
  import {
    ColumnaTabla,
    BotonTabla
  } from '../shared/components/reuzables/tabla-dinamica/tabla-dinamica.component';

  import { Siniestro } from '../interfaces/siniestro.model';
  import { PolizasService } from '../services/polizas.service';
  import { EmailService } from '../services/envio/email.service';
  import { SiniestroPdfMapper } from '../mapping/siniestro-pdf.mapper';


  @Injectable({ providedIn: 'root' })
  export class SiniestrosMapper {

    /* =========================
      ESTADO GENERAL
    ========================= */
    siniestros: any[] = [];
    totalSiniestros = 0;
    pedidos: any[] = [];
    polizas: any[] = [];
    cargando = false;
    error: string | null = null;

    /* =========================
      FORMULARIO
    ========================= */
    mostrarFormulario = false;
    modoFormulario: 'crear' | 'editar' = 'crear';
    siniestroSeleccionado: Siniestro | null = null;

    /* =========================
      FORMULARIO DINÁMICO
    ========================= */
    fields: DynamicField[] = [];

    /* =========================
      TABLA
    ========================= */
    columnas: ColumnaTabla[] = [
      { key: 'fecha_siniestro', label: 'Fecha' },
      { key: 'monto_danio', label: 'Monto daño' },
      { key: 'estado', label: 'Estado' },
    ];

    botones: BotonTabla[] = [
      { texto: '+ Nuevo siniestro', tipo: 'success', evento: 'crear' },
      { texto: 'Editar', tipo: 'primary', evento: 'editar' },
      { texto: 'Eliminar', tipo: 'danger', evento: 'eliminar' },
    ];


    constructor(
      private siniestrosService: SiniestrosService,
      private pedidosService: PedidosService,
      private polizasService: PolizasService,
      private emailService: EmailService
    ) { }

    /* =========================
      INIT
    ========================= */
    async init(): Promise<void> {
      await this.cargarPedidos();
      await this.cargarSiniestros();
      await this.cargarPolizas();
    }

    async cargarPolizas(): Promise<void> {
      this.polizas = await this.polizasService.listar();
    }


    /* =========================
      DEFINICIÓN DE CAMPOS
    ========================= */

    definirCamposBase(): DynamicField[] {
      return [
        // ===== INFO DEL PEDIDO (SOLO LECTURA LÓGICA) =====
        { type: 'text', name: 'asegurado', label: 'Asegurado' },
        { type: 'text', name: 'bien', label: 'Bien asegurado' },
        {
          type: 'textarea',
          name: 'descripcion_pedido',
          label: 'Descripción del pedido'
        },

        // ===== DATOS DEL SINIESTRO =====
        { type: 'number', name: 'monto_danio', label: 'Monto del daño' },
        { type: 'number', name: 'deducible', label: 'Deducible' },
        {
          type: 'textarea',
          name: 'descripcion_siniestro',
          label: 'Descripción del siniestro'
        },

        // ===== DATOS DEL PROVEEDOR (OPCIONALES) =====
        { type: 'text', name: 'proveedor_nombre', label: 'Proveedor' },
        { type: 'text', name: 'proveedor_direccion', label: 'Dirección proveedor' },
        { type: 'text', name: 'proveedor_telefono', label: 'Teléfono proveedor' },
        { type: 'text', name: 'proveedor_correo', label: 'Correo proveedor' },
      ];
    }


    definirCamposCrear(): void {
      this.fields = [
        {
          type: 'select',
          name: 'pedido_id',
          label: 'Pedido',
          required: true,
          options: this.pedidos.map(p => ({
            label: `Pedido ${p.id.slice(0, 6)}`,
            value: p.id
          }))
        },
        {
          type: 'select',
          name: 'poliza_id',
          label: 'Póliza',
          required: true,
          options: this.polizas.map(p => ({
            label: `${p.num_poliza} · ${p.aseguradora}`,
            value: p.id
          }))
        },
        ...this.definirCamposBase()
      ];
    }

    definirCamposEditar(): void {
      this.fields = [
        {
          type: 'select',
          name: 'pedido_id',
          label: 'Pedido',
          required: true,
          options: this.pedidos.map(p => ({
            label: `Pedido ${p.id.slice(0, 6)}`,
            value: p.id
          }))
        },
        {
          type: 'select',
          name: 'poliza_id',
          label: 'Póliza',
          required: true,
          options: this.polizas.map(p => ({
            label: `${p.num_poliza} · ${p.aseguradora}`,
            value: p.id
          }))
        },
        ...this.definirCamposBase(),
        {
          type: 'select',
          name: 'estado',
          label: 'Estado',
          required: true,
          options: [
            { label: 'Reportado', value: 'Reportado' },
            { label: 'En proceso', value: 'En proceso' },
            { label: 'Aprobado', value: 'Aprobado' },
            { label: 'Rechazado', value: 'Rechazado' },
          ],
        }
      ];
    }


    /* =========================
      CARGA DE DATOS
    ========================= */
    async cargarSiniestros(): Promise<void> {
      this.cargando = true;
      try {
        const data = await this.siniestrosService.listar();
        this.siniestros = data;
        this.totalSiniestros = data.length;
      } catch {
        this.error = 'Error al cargar siniestros';
      } finally {
        this.cargando = false;
      }
    }

    async cargarPedidos(): Promise<void> {
      this.pedidos = await this.pedidosService.listar();
    }

    /* =========================
      ACCIONES
    ========================= */
    manejarAccion(e: { evento: string; fila?: any }): void {
      if (e.evento === 'crear') return this.crearSiniestro();
      if (!e.fila) return;

      if (e.evento === 'editar') this.editarSiniestro(e.fila);
      if (e.evento === 'eliminar') this.eliminarSiniestro(e.fila);
    }

    crearSiniestro(): void {
      this.modoFormulario = 'crear';
      this.siniestroSeleccionado = null;
      this.definirCamposCrear();
      this.mostrarFormulario = true;
    }

    editarSiniestro(s: any): void {
      this.modoFormulario = 'editar';
      this.siniestroSeleccionado = s;
      this.definirCamposEditar();
      this.mostrarFormulario = true;

      // esperar a que el form exista
      setTimeout(() => {
        const pedidoId = s.pedido_id;

        if (!pedidoId) return;

        const pedido = this.pedidos.find(p => p.id === pedidoId);
        if (!pedido) return;

        this.siniestroSeleccionado = {
          ...s,
          pedido_id: pedidoId,
          asegurado: `${pedido.asegurado.nombre} ${pedido.asegurado.apellido}`,
          bien: `${pedido.bien.tipo} (${pedido.bien.num_serie})`,
          descripcion_pedido: pedido.descripcion,
          proveedor_nombre: s.proveedor_nombre ?? null,
          proveedor_direccion: s.proveedor_direccion ?? null,
          proveedor_telefono: s.proveedor_telefono ?? null,
          proveedor_correo: s.proveedor_correo ?? null,
        };
      });
    }

    /* =========================
      AUTOCOMPLETADO POR PEDIDO
    ========================= */
    async manejarCambioFormulario(e: {
      field: string;
      value: any;
      form: FormGroup;
    }): Promise<void> {

      // Solo reaccionamos al seleccionar un pedido
      if (e.field !== 'pedido_id') return;

      // Buscamos el pedido REAL (según tu JSON)
      const pedido = this.pedidos.find(p => p.id === e.value);
      if (!pedido) return;

      e.form.patchValue({
        // Asegurado
        asegurado: pedido.asegurado
          ? `${pedido.asegurado.nombre} ${pedido.asegurado.apellido}`
          : '',

        // Bien
        bien: pedido.bien
          ? `${pedido.bien.tipo} (${pedido.bien.num_serie})`
          : '',

        // Descripción del pedido
        descripcion_pedido: pedido.descripcion ?? ''
      }, { emitEvent: false });
    }


    /* =========================
      GUARDAR
    ========================= */
    async recibirFormulario(form: FormGroup): Promise<void> {
  const v = form.value;

  // CREAR SINIESTRO
  if (this.modoFormulario === 'crear') {

    const siniestroCreado = await this.siniestrosService.crearDesdePedido({
      pedido_id: v.pedido_id,
      poliza_id: v.poliza_id,
      fecha_siniestro: new Date().toISOString().substring(0, 10),
      monto_danio:
        v.monto_danio === '' || v.monto_danio === undefined
          ? null
          : Number(v.monto_danio),
      deducible:
        v.deducible === '' || v.deducible === undefined
          ? null
          : Number(v.deducible),
      descripcion_siniestro: v.descripcion_siniestro || null,
      proveedor_nombre: v.proveedor_nombre || null,
      proveedor_direccion: v.proveedor_direccion || null,
      proveedor_telefono: v.proveedor_telefono || null,
      proveedor_correo: v.proveedor_correo || null,
    });

    // generar pdf del siniestro
    const pdfBase64 = SiniestroPdfMapper.generar(siniestroCreado);

    // mensaje del correo
    const mensajeHtml = `
      <p>Buenos días,</p>
      <p>Nos comunicamos del departamento encargado del manejo de seguros de bienes UTPL.</p>
      <p>Se ha registrado un nuevo siniestro y se requiere su revisión.</p>
      <p>La información completa se encuentra adjunta en el documento PDF.</p>
      <p>Atentamente,<br/>Sistema de Gestión de Siniestros</p>
    `;

    // enviar correo fijo
    await this.emailService.sendSiniestroCorreo(
      'pm911394@gmail.com',
      'Notificación de siniestro',
      mensajeHtml,
      pdfBase64
    );
  }

  // EDITAR SINIESTRO
  if (this.modoFormulario === 'editar' && this.siniestroSeleccionado) {

    await this.siniestrosService.editar(
      this.siniestroSeleccionado.id,
      {
        estado: v.estado,
        monto_danio:
          v.monto_danio === '' || v.monto_danio === undefined
            ? null
            : Number(v.monto_danio),
        deducible:
          v.deducible === '' || v.deducible === undefined
            ? null
            : Number(v.deducible),
        descripcion_siniestro: v.descripcion_siniestro || null,
        proveedor_nombre: v.proveedor_nombre || null,
        proveedor_direccion: v.proveedor_direccion || null,
        proveedor_telefono: v.proveedor_telefono || null,
        proveedor_correo: v.proveedor_correo || null,
      }
    );
  }

  // cerrar formulario y recargar
  this.cerrarFormulario(true);
}



    cerrarFormulario(recargar = false): void {
      this.mostrarFormulario = false;
      this.siniestroSeleccionado = null;
      if (recargar) this.cargarSiniestros();
    }

    async eliminarSiniestro(s: Siniestro): Promise<void> {
      await this.siniestrosService.eliminar(s.id);
      await this.cargarSiniestros();
    }
  }
