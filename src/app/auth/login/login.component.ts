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
  this.error = null;
  this.loading = true;

  try {
    const usuario = await this.usuariosService.login(
      this.email.trim(),
      this.password.trim()
    );

    localStorage.setItem('usuario', JSON.stringify(usuario));

    this.router.navigateByUrl('/Administrador');

  } catch (err: any) {
    this.error = err?.message || 'Credenciales incorrectas';
  } finally {
    this.loading = false;
  }
}

}
