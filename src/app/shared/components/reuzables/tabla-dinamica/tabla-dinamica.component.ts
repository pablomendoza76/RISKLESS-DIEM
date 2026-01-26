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
import { MatIconModule } from '@angular/material/icon';

export interface ColumnaTabla {
  key: string;
  label: string;
  width?: string;
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
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './tabla-dinamica.component.html',
  styleUrls: ['./tabla-dinamica.component.scss'],
})
export class TablaDinamicaComponent implements OnChanges {

  /* ================= INPUTS ================= */
  @Input() columnas: ColumnaTabla[] = [];
  @Input() data: any[] = [];
  @Input() botones: BotonTabla[] = [];
  @Input() placeholder = 'Buscar...';
  @Input() itemsPorPagina = 4;
  @Input() layout: 'auto' | 'fixed' = 'auto';

  /* ================= OUTPUT ================= */
  @Output() accion = new EventEmitter<{
    evento: string;
    fila?: any;
  }>();

  /* ================= STATE ================= */
  textoBusqueda = '';
  dataFiltrada: any[] = [];
  dataPaginada: any[] = [];

  // Paginación
  paginaActual = 1;
  totalPaginas = 1;
  paginasTotales: number[] = [];

  totalRegistros = 0;
  inicioRegistro = 0;
  finRegistro = 0;

  botonesGlobales: BotonTabla[] = [];
  botonesAccion: BotonTabla[] = [];

  /* ================= LIFECYCLE ================= */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.actualizarTabla();
    }

    if (changes['botones']) {
      this.clasificarBotones();
    }
  }

  private actualizarTabla(): void {
    this.buscar();
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
    } else {
      this.dataFiltrada = this.data.filter(item =>
        Object.values(item).some(valor =>
          valor !== null &&
          valor !== undefined &&
          valor.toString().toLowerCase().includes(texto)
        )
      );
    }

    this.paginaActual = 1;
    this.calcularPaginacion();
  }

  /* ================= PAGINACION LOGIC ================= */

  calcularPaginacion(): void {
    this.totalRegistros = this.dataFiltrada.length;
    this.totalPaginas = Math.ceil(this.totalRegistros / this.itemsPorPagina) || 1;

    // Generar array de páginas [1, 2, 3...]
    this.paginasTotales = Array.from({ length: this.totalPaginas }, (_, i) => i + 1);

    this.aplicarPaginacion();
  }

  aplicarPaginacion(): void {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;

    this.dataPaginada = this.dataFiltrada.slice(inicio, fin);

    this.inicioRegistro = this.totalRegistros > 0 ? inicio + 1 : 0;
    this.finRegistro = Math.min(fin, this.totalRegistros);
  }

  cambiarPagina(p: number): void {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaActual = p;
    this.aplicarPaginacion();
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

      case 'activo':
      case 'activa':
      case 'abierto':
        return 'estado-activo';

      case 'inactivo':
      case 'inactiva':
      case 'desactivada':
      case 'cancelada':
        return 'estado-inactivo';

      case 'en proceso':
        return 'estado-proceso';

      case 'aprobado':
        return 'estado-exito';

      case 'vencida':
      case 'rechazado':
        return 'estado-critico';

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
