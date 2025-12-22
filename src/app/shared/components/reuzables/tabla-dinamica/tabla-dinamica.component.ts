import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';

export interface ColumnaTabla {
  key: string;
  label: string;
}

export interface BotonTabla {
  texto: string;
  tipo?: 'primary' | 'secondary' | 'danger';
  evento: string;
}

@Component({
  selector: 'app-tabla-dinamica',
  templateUrl: './tabla-dinamica.component.html',
  styleUrls: ['./tabla-dinamica.component.scss'],
})
export class TablaDinamicaComponent implements OnChanges {

  @Input() columnas: ColumnaTabla[] = [];
  @Input() data: any[] = [];
  @Input() botones: BotonTabla[] = [];

  @Output() accion = new EventEmitter<{
    evento: string;
    fila?: any;
  }>();

  textoBusqueda = '';
  dataFiltrada: any[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.dataFiltrada = [...this.data];
    }
  }

  buscar(): void {
    const texto = this.textoBusqueda.toLowerCase().trim();

    if (!texto) {
      this.dataFiltrada = [...this.data];
      return;
    }

    this.dataFiltrada = this.data.filter(item =>
      Object.values(item).some(valor =>
        valor !== null &&
        valor !== undefined &&
        valor.toString().toLowerCase().includes(texto)
      )
    );
  }

  emitir(evento: string, fila?: any): void {
    this.accion.emit({ evento, fila });
  }
}
