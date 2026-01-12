import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PedidosMapper } from '../../../../mapping/pedidos.mapper';
import { TablaDinamicaComponent } from '../../../../shared/components/reuzables/tabla-dinamica/tabla-dinamica.component';
import { DynamicFormComponent } from '../../../../shared/components/reuzables/dynamic-form/dynamic-form.component';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [
    CommonModule,
    TablaDinamicaComponent,
    DynamicFormComponent
  ],
  templateUrl: './pedidos.component.html',
  styleUrl: './pedidos.component.scss'
})
export class PedidosComponent implements OnInit {

  mapper = inject(PedidosMapper);

  async ngOnInit(): Promise<void> {
    await this.mapper.init();
  }
}
