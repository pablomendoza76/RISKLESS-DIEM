import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';




import { HomeAdminComponent } from './pages/home-admin/home-admin.component';
import { HomeGerenteComponent } from './pages/home-gerente/home-gerente.component';
import { HomeAsesorComponent } from './pages/home-asesor/home-asesor.component';
import { RolGuard } from './guards/rol.guard';

export const routes: Routes = [
  // Default
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  //  LOGIN
  {
    path: 'login',
    component: LoginComponent,
  },

  // ADMIN
  {
    path: 'admin',
    component: HomeAdminComponent,
    canActivate: [RolGuard],
    data: { rol: 'Administrador' },
  },

  // GERENTE
  {
    path: 'gerente',
    component: HomeGerenteComponent,
    canActivate: [RolGuard],
    data: { rol: 'Gerente' },
  },

  // ASESOR
  {
    path: 'asesor',
    component: HomeAsesorComponent,
    canActivate: [RolGuard],
    data: { rol: 'Asesor' },
  },

  // CUALQUIER OTRA RUTA
  {
    path: '**',
    redirectTo: 'login',
  },
];
