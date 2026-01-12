import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';

import { HomeAdminComponent } from './pages/home-admin/home-admin.component';
import { HomeGerenteComponent } from './pages/home-gerente/home-gerente.component';
import { HomeAsesorComponent } from './pages/home-asesor/home-asesor.component';
import { AseguradosComponent } from './pages/home-asesor/opciones/asegurados/asegurados.component';
import { BienesComponent } from './pages/home-asesor/opciones/bienes/bienes.component';
import { PedidosComponent } from './pages/home-asesor/opciones/pedidos/pedidos.component';
import { PolizasComponent } from './pages/home-asesor/opciones/polizas/polizas.component';
import { SiniestrosComponent } from './pages/home-asesor/opciones/siniestros/siniestros.component';
import { PolizaFormComponent } from './pages/home-asesor/opciones/poliza-form/poliza-form.component';
import { FacturacionComponent } from './pages/home-asesor/opciones/facturacion/facturacion.component';
import { PedidosAseguradoComponent } from './pages/pedidos-asegurado/pedidos-asegurado.component';




export const routes: Routes = [

  // DEFAULT
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // LOGIN
  { path: 'login', component: LoginComponent },

  // ADMIN
  {
    path: 'admin',
    component: HomeAdminComponent,
    data: { rol: 'Administrador' },
  },

  // GERENTE
  {
    path: 'gerente',
    component: HomeGerenteComponent,
    data: { rol: 'Gerente' },
  },

  // PEDIDO INDIVIDUAL
  {
    path: 'pedidoAgurado',
    component: PedidosAseguradoComponent,
  },


  // ASESOR (RUTAS HIJAS)
  {
    path: 'asesor',
    component: HomeAsesorComponent,
    data: { rol: 'Asesor' },
    children: [

      { path: '', redirectTo: 'asegurados', pathMatch: 'full' },

      { path: 'asegurados', component: AseguradosComponent },
      { path: 'bienes', component: BienesComponent },
      { path: 'polizas', component: PolizasComponent },
      { path: 'polizas_crear', component: PolizaFormComponent },
      { path: 'sinistros', component: SiniestrosComponent },
      { path: 'pedidos', component: PedidosComponent },
      { path: 'facturacion', component: FacturacionComponent },

    ],
  },

  // CUALQUIER OTRA
  { path: '**', redirectTo: 'login' },
];
