import { Injectable } from '@angular/core'
import { SupabaseService } from './supabase.service'
import { SupabaseGatewayService } from './supabase-gateway.service'
import { Bien } from '../interfaces/bien.model'

type CustodioInput = {
  nombre: string
  apellido: string
  correo_institucional?: string | null
  departamento?: string | null
  area?: string | null
  activo?: boolean
}

type BienConCustodio = Bien & {
  custodio?: {
    id: string
    nombre: string
    apellido: string
    correo_institucional?: string | null
    departamento?: string | null
    area?: string | null
    activo?: boolean
  } | null
  custodio_nombre?: string
  custodio_apellido?: string
}

@Injectable({ providedIn: 'root' })
export class BienesService {
  constructor(
    private sb: SupabaseService,
    private gateway: SupabaseGatewayService
  ) {}

  private normalizarCustodio(c?: CustodioInput | null): CustodioInput | null {
    if (!c) return null
    const nombre = (c.nombre ?? '').trim()
    const apellido = (c.apellido ?? '').trim()
    const correo = (c.correo_institucional ?? '').trim()
    const depto = (c.departamento ?? '').trim()
    const area = (c.area ?? '').trim()
    if (!nombre || !apellido) return null
    return {
      nombre,
      apellido,
      correo_institucional: correo || null,
      departamento: depto || null,
      area: area || null,
      activo: c.activo ?? true
    }
  }

  private async crearCustodio(c: CustodioInput): Promise<{ id: string }> {
    const res = await this.sb.client
      .from('custodios')
      .insert({
        nombre: c.nombre,
        apellido: c.apellido,
        correo_institucional: c.correo_institucional ?? null,
        departamento: c.departamento ?? null,
        area: c.area ?? null,
        activo: c.activo ?? true
      })
      .select('id')
      .maybeSingle<{ id: string }>()
    return { id: res.data?.id as any }
  }

  listar(): Promise<BienConCustodio[]> {
  return this.gateway.ejecutar(async () => {
    const res = await this.sb.client
      .from('bienes')
      .select(`
        *,
        custodio:custodio_id (
          id,
          nombre,
          apellido,
          correo_institucional,
          departamento,
          area,
          activo
        )
      `)
      .order('created_at', { ascending: false })

    const data = (res.data ?? []).map((b: any) => ({
      ...b,

      // custodio completo anidado
      custodio: b.custodio ?? null,

      // campos planos para tabla / filtros
      custodio_nombre: b.custodio?.nombre ?? '',
      custodio_apellido: b.custodio?.apellido ?? '',
      custodio_correo: b.custodio?.correo_institucional ?? '',
      custodio_departamento: b.custodio?.departamento ?? '',
      custodio_area: b.custodio?.area ?? '',
      custodio_activo: b.custodio?.activo ?? false,
    })) as BienConCustodio[]

    return { data, error: res.error }
  }, { silent: true })
}

  obtenerPorId(id: string): Promise<BienConCustodio> {
    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('bienes')
        .select(`
          *,
          custodio:custodio_id (
            id,
            nombre,
            apellido,
            correo_institucional,
            departamento,
            area,
            activo
          )
        `)
        .eq('id', id)
        .maybeSingle<BienConCustodio>()

      const data = res.data
        ? ({
            ...res.data,
            custodio_nombre: (res.data as any).custodio?.nombre ?? '',
            custodio_apellido: (res.data as any).custodio?.apellido ?? ''
          } as BienConCustodio)
        : (null as any)

      return { data, error: res.error }
    })
  }

  crear(payload: (Omit<Bien, 'id' | 'created_at'> & { custodio?: CustodioInput | null })): Promise<BienConCustodio> {
    return this.gateway.ejecutar(async () => {
      const c = this.normalizarCustodio(payload.custodio ?? null)
      let custodio_id: string | null = (payload as any).custodio_id ?? null

      if (!custodio_id && c) {
        const creado = await this.sb.client
          .from('custodios')
          .insert({
            nombre: c.nombre,
            apellido: c.apellido,
            correo_institucional: c.correo_institucional ?? null,
            departamento: c.departamento ?? null,
            area: c.area ?? null,
            activo: c.activo ?? true
          })
          .select('id')
          .maybeSingle<{ id: string }>()
        if (creado.error) return { data: null as any, error: creado.error }
        custodio_id = creado.data?.id ?? null
      }

      const bienPayload: any = { ...payload }
      delete bienPayload.custodio
      bienPayload.custodio_id = custodio_id

      const res = await this.sb.client
        .from('bienes')
        .insert(bienPayload)
        .select(`
          *,
          custodio:custodio_id (
            id,
            nombre,
            apellido,
            correo_institucional,
            departamento,
            area,
            activo
          )
        `)
        .maybeSingle<BienConCustodio>()

      const data = res.data
        ? ({
            ...res.data,
            custodio_nombre: (res.data as any).custodio?.nombre ?? '',
            custodio_apellido: (res.data as any).custodio?.apellido ?? ''
          } as BienConCustodio)
        : (null as any)

      return { data, error: res.error }
    }, {
      successMessage: 'Bien registrado correctamente'
    })
  }

  editar(id: string, cambios: Partial<Bien> & { custodio?: CustodioInput | null; custodio_id?: string | null }): Promise<BienConCustodio> {
    return this.gateway.ejecutar(async () => {
      const c = this.normalizarCustodio(cambios.custodio ?? null)
      let custodio_id: string | null = cambios.custodio_id ?? null

      if (c) {
        const creado = await this.sb.client
          .from('custodios')
          .insert({
            nombre: c.nombre,
            apellido: c.apellido,
            correo_institucional: c.correo_institucional ?? null,
            departamento: c.departamento ?? null,
            area: c.area ?? null,
            activo: c.activo ?? true
          })
          .select('id')
          .maybeSingle<{ id: string }>()
        if (creado.error) return { data: null as any, error: creado.error }
        custodio_id = creado.data?.id ?? null
      }

      const patch: any = { ...cambios }
      delete patch.custodio
      if ('custodio_id' in cambios || c) patch.custodio_id = custodio_id

      const res = await this.sb.client
        .from('bienes')
        .update(patch)
        .eq('id', id)
        .select(`
          *,
          custodio:custodio_id (
            id,
            nombre,
            apellido,
            correo_institucional,
            departamento,
            area,
            activo
          )
        `)

      const row = (res.data as any)?.[0] ?? null
      const data = row
        ? ({
            ...row,
            custodio_nombre: row.custodio?.nombre ?? '',
            custodio_apellido: row.custodio?.apellido ?? ''
          } as BienConCustodio)
        : (null as any)

      return { data, error: res.error }
    }, {
      successMessage: 'Bien actualizado correctamente'
    })
  }

  eliminar(id: string): Promise<void> {
    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('bienes')
        .delete()
        .eq('id', id)

      return { data: true as any, error: res.error }
    }, {
      successMessage: 'Bien eliminado correctamente'
    })
  }

  obtenerPorNumeroSerie(numSerie: string): Promise<BienConCustodio | null> {
    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('bienes')
        .select(`
          *,
          custodio:custodio_id (
            id,
            nombre,
            apellido,
            correo_institucional,
            departamento,
            area,
            activo
          )
        `)
        .eq('num_serie', numSerie)
        .maybeSingle<BienConCustodio>()

      const data = res.data
        ? ({
            ...res.data,
            custodio_nombre: (res.data as any).custodio?.nombre ?? '',
            custodio_apellido: (res.data as any).custodio?.apellido ?? ''
          } as BienConCustodio)
        : null

      return { data, error: res.error }
    }, { silent: true })
  }
}
