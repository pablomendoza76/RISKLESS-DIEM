import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { SidebarComponent, SidebarItem } from '../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-home-asesor',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,      // ✅ NECESARIO
    SidebarComponent
  ],
  templateUrl: './home-asesor.component.html',
  styleUrl: './home-asesor.component.scss'
})
export class HomeAsesorComponent {

  sidebarTitle = 'Panel Asesor';

  sidebarItems: SidebarItem[] = [
    {
      label: 'Inicio',
      icon: 'home',
      route: '/asesor'
    },
    {
      label: 'Asegurados',
      icon: 'person',
      route: '/asesor/asegurados'
    },
    {
      label: 'Pólizas',
      icon: 'description',
      children: [
        { label: 'Listado', icon: 'list', route: '/asesor/polizas' },
        { label: 'Nueva póliza', icon: 'add', route: '/asesor/polizas/nueva' }
      ]
    },
    {
      label: 'Siniestros',
      icon: 'warning',
      route: '/asesor/siniestros'
    },
    {
      label: 'Pedidos',
      icon: 'assignment',
      route: '/asesor/pedidos'
    }
  ];
}
