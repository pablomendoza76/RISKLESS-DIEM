import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MediaMatcher, BreakpointObserver } from '@angular/cdk/layout';

export interface SidebarItem {
  label: string;
  icon: string;
  route?: string;
  children?: SidebarItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class SidebarComponent implements OnInit, OnDestroy {

  /* =========================
     INPUTS
  ========================= */
  @Input() title = 'Riskless';
  @Input() items: SidebarItem[] = [];

  /* =========================
     OUTPUTS
  ========================= */
  @Output() logout = new EventEmitter<void>();

  /* =========================
     ESTADO INTERNO
  ========================= */
  activeIndex: number | null = null;
  isMobileView = false;
  isMobileMenuOpen = false;
  private mobileQuery: MediaQueryList;

  constructor(
    private mediaMatcher: MediaMatcher,
    private breakpointObserver: BreakpointObserver
  ) {
    this.mobileQuery = this.mediaMatcher.matchMedia('(max-width: 768px)');
  }

  ngOnInit() {
    // Escuchar cambios en el tamaño de pantalla
    this.mobileQuery.addEventListener('change', () => {
      this.isMobileView = this.mobileQuery.matches;
      if (!this.isMobileView) {
        this.isMobileMenuOpen = false;
      }
    });
    
    // Estado inicial
    this.isMobileView = this.mobileQuery.matches;
  }

  ngOnDestroy() {
    this.mobileQuery.removeEventListener('change', () => {});
  }

  toggle(index: number): void {
    this.activeIndex = this.activeIndex === index ? null : index;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  navigateAndClose(route?: string): void {
    if (route) {
      this.closeMobileMenu();
    }
  }

  emitirLogout(): void {
    this.logout.emit();
    this.closeMobileMenu();
  }
}
