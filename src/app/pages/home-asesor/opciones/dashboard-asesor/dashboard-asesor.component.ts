import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartConfiguration } from 'chart.js';

import { AseguradosService } from '../../../../services/asegurados.service';
import { PedidosService } from '../../../../services/pedidos.service';
import { PolizasService } from '../../../../services/polizas.service';
import { SiniestrosService } from '../../../../services/siniestros.service';

@Component({
  selector: 'app-dashboard-asesor',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard-asesor.component.html',
  styleUrls: ['./dashboard-asesor.component.scss'],
})
export class DashboardAsesorComponent implements OnInit {

  loading = true;

  // ================= KPIs =================
  totalAsegurados = 0;
  polizasActivas = 0;
  siniestrosEnProceso = 0;
  pedidosAbiertos = 0;

  // ================= CHARTS =================

  // 1️⃣ Pedidos (líneas)
  pedidosLineChart: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        label: 'Pedidos realizados',
        data: [],
        borderColor: '#3891F4',
        backgroundColor: 'rgba(56,145,244,0.15)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Pedidos abiertos',
        data: [],
        borderColor: '#C6AF6B',
        backgroundColor: 'rgba(198,175,107,0.15)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  // 2️⃣ Estado pedidos (doughnut)
  pedidosEstadoChart: ChartData<'doughnut'> = {
    labels: ['Abiertos', 'Aprobados', 'Rechazados', 'Convertidos'],
    datasets: [{
      data: [0, 0, 0, 0],
      backgroundColor: ['#3891F4', '#2e7d32', '#c62828', '#C6AF6B'],
      borderWidth: 0
    }]
  };

  // 3️⃣ Siniestros por estado (bar)
  siniestrosEstadoChart: ChartData<'bar'> = {
    labels: ['En proceso', 'Cerrado', 'Rechazado'],
    datasets: [{
      label: 'Siniestros',
      data: [0, 0, 0],
      backgroundColor: '#062140',
      borderRadius: 8
    }]
  };

  // 4️⃣ Pólizas (bar simple)
  polizasChart: ChartData<'bar'> = {
    labels: ['Activas', 'Vencidas'],
    datasets: [{
      label: 'Pólizas',
      data: [0, 0],
      backgroundColor: ['#3891F4', '#c62828'],
      borderRadius: 8
    }]
  };

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  constructor(
    private aseguradosSvc: AseguradosService,
    private pedidosSvc: PedidosService,
    private polizasSvc: PolizasService,
    private siniestrosSvc: SiniestrosService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.cargarDashboard();
  }

  async cargarDashboard(): Promise<void> {
    this.loading = true;

    try {
      const [asegurados, pedidos, polizas, siniestros] = await Promise.all([
        this.aseguradosSvc.listar(),
        this.pedidosSvc.listar(),
        this.polizasSvc.listar(),
        this.siniestrosSvc.listar()
      ]);

      // KPIs
      this.totalAsegurados = asegurados.length;
      this.polizasActivas = polizas.filter(p => p.estado === 'Activa').length;
      this.siniestrosEnProceso = siniestros.filter(s => s.estado === 'En proceso').length;
      this.pedidosAbiertos = pedidos.filter(p => p.estado === 'Abierto').length;

      this.generarGraficoPedidos(pedidos);
      this.generarEstadoPedidos(pedidos);
      this.generarEstadoSiniestros(siniestros);
      this.generarEstadoPolizas(polizas);

    } catch (err) {
      console.error('Error dashboard asesor', err);
    } finally {
      this.loading = false;
    }
  }

  // ================= MÉTODOS =================

  private generarGraficoPedidos(pedidos: any[]) {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    const ahora = new Date();

    const realizados: number[] = [];
    const abiertos: number[] = [];

    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);

      const pedidosMes = pedidos.filter(p => {
        const f = new Date(p.created_at);
        return f.getMonth() === fecha.getMonth() &&
               f.getFullYear() === fecha.getFullYear();
      });

      realizados.push(pedidosMes.length);
      abiertos.push(pedidosMes.filter(p => p.estado === 'Abierto').length);
    }

    this.pedidosLineChart.labels = meses;
    this.pedidosLineChart.datasets[0].data = realizados;
    this.pedidosLineChart.datasets[1].data = abiertos;
  }

  private generarEstadoPedidos(pedidos: any[]) {
    this.pedidosEstadoChart.datasets[0].data = [
      pedidos.filter(p => p.estado === 'Abierto').length,
      pedidos.filter(p => p.estado === 'Aprobado').length,
      pedidos.filter(p => p.estado === 'Rechazado').length,
      pedidos.filter(p => p.estado === 'Convertido').length,
    ];
  }

  private generarEstadoSiniestros(siniestros: any[]) {
    this.siniestrosEstadoChart.datasets[0].data = [
      siniestros.filter(s => s.estado === 'En proceso').length,
      siniestros.filter(s => s.estado === 'Cerrado').length,
      siniestros.filter(s => s.estado === 'Rechazado').length,
    ];
  }

  private generarEstadoPolizas(polizas: any[]) {
    this.polizasChart.datasets[0].data = [
      polizas.filter(p => p.estado === 'Activa').length,
      polizas.filter(p => p.estado === 'Vencida').length,
    ];
  }
}
