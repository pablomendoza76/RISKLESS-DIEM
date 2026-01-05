export interface Documento {
  id: string;
  entidad: string;        // 'siniestro' | 'poliza' | etc
  entidad_id: string;
  nombre_archivo: string;
  ruta_storage: string;
  tipo_documento: string;
  subido_por: string;
  created_at?: string;
}
