import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacionesMapper } from '../../../../mapping/Notificaciones.mapper';
import { NotificacionItem } from '../../../../services/presentación/Notificaciones.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-modal-notificaciones',
  standalone: true,
  imports: [CommonModule, MatIcon],
  templateUrl: './modal-notificaciones.component.html',
  styleUrls: ['./modal-notificaciones.component.scss']
})
export class ModalNotificacionesComponent {

  private _isOpen = false;
  cargando = false;

  constructor(public mapper: NotificacionesMapper) {}

  @Input()
  set isOpen(value: boolean) {
    this._isOpen = value;

    if (value) {
      this.cargar();
    }
  }

  get isOpen(): boolean {
    return this._isOpen;
  }

  async cargar(): Promise<void> {
    console.log("lanzando cargar");
    
    this.cargando = true;
    await this.mapper.init(true);
    this.cargando = false;
  }

  cerrar(): void {
    this._isOpen = false;
  }

  async marcarLeida(n: NotificacionItem): Promise<void> {
    await this.mapper.marcarLeida(n);
  }

  trackById(_: number, n: NotificacionItem): string {
    return `${n.entidad}-${n.entidad_id}-${n.tipo}`;
  }
}
