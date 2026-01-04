import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TablaDinamicaComponent } from '../../shared/components/reuzables/tabla-dinamica/tabla-dinamica.component';
import { DynamicFormComponent } from '../../shared/components/reuzables/dynamic-form/dynamic-form.component';
import { AdminMapper } from '../../mapping/admin.mapper';

@Component({
  selector: 'app-home-admin',
  standalone: true,
  imports: [
    CommonModule,
    TablaDinamicaComponent,
    DynamicFormComponent,
  ],
  templateUrl: './home-admin.component.html',
  styleUrl: './home-admin.component.scss',
})
export class HomeAdminComponent implements OnInit {

  // el mapper contiene todo el estado y la lógica
  constructor(public mapper: AdminMapper) {}

  // inicialización del módulo
  ngOnInit(): void {
    this.mapper.init();
  }
}
