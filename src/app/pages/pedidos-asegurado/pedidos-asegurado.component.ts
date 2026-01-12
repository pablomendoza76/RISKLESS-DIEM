import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicFormComponent } from '../../shared/components/reuzables/dynamic-form/dynamic-form.component';
import { PedidosMapper } from '../../mapping/pedidos.mapper';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [
    CommonModule,
    DynamicFormComponent
  ],
  templateUrl: './pedidos-asegurado.component.html',
  styleUrl: './pedidos-asegurado.component.scss'
})
export class PedidosAseguradoComponent implements OnInit {

  constructor(
    public mapper: PedidosMapper
  ) {}

  ngOnInit(): void {
    // Estado inicial: solo bienvenida
    this.mapper.mostrarFormulario = false;
    this.mapper.modoFormulario = 'crear';
    this.mapper.pedidoSeleccionado = null;
    this.mapper.archivos = [];
  }

  // En tu componente .ts
scrollToForm() {
  setTimeout(() => {
    const element = document.getElementById('formulario-destino');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 100); // Pequeño retraso para que Angular renderice el *ngIf primero
}

}
