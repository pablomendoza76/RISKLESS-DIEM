export interface Siniestro {
  id: string;
  poliza_id: string;
  asegurado_id: string;
  bien_id: string;
  fecha_siniestro: string; // date
  monto_danio: number;
  estado: string;
  created_at?: string;
}
