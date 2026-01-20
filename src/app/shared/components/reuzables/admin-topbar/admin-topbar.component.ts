import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ModalNotificacionesComponent } from '../modal-notificaciones.component/modal-notificaciones.component';

// IMPORTA EL MODAL


@Component({
  selector: 'app-admin-topbar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    ModalNotificacionesComponent
  ],
  templateUrl: './admin-topbar.component.html',
  styleUrls: ['./admin-topbar.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class AdminTopbarComponent {

  @Input() mensaje = '';
  @Input() nombre = '';
  @Input() rol = '';
  @Input() iniciales = '';

  @Output() logout = new EventEmitter<void>();

  mostrarLogout = false;
  mostrarNotificaciones = false;

  toggleLogout() {
    this.mostrarLogout = !this.mostrarLogout;
  }

  toggleNotificaciones() {
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
  }

  cerrarModalLogout() {
    this.mostrarLogout = false;
  }

  cerrarModalNotificaciones() {
    this.mostrarNotificaciones = false;
  }

  confirmarLogout() {
    this.logout.emit();
    this.mostrarLogout = false;
  }
}
