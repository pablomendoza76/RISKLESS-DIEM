export interface Asegurado {
  id: string;
  nombre: string;
  apellido: string;
  cedula: string;
  correo: string | null;
  activo: boolean;
  created_at?: string;
}
