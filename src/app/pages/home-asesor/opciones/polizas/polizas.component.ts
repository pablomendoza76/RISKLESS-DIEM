import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolizasMapper } from '../../../../mapping/polizas.mapper';
import { DynamicFormComponent } from '../../../../shared/components/reuzables/dynamic-form/dynamic-form.component';
import { TablaDinamicaComponent } from '../../../../shared/components/reuzables/tabla-dinamica/tabla-dinamica.component';



@Component({
  selector: 'app-polizas',
  standalone: true,
  imports: [
    CommonModule,
    TablaDinamicaComponent,
    DynamicFormComponent
  ],
  templateUrl: './polizas.component.html',
  styleUrl: './polizas.component.scss'
})
export class PolizasComponent implements OnInit {

  constructor(
    public mapper: PolizasMapper
  ) {}

  ngOnInit(): void {
    this.mapper.init();
  }
}
