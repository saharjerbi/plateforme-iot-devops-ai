# Plateforme IoT DevOps AI

> **Plateforme multi-agents** : analyse automatique de dépôts GitHub embarqués (Zephyr, Arduino, ESP-IDF), décision d'architecture DevOps, et supervision IoT en temps réel (MQTT → InfluxDB → Grafana).

Projet de stage — Équipe : Sahar (Agent 1), Ameni (Agent 2), Nour (Frontend + Infrastructure)

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React + Vite)                 │
│  App.tsx (→ /analyze, /architect)  MqttLive.tsx (ws:9001)   │
│  ChatRAG.tsx (→ /assistant)        GrafanaDashboard.tsx     │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTP
┌─────────────────────────────▼───────────────────────────────┐
│          BACKEND (FastAPI + Uvicorn) — port 8000            │
│  POST /analyze         → Agent 1 (GitHub analyzer)            │
│  POST /architect       → Agent 1 → Agent 2 (Architect)        │
│  POST /assistant       → Agent 4 (RAG mock)                    │
│  POST /assistant/llm   → Agent 4 (RAG + Groq LLM)             │
│  ChromaDB (RAG) + Sentence-Transformers (all-MiniLM-L6-v2)   │
└─────────────────────────────┬───────────────────────────────┘
                              │ MQTT 1883 / WS 9001
┌─────────────────────────────▼───────────────────────────────┐
│                  INFRASTRUCTURE (Docker Compose)             │
│  Mosquitto (broker) → Pont MQTT → InfluxDB (bucket: capteurs)│
│  Simulateur DHT22 (publie toutes les 5s) → Grafana (port 3000)│
└───────────────────────────────────────────────────────────────┘
```

---

## Structure

### 🧠 Agent 1 (Sahar) — Analyseur de projets embarqués
- `backend/app/agent1.py` — Agent qui clone un dépôt GitHub (`git clone --depth 1`), détecte le framework (Zephyr, Arduino, ESP-IDF, Mbed OS) via des *fingerprints* de fichiers, extrait les protocoles (MQTT, WiFi, BLE…) et la carte cible, puis valide la cohérence.
- `backend/app/main.py` — API FastAPI avec CORS, endpoints `/analyze`, `/architect`, `/architect/mock`, `/assistant`, `/assistant/llm`

### 🏗️ Agent 2 (Ameni) — Architecte des décisions d'infrastructure
- `backend/src/agent2/architect.py` — Décision d'architecture (build strategy, OTA, monitoring, MQTT broker) via Groq LLM ou mode mock (offline, 0 coût)
- `backend/src/agent2/exceptions.py` — Hiérarchie d'exceptions (`Agent2Error` → sous-classes)
- `backend/src/utils/json_utils.py` — Extraction JSON robuste + validation stricte du schéma
- CLI : `agent2.py` + `src/agent2/` (entrypoint autonome, utilise `mock_agent1_output.json`)

### 🌐 Frontend (Nour) — Dashboard React
- `frontend/` — Application React + TypeScript (Vite)
  - `App.tsx` — Soumet un dépôt GitHub, affiche résultats Agents 1 & 2
  - `MqttLive.tsx` — Visualisation MQTT temps réel (WebSocket port 9001)
  - `GrafanaDashboard.tsx` — Dashboard Grafana via iframe
  - `ChatRAG.tsx` — Interface de questionnement RAG

### 📡 Infrastructure (Nour) — Simulateur & Pont IoT
- `simulateur/simulateur_dht22.py` — Publie Temp/Hum sur MQTT (`sensor/dht22`, toutes les 5s)
- `pont-mqtt/mqtt_to_influxdb.py` — Pont MQTT → InfluxDB (écrit réel dans le bucket `capteurs`)
- `mosquitto/config/mosquitto.conf` — Broker Mosquitto (MQTT/TCP 1883 + WebSocket 9001)
- `docker-compose.yml` — Orchestration complète (backend + MQTT + InfluxDB + Grafana + simulateur + pont)
- `infrastructure/docker-compose.yml` — Orchestration infra seule (InfluxDB + Grafana)
- `build-runner/` — Image Docker pré-configurée : Zephyr SDK v4.0.0 + `west`

---

## 🚀 Lancer le projet

### Démarrage complet (Docker Compose)
```bash
docker-compose up --build -d
```

| Service | Port | Description |
|---------|------|-------------|
| Backend | 8000 | FastAPI + Swagger UI |
| Mosquitto | 1883 | MQTT TCP (simulateur, pont) |
| Mosquitto | 9001 | MQTT WebSocket (frontend) |
| InfluxDB | 8086 | Base de temps séries |
| Grafana | 3000 | Visualisation (admin / admin123456) |

### Frontend seul
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### API Backend
```
http://localhost:8000/docs  — Swagger UI avec tous les endpoints
```

---

## 📡 Endpoints API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/analyze` | Agent 1 — Analyse un dépôt GitHub (framework, protocoles, carte cible) |
| `POST` | `/architect` | Pipeline Agent 1 → Agent 2 — Décision d'architecture complète |
| `POST` | `/architect/mock` | Agent 2 — Décision mock hors ligne (0 token) |
| `POST` | `/assistant` | Agent 4 — Chatbot RAG (mode mock : chunks bruts, 0 token) |
| `POST` | `/assistant/llm` | Agent 4 — Chatbot RAG + Groq LLM (synthèse) |

### Exemples
```bash
# Analyser un projet
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"url_github": "https://github.com/zephyrproject-rtos/zephyr"}'

# Décision mock (0 token)
curl -X POST http://localhost:8000/architect/mock
```

---

## ⚙️ Configuration

### 1. Fichier `.env` (backend — à la racine)
```bash
GROQ_API_KEY=gsk_...
```
> Le `.env` est chargé automatiquement par `docker-compose.yml` (`env_file`). Le projet fonctionne en **mode mock** sans clé API. `AgentConfig` accepte désormais une clé absente en mock mode (aucun crash d'import).

### 2. Frontend `.env.local`
Le `.env` du frontend est **gitignoré**. Créez `frontend/.env.local` :
```bash
VITE_API_URL=http://localhost:8000
VITE_MQTT_WS_URL=ws://localhost:9001
VITE_GRAFANA_URL=http://localhost:3000
VITE_GRAFANA_DASHBOARD=<votre-dashboard-uid>
VITE_MOCK_RAG=false
VITE_MOCK_GRAFANA=false
```

### 3. Variables InfluxDB
| Variable | Valeur | Description |
|----------|--------|-------------|
| `INFLUXDB_TOKEN` | `iot-token-2024` | Token admin (défini dans docker-compose.yml) |
| `INFLUXDB_ORG` | `iot-org` | Organisation |
| `INFLUXDB_BUCKET` | `capteurs` | Bucket de stockage |

---

## 🔧 Configuration Grafana

1. Ouvrir `http://localhost:3000` (admin / admin123456)
2. **Data Sources → Add InfluxDB** : Flux, URL `http://influxdb:8086`, org `iot-org`, token `iot-token-2024`, bucket `capteurs`
3. **Create Dashboard → Query Flux** :
   ```flux
   from(bucket: "capteurs")
     |> range(start: -1h)
     |> filter(fn: (r) => r._measurement == "capteur_dht22")
     |> filter(fn: (r) => r._field == "temperature" or r._field == "humidity")
   ```
4. Copier le **Dashboard UID** → coller dans `frontend/.env.local`

---

## 🏗️ Build Runner (Zephyr)
```bash
docker build -t build-runner ./build-runner
docker run --rm -v "$(pwd)/firmware:/app" build-runner build -b esp32_devkitc_wroom/esp32/procpu /app
```
CI automatisé via `.github/workflows/ci.yml`.

---

## ✅ Améliorations récentes

- **CORS** activé sur le backend (frontend ↔ API)
- **Frontend branché** au backend (App.tsx → `/analyze` + `/architect`)
- **InfluxDB** : écriture réelle (MODE=production) au lieu de simulation
- **WebSocket MQTT** exposé sur le port 9001
- **Credentials InfluxDB** uniformisés entre les deux docker-compose
- **BOM** supprimé des fichiers Python racine
- **Requirements** nettoyés (anthropic/ollama/gitpython → influxdb-client)
- **AgentConfig** tolère une clé API absente en mode mock
- **Groq client** lazy (agent1.py) et null-safe (agent4.py)
