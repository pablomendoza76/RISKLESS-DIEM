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
  // Estilos soportados por Riskless
  tipo?: 'primary' | 'secondary' | 'danger' | 'activate' | 'success';
  evento: string;
}

@Component({
  selector: 'app-tabla-dinamica',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tabla-dinamica.component.html',
  styleUrls: ['./tabla-dinamica.component.scss'],
})
export class TablaDinamicaComponent implements OnChanges {

  /* ================= INPUTS ================= */
  @Input() columnas: ColumnaTabla[] = [];
  @Input() data: any[] = [];
  @Input() botones: BotonTabla[] = [];

  /* ================= OUTPUT ================= */
  @Output() accion = new EventEmitter<{
    evento: string;
    fila?: any;
  }>();

  /* ================= STATE ================= */
  textoBusqueda = '';
  dataFiltrada: any[] = [];

  botonesGlobales: BotonTabla[] = [];
  botonesAccion: BotonTabla[] = [];

  /* ================= LIFECYCLE ================= */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.dataFiltrada = [...this.data];
    }

    if (changes['botones']) {
      this.clasificarBotones();
    }
  }

  /* ================= BOTONES ================= */

  /**
   * Clasifica botones:
   * - Acciones por fila → tabla
   * - Acciones globales → header
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

  /* ================= BUSQUEDA ================= */

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

  /* ================= EMIT ================= */

  emitir(evento: string, fila?: any): void {
    this.accion.emit({ evento, fila });
  }

  /* ================= ESTADOS (COLORES) ================= */

  /**
   * Clase para el badge de estado
   */
  estadoClass(estado: string): string {
    switch (estado?.toLowerCase()) {

      case 'activa':
      case 'abierto':
        return 'estado-activo';

      case 'en proceso':
        return 'estado-proceso';

      case 'aprobado':
        return 'estado-exito';

      case 'vencida':
      case 'rechazado':
        return 'estado-critico';

      case 'cancelada':
        return 'estado-inactivo';

      case 'cerrado':
        return 'estado-cerrado';

      default:
        return 'estado-default';
    }
  }

  /**
   * (Opcional) Clase para resaltar la fila
   */
  estadoFilaClass(estado: string): string {
    switch (estado?.toLowerCase()) {

      case 'activa':
      case 'abierto':
        return 'fila-activa';

      case 'en proceso':
        return 'fila-proceso';

      case 'vencida':
      case 'rechazado':
        return 'fila-critica';

      default:
        return '';
    }
  }
}
