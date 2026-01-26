import { Injectable } from '@angular/core';
import { ToastrService, ActiveToast } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class AlertService {

  private loadingToast: ActiveToast<any> | null = null;

  constructor(private toastr: ToastrService) {}

  /* =========================
     LOADING
  ========================= */

  loading(message: string = 'Cargando...'): void {
    if (this.loadingToast) return;

    this.loadingToast = this.toastr.info(message, 'Procesando', {
      disableTimeOut: true,
      tapToDismiss: false,
      closeButton: false,
      progressBar: true,
      positionClass: 'toast-top-center',
    });
  }

  closeLoading(): void {
    if (!this.loadingToast) return;

    this.toastr.clear(this.loadingToast.toastId);
    this.loadingToast = null;
  }

  /* =========================
     TOASTS GENERALES
  ========================= */

  success(message: string, title: string = ''): void {
    this.toastr.success(message, title, {
      progressBar: true,
    });
  }

  error(message: string, title: string = ''): void {
    this.toastr.error(message, title, {
      progressBar: true,
    });
  }

  warning(message: string, title: string = ''): void {
    this.toastr.warning(message, title, {
      progressBar: true,
    });
  }

  info(message: string, title: string = ''): void {
    this.toastr.info(message, title, {
      progressBar: true,
    });
  }

  /* =========================
     TOASTS POSICIÓN INFERIOR
  ========================= */

  successBottom(message: string, title: string = 'Éxito'): void {
    this.toastr.success(message, title, {
      progressBar: true,
      positionClass: 'toast-bottom-left',
    });
  }

  errorBottom(message: string, title: string = 'Error'): void {
    this.toastr.error(message, title, {
      progressBar: true,
      positionClass: 'toast-bottom-left',
    });
  }

  warningBottom(message: string, title: string = 'Advertencia'): void {
    this.toastr.warning(message, title, {
      progressBar: true,
      positionClass: 'toast-bottom-left',
    });
  }

  infoBottom(message: string, title: string = 'Información'): void {
    this.toastr.info(message, title, {
      progressBar: true,
      positionClass: 'toast-bottom-left',
    });
  }
}
