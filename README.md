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
- `PORT`: puerto del servidor Express (por defecto 8080).
- `N8N_BASE_URL`: URL base de n8n.
- `N8N_TRANSCRIBE_PATH`: webhook de transcripción.
- `N8N_SCORE_PATH`: webhook de scoring.
- `OPENAI_API_KEY`: clave para la API de OpenAI usada por n8n.
- `OPENAI_WHISPER_MODEL`: modelo de Whisper a usar.
- `OPENAI_WHISPER_LANG`: idioma por defecto para transcripción.

## Scripts npm

- `npm run dev`: modo desarrollo con recarga.
- `npm run build`: compila a `dist/`.
- `npm start`: ejecuta el servidor compilado.

## n8n

Arranca n8n (Docker o local) y luego importa los archivos JSON de `n8n/workflows/` desde la interfaz de n8n. El workflow `transcribe_whisper.json` utiliza la API de Whisper para transcribir audios.

## Flujo de prueba

1. Levanta el backend:

```bash
npm run dev
```

2. Visita `http://localhost:8080` y usa la interfaz para:
   - Subir una matriz.
   - Subir un audio (mostrará `audio_id`).
   - Transcribir y puntuar.
   - Descargar reportes.

### Ejemplos de cURL

Subir matriz:
```bash
curl -F "file=@data/matrices/sample_matrix.csv" http://localhost:8080/upload/matrix
```

Subir audio:
```bash
curl -F "file=@ruta/audio.wav" http://localhost:8080/upload/audio
```

Transcribir:
```bash
curl -X POST http://localhost:8080/transcribe/AUDIO_ID
```

Puntuar:
```bash
curl -X POST http://localhost:8080/score/AUDIO_ID
```

Descargar reporte:
```bash
curl -O http://localhost:8080/report/AUDIO_ID
```

Consolidado:
```bash
curl -O http://localhost:8080/report/consolidated
```

## Prueba rápida

```bash
docker run -it --rm -p 5678:5678 -e N8N_PAYLOAD_SIZE_MAX=64 n8nio/n8n
```

1. Importa `n8n/workflows/transcribe_whisper.json` en n8n.
2. En el proyecto Node:

```bash
cp .env.example .env
# Rellena OPENAI_API_KEY
npm i
npm run dev
```

Flujo:

```
POST /upload/matrix (sube CSV)
POST /upload/audio (sube mp3/wav)
POST /transcribe/:audio_id → devuelve texto real de Whisper
POST /score/:audio_id → genera CSV
GET /report/:audio_id / GET /report/consolidated/all
```

## Estructura de carpetas

- `src/`: código fuente.
- `data/`: audios, matrices y db.json.
- `reports/`: resultados de transcripción y scoring.
- `public/`: frontend simple.
- `n8n/workflows/`: workflows de n8n exportados.

