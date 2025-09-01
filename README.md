# Speech Analytics COS

Proyecto de ejemplo para QA de llamadas con Node.js, Express y n8n.

## Instalación

```bash
npm install
```

## Configuración

Crea un archivo `.env` basado en `.env.example`.

```bash
cp .env.example .env
```

Variables principales:
- `PORT`: puerto del servidor Express.
- `N8N_BASE_URL`: URL base de n8n.
- `N8N_TRANSCRIBE_PATH`: webhook de transcripción.
- `N8N_SCORE_PATH`: webhook de scoring.
- `OPENAI_API_KEY`: opcional para usar Whisper API.

## Scripts npm

- `npm run dev`: modo desarrollo con recarga.
- `npm run build`: compila a `dist/`.
- `npm start`: ejecuta el servidor compilado.

## n8n

Arranca n8n (Docker o local) y luego importa los archivos JSON de `n8n/workflows/` desde la interfaz de n8n.

## Flujo de prueba

1. Levanta el backend:

```bash
npm run dev
```

2. Visita `http://localhost:3000` y usa la interfaz para:
   - Subir una matriz.
   - Subir un audio (mostrará `audio_id`).
   - Transcribir y puntuar.
   - Descargar reportes.

### Ejemplos de cURL

Subir matriz:
```bash
curl -F "file=@data/matrices/sample_matrix.csv" http://localhost:3000/upload/matrix
```

Subir audio:
```bash
curl -F "file=@ruta/audio.wav" http://localhost:3000/upload/audio
```

Transcribir:
```bash
curl -X POST http://localhost:3000/transcribe/AUDIO_ID
```

Puntuar:
```bash
curl -X POST http://localhost:3000/score/AUDIO_ID
```

Descargar reporte:
```bash
curl -O http://localhost:3000/report/AUDIO_ID
```

Consolidado:
```bash
curl -O http://localhost:3000/report/consolidated
```

## Transcripción Mock vs OpenAI

Si `OPENAI_API_KEY` está vacío, el sistema usará una transcripción simulada (`mock`).
Si está configurado, el workflow de n8n puede llamar a la API de Whisper u otra implementación local.

## Estructura de carpetas

- `src/`: código fuente.
- `data/`: audios, matrices y db.json.
- `reports/`: resultados de transcripción y scoring.
- `public/`: frontend simple.
- `n8n/workflows/`: workflows de n8n exportados.

