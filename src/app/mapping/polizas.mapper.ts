import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { PolizasService } from '../services/polizas.service';
import { ClausulasService } from '../services/clausulas.service';
import { PolizaClausulaService } from '../services/poliza-clausula.service';
import { DocumentosService } from '../services/documentos.service';

import { Poliza } from '../interfaces/poliza.model';
import { Clausula } from '../interfaces/clausula.model';
import { Documento } from '../interfaces/documento.model';

import { DynamicField } from '../shared/components/reuzables/dynamic-form/dynamic-form.component';
import {
  ColumnaTabla,
  BotonTabla
} from '../shared/components/reuzables/tabla-dinamica/tabla-dinamica.component';
import { SupabaseService } from '../services/supabase.service';

@Injectable({
  providedIn: 'root',
})
export class PolizasMapper {

  /* =========================
     ESTADO GENERAL
  ========================= */
  polizas: Poliza[] = [];
  totalPolizas = 0;

  cargando = false;
  error: string | null = null;

  /* =========================
     FORMULARIO PÓLIZA
  ========================= */
  mostrarFormulario = false;
  modoFormulario: 'crear' | 'editar' = 'crear';
  polizaSeleccionada: Poliza | null = null;

  /* =========================
     CLÁUSULAS
  ========================= */
  clausulas: Clausula[] = [];
  clausulasSeleccionadas: string[] = [];

  /* =========================
     DOCUMENTOS
  ========================= */
  documentos: Documento[] = [];
  archivoSeleccionado: File | null = null;

  /* =========================
     FORMULARIO DINÁMICO
  ========================= */
  fields: DynamicField[] = [];

  /* =========================
     TABLA
  ========================= */
  columnas: ColumnaTabla[] = [
    { key: 'num_poliza', label: 'N° Póliza' },
    { key: 'aseguradora', label: 'Aseguradora' },
    { key: 'valor_asegurado', label: 'Valor asegurado' },
    { key: 'estado', label: 'Estado' },
    { key: 'fecha_inicio', label: 'Inicio' },
    { key: 'fecha_fin', label: 'Fin' },
  ];

  botones: BotonTabla[] = [
    
    { texto: 'Editar', tipo: 'primary', evento: 'editar' },
    { texto: 'Eliminar', tipo: 'danger', evento: 'eliminar' },
  ];

  constructor(
    private polizasService: PolizasService,
    private clausulasService: ClausulasService,
    private polizaClausulaService: PolizaClausulaService,
    private documentosService: DocumentosService,
    private supabase: SupabaseService
  ) {}

  /* =========================
     INIT
  ========================= */
  async init(): Promise<void> {
    this.definirCamposFormulario();
    await this.cargarClausulas();
    await this.cargarPolizas();
  }

  /* =========================
     FORMULARIO
  ========================= */
  definirCamposFormulario(): void {
    this.fields = [
      { type: 'text', name: 'num_poliza', label: 'Número de póliza', required: true },
      { type: 'text', name: 'aseguradora', label: 'Aseguradora', required: true },
      { type: 'number', name: 'valor_asegurado', label: 'Valor asegurado', required: true },
      {
        type: 'select',
        name: 'estado',
        label: 'Estado',
        required: true,
        options: [
          { label: 'Activa', value: 'Activa' },
          { label: 'Vencida', value: 'Vencida' },
          { label: 'Cancelada', value: 'Cancelada' },
        ],
      },
      
    ];
  }



 getUsuarioLogueadoId(): string {
  const raw = localStorage.getItem('usuario');

  if (!raw) {
    throw new Error('Usuario no autenticado (sin store)');
  }

  const usuario = JSON.parse(raw);

  if (!usuario?.id) {
    throw new Error('Usuario inválido en store');
  }

  return usuario.id; // ✅ UUID REAL
}




  /* =========================
     CARGA DE DATOS
  ========================= */
  async cargarPolizas(): Promise<void> {
    this.cargando = true;
    this.error = null;

    try {
      const data = await this.polizasService.listar();
      this.polizas = data;
      this.totalPolizas = data.length;
    } catch (e) {
      console.error(e);
      this.error = 'Error al cargar pólizas';
    } finally {
      this.cargando = false;
    }
  }

  async cargarClausulas(): Promise<void> {
    this.clausulas = await this.clausulasService.listar();
  }

  async cargarDocumentos(polizaId: string): Promise<void> {
    this.documentos = await this.documentosService.listarPorEntidad(
      'poliza',
      polizaId
    );
  }

  /* =========================
     ACCIONES TABLA
  ========================= */
  manejarAccion(e: { evento: string; fila?: any }): void {

    if (e.evento === 'crear') {
      this.crearPoliza();
      return;
    }

    if (!e.fila) return;

    if (e.evento === 'editar') this.editarPoliza(e.fila);
    if (e.evento === 'eliminar') this.eliminarPoliza(e.fila);
    if (e.evento === 'documentos') this.verDocumentos(e.fila);
  }

  /* =========================
     CRUD PÓLIZAS
  ========================= */
  crearPoliza(): void {
    this.modoFormulario = 'crear';
    this.polizaSeleccionada = null;
    this.clausulasSeleccionadas = [];
    this.mostrarFormulario = true;
  }

  editarPoliza(poliza: Poliza): void {
    this.modoFormulario = 'editar';
    this.polizaSeleccionada = poliza;
    this.mostrarFormulario = true;
  }

  async recibirFormulario(form: FormGroup): Promise<void> {
    const payload = form.value;
    let polizaId: string;

    if (this.modoFormulario === 'crear') {
      const poliza = await this.polizasService.crear(payload);
      polizaId = poliza.id;

      // Asignar cláusulas
      for (const clausulaId of this.clausulasSeleccionadas) {
        await this.polizaClausulaService.asignar(polizaId, clausulaId);
      }
    }

    if (this.modoFormulario === 'editar' && this.polizaSeleccionada) {
      await this.polizasService.editar(this.polizaSeleccionada.id, payload);
      polizaId = this.polizaSeleccionada.id;
    }

    this.cerrarFormulario(true);
  }

  cerrarFormulario(recargar = false): void {
    this.mostrarFormulario = false;
    this.polizaSeleccionada = null;
    this.clausulasSeleccionadas = [];

    if (recargar) {
      this.cargarPolizas();
    }
  }

  async eliminarPoliza(poliza: Poliza): Promise<void> {
    await this.polizasService.eliminar(poliza.id);
    await this.cargarPolizas();
  }

  /* =========================
     DOCUMENTOS
  ========================= */
  async verDocumentos(poliza: Poliza): Promise<void> {
    this.polizaSeleccionada = poliza;
    await this.cargarDocumentos(poliza.id);
  }

async crearPolizaCompleta(payload: {
  poliza: Omit<Poliza, 'id' | 'created_at'>;
  clausulasNuevas: { titulo: string; descripcion: string }[];
  documentos: File[];
}): Promise<void> {

  try {
    this.cargando = true;

    /* =====================
       1. CREAR PÓLIZA
    ===================== */
    const poliza = await this.polizasService.crear(payload.poliza);
    const polizaId = poliza.id;

    /* =====================
       2. CREAR CLÁUSULAS
    ===================== */
    for (const clausula of payload.clausulasNuevas) {
      const nueva = await this.clausulasService.crear({
        titulo: clausula.titulo,
        descripcion: clausula.descripcion,
      });

      await this.polizaClausulaService.asignar(
        polizaId,
        nueva.id
      );
    }

    /* =====================
       3. SUBIR DOCUMENTOS
       (el usuario se resuelve
        DENTRO del service)
    ===================== */
    for (const file of payload.documentos) {
      await this.documentosService.subirDocumento(file, {
        entidad: 'poliza',
        entidad_id: polizaId,
        tipo_documento: 'Documento póliza'
      });
    }

    /* =====================
       4. REFRESCAR
    ===================== */
    await this.cargarPolizas();

  } catch (error) {
    console.error(error);
    this.error = 'Error al crear la póliza completa';
    throw error;
  } finally {
    this.cargando = false;
  }
}



  eliminarDocumento(doc: Documento): Promise<void> {
    return this.documentosService.eliminar(doc);
  }

  obtenerUrlDocumento(doc: Documento): string {
    return this.documentosService.obtenerUrl(doc.ruta_storage);
  }

  // poliza form
  /* =========================
   CREAR PÓLIZA DESDE VISTA
   (con cláusulas nuevas + documentos)
========================= */


}
