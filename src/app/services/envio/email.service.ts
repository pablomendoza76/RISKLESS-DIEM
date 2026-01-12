import { Injectable } from '@angular/core';
import emailjs from 'emailjs-com';

@Injectable({ providedIn: 'root' })
export class EmailService {

  sendSiniestroCorreo(
    destinatario: string,
    asunto: string,
    mensajeHtml: string,
    pdfBase64: string,
    archivos: { name: string; base64: string }[] = []
  ): Promise<any> {

    return emailjs.send(
      'service_9xvhftj',
      'template_uhsrrme',
      {
        to_email: destinatario,
        subject: asunto,
        message_html: mensajeHtml,

        attachments: [
          {
            name: 'siniestro.pdf',
            data: pdfBase64,
            type: 'application/pdf'
          },
          ...archivos
        ]
      },
      'e_6lE7u-Imo3ziGaQ'
    );
  }
}
