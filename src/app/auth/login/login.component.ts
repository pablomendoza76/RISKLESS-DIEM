import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../../services/usuarios.service';
import { gsap } from 'gsap';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements AfterViewInit {

  email: string = '';
  password: string = '';
  loading: boolean = false;
  error: string | null = null;

  // --- Referencias al DOM para GSAP ---
  @ViewChild('loginCard') loginCard!: ElementRef;
  @ViewChild('brandContent') brandContent!: ElementRef;
  @ViewChild('featureList') featureList!: ElementRef;
  @ViewChild('formHeader') formHeader!: ElementRef;
  @ViewChild('inputList') inputList!: ElementRef;
  @ViewChild('formFooter') formFooter!: ElementRef;
  @ViewChild('decorations') decorations!: ElementRef;

  constructor(
    private usuariosService: UsuariosService,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    // Iniciamos la animación una vez que la vista ha cargado
    this.initEntranceAnimation();
  }

  private initEntranceAnimation(): void {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // 1. Elementos decorativos (Fondo)
    const decorElements = this.decorations.nativeElement.children;
    tl.to(decorElements, {
      autoAlpha: 1,
      duration: 1.5,
      stagger: 0.2,
      scale: 1
    });

    // 2. Tarjeta Principal (Entrada desde abajo)
    tl.fromTo(this.loginCard.nativeElement,
      { y: 50, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.8 },
      "-=1.2" // Solapamiento para que empiece antes de terminar el fondo
    );

    // 3. Contenido Izquierdo (Branding)
    tl.fromTo(this.brandContent.nativeElement.children,
      { x: -30, autoAlpha: 0 },
      { x: 0, autoAlpha: 1, duration: 0.6, stagger: 0.1 },
      "-=0.4"
    );

    // 4. Features (Iconos)
    tl.fromTo(this.featureList.nativeElement.children,
      { x: -20, autoAlpha: 0 },
      { x: 0, autoAlpha: 1, duration: 0.6, stagger: 0.1 },
      "-=0.4"
    );

    // 5. Contenido Derecho (Formulario)
    tl.fromTo([this.formHeader.nativeElement, ...Array.from(this.inputList.nativeElement.children)],
      { y: 20, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.08 },
      "-=0.6"
    );

    // 6. Footer
    tl.fromTo(this.formFooter.nativeElement,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.5 },
      "-=0.2"
    );
  }

  async login(): Promise<void> {
    console.log('🟡 [LOGIN] Iniciando login');
    this.error = null;
    this.loading = true;

    // Micro-animación en el botón al hacer click
    gsap.to('.btn-login', { scale: 0.98, duration: 0.1, yoyo: true, repeat: 1 });

    try {
      const usuario = await this.usuariosService.login(
        this.email.trim(),
        this.password
      );

      if (!usuario.rol || !usuario.rol.nombre) {
        this.error = 'Usuario sin rol asignado';
        this.shakeError();
        return;
      }

      const rol = usuario.rol.nombre.trim().toLowerCase();
      const nombre = usuario.nombre?.trim() || 'Usuario';

      localStorage.setItem('usuario', JSON.stringify(usuario));
      localStorage.setItem('rol', rol);
      localStorage.setItem('nombreUsuario', nombre);

      // --- Animación de Salida Exitosa ---
      await this.animateOut();

      // Redirección
      if (rol === 'administrador') {
        await this.router.navigate(['/admin']);
      } else if (rol === 'gerente') {
        await this.router.navigate(['/gerente']);
      } else if (rol === 'asesor') {
        await this.router.navigate(['/asesor']);
      } else {
        await this.router.navigate(['/login']);
      }

    } catch (err: any) {
      console.error('🔴 [LOGIN] Error:', err);
      this.error = err?.message || 'Credenciales incorrectas';
      
      // Esperamos un tick para que Angular renderice el div de error, luego animamos
      setTimeout(() => this.shakeError(), 0);
    } finally {
      this.loading = false;
    }
  }

  // Animación de "temblor" para errores
  private shakeError(): void {
    const errorEl = document.querySelector('.error-message');
    if (errorEl) {
      gsap.fromTo(errorEl, 
        { x: 0 }, 
        { x: 10, duration: 0.08, repeat: 5, yoyo: true, ease: 'power1.inOut' }
      );
    }
  }

  // Animación de salida al completar login
  private animateOut(): Promise<void> {
    return new Promise((resolve) => {
      gsap.to(this.loginCard.nativeElement, {
        y: -50,
        autoAlpha: 0,
        scale: 0.95,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => resolve()
      });
    });
  }
}