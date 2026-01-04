import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface ColumnaTabla {
  key: string;
  label: string;
}

export interface BotonTabla {
  texto: string;
  // Añadimos 'activate' y 'success' para soportar los estilos iOS/Riskless
  tipo?: 'primary' | 'secondary' | 'danger' | 'activate' | 'success'; 
  evento: string;
}

@Component({
  selector: 'app-tabla-dinamica',
  standalone: true, // Asegura compatibilidad con imports
  imports: [CommonModule, FormsModule],
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

  // Propiedades para separar los botones visualmente en el HTML
  botonesGlobales: BotonTabla[] = [];
  botonesAccion: BotonTabla[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.dataFiltrada = [...this.data];
    }
    
    // Clasificamos los botones cada vez que cambian
    if (changes['botones']) {
      this.clasificarBotones();
    }
  }

  /**
   * Clasifica los botones según su texto para decidir dónde se muestran.
   * Si el texto es "Editar", "Activar" o "Desactivar", va a la tabla.
   * Cualquier otro (como "+ Nuevo") va al header.
   */
  private clasificarBotones(): void {
    const palabrasAccion = ['editar', 'desactivar', 'activar', 'eliminar'];

    this.botonesGlobales = this.botones.filter(btn => 
      !palabrasAccion.includes(btn.texto.toLowerCase())
    );

    this.botonesAccion = this.botones.filter(btn => 
      palabrasAccion.includes(btn.texto.toLowerCase())
    );
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