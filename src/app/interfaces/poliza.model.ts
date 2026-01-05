export interface Poliza {
  id: string;
  num_poliza: string;
  aseguradora: string;
  valor_asegurado: number;
  estado: string;
  fecha_inicio: string; // date
  fecha_fin: string;    // date
  created_at?: string;
}
