import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { provideToastr } from 'ngx-toastr';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { MarkdownModule } from 'ngx-markdown';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),

    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-center',
      preventDuplicates: true,
      progressBar: true,
      closeButton: false,
    }),

    provideCharts(withDefaultRegisterables()),

    //  ESTA LÍNEA SOLUCIONA EL ERROR
    importProvidersFrom(
      MarkdownModule.forRoot()
    ),
  ],
};
