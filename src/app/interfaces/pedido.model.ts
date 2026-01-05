export interface Pedido {
  id: string;
  usuario_id: string;
  poliza_id: string;
  siniestro_id: string;
  estado: string;
  created_at?: string;
}
