import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';

import { SidebarComponent, SidebarItem } from '../../shared/components/sidebar/sidebar.component';
import { AdminTopbarComponent } from '../../shared/components/reuzables/admin-topbar/admin-topbar.component';

import { AuthService } from '../../services/presentación/auth.service';
import { NotificacionesService } from '../../services/presentación/Notificaciones.service';
import { AlertService } from '../../services/presentación/alert.service';

@Component({
  selector: 'app-home-asesor',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    AdminTopbarComponent
  ],
  templateUrl: './home-asesor.component.html',
  styleUrl: './home-asesor.component.scss'
})
export class HomeAsesorComponent implements OnInit {

  sidebarTitle = 'Panel Asesor';

  // Datos del usuario (luego pueden venir de un service)
  nombreUsuario = 'Juan Pérez';
  rolUsuario = 'Asesor';
  inicialesUsuario = 'JP';
  subtituloFecha = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private notificacionesService: NotificacionesService,
    private alert: AlertService
  ) { }

  // ===============================
  // INIT
  // ===============================
  async ngOnInit(): Promise<void> {
    this.actualizarFecha();
    await this.verificarNotificacionesPendientes();
  }

  private actualizarFecha(): void {
    const ahora = new Date();
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    const fechaFormateada = ahora.toLocaleDateString('es-ES', opciones);
    this.subtituloFecha = `Resumen a ${fechaFormateada}`;
  }

  // ===============================
  // SIDEBAR
  // ===============================
  sidebarItems: SidebarItem[] = [

    {
      label: 'Inicio',
      icon: 'home',
      route: '/asesor/dashboard'
    },

    {
      label: 'Asegurados',
      icon: 'person',
      route: '/asesor/asegurados'
    },

    {
      label: 'Bienes',
      icon: 'inventory',
      route: '/asesor/bienes'
    },

    {
      label: 'Pólizas',
      icon: 'description',
      children: [
        {
          label: 'Listado',
          icon: 'list',
          route: '/asesor/polizas'
        },
        {
          label: 'Nueva póliza',
          icon: 'add',
          route: '/asesor/polizas_crear'
        }
      ]
    },

    {
      label: 'Pedidos',
      icon: 'assignment',
      route: '/asesor/pedidos'
    },

    {
      label: 'Siniestros',
      icon: 'warning',
      route: '/asesor/sinistros'
    },

    {
      label: 'Facturación',
      icon: 'attach_money',
      route: '/asesor/facturacion'
    }
  ];

  // ===============================
  // NOTIFICACIONES (AVISO INICIAL)
  // ===============================
  private async verificarNotificacionesPendientes(): Promise<void> {
    try {
      const total = await this.notificacionesService.contadorNoLeidas();

      if (total > 0) {
        // Evita mostrar el mensaje más de una vez por sesión
        if (!sessionStorage.getItem('notificaciones_asesor_alert')) {
          sessionStorage.setItem('notificaciones_asesor_alert', 'true');

          this.alert.info(
            `🔔 Tienes ${total} notificaciones pendientes. Revisa la campana.`
          );
        }
      }
    } catch {
      // No romper el dashboard si falla
    }
  }

  // ===============================
  // LOGOUT
  // ===============================
  async cerrarSesion(): Promise<void> {
    try {
      await this.auth.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      this.router.navigate(['/login']);
    }
  }
}
