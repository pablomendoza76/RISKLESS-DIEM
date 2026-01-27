import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { MarkdownModule } from 'ngx-markdown' // 👈 IMPORTANTE
import { ChatbotService } from '../../services/chatbot/chatbot.service'

type Mensaje = {
  from: 'user' | 'bot'
  text: string
}

@Component({
  selector: 'app-asistente-reportes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MarkdownModule // 👈 AQUÍ VA
  ],
  templateUrl: './asistente-reportes.component.html',
  styleUrl: './asistente-reportes.component.scss',
})
export class AsistenteReportesComponent {
  mensajes: Mensaje[] = [
    {
      from: 'bot',
      text: 'Hola, puedo analizar información del sistema de seguros y generar reportes basados en los datos.'
    }
  ]

  input = ''
  cargando = false

  constructor(
    private chatbotService: ChatbotService
  ) {}

  async enviar(): Promise<void> {
    const texto = this.input.trim()
    if (!texto || this.cargando) return

    this.mensajes.push({ from: 'user', text: texto })
    this.input = ''
    this.cargando = true

    const indiceBot = this.mensajes.push({
      from: 'bot',
      text: 'Analizando información del sistema...'
    }) - 1

    try {
      const respuesta = await this.chatbotService.procesarPregunta(texto)

      this.mensajes[indiceBot] = {
        from: 'bot',
        text: respuesta
      }
    } catch {
      this.mensajes[indiceBot] = {
        from: 'bot',
        text: 'Ocurrió un error al generar el análisis. Intenta nuevamente.'
      }
    } finally {
      this.cargando = false
    }
  }
}
