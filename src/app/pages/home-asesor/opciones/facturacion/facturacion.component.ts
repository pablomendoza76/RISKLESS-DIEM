import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FacturacionMapper } from '../../../../mapping/facturacion.mapper';
import { DynamicFormComponent } from '../../../../shared/components/reuzables/dynamic-form/dynamic-form.component';
import { TablaDinamicaComponent } from '../../../../shared/components/reuzables/tabla-dinamica/tabla-dinamica.component';

@Component({
  selector: 'app-facturacion',
  standalone: true,
  imports: [
    CommonModule,
    TablaDinamicaComponent,
    DynamicFormComponent
  ],
  templateUrl: './facturacion.component.html',
  styleUrl: './facturacion.component.scss'
})
export class FacturacionComponent implements OnInit {

  mapper = inject(FacturacionMapper);

  async ngOnInit(): Promise<void> {
    await this.mapper.init();
  }
}
