import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

export interface DynamicField {
  type: 'text' | 'number' | 'select' | 'file' | 'email' | 'password' | 'date';
  name: string;
  label: string;
  required?: boolean;
  min?: number;
  max?: number;
  options?: { label: string; value: any }[];
}

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.scss',
})
export class DynamicFormComponent implements OnInit, OnChanges {

  @Input() fields: DynamicField[] = [];
  @Input() titulo: string = '';
  @Input() initialData: any | null = null;

  @Output() cancelar = new EventEmitter<void>();
  @Output() formSubmit = new EventEmitter<FormGroup>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  /* =========================
     INIT
  ========================= */
  ngOnInit(): void {
    this.buildForm();
  }

  /* =========================
     DETECTA CAMBIOS (EDITAR)
  ========================= */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData'] && this.initialData && this.form) {
      this.form.patchValue(this.initialData);
    }
  }

  /* =========================
     CONSTRUYE FORMULARIO
  ========================= */
  private buildForm(): void {
    const group: any = {};

    this.fields.forEach(field => {
      const validators = [];

      if (field.required) validators.push(Validators.required);
      if (field.min !== undefined) validators.push(Validators.min(field.min));
      if (field.max !== undefined) validators.push(Validators.max(field.max));

      // validación email
      if (field.type === 'email') {
        validators.push(
          Validators.email,
          Validators.pattern(/.+@.+\.com$/)
        );
      }

      group[field.name] = ['', validators];
    });

    this.form = this.fb.group(group);

    // precarga inicial (por si llega antes del ngOnChanges)
    if (this.initialData) {
      this.form.patchValue(this.initialData);
    }
  }

  /* =========================
     FILE INPUT
  ========================= */
  onFileChange(event: Event, fieldName: string): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.form.patchValue({ [fieldName]: file });
    }
  }

  /* =========================
     SUBMIT
  ========================= */
  submit(): void {
    if (this.form.valid) {
      this.formSubmit.emit(this.form);
    } else {
      this.form.markAllAsTouched();
    }
  }

  /* =========================
     CANCELAR
  ========================= */
  onCancelar(): void {
    this.cancelar.emit();
  }
}
