// import { Injectable } from '@angular/core';
// import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';

// @Injectable({ providedIn: 'root' })
// export class RolGuard implements CanActivate {

//   constructor(private router: Router) {}

//   canActivate(route: ActivatedRouteSnapshot): boolean {

//     const usuarioRaw = localStorage.getItem('usuario');
//     if (!usuarioRaw) {
//       this.router.navigate(['/login']);
//       return false;
//     }

//     const usuario = JSON.parse(usuarioRaw);
//     const rolEsperado = route.data['rol'];

//     if (!usuario.rol || usuario.rol.nombre !== rolEsperado) {
//       this.router.navigate(['/login']);
//       return false;
//     }

//     return true;
//   }
// }
