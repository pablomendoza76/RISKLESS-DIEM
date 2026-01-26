import { Injectable } from '@angular/core'
import { FormGroup } from '@angular/forms'

import { BienesService } from '../services/bienes.service'
import { Bien } from '../interfaces/bien.model'

import { DynamicField } from '../shared/components/reuzables/dynamic-form/dynamic-form.component'
import {
  ColumnaTabla,
  BotonTabla
} from '../shared/components/reuzables/tabla-dinamica/tabla-dinamica.component'

@Injectable({
  providedIn: 'root',
})
export class BienesMapper {

  bienes: Bien[] = []
  totalBienes = 0

  cargando = false
  error: string | null = null

  mostrarFormulario = false
  modoFormulario: 'crear' | 'editar' = 'crear'
  bienSeleccionado: any | null = null

  fields: DynamicField[] = []

  mostrarCustodio = false

  columnas: ColumnaTabla[] = [
    { key: 'tipo', label: 'Tipo' },
    { key: 'num_serie', label: 'N° Serie' },
    { key: 'anio_fabricacion', label: 'Año fabricación' },
    { key: 'antiguedad', label: 'Antigüedad (años)' },
    { key: 'custodio_nombre_completo', label: 'Custodio' },
  ]

  botones: BotonTabla[] = [
    { texto: 'Nuevo bien', tipo: 'success', evento: 'crear' },
    { texto: 'Editar', tipo: 'primary', evento: 'editar' },
    { texto: 'Eliminar', tipo: 'danger', evento: 'eliminar' },
  ]

  constructor(
    private bienesService: BienesService
  ) {}

  async init(): Promise<void> {
    this.definirCamposFormulario()
    await this.cargarBienes()
  }

  definirCamposFormulario(): void {
    this.fields = [
      { type: 'text', name: 'tipo', label: 'Tipo de bien', required: true },
      { type: 'text', name: 'num_serie', label: 'Número de serie', required: true },
      { type: 'number', name: 'anio_fabricacion', label: 'Año de fabricación', required: true },
      { type: 'number', name: 'antiguedad', label: 'Antigüedad (años)', required: true },
      { type: 'checkbox', name: 'agregar_custodio', label: 'Agregar custodio' },
    ]

    if (this.mostrarCustodio) {
      this.fields.push(
        { type: 'text', name: 'custodio_nombre', label: 'Nombre custodio', required: true },
        { type: 'text', name: 'custodio_apellido', label: 'Apellido custodio', required: true },
        { type: 'email', name: 'custodio_correo', label: 'Correo institucional' },
        { type: 'text', name: 'custodio_departamento', label: 'Departamento' },
        { type: 'text', name: 'custodio_area', label: 'Área' }
      )
    }
  }

  async cargarBienes(): Promise<void> {
    this.cargando = true
    this.error = null

    try {
      const data = await this.bienesService.listar()

      this.bienes = data.map(bien => ({
        ...bien,
        custodio_nombre_completo: bien.custodio
          ? `${bien.custodio.nombre} ${bien.custodio.apellido}`
          : 'Sin custodio'
      }))

      this.totalBienes = this.bienes.length
    } catch {
      this.error = 'Error al cargar bienes'
    } finally {
      this.cargando = false
    }
  }

  manejarAccion(e: { evento: string; fila?: any }): void {
    if (e.evento === 'crear') {
      this.crearBien()
      return
    }

    if (!e.fila) return

    if (e.evento === 'editar') this.editarBien(e.fila)
    if (e.evento === 'eliminar') this.eliminarBien(e.fila)
  }

  crearBien(): void {
    this.modoFormulario = 'crear'
    this.mostrarCustodio = false

    this.bienSeleccionado = {
      agregar_custodio: false
    }

    this.definirCamposFormulario()
    this.mostrarFormulario = true
  }

  editarBien(bien: any): void {
    this.modoFormulario = 'editar'

    this.mostrarCustodio = !!bien.custodio

    this.bienSeleccionado = {
      ...bien,
      agregar_custodio: !!bien.custodio,
      custodio_nombre: bien.custodio?.nombre ?? null,
      custodio_apellido: bien.custodio?.apellido ?? null,
      custodio_correo: bien.custodio?.correo_institucional ?? null,
      custodio_departamento: bien.custodio?.departamento ?? null,
      custodio_area: bien.custodio?.area ?? null,
    }

    this.definirCamposFormulario()
    this.mostrarFormulario = true
  }

  manejarCambioFormulario(e: { field: string; value: any; form: FormGroup }): void {
    if (e.field !== 'agregar_custodio') return

    const activo = !!e.value

    this.mostrarCustodio = activo

    this.bienSeleccionado = {
      ...this.bienSeleccionado,
      agregar_custodio: activo
    }

    if (!activo) {
      e.form.patchValue({
        custodio_nombre: null,
        custodio_apellido: null,
        custodio_correo: null,
        custodio_departamento: null,
        custodio_area: null,
      }, { emitEvent: false })
    }

    this.definirCamposFormulario()
  }

  async recibirFormulario(form: FormGroup): Promise<void> {
    const v = form.value

    const payload: any = {
      tipo: v.tipo,
      num_serie: v.num_serie,
      anio_fabricacion: v.anio_fabricacion,
      antiguedad: v.antiguedad,
    }

    if (this.mostrarCustodio) {
      payload.custodio = {
        nombre: v.custodio_nombre,
        apellido: v.custodio_apellido,
        correo_institucional: v.custodio_correo ?? null,
        departamento: v.custodio_departamento ?? null,
        area: v.custodio_area ?? null,
      }
    }

    if (this.modoFormulario === 'crear') {
      await this.bienesService.crear(payload)
    }

    if (this.modoFormulario === 'editar' && this.bienSeleccionado) {
      await this.bienesService.editar(this.bienSeleccionado.id, payload)
    }

    this.cerrarFormulario(true)
  }

  cerrarFormulario(recargar = false): void {
    this.mostrarFormulario = false
    this.bienSeleccionado = null
    this.mostrarCustodio = false

    if (recargar) {
      this.cargarBienes()
    }
  }

  async eliminarBien(bien: Bien): Promise<void> {
    await this.bienesService.eliminar(bien.id)
    await this.cargarBienes()
  }
}
