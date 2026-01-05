import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { Router } from '@angular/router';

import { PolizasMapper } from '../../../../mapping/polizas.mapper';

@Component({
  selector: 'app-poliza-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './poliza-form.component.html',
  styleUrl: './poliza-form.component.scss'
})
export class PolizaFormComponent implements OnInit {

  // ===== Inyecciones =====
  mapper = inject(PolizasMapper);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // ===== Formulario =====
  form!: FormGroup;

  // ===== Archivos =====
  archivos: File[] = [];

  async ngOnInit(): Promise<void> {

    // Inicializar formulario
    this.form = this.fb.group({
      num_poliza: ['', Validators.required],
      aseguradora: ['', Validators.required],
      valor_asegurado: [0, [Validators.required, Validators.min(1)]],
      estado: ['Activa', Validators.required],
      fecha_inicio: ['', Validators.required],
      fecha_fin: ['', Validators.required],

      // 🔹 Cláusulas NUEVAS (FormArray)
      clausulas: this.fb.array([])
    });
  }

  /* =========================
     GETTERS
  ========================= */
  get clausulas(): FormArray {
    return this.form.get('clausulas') as FormArray;
  }

  /* =========================
     CLÁUSULAS
  ========================= */
  agregarClausula(): void {
    this.clausulas.push(
      this.fb.group({
        titulo: ['', Validators.required],
        descripcion: ['', Validators.required]
      })
    );
  }

  eliminarClausula(index: number): void {
    this.clausulas.removeAt(index);
  }

  /* =========================
     DOCUMENTOS
  ========================= */
  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    for (let i = 0; i < input.files.length; i++) {
      this.archivos.push(input.files[i]);
    }

    // limpiar input
    input.value = '';
  }

  quitarArchivo(file: File): void {
    this.archivos = this.archivos.filter(f => f !== file);
  }

  /* =========================
     GUARDAR
  ========================= */
  async guardar(): Promise<void> {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const usuarioId = localStorage.getItem('usuarioId') ?? 'sistema';

    await this.mapper.crearPolizaCompleta({
      poliza: {
        num_poliza: this.form.value.num_poliza,
        aseguradora: this.form.value.aseguradora,
        valor_asegurado: this.form.value.valor_asegurado,
        estado: this.form.value.estado,
        fecha_inicio: this.form.value.fecha_inicio,
        fecha_fin: this.form.value.fecha_fin,
      },
      clausulasNuevas: this.form.value.clausulas,
      documentos: this.archivos,
      usuarioId
    });

    this.router.navigate(['/polizas']);
  }

  /* =========================
     CANCELAR
  ========================= */
  cancelar(): void {
    this.router.navigate(['/polizas']);
  }
}
