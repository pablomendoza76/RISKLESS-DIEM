import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BienesMapper } from '../../../../mapping/bienes.mapper';
import { DynamicFormComponent } from '../../../../shared/components/reuzables/dynamic-form/dynamic-form.component';
import { TablaDinamicaComponent } from '../../../../shared/components/reuzables/tabla-dinamica/tabla-dinamica.component';


@Component({
  selector: 'app-bienes',
  standalone: true,
  imports: [
    CommonModule,
    TablaDinamicaComponent,
    DynamicFormComponent
  ],
  templateUrl: './bienes.component.html',
  styleUrl: './bienes.component.scss'
})
export class BienesComponent implements OnInit {

  constructor(
    public mapper: BienesMapper
  ) {}

  ngOnInit(): void {
    this.mapper.init();
  }
}
