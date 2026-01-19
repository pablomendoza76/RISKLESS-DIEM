import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts'; 
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

// Services
import { PolizasService } from '../../services/polizas.service';
import { SiniestrosService } from '../../services/siniestros.service';
import { FacturacionService } from '../../services/facturacion.service';
import { AseguradosService } from '../../services/asegurados.service';
import { Poliza } from '../../interfaces/poliza.model';

@Component({
  selector: 'app-home-gerente',
  standalone: true,
  imports: [CommonModule, MatIconModule, BaseChartDirective],
  templateUrl: './home-gerente.component.html',
  styleUrls: ['./home-gerente.component.scss']
})
export class HomeGerenteComponent implements OnInit {
  // KPIs
  totalAsegurados = 0;
  totalPolizas = 0;
  valorTotalAsegurado = 0;
  siniestrosActivos = 0;
  totalRecaudado = 0;
  loading = true;

  // Chart Data: Claims Distribution (Doughnut)
  public claimsChartData: ChartData<'doughnut'> = {
    labels: ['En proceso', 'Cerrados', 'Rechazados'],
    datasets: [{ data: [0, 0, 0], backgroundColor: ['#f44336', '#4caf50', '#ff9800'] }]
  };

  // Chart Data: Monthly Revenue (Bar)
  public revenueChartData: ChartData<'bar'> = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [{ 
      data: [0, 0, 0, 0, 0, 0], 
      label: 'Recaudación ($)', 
      backgroundColor: '#3f51b5' 
    }]
  };

  constructor(
    private polizasSvc: PolizasService,
    private siniestrosSvc: SiniestrosService,
    private facturacionSvc: FacturacionService,
    private aseguradosSvc: AseguradosService
  ) {}

  ngOnInit(): void {
    this.cargarDashboard();
  }

  async cargarDashboard() {
    this.loading = true;
    try {
      const [asegurados, polizas, siniestros, facturas] = await Promise.all([
        this.aseguradosSvc.listar(),
        this.polizasSvc.listar(),
        this.siniestrosSvc.listar(),
        this.facturacionSvc.listar()
      ]);

      // Global Stats
      this.totalAsegurados = asegurados.length;
      this.totalPolizas = polizas.length;
      this.valorTotalAsegurado = polizas.reduce((acc: number, p: Poliza) => acc + (Number(p.valor_asegurado) || 0), 0);
      this.siniestrosActivos = siniestros.filter((s: any) => s.estado === 'En proceso').length;
      this.totalRecaudado = facturas.reduce((acc: number, f: any) => acc + (Number(f.monto_cancelado) || 0), 0);

      // Process Data for Claims Chart
      const proc = siniestros.filter((s: any) => s.estado === 'En proceso').length;
      const cerr = siniestros.filter((s: any) => s.estado === 'Finalizado').length;
      const rech = siniestros.filter((s: any) => s.estado === 'Rechazado').length;
      this.claimsChartData.datasets[0].data = [proc, cerr, rech];

      // Example: Fill Revenue chart (logic depends on your facturas date format)
      // this.revenueChartData.datasets[0].data = [actual_monthly_data...];

    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      this.loading = false;
    }
  }

  cerrarSesion() {
    window.location.href = '/login';
  }
}