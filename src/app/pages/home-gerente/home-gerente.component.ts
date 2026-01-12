import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

// Servicios (Ruta corregida: sube 2 niveles hasta src/app/)
import { PolizasService } from '../../services/polizas.service';
import { SiniestrosService } from '../../services/siniestros.service';
import { FacturacionService } from '../../services/facturacion.service';
import { AseguradosService } from '../../services/asegurados.service';

// Interfaces
import { Poliza } from '../../interfaces/poliza.model';

@Component({
  selector: 'app-home-gerente',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './home-gerente.component.html',
  styleUrls: ['./home-gerente.component.scss']
})
export class HomeGerenteComponent implements OnInit {

  // Métricas para el dashboard
  totalAsegurados = 0;
  totalPolizas = 0;
  valorTotalAsegurado = 0;
  siniestrosActivos = 0;
  totalRecaudado = 0;
  loading = true;

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

      this.totalAsegurados = asegurados.length;
      this.totalPolizas = polizas.length;
      
      this.valorTotalAsegurado = polizas.reduce((acc: number, p: Poliza) => 
        acc + (Number(p.valor_asegurado) || 0), 0);
      
      this.siniestrosActivos = siniestros.filter((s: any) => 
        s.estado === 'En proceso').length;

      this.totalRecaudado = facturas.reduce((acc: number, f: any) => 
        acc + (Number(f.monto_cancelado) || 0), 0);

    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      this.loading = false;
    }
  }

  cerrarSesion() {
    // Lógica para limpiar token y redirigir al login
    window.location.href = '/login';
  }
}