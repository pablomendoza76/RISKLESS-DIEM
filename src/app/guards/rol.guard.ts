import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UsuarioPerfilConRol } from '../services/usuarios.service';

@Injectable({ providedIn: 'root' })
export class RolGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {

    const raw = localStorage.getItem('usuario');

    if (!raw) {
      this.router.navigate(['/login']);
      return false;
    }

    const usuario: UsuarioPerfilConRol = JSON.parse(raw);

    if (!usuario.rol || usuario.rol.nombre !== 'Administrador') {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
