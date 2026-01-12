export interface Siniestro {
  id: string;

  // =========================
  // RELACIÓN PRINCIPAL
  // =========================
  pedido_id: string;
  poliza_id?: string;

  // =========================
  // DATOS DEL SINIESTRO
  // =========================
  fecha_siniestro: string;
  monto_danio?: number | null;
  deducible?: number | null;
  descripcion_siniestro?: string | null;
  estado: string;

  // =========================
  // DATOS DEL PROVEEDOR (OPCIONALES)
  // =========================
  proveedor_nombre?: string | null;
  proveedor_direccion?: string | null;
  proveedor_telefono?: string | null;
  proveedor_correo?: string | null;

  // =========================
  // AUDITORÍA
  // =========================
  created_at?: string;

  // =========================
  // RELACIONES (OPCIONALES)
  // =========================
  pedido?: {
    id: string;
    descripcion?: string;
    estado?: string;
    created_at?: string;

    asegurado?: {
      id?: string;
      nombre: string;
      apellido: string;
    };

    bien?: {
      id?: string;
      tipo: string;
      num_serie: string;
    };
  };

  poliza?: {
    id: string;
    num_poliza: string;
    aseguradora: string;
  };
}
