import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {

  email: string = '';
  password: string = '';

  loading: boolean = false;
  error: string | null = null;

  constructor(
    private usuariosService: UsuariosService,
    private router: Router
  ) {}

async login(): Promise<void> {
  console.log('🟡 [LOGIN] Iniciando login');
  this.error = null;
  this.loading = true;

  try {
    const usuario = await this.usuariosService.login(
      this.email.trim(),
      this.password
    );

    console.log('🟢 [LOGIN] Usuario recibido:', usuario);

    // ✅ VALIDACIÓN REAL
    if (!usuario.rol || !usuario.rol.nombre) {
      console.error('🔴 [LOGIN] Usuario sin rol:', usuario);
      this.error = 'Usuario sin rol asignado';
      return;
    }

    // ✅ NORMALIZACIÓN SEGURA
    const rol = usuario.rol.nombre.trim().toLowerCase();
    const nombre = usuario.nombre?.trim() || 'Usuario';

    console.log('🟢 [LOGIN] Rol normalizado:', rol);
    console.log('🟢 [LOGIN] Nombre:', nombre);

    // Guardar sesión
    localStorage.setItem('usuario', JSON.stringify(usuario));
    localStorage.setItem('rol', rol);
    localStorage.setItem('nombreUsuario', nombre);

    // ✅ REDIRECCIÓN REAL
    if (rol === 'administrador') {
      await this.router.navigate(['/admin']);
    } else if (rol === 'gerente') {
      await this.router.navigate(['/gerente']);
    } else if (rol === 'asesor') {
      await this.router.navigate(['/asesor']);
    } else {
      console.warn('⚠️ Rol no reconocido:', rol);
      await this.router.navigate(['/login']);
    }

  } catch (err: any) {
    console.error('🔴 [LOGIN] Error:', err);
    this.error = err?.message || 'Credenciales incorrectas';
  } finally {
    this.loading = false;
    console.log('🟡 [LOGIN] Proceso finalizado');
  }
}



}
