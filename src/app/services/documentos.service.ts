import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { SupabaseGatewayService } from './supabase-gateway.service';
import { Documento } from '../interfaces/documento.model';
@Injectable({ providedIn: 'root' })
export class DocumentosService {

  private readonly BUCKET = 'documentos';

  constructor(
    private sb: SupabaseService,
    private gateway: SupabaseGatewayService
  ) {}

  /* =========================
     LISTAR POR ENTIDAD
  ========================= */
  listarPorEntidad(
    entidad: string,
    entidad_id: string
  ): Promise<Documento[]> {

    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('documentos')
        .select('*')
        .eq('entidad', entidad)
        .eq('entidad_id', entidad_id)
        .order('created_at', { ascending: false });

      return {
        data: res.data ?? [],
        error: res.error
      };
    }, { silent: true });
  }

  /* =========================
     SUBIR DOCUMENTO
  ========================= */
  subirDocumento(
    file: File,
    payload: Omit<Documento, 'id' | 'created_at' | 'ruta_storage' | 'nombre_archivo'>
  ): Promise<Documento> {

    return this.gateway.ejecutar(async () => {

      const filePath = `${payload.entidad}/${payload.entidad_id}/${Date.now()}_${file.name}`;

      //  Subir a Storage
      const upload = await this.sb.client.storage
        .from(this.BUCKET)
        .upload(filePath, file, { upsert: false });

      if (upload.error) throw upload.error;

      //  Guardar metadata
      const res = await this.sb.client
        .from('documentos')
        .insert({
          ...payload,
          nombre_archivo: file.name,
          ruta_storage: filePath
        })
        .select()
        .maybeSingle<Documento>();

      return {
        data: res.data,
        error: res.error
      };
    }, {
      successMessage: 'Documento subido correctamente'
    });
  }

  /* =========================
     OBTENER URL PÚBLICA
  ========================= */
  obtenerUrl(ruta: string): string {
    const { data } = this.sb.client.storage
      .from(this.BUCKET)
      .getPublicUrl(ruta);

    return data.publicUrl;
  }

  /* =========================
     ELIMINAR DOCUMENTO
  ========================= */
  eliminar(documento: Documento): Promise<void> {

    return this.gateway.ejecutar(async () => {
      //  Eliminar archivo
      await this.sb.client.storage
        .from(this.BUCKET)
        .remove([documento.ruta_storage]);

      //  Eliminar metadata
      const res = await this.sb.client
        .from('documentos')
        .delete()
        .eq('id', documento.id);

      return {
        data: true as any,
        error: res.error
      };
    }, {
      successMessage: 'Documento eliminado correctamente'
    });
  }
}
