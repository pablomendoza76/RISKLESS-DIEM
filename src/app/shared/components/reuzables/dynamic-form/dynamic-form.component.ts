import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';

export interface DynamicField {
  type: 'text' | 'number' | 'select' | 'file' | 'email' | 'password' | 'date' |'textarea';
  name: string;
  label: string;
  required?: boolean;
  min?: number;
  max?: number;
  maxLength?: number; 
  disabled?: boolean;
  options?: { label: string; value: any }[];
}

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.scss',
})
export class DynamicFormComponent
  implements OnInit, OnChanges, OnDestroy {

  @Input() fields: DynamicField[] = [];
  @Input() titulo: string = '';
  @Input() initialData: any | null = null;

  @Output() cancelar = new EventEmitter<void>();
  @Output() formSubmit = new EventEmitter<FormGroup>();
  @Output() filesSelected = new EventEmitter<File[]>();


  // emite cambios por campo
  @Output() valueChange = new EventEmitter<{
    field: string;
    value: any;
    form: FormGroup;
  }>();

  form!: FormGroup;
  private subscriptions: Subscription[] = [];

  // archivos por campo
  selectedFiles: Record<string, File[]> = {};

  constructor(private fb: FormBuilder) {}

  /* init */
  ngOnInit(): void {
    this.buildForm();
    this.listenToChanges();
  }

  /* cambios externos */
  ngOnChanges(changes: SimpleChanges): void {

  // CUANDO CAMBIAN LOS CAMPOS → RECONSTRUIR FORMULARIO
  if (changes['fields'] && this.fields?.length) {

    // limpiar subscripciones
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];

    // reconstruir form
    this.buildForm();
    this.listenToChanges();

    // cargar datos iniciales si existen
    if (this.initialData) {
      this.form.patchValue(this.initialData, { emitEvent: false });
    }
  }

  // edición: datos iniciales
  if (changes['initialData'] && this.initialData && this.form) {
    this.form.patchValue(this.initialData, { emitEvent: false });
  }
}


  /* construir formulario */
  private buildForm(): void {
  const group: any = {};

  this.fields.forEach(field => {
    const validators = [];

    if (field.required) validators.push(Validators.required);
    if (field.min !== undefined) validators.push(Validators.min(field.min));
    if (field.max !== undefined) validators.push(Validators.max(field.max));
    if (field.maxLength !== undefined) {
      validators.push(Validators.maxLength(field.maxLength));
    }

    if (field.type === 'email') {
      validators.push(
        Validators.email,
        Validators.pattern(/.+@.+\.com$/)
      );
    }

    group[field.name] = [
      { value: '', disabled: field.disabled === true },
      validators
    ];
  });

  this.form = this.fb.group(group);

  if (this.initialData) {
    this.form.patchValue(this.initialData, { emitEvent: false });
  }
}


  /* escuchar cambios */
  private listenToChanges(): void {
    this.fields.forEach(field => {
      const control = this.form.get(field.name);
      if (!control) return;

      const sub = control.valueChanges.subscribe(value => {
        this.valueChange.emit({
          field: field.name,
          value,
          form: this.form,
        });
      });

      this.subscriptions.push(sub);
    });
  }

  /* archivos */
onFileChange(event: Event, fieldName: string): void {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const files = Array.from(input.files);

  if (!this.selectedFiles[fieldName]) {
    this.selectedFiles[fieldName] = [];
  }

  this.selectedFiles[fieldName].push(...files);

  // 🔥 EMITIR AL PADRE
  this.filesSelected.emit(this.selectedFiles[fieldName]);

  this.form.patchValue(
    { [fieldName]: this.selectedFiles[fieldName] },
    { emitEvent: true }
  );

  input.value = '';
}

  /* submit */
  submit(): void {
    if (this.form.valid) {
      this.formSubmit.emit(this.form);
    } else {
      this.form.markAllAsTouched();
    }
  }

  /* cancelar */
  onCancelar(): void {
    this.cancelar.emit();
  }

  /* cleanup */
  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
