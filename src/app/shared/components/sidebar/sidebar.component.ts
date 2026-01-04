import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

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
})
export class SidebarComponent {

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

  toggle(index: number): void {
    this.activeIndex = this.activeIndex === index ? null : index;
  }

  emitirLogout(): void {
    this.logout.emit();
  }
}
