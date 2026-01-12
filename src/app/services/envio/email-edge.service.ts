import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EmailEdgeService {

  private readonly url =
    'https://mjqrcgfgwbqkikzzymwl.functions.supabase.co/send-siniestro-email';

  async enviarCorreo(payload: {
    to: string;
    subject: string;
    html: string;
    attachments?: any[];
  }): Promise<void> {

    const res = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const error = await res.text();
      console.error('Error enviando correo', error);
      throw new Error('No se pudo enviar el correo');
    }
  }
}
