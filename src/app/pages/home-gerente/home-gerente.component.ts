import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { SidebarComponent, SidebarItem } from '../../shared/components/sidebar/sidebar.component';
import { AdminTopbarComponent } from '../../shared/components/reuzables/admin-topbar/admin-topbar.component';

@Component({
  selector: 'app-home-gerente',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    AdminTopbarComponent
  ],
  templateUrl: './home-gerente.component.html',
  styleUrl: './home-gerente.component.scss'
})
export class HomeGerenteComponent {

  sidebarTitle = 'Panel Gerencial';

  // Datos del usuario (pueden venir de un servicio de autenticación)
  nombreUsuario = 'Carlos Gerente';
  rolUsuario = 'Gerente';
  inicialesUsuario = 'CG';

  sidebarItems: SidebarItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/gerente'
    },
    {
      label: 'Control de Pólizas',
      icon: 'description',
      route: '/gerente/polizas' // Asegúrate de tener estas rutas en app.routes.ts
    },
    {
      label: 'Seguimiento Siniestros',
      icon: 'warning',
      route: '/gerente/sinistros'
    },
    {
      label: 'Análisis Financiero',
      icon: 'payments',
      route: '/gerente/facturacion'
    },
    {
      label: 'Reportes',
      icon: 'assessment',
      children: [
        { label: 'Mensual', icon: 'calendar_month', route: '/gerente/reportes/mensual' },
        { label: 'Anual', icon: 'analytics', route: '/gerente/reportes/anual' }
      ]
    }
  ];

  cerrarSesion() {
    console.log('Cerrar sesión gerente');
    // Aquí invocarías a tu AuthService.logout()
  }
}