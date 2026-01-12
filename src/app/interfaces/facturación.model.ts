export interface Factura {
  id: string;
  siniestro_id: string;
  fecha_pago: string;
  monto_cancelado: number;
  porcentaje_descuento?: number | null;
  created_at?: string;

  siniestro?: {
    id: string;
    fecha_siniestro: string;
    monto_danio: number;
    pedido?: {
      descripcion: string;
      asegurado?: {
        nombre: string;
        apellido: string;
      };
      bien?: {
        tipo: string;
        num_serie: string;
      };
    };
  };
}
