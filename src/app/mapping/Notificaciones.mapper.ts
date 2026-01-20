import { Injectable } from '@angular/core';
import { NotificacionesService, NotificacionItem } from '../services/presentación/Notificaciones.service';

@Injectable({ providedIn: 'root' })
export class NotificacionesMapper {

  /* ESTADO GENERAL */
  todas: NotificacionItem[] = [];

  pedidos: NotificacionItem[] = [];
  polizas: NotificacionItem[] = [];
  siniestros: NotificacionItem[] = [];
  facturacion: NotificacionItem[] = [];

  total = 0;
  cargando = false;
  error: string | null = null;

  constructor(
    private notificacionesService: NotificacionesService
  ) {}

  /* INIT */
  async init(soloNoLeidas = true): Promise<void> {
    console.log('[Mapper] iniciando');

    this.cargando = true;
    this.error = null;

    try {
      // 🔹 res YA ES UN ARRAY
      const data = soloNoLeidas
        ? await this.notificacionesService.listarNoLeidas()
        : await this.notificacionesService.listar();

      console.log('[Mapper] DATA RAW:', data);

      this.todas = data;
      this.total = data.length;

      this.segmentar();

      console.log('[Mapper] TODAS:', this.todas);
      console.log('[Mapper] POLIZAS:', this.polizas);
      console.log('[Mapper] PEDIDOS:', this.pedidos);
      console.log('[Mapper] SINIESTROS:', this.siniestros);
      console.log('[Mapper] FACTURACION:', this.facturacion);

    } catch (e: any) {
      this.error = e?.message ?? 'Error al cargar notificaciones';
    } finally {
      this.cargando = false;
    }
  }

  /* SEGMENTACIÓN */
  private segmentar(): void {
    this.pedidos = this.filtrarPorEntidad('pedido');
    this.polizas = this.filtrarPorEntidad('poliza');
    this.siniestros = this.filtrarPorEntidad('siniestro');
    this.facturacion = this.filtrarPorEntidad('facturacion');
  }

  private filtrarPorEntidad(
    entidad: NotificacionItem['entidad']
  ): NotificacionItem[] {
    return this.todas.filter(n => n.entidad === entidad);
  }

  /* CONTADORES */
  get totalPedidos(): number {
    return this.pedidos.length;
  }

  get totalPolizas(): number {
    return this.polizas.length;
  }

  get totalSiniestros(): number {
    return this.siniestros.length;
  }

  get totalFacturacion(): number {
    return this.facturacion.length;
  }

  /* MARCAR COMO LEÍDA */
  async marcarLeida(n: NotificacionItem): Promise<void> {
    await this.notificacionesService.marcarLeida({
      entidad: n.entidad,
      entidad_id: n.entidad_id,
      tipo: n.tipo
    });

    this.todas = this.todas.filter(x =>
      !(x.entidad === n.entidad &&
        x.entidad_id === n.entidad_id &&
        x.tipo === n.tipo)
    );

    this.segmentar();
    this.total = this.todas.length;
  }

  reset(): void {
    this.todas = [];
    this.pedidos = [];
    this.polizas = [];
    this.siniestros = [];
    this.facturacion = [];
    this.total = 0;
  }
}
