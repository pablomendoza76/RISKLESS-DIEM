import { Injectable } from '@angular/core'
import { environment } from '../../environments/environment.prod'

@Injectable({ providedIn: 'root' })
export class IaService {

  private readonly MODEL = 'gemini-2.5-flash'
  private readonly API_URL =
    `https://generativelanguage.googleapis.com/v1beta/models/${this.MODEL}:generateContent`

  private async callGemini(prompt: string, maxOutputTokens = 800): Promise<string> {
    const res = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': environment.geminiApiKey,
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens,
        }
      })
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      throw new Error(`Gemini error ${res.status}: ${errText}`)
    }

    const data = await res.json()
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
  }

  interpretarPregunta(prompt: string): Promise<string> {
  return this.callGemini(prompt, 600) // ⬅️ antes 300
}


  analizar(prompt: string): Promise<string> {
    return this.callGemini(prompt, 30000)
  }
}
