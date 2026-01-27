import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { MarkdownModule } from 'ngx-markdown'
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
export class AsistenteReportesComponent implements AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  mensajes: Mensaje[] = [
    {
      from: 'bot',
      text: 'Hola, puedo analizar información del sistema de seguros y generar reportes basados en los datos.'
    }
  ]

  input = ''
  cargando = false

  private ultimoHash = '';

  constructor(
    private chatbotService: ChatbotService
  ) { }

  ngAfterViewChecked() {
    // Calculamos un hash simple de los mensajes para detectar cambios en el contenido, no solo en la cantidad
    const hashActual = JSON.stringify(this.mensajes) + this.cargando;
    if (hashActual !== this.ultimoHash) {
      this.ultimoHash = hashActual;
      this.scrollToBottom();
    }
  }

  private scrollToBottom(): void {
    if (!this.scrollContainer) return;

    // Usamos un pequeño timeout junto con requestAnimationFrame para dar tiempo a Markdown 
    // a renderizar tablas o bloques de código que cambian la altura
    setTimeout(() => {
      requestAnimationFrame(() => {
        try {
          const element = this.scrollContainer.nativeElement;
          element.scrollTop = element.scrollHeight;
        } catch (err) { }
      });
    }, 50);
  }

  async enviar(): Promise<void> {
    const texto = this.input.trim()
    if (!texto || this.cargando) return

    this.mensajes.push({ from: 'user', text: texto })
    this.scrollToBottom();
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
