import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FacturacionService } from '../services/facturacion.service';
import { SiniestrosService } from '../services/siniestros.service';

import { Factura } from '../interfaces/facturación.model';
import { Siniestro } from '../interfaces/siniestro.model';

import { DynamicField } from '../shared/components/reuzables/dynamic-form/dynamic-form.component';
import {
  ColumnaTabla,
  BotonTabla
} from '../shared/components/reuzables/tabla-dinamica/tabla-dinamica.component';

@Injectable({ providedIn: 'root' })
export class FacturacionMapper {

  /* =========================
     ESTADO GENERAL
  ========================= */
  facturas: Factura[] = [];
  siniestros: Siniestro[] = [];
  totalFacturas = 0;
  formData: any = null;
  cargando = false;
  error: string | null = null;

  /* =========================
     FORMULARIO
  ========================= */
  mostrarFormulario = false;
  modoFormulario: 'crear' | 'editar' = 'crear';
  facturaSeleccionada: Factura | null = null;

  /* =========================
     FORMULARIO DINÁMICO
  ========================= */
  fields: DynamicField[] = [];

  /* =========================
     TABLA
  ========================= */
  columnas: ColumnaTabla[] = [
    { key: 'fecha_pago', label: 'Fecha pago' },
    { key: 'monto_cancelado', label: 'Monto pagado' },
    { key: 'porcentaje_descuento', label: 'Descuento %' },
  ];

  botones: BotonTabla[] = [
    { texto: '+ Nueva factura', tipo: 'success', evento: 'crear' },
    { texto: 'Editar', tipo: 'primary', evento: 'editar' },
  ];


  constructor(
    private facturacionService: FacturacionService,
    private siniestrosService: SiniestrosService
  ) { }

  /* =========================
     INIT
  ========================= */
  async init(): Promise<void> {
    await this.cargarSiniestros();
    await this.cargarFacturas();
  }

  /* =========================
     CAMPOS FORMULARIO
  ========================= */
  definirCamposCrear(): void {
    const soloLectura = this.modoFormulario === 'editar';

    this.fields = [
      {
        type: 'select',
        name: 'siniestro_id',
        label: 'Siniestro',
        required: true,
        disabled: soloLectura,
        options: this.siniestros.map(s => ({
          label: `Siniestro ${s.id.slice(0, 6)}`,
          value: s.id
        }))
      },

      { type: 'text', name: 'asegurado', label: 'Asegurado', disabled: true },
      { type: 'text', name: 'bien', label: 'Bien asegurado', disabled: true },
      { type: 'date', name: 'fecha_siniestro', label: 'Fecha siniestro', disabled: true },

      { type: 'number', name: 'monto_siniestro', label: 'Monto siniestro', disabled: true },
      { type: 'number', name: 'monto_calculado', label: 'Monto calculado', disabled: true },

      { type: 'number', name: 'monto_cancelado', label: 'Monto cancelado', required: true },
      { type: 'number', name: 'porcentaje_descuento', label: 'Descuento %', disabled: true },

      { type: 'file', name: 'evidencias', label: 'Evidencias' },
    ];
  }


  definirCamposEditar(): void {
    this.fields = [
      { type: 'number', name: 'monto_cancelado', label: 'Monto cancelado', required: true },
      { type: 'number', name: 'porcentaje_descuento', label: 'Descuento %' },
      { type: 'file', name: 'evidencias', label: 'Evidencias' },
    ];
  }

  /* =========================
     CARGA DE DATOS
  ========================= */
  async cargarFacturas(): Promise<void> {
    const data = await this.facturacionService.listar();
    this.facturas = data;
    this.totalFacturas = data.length;
  }

  async cargarSiniestros(): Promise<void> {
    this.siniestros = await this.siniestrosService.listar();
  }

  /* =========================
     ACCIONES TABLA
  ========================= */
  manejarAccion(e: { evento: string; fila?: Factura }): void {

    if (e.evento === 'crear') {
      this.crearFactura();
      return;
    }

    if (!e.fila) return;

    if (e.evento === 'editar') {
      this.editarFactura(e.fila);
    }
  }

  crearFactura(): void {
    this.modoFormulario = 'crear';
    this.facturaSeleccionada = null;
    this.definirCamposCrear();
    this.mostrarFormulario = true;
  }

  editarFactura(f: Factura): void {
    this.modoFormulario = 'editar';
    this.facturaSeleccionada = f;

    this.definirCamposCrear();
    this.mostrarFormulario = true;

    setTimeout(() => {
      if (!f.siniestro_id) return;

      const s = this.siniestros.find(x => x.id === f.siniestro_id);
      if (!s) return;

      const montoDanio = Number(s.monto_danio ?? 0);

      const { descuento, montoCalculado } =
        this.calcularDescuentoPorFecha(
          f.created_at ?? null,
          montoDanio
        );

      this.formData = {
        siniestro_id: f.siniestro_id,

        asegurado: s.pedido?.asegurado
          ? `${s.pedido.asegurado.nombre} ${s.pedido.asegurado.apellido}`
          : '',

        bien: s.pedido?.bien
          ? `${s.pedido.bien.tipo} (${s.pedido.bien.num_serie})`
          : '',

        fecha_siniestro: s.fecha_siniestro,

        monto_siniestro: montoDanio,
        monto_calculado: montoCalculado,   // ✅ YA CON DESCUENTO
        porcentaje_descuento: descuento,   // ✅ 10 SI <= 7 DÍAS

        monto_cancelado: f.monto_cancelado
      };
    });
  }





  /* =========================
     AUTOCOMPLETADO SINIESTRO
  ========================= */
  manejarCambioFormulario(e: {
    field: string;
    value: any;
    form: FormGroup;
  }): void {

    /* =========================
       SELECCIÓN DE SINIESTRO
       (SOLO CREAR)
    ========================= */
    if (e.field === 'siniestro_id' && this.modoFormulario === 'crear') {

      const s = this.siniestros.find(x => x.id === e.value);
      if (!s) return;

      const montoDanio = Number(s.monto_danio ?? 0);

      e.form.patchValue({
        asegurado: s.pedido?.asegurado
          ? `${s.pedido.asegurado.nombre} ${s.pedido.asegurado.apellido}`
          : '',
        bien: s.pedido?.bien
          ? `${s.pedido.bien.tipo} (${s.pedido.bien.num_serie})`
          : '',
        fecha_siniestro: s.fecha_siniestro,
        monto_siniestro: montoDanio,
        monto_calculado: montoDanio,
        porcentaje_descuento: 0
      }, { emitEvent: false });

      return;
    }

    /* =========================
       DESCUENTO PRONTO PAGO
       (SOLO EDITAR)
    ========================= */
    if (
      this.modoFormulario === 'editar' &&
      this.facturaSeleccionada &&
      (e.field === 'monto_cancelado' || e.field === 'init')
    ) {

      const montoSiniestro =
        Number(e.form.get('monto_siniestro')?.value ?? 0);

      let descuento = 0;
      let montoCalculado = montoSiniestro;

      if (this.facturaSeleccionada.created_at) {

        const fechaCreacion = new Date(this.facturaSeleccionada.created_at);
        const hoy = new Date();

        const dias =
          (hoy.getTime() - fechaCreacion.getTime()) /
          (1000 * 60 * 60 * 24);

        if (dias <= 7 && Number(e.form.get('monto_cancelado')?.value) > 0) {
          descuento = 10;
          montoCalculado = montoSiniestro * 0.9;
        }
      }

      e.form.patchValue({
        porcentaje_descuento: descuento,
        monto_calculado: montoCalculado
      }, { emitEvent: false });
    }
  }



  /* =========================
     GUARDAR
  ========================= */
  async recibirFormulario(form: FormGroup): Promise<void> {
    const v = form.value;

    // CREAR FACTURA
    if (this.modoFormulario === 'crear') {

      await this.facturacionService.crear({
        // relación
        siniestro_id: v.siniestro_id,

        // OBLIGATORIO EN BD
        monto_facturado: Number(v.monto_siniestro),

        // datos de pago
        monto_cancelado: Number(v.monto_cancelado),
        porcentaje_descuento: Number(v.porcentaje_descuento || 0),

        // fecha automática
        fecha_pago: new Date().toISOString().substring(0, 10),
      });
    }

    // EDITAR FACTURA
    if (this.modoFormulario === 'editar' && this.facturaSeleccionada) {

      await this.facturacionService.editar(
        this.facturaSeleccionada.id,
        {
          monto_cancelado: Number(v.monto_cancelado),
          porcentaje_descuento: Number(v.porcentaje_descuento || 0),
        }
      );
    }

    // cerrar y refrescar
    this.cerrarFormulario(true);
  }

  cerrarFormulario(recargar = false): void {
    this.mostrarFormulario = false;
    this.facturaSeleccionada = null;
    if (recargar) this.cargarFacturas();
  }

  private calcularDescuentoPorFecha(
    fechaCreacion: string | null,
    montoBase: number
  ): { descuento: number; montoCalculado: number } {

    if (!fechaCreacion) {
      return { descuento: 0, montoCalculado: montoBase };
    }

    const inicio = new Date(fechaCreacion);
    const hoy = new Date();

    const dias =
      (hoy.getTime() - inicio.getTime()) /
      (1000 * 60 * 60 * 24);

    if (dias <= 7) {
      return {
        descuento: 10,
        montoCalculado: montoBase * 0.9
      };
    }

    return {
      descuento: 0,
      montoCalculado: montoBase
    };
  }


}
