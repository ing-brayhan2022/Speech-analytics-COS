# Servicio IA de Analista de Calidad

Proyecto Node.js (ESM) con Express que recibe una matriz de calidad y un audio de llamada, genera la transcripción con Whisper, evalúa la llamada con un modelo de chat de OpenAI y devuelve un consolidado con puntuación y recomendaciones. Pensado para integrarse con **n8n** mediante HTTP.

## Requisitos
- Node.js 18+
- Clave de API de OpenAI

## Instalación
```bash
npm install
cp .env.example .env # complete los valores
npm run dev # o npm start
```

## Variables de entorno
```
OPENAI_API_KEY=
PORT=3000
OPENAI_TRANSCRIPTION_MODEL=whisper-1
OPENAI_CHAT_MODEL=gpt-4o
CORS_ORIGIN=*
```

## Uso
### cURL de prueba
```bash
curl -X POST http://localhost:3000/analyze \
  -F "matrix=@./ejemplos/matriz.xlsx" \
  -F "audio=@./ejemplos/llamada.mp3" \
  -F "callId=ABC123" -F "agentName=Agente 1" -F "language=es-ES"
```

### Respuesta de ejemplo
```json
{
  "metadata": {
    "callId": "ABC123",
    "agentName": "Agente 1",
    "customerName": "Cliente",
    "language": "es-ES",
    "channel": "voz"
  },
  "transcript": "Hola señor, gracias por llamar...",
  "analisis": {
    "resumen": "La llamada mostró un adecuado control del protocolo...",
    "hallazgos": [
      "Cliente satisfecho",
      "Verificación de identidad correcta",
      "Falta de empatía"
    ]
  },
  "consolidado": {
    "notaBase": 100,
    "totalDeducciones": 8,
    "notaFinal": 92,
    "porCategoria": [
      {
        "categoria": "Protocolo",
        "cumplimiento": { "cumplidos": 1, "noCumplidos": 0, "porcentaje": 100 },
        "recomendaciones": []
      },
      {
        "categoria": "Habilidades",
        "cumplimiento": { "cumplidos": 1, "noCumplidos": 1, "porcentaje": 50 },
        "recomendaciones": ["Usar un lenguaje más empático"]
      }
    ],
    "porAtributo": [
      {
        "atributo": "Saludo inicial",
        "categoria": "Protocolo",
        "peso": 5,
        "cumplido": true,
        "deduccion": 0,
        "justificacion": "Saludó y se presentó",
        "mejora": "",
        "reconocimiento": "Buen saludo"
      },
      {
        "atributo": "Empatía",
        "categoria": "Habilidades",
        "peso": 8,
        "cumplido": false,
        "deduccion": 8,
        "justificacion": "No se detectó tono empático",
        "mejora": "Mostrar empatía ante el problema del cliente",
        "reconocimiento": ""
      }
    ]
  },
  "reportPath": "reports/ABC123.md"
}
```

## Integración con n8n
1. **Nodo HTTP Request** (método POST, Content-Type multipart/form-data).
2. URL: `http://<host>:3000/analyze`
3. En la sección *Binary* adjuntar:
   - `matrix`: archivo Excel con la matriz de calidad.
   - `audio`: archivo de audio de la llamada.
4. En la sección *JSON* agregar campos opcionales: `callId`, `agentName`, `customerName`, `language`.
5. El nodo recibe el JSON consolidado para su posterior uso (guardar en BD, enviar correo, Slack, etc.).

> También puede conectarse como webhook en n8n, pero la opción recomendada es usar el nodo HTTP Request.

## Estructura de carpetas
```
/src
  /routes
    analyze.route.js
    health.route.js
  /services
    analysisService.js
    transcriptionService.js
    scoringService.js
    matrixService.js
/reports
.env.example
package.json
```
