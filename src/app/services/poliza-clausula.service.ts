import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { SupabaseGatewayService } from './supabase-gateway.service';

@Injectable({ providedIn: 'root' })
export class PolizaClausulaService {

  constructor(
    private sb: SupabaseService,
    private gateway: SupabaseGatewayService
  ) {}

  /* =========================
     ASIGNAR CLÁUSULA A PÓLIZA
  ========================= */
  asignar(
    poliza_id: string,
    clausula_id: string
  ): Promise<void> {

    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('poliza_clausula')
        .insert({ poliza_id, clausula_id });

      return {
        data: true as any,
        error: res.error
      };
    }, {
      successMessage: 'Cláusula asignada a la póliza'
    });
  }

  /* =========================
     QUITAR CLÁUSULA DE PÓLIZA
  ========================= */
  quitar(
    poliza_id: string,
    clausula_id: string
  ): Promise<void> {

    return this.gateway.ejecutar(async () => {
      const res = await this.sb.client
        .from('poliza_clausula')
        .delete()
        .eq('poliza_id', poliza_id)
        .eq('clausula_id', clausula_id);

      return {
        data: true as any,
        error: res.error
      };
    }, {
      successMessage: 'Cláusula removida de la póliza'
    });
  }
}
