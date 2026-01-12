import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { SidebarComponent, SidebarItem } from '../../shared/components/sidebar/sidebar.component';
import { AdminTopbarComponent } from '../../shared/components/reuzables/admin-topbar/admin-topbar.component';

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
export class HomeAsesorComponent {

  sidebarTitle = 'Panel Asesor';

  // Datos del usuario (luego pueden venir de un service)
  nombreUsuario = 'Juan Pérez';
  rolUsuario = 'Asesor';
  inicialesUsuario = 'JP';

sidebarItems: SidebarItem[] = [

  // INICIO
  {
    label: 'Inicio',
    icon: 'home',
    route: '/asesor'
  },

  // ASEGURADOS
  {
    label: 'Asegurados',
    icon: 'person',
    route: '/asesor/asegurados'
  },

  // BIENES
  {
    label: 'Bienes',
    icon: 'inventory',
    route: '/asesor/bienes'
  },

  // PÓLIZAS (CON HIJOS)
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

  
  // PEDIDOS
  {
    label: 'Pedidos',
    icon: 'assignment',
    route: '/asesor/pedidos'
  },

  // SINIESTROS
  {
    label: 'Siniestros',
    icon: 'warning',
    route: '/asesor/sinistros'
  },

  // fACTURACIÓN
  {
    label: 'Facturación',
    icon: 'attach_money',
    route: '/asesor/facturacion'
  },


];


  cerrarSesion() {
    console.log('Cerrar sesión asesor');
    // aquí luego llamas a tu AuthService
  }
}
