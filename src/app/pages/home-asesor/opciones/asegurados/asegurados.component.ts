import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AseguradosMapper } from '../../../../mapping/asegurados.mapper';
import { DynamicFormComponent } from '../../../../shared/components/reuzables/dynamic-form/dynamic-form.component';
import { TablaDinamicaComponent } from '../../../../shared/components/reuzables/tabla-dinamica/tabla-dinamica.component';



@Component({
  selector: 'app-asegurados',
  standalone: true,
  imports: [
    CommonModule,
    TablaDinamicaComponent,
    DynamicFormComponent
  ],
  templateUrl: './asegurados.component.html',
  styleUrl: './asegurados.component.scss'
})
export class AseguradosComponent implements OnInit {

  constructor(
    public mapper: AseguradosMapper
  ) {}

  ngOnInit(): void {
    this.mapper.init();
  }
}
