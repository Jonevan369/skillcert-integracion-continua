# SkillCert

SkillCert es una red social competencial basada en evidencias: los usuarios registran logros, la IA o un simulador sugiere competencias, la comunidad valida con votos ponderados por karma y el perfil evoluciona con mapa de habilidades, badges, exportacion y credenciales JSON simuladas.

## Stack

- Frontend: React, Vite, React Router, Zustand, Tailwind CSS, componentes estilo shadcn/ui.
- Backend: Node.js, Express, SQLite con migraciones propias, JWT, Swagger/OpenAPI.
- IA: Gemini opcional con `GEMINI_API_KEY`; fallback local si no hay clave.

## Instalacion

```bash
npm install
cp server/.env.example server/.env
npm run db:migrate
npm run db:seed
npm run dev
```

URLs:

- Frontend: http://localhost:5173
- API: http://localhost:4000/api
- Swagger: http://localhost:4000/api/docs

## Ejecucion con Docker

La entrega de semana 3 usa Docker Compose para construir dos contenedores comunicados en la misma red:

- `client`: aplicacion React servida con Nginx en http://localhost:5173.
- `server`: API Express en http://localhost:4000/api, con SQLite persistido en el volumen `skillcert-data`.

```bash
docker compose up --build
```

Verificacion rapida:

```bash
curl http://localhost:4000/api/health
open http://localhost:5173
```

El cliente consume la API mediante `/api`; Nginx redirige internamente esas peticiones al servicio `server`, demostrando comunicacion entre contenedores.

## Integracion continua con Jenkins

La entrega de semana 5 agrega un pipeline declarativo en `Jenkinsfile`. Jenkins valida el proyecto con las etapas de checkout, instalacion de dependencias, pruebas backend, build frontend, validacion de Docker Compose y construccion de contenedores.

Requisitos del agente Jenkins:

- Jenkins LTS con plugins Pipeline, Git, GitHub Branch Source, Docker Pipeline y NodeJS.
- Node.js 20 o superior.
- Docker Engine o Docker Desktop activo.
- Acceso del usuario `jenkins` al daemon Docker.

Ejecucion principal del pipeline:

```bash
npm ci
npm test -w server
npm run build
docker compose config
docker compose build
```

Documento de soporte: `docs/Entrega_2_Semana_5_Jenkins_SkillCert.md`.

Usuarios demo:

- `ana@example.com` / `password123`
- `luis@example.com` / `password123`
- `sofia@example.com` / `password123`

## Scripts

```bash
npm run dev          # frontend + backend
npm run build        # build frontend
npm run start        # backend
npm run db:migrate   # crea/actualiza SQLite
npm run db:seed      # datos demo
npm run test -w server
```

## Funcionalidades

- Registro/login con JWT y rutas protegidas.
- Navegacion: `/login`, `/register`, `/dashboard`, `/profile/:userId`, `/explore`, `/communities`.
- Busqueda de usuarios por nombre o habilidad.
- Follow/unfollow.
- Comunidades por area de conocimiento y publicacion de evidencias en comunidad.
- Feed de personas seguidas y comunidades propias.
- Validaciones `+1/-1` ponderadas por karma.
- Mapa de habilidades filtrable por nombre y nivel.
- Tendencias de habilidades mas validadas en la ultima semana.
- Exportacion JSON de perfil.
- Badges automaticos por umbrales de validacion.
- Credencial verificable simulada W3C VC con hash SHA-256.
- Grafico SVG de progreso por habilidad.

## Arquitectura

```text
server/src
  controllers/   # auth, usuarios, evidencias, comunidades, skills, badges
  middleware/    # JWT y validacion
  services/      # IA, auth, karma, badges, credenciales, exportacion
  db/            # conexion SQLite, migracion y seed
  tests/         # pruebas unitarias criticas

client/src
  api/           # cliente REST con JWT
  components/    # layout, formularios, cards, mapa, chart
  components/ui/ # componentes estilo shadcn
  hooks/         # useAuth, useSkills, useFollow
  pages/         # rutas principales
  store/         # Zustand auth store
```

## Roadmap de 4 semanas

**Semana 1: Base segura y UI**
- Endurecer auth: refresh tokens, recuperacion de password, validacion de email.
- Completar shadcn/ui real con tema persistente claro/oscuro.
- Agregar pruebas de rutas protegidas y contratos API.

**Semana 2: Red social competencial**
- Comentarios en evidencias.
- Moderacion basica en comunidades.
- Feed paginado y ordenado por relevancia competencial, no viralidad.

**Semana 3: Calidad de habilidades**
- Mejorar ponderacion de karma con consenso historico y reputacion por area.
- Vista de tendencias por comunidad y periodo.
- Busqueda avanzada por nivel, area y evidencia.

**Semana 4: Integraciones SkillNet**
- Export PDF y JSON-LD.
- Credenciales W3C VC mas completas con DID simulado.
- Importadores de certificados y preparacion para IPFS/OrbitDB.
