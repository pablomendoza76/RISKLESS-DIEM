import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts'; 
import { ChartConfiguration, ChartData } from 'chart.js';
import * as XLSX from 'xlsx';

// Services
import { PolizasService } from '../../services/polizas.service';
import { SiniestrosService } from '../../services/siniestros.service';
import { FacturacionService } from '../../services/facturacion.service';
import { AseguradosService } from '../../services/asegurados.service';
import { PedidosService } from '../../services/pedidos.service';

interface Poliza {
  id: string;
  num_poliza: string;
  aseguradora: string;
  valor_asegurado: number;
  estado: string;
  fecha_inicio: string;
  fecha_fin: string;
}

interface Siniestro {
  id: string;
  estado: string;
  monto_danio: number;
  fecha_siniestro: string;
}

interface Factura {
  id: string;
  monto_facturado: number;
  monto_cancelado: number;
  porcentaje_descuento: number;
  fecha_pago: string;
}

@Component({
  selector: 'app-home-gerente',
  standalone: true,
  imports: [CommonModule, MatIconModule, BaseChartDirective],
  templateUrl: './home-gerente.component.html',
  styleUrls: ['./home-gerente.component.scss']
})
export class HomeGerenteComponent implements OnInit {
  // Estados de carga
  loading = true;
  dataLoaded = false;
  exportando = false;
  
  // Datos originales para exportación
  private datosOriginales = {
    asegurados: [] as any[],
    polizas: [] as Poliza[],
    siniestros: [] as Siniestro[],
    facturas: [] as Factura[],
    pedidos: [] as any[]
  };
  
  // KPIs Principales
  totalAsegurados = 0;
  totalPolizasActivas = 0;
  totalPolizas = 0;
  valorTotalAsegurado = 0;
  
  // KPIs Siniestros
  totalSiniestros = 0;
  siniestrosEnProceso = 0;
  siniestrosFinalizados = 0;
  siniestrosRechazados = 0;
  montoTotalDanios = 0;
  promedioMontoDanio = 0;
  
  // KPIs Financieros
  totalRecaudado = 0;
  totalFacturado = 0;
  totalPendientePago = 0;
  promedioDescuento = 0;
  tasaRecuperacion = 0;
  
  // KPIs Pedidos
  totalPedidos = 0;
  pedidosAbiertos = 0;
  pedidosAprobados = 0;
  pedidosRechazados = 0;
  pedidosConvertidos = 0;
  
  // KPIs Documentos
  totalDocumentos = 0;
  
  // Métricas Calculadas
  tasaConversionPedidos = 0;
  tasaSiniestralidad = 0;
  eficienciaOperativa = 0;

  // Gráfico: Distribución de Siniestros por Estado
  public siniestrosEstadoChart: ChartData<'doughnut'> = {
    labels: ['En Proceso', 'Finalizados', 'Rechazados'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#3891F4', '#2e7d32', '#c62828'],
      borderWidth: 0
    }]
  };

  // Gráfico: Recaudación Mensual
  public recaudacionMensualChart: ChartData<'line'> = {
    labels: [],
    datasets: [{
      label: 'Recaudación',
      data: [],
      borderColor: '#C6AF6B',
      backgroundColor: 'rgba(198, 175, 107, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  // Gráfico: Top 5 Aseguradoras por Valor
  public aseguradorasChart: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      label: 'Valor Asegurado',
      data: [],
      backgroundColor: '#062140',
      borderRadius: 8
    }]
  };

  // Gráfico: Estado de Pedidos
  public pedidosEstadoChart: ChartData<'pie'> = {
    labels: ['Abiertos', 'Aprobados', 'Rechazados', 'Convertidos'],
    datasets: [{
      data: [0, 0, 0, 0],
      backgroundColor: ['#3891F4', '#2e7d32', '#c62828', '#C6AF6B'],
      borderWidth: 0
    }]
  };

  // Gráfico: Tendencia de Siniestros (últimos 6 meses)
  public tendenciaSiniestrosChart: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      label: 'Siniestros',
      data: [],
      backgroundColor: '#3891F4',
      borderRadius: 8
    }]
  };

  // Configuración de gráficos
  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      }
    }
  };

  constructor(
    private polizasSvc: PolizasService,
    private siniestrosSvc: SiniestrosService,
    private facturacionSvc: FacturacionService,
    private aseguradosSvc: AseguradosService,
    private pedidosSvc: PedidosService
  ) {}

  ngOnInit(): void {
    this.cargarDashboard();
  }

  async cargarDashboard() {
    this.loading = true;
    try {
      // Cargar datos principales
      const [asegurados, polizas, siniestros, facturas, pedidos] = await Promise.all([
        this.aseguradosSvc.listar(),
        this.polizasSvc.listar(),
        this.siniestrosSvc.listar(),
        this.facturacionSvc.listar(),
        this.pedidosSvc.listar()
      ]);

      // Guardar datos originales para exportación
      this.datosOriginales = {
        asegurados,
        polizas,
        siniestros,
        facturas,
        pedidos
      };

      this.procesarAsegurados(asegurados);
      this.procesarPolizas(polizas);
      this.procesarSiniestros(siniestros);
      this.procesarFacturacion(facturas);
      this.procesarPedidos(pedidos);
      
      this.calcularMetricasAvanzadas();
      this.generarGraficos(polizas, siniestros, facturas, pedidos);
      
      this.dataLoaded = true;
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      this.loading = false;
    }
  }

  procesarAsegurados(asegurados: any[]) {
    this.totalAsegurados = asegurados.length;
  }

  procesarPolizas(polizas: Poliza[]) {
    this.totalPolizas = polizas.length;
    this.totalPolizasActivas = polizas.filter(p => p.estado === 'Activa').length;
    this.valorTotalAsegurado = polizas.reduce((acc, p) => acc + (Number(p.valor_asegurado) || 0), 0);
  }

  procesarSiniestros(siniestros: Siniestro[]) {
    this.totalSiniestros = siniestros.length;
    this.siniestrosEnProceso = siniestros.filter(s => s.estado === 'En proceso').length;
    this.siniestrosFinalizados = siniestros.filter(s => s.estado === 'Finalizado').length;
    this.siniestrosRechazados = siniestros.filter(s => s.estado === 'Rechazado').length;
    this.montoTotalDanios = siniestros.reduce((acc, s) => acc + (Number(s.monto_danio) || 0), 0);
    this.promedioMontoDanio = this.totalSiniestros > 0 ? this.montoTotalDanios / this.totalSiniestros : 0;
  }

  procesarFacturacion(facturas: Factura[]) {
    this.totalFacturado = facturas.reduce((acc, f) => acc + (Number(f.monto_facturado) || 0), 0);
    this.totalRecaudado = facturas.reduce((acc, f) => acc + (Number(f.monto_cancelado) || 0), 0);
    this.totalPendientePago = this.totalFacturado - this.totalRecaudado;
    
    const descuentos = facturas.map(f => Number(f.porcentaje_descuento) || 0).filter(d => d > 0);
    this.promedioDescuento = descuentos.length > 0 
      ? descuentos.reduce((a, b) => a + b, 0) / descuentos.length 
      : 0;
    
    this.tasaRecuperacion = this.totalFacturado > 0 
      ? (this.totalRecaudado / this.totalFacturado) * 100 
      : 0;
  }

  procesarPedidos(pedidos: any[]) {
    this.totalPedidos = pedidos.length;
    this.pedidosAbiertos = pedidos.filter(p => p.estado === 'Abierto').length;
    this.pedidosAprobados = pedidos.filter(p => p.estado === 'Aprobado').length;
    this.pedidosRechazados = pedidos.filter(p => p.estado === 'Rechazado').length;
    this.pedidosConvertidos = pedidos.filter(p => p.estado === 'Convertido').length;
  }

  procesarDocumentos(documentos: any[]) {
    this.totalDocumentos = documentos.length;
  }

  calcularMetricasAvanzadas() {
    this.tasaConversionPedidos = this.totalPedidos > 0 
      ? (this.pedidosConvertidos / this.totalPedidos) * 100 
      : 0;
    
    this.tasaSiniestralidad = this.valorTotalAsegurado > 0 
      ? (this.montoTotalDanios / this.valorTotalAsegurado) * 100 
      : 0;
    
    this.eficienciaOperativa = this.totalSiniestros > 0 
      ? (this.siniestrosFinalizados / this.totalSiniestros) * 100 
      : 0;
  }

  generarGraficos(polizas: Poliza[], siniestros: Siniestro[], facturas: Factura[], pedidos: any[]) {
    this.siniestrosEstadoChart.datasets[0].data = [
      this.siniestrosEnProceso,
      this.siniestrosFinalizados,
      this.siniestrosRechazados
    ];

    this.pedidosEstadoChart.datasets[0].data = [
      this.pedidosAbiertos,
      this.pedidosAprobados,
      this.pedidosRechazados,
      this.pedidosConvertidos
    ];

    const aseguradorasMap = new Map<string, number>();
    polizas.forEach(p => {
      const current = aseguradorasMap.get(p.aseguradora) || 0;
      aseguradorasMap.set(p.aseguradora, current + Number(p.valor_asegurado));
    });
    const top5 = Array.from(aseguradorasMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    this.aseguradorasChart.labels = top5.map(([name]) => name);
    this.aseguradorasChart.datasets[0].data = top5.map(([, value]) => value);

    const recaudacionPorMes = this.agruparPorMes(facturas);
    this.recaudacionMensualChart.labels = recaudacionPorMes.map(m => m.mes);
    this.recaudacionMensualChart.datasets[0].data = recaudacionPorMes.map(m => m.total);

    const siniestrosPorMes = this.agruparSiniestrosPorMes(siniestros);
    this.tendenciaSiniestrosChart.labels = siniestrosPorMes.map(m => m.mes);
    this.tendenciaSiniestrosChart.datasets[0].data = siniestrosPorMes.map(m => m.cantidad);
  }

  agruparPorMes(facturas: Factura[]): { mes: string, total: number }[] {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const resultado: { mes: string, total: number }[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mesNombre = meses[fecha.getMonth()];
      const total = facturas
        .filter(f => {
          const fechaPago = new Date(f.fecha_pago);
          return fechaPago.getMonth() === fecha.getMonth() && 
                 fechaPago.getFullYear() === fecha.getFullYear();
        })
        .reduce((acc, f) => acc + Number(f.monto_cancelado), 0);
      
      resultado.push({ mes: mesNombre, total });
    }
    
    return resultado;
  }

  agruparSiniestrosPorMes(siniestros: Siniestro[]): { mes: string, cantidad: number }[] {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const resultado: { mes: string, cantidad: number }[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mesNombre = meses[fecha.getMonth()];
      const cantidad = siniestros
        .filter(s => {
          const fechaSiniestro = new Date(s.fecha_siniestro);
          return fechaSiniestro.getMonth() === fecha.getMonth() && 
                 fechaSiniestro.getFullYear() === fecha.getFullYear();
        }).length;
      
      resultado.push({ mes: mesNombre, cantidad });
    }
    
    return resultado;
  }

  /**
   * Exporta todos los datos del dashboard a un archivo Excel (.xlsx)
   * Organiza la información en múltiples hojas para mejor legibilidad
   */
  exportarAExcel(): void {
    if (this.exportando) return;
    
    this.exportando = true;
    
    try {
      // Crear un nuevo libro de trabajo
      const workbook = XLSX.utils.book_new();
      
      // HOJA 1: Resumen Ejecutivo - KPIs
      const resumenData = [
        ['PANEL GERENCIAL - RISKLEES DIEM'],
        ['Fecha de generación:', new Date().toLocaleString('es-EC')],
        [],
        ['INDICADORES PRINCIPALES'],
        ['Métrica', 'Valor'],
        ['Total Asegurados', this.totalAsegurados],
        ['Pólizas Activas', this.totalPolizasActivas],
        ['Total Pólizas', this.totalPolizas],
        ['Valor Total Asegurado', this.formatearMoneda(this.valorTotalAsegurado)],
        [],
        ['MÉTRICAS FINANCIERAS'],
        ['Métrica', 'Valor'],
        ['Total Recaudado', this.formatearMoneda(this.totalRecaudado)],
        ['Total Facturado', this.formatearMoneda(this.totalFacturado)],
        ['Pendiente de Pago', this.formatearMoneda(this.totalPendientePago)],
        ['Tasa de Recuperación', this.formatearPorcentaje(this.tasaRecuperacion)],
        ['Descuento Promedio', this.formatearPorcentaje(this.promedioDescuento)],
        [],
        ['MÉTRICAS OPERATIVAS'],
        ['Métrica', 'Valor'],
        ['Total Siniestros', this.totalSiniestros],
        ['Siniestros en Proceso', this.siniestrosEnProceso],
        ['Siniestros Finalizados', this.siniestrosFinalizados],
        ['Siniestros Rechazados', this.siniestrosRechazados],
        ['Monto Total Daños', this.formatearMoneda(this.montoTotalDanios)],
        ['Monto Promedio Daño', this.formatearMoneda(this.promedioMontoDanio)],
        ['Tasa de Siniestralidad', this.formatearPorcentaje(this.tasaSiniestralidad)],
        ['Eficiencia Operativa', this.formatearPorcentaje(this.eficienciaOperativa)],
        [],
        ['MÉTRICAS DE PEDIDOS'],
        ['Métrica', 'Valor'],
        ['Total Pedidos', this.totalPedidos],
        ['Pedidos Abiertos', this.pedidosAbiertos],
        ['Pedidos Aprobados', this.pedidosAprobados],
        ['Pedidos Rechazados', this.pedidosRechazados],
        ['Pedidos Convertidos', this.pedidosConvertidos],
        ['Tasa de Conversión', this.formatearPorcentaje(this.tasaConversionPedidos)]
      ];
      
      const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
      this.aplicarEstilosHoja(wsResumen);
      XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen Ejecutivo');
      
      // HOJA 2: Detalle de Pólizas
      const polizasExport = this.datosOriginales.polizas.map(p => ({
        'ID': p.id,
        'Número de Póliza': p.num_poliza,
        'Aseguradora': p.aseguradora,
        'Valor Asegurado': Number(p.valor_asegurado),
        'Estado': p.estado,
        'Fecha Inicio': p.fecha_inicio,
        'Fecha Fin': p.fecha_fin
      }));
      
      const wsPolizas = XLSX.utils.json_to_sheet(polizasExport);
      this.aplicarEstilosHoja(wsPolizas);
      XLSX.utils.book_append_sheet(workbook, wsPolizas, 'Pólizas');
      
      // HOJA 3: Detalle de Siniestros
      const siniestrosExport = this.datosOriginales.siniestros.map(s => ({
        'ID': s.id,
        'Estado': s.estado,
        'Monto Daño': Number(s.monto_danio),
        'Fecha Siniestro': s.fecha_siniestro
      }));
      
      const wsSiniestros = XLSX.utils.json_to_sheet(siniestrosExport);
      this.aplicarEstilosHoja(wsSiniestros);
      XLSX.utils.book_append_sheet(workbook, wsSiniestros, 'Siniestros');
      
      // HOJA 4: Detalle de Facturación
      const facturasExport = this.datosOriginales.facturas.map(f => ({
        'ID': f.id,
        'Monto Facturado': Number(f.monto_facturado),
        'Monto Cancelado': Number(f.monto_cancelado),
        'Pendiente': Number(f.monto_facturado) - Number(f.monto_cancelado),
        'Descuento (%)': Number(f.porcentaje_descuento),
        'Fecha de Pago': f.fecha_pago
      }));
      
      const wsFacturas = XLSX.utils.json_to_sheet(facturasExport);
      this.aplicarEstilosHoja(wsFacturas);
      XLSX.utils.book_append_sheet(workbook, wsFacturas, 'Facturación');
      
      // HOJA 5: Detalle de Pedidos
      const pedidosExport = this.datosOriginales.pedidos.map(p => ({
        'ID': p.id,
        'Estado': p.estado,
        ...p
      }));
      
      const wsPedidos = XLSX.utils.json_to_sheet(pedidosExport);
      this.aplicarEstilosHoja(wsPedidos);
      XLSX.utils.book_append_sheet(workbook, wsPedidos, 'Pedidos');
      
      // HOJA 6: Asegurados
      const aseguradosExport = this.datosOriginales.asegurados.map(a => ({
        'ID': a.id,
        ...a
      }));
      
      const wsAsegurados = XLSX.utils.json_to_sheet(aseguradosExport);
      this.aplicarEstilosHoja(wsAsegurados);
      XLSX.utils.book_append_sheet(workbook, wsAsegurados, 'Asegurados');
      
      // HOJA 7: Análisis por Aseguradora
      const aseguradorasMap = new Map<string, { 
        valorTotal: number, 
        cantidadPolizas: number,
        polizasActivas: number 
      }>();
      
      this.datosOriginales.polizas.forEach(p => {
        const current = aseguradorasMap.get(p.aseguradora) || { 
          valorTotal: 0, 
          cantidadPolizas: 0,
          polizasActivas: 0
        };
        
        aseguradorasMap.set(p.aseguradora, {
          valorTotal: current.valorTotal + Number(p.valor_asegurado),
          cantidadPolizas: current.cantidadPolizas + 1,
          polizasActivas: current.polizasActivas + (p.estado === 'Activa' ? 1 : 0)
        });
      });
      
      const aseguradorasAnalisis = Array.from(aseguradorasMap.entries())
        .map(([nombre, datos]) => ({
          'Aseguradora': nombre,
          'Valor Total Asegurado': datos.valorTotal,
          'Cantidad de Pólizas': datos.cantidadPolizas,
          'Pólizas Activas': datos.polizasActivas,
          'Valor Promedio': datos.valorTotal / datos.cantidadPolizas
        }))
        .sort((a, b) => b['Valor Total Asegurado'] - a['Valor Total Asegurado']);
      
      const wsAseguradoras = XLSX.utils.json_to_sheet(aseguradorasAnalisis);
      this.aplicarEstilosHoja(wsAseguradoras);
      XLSX.utils.book_append_sheet(workbook, wsAseguradoras, 'Análisis Aseguradoras');
      
      // HOJA 8: Recaudación Mensual
      const recaudacionMensual = this.agruparPorMes(this.datosOriginales.facturas).map(r => ({
        'Mes': r.mes,
        'Total Recaudado': r.total
      }));
      
      const wsRecaudacion = XLSX.utils.json_to_sheet(recaudacionMensual);
      this.aplicarEstilosHoja(wsRecaudacion);
      XLSX.utils.book_append_sheet(workbook, wsRecaudacion, 'Recaudación Mensual');
      
      // HOJA 9: Tendencia de Siniestros
      const tendenciaSiniestros = this.agruparSiniestrosPorMes(this.datosOriginales.siniestros).map(s => ({
        'Mes': s.mes,
        'Cantidad de Siniestros': s.cantidad
      }));
      
      const wsTendencia = XLSX.utils.json_to_sheet(tendenciaSiniestros);
      this.aplicarEstilosHoja(wsTendencia);
      XLSX.utils.book_append_sheet(workbook, wsTendencia, 'Tendencia Siniestros');
      
      // Generar nombre de archivo con fecha
      const fecha = new Date().toISOString().split('T')[0];
      const nombreArchivo = `Dashboard_Gerencial_${fecha}.xlsx`;
      
      // Exportar el archivo
      XLSX.writeFile(workbook, nombreArchivo);
      
      console.log('Exportación completada exitosamente');
      
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      alert('Ocurrió un error al generar el archivo Excel. Por favor, intente nuevamente.');
    } finally {
      this.exportando = false;
    }
  }
  
  /**
   * Aplica estilos y configuraciones a una hoja de Excel
   */
  private aplicarEstilosHoja(worksheet: XLSX.WorkSheet): void {
    // Configurar ancho de columnas
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    const colWidths: number[] = [];
    
    for (let C = range.s.c; C <= range.e.c; ++C) {
      let maxWidth = 10;
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellAddress];
        if (cell && cell.v) {
          const cellLength = cell.v.toString().length;
          maxWidth = Math.max(maxWidth, cellLength);
        }
      }
      colWidths.push(Math.min(maxWidth + 2, 50));
    }
    
    worksheet['!cols'] = colWidths.map(w => ({ wch: w }));
  }
  
  /**
   * Formatea un número como moneda USD
   */
  private formatearMoneda(valor: number): string {
    return `$${valor.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  
  /**
   * Formatea un número como porcentaje
   */
  private formatearPorcentaje(valor: number): string {
    return `${valor.toFixed(2)}%`;
  }

  cerrarSesion() {
    localStorage.removeItem('usuario');
    window.location.href = '/login';
  }
}