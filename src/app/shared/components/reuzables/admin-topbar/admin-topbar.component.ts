import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-topbar.component.html',
  styleUrls: ['./admin-topbar.component.scss'],
})
export class AdminTopbarComponent {

  @Input() mensaje = '';
  @Input() nombre = '';
  @Input() rol = '';
  @Input() iniciales = '';

  @Output() logout = new EventEmitter<void>();

  mostrarLogout = false;

  toggleLogout() {
    this.mostrarLogout = !this.mostrarLogout;
  }
}
