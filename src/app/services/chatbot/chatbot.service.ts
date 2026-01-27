import { Injectable } from '@angular/core'

import { IaService } from './ia.service'

import { AseguradosService } from '../asegurados.service'
import { BienesService } from '../bienes.service'
import { FacturacionService } from '../facturacion.service'
import { PedidosService } from '../pedidos.service'
import { PolizasService } from '../polizas.service'
import { SiniestrosService } from '../siniestros.service'

type PlanConsulta = {
  modulo:
    | 'asegurados'
    | 'bienes'
    | 'pedidos'
    | 'siniestros'
    | 'polizas'
    | 'facturacion'
    | 'desconocido'
  accion: 'listar' | 'analizar'
}

@Injectable({ providedIn: 'root' })
export class ChatbotService {

  constructor(
    private ia: IaService,
    private aseguradosService: AseguradosService,
    private bienesService: BienesService,
    private pedidosService: PedidosService,
    private siniestrosService: SiniestrosService,
    private polizasService: PolizasService,
    private facturacionService: FacturacionService
  ) {}

  // =========================
  // LIMPIAR JSON DE GEMINI
  // =========================
  private limpiarJson(texto: string): string {
    return texto
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim()
  }

  // =========================
  // ENTRADA PRINCIPAL
  // =========================
  async procesarPregunta(texto: string): Promise<string> {

    let plan: PlanConsulta

    try {
      const planTexto = await this.ia.interpretarPregunta(`
Eres un asistente experto en análisis de sistemas de seguros.

Devuelve SOLO un JSON válido con esta estructura:
{
  "modulo": "asegurados | bienes | pedidos | siniestros | polizas | facturacion | desconocido",
  "accion": "listar | analizar"
}

Pregunta del usuario:
"${texto}"
      `)

      const limpio = this.limpiarJson(planTexto)
      plan = JSON.parse(limpio)

    } catch (err) {
      console.error('ERROR PLAN IA', err)
      return 'No pude interpretar la consulta. Intenta reformularla.'
    }

    if (plan.modulo === 'desconocido') {
      return 'No logré identificar el módulo solicitado. Puedes consultar asegurados, bienes, pedidos, siniestros, pólizas o facturación.'
    }

    // =========================
    // OBTENER DATA REAL
    // =========================
    let data: any[] = []

    try {
      switch (plan.modulo) {
        case 'asegurados':
          data = await this.aseguradosService.listar()
          break
        case 'bienes':
          data = await this.bienesService.listar()
          break
        case 'pedidos':
          data = await this.pedidosService.listar()
          break
        case 'siniestros':
          data = await this.siniestrosService.listar()
          break
        case 'polizas':
          data = await this.polizasService.listar()
          break
        case 'facturacion':
          data = await this.facturacionService.listar()
          break
      }
    } catch (err) {
      console.error('ERROR DATA', err)
      return 'Ocurrió un error al obtener la información del sistema.'
    }

    // =========================
    // ANALISIS CON IA
    // =========================
    try {
      const respuesta = await this.ia.analizar(`
Eres un analista profesional de seguros.

Datos reales del sistema (${plan.modulo}):
${JSON.stringify(data, null, 2)}

Solicitud del usuario:
"${texto}"

Analiza la información REAL, genera conclusiones,
identifica patrones, riesgos u oportunidades si existen
y responde de forma clara, estructurada y profesional.
      `)

      return respuesta

    } catch (err) {
      console.error('ERROR ANALISIS IA', err)
      return 'Ocurrió un error al generar el análisis.'
    }
  }
}
