export interface Pedido {
  id: string;
  usuario_id: string;
  poliza_id: string;
  asegurado_id: string;
  bien_id: string;
  descripcion: string;
  estado: string;
  siniestro_id?: string | null;
  created_at?: string;
}
