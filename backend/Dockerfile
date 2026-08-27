FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY app/ /app/app/
COPY src/ /app/src/
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# Copie des fichiers mock pour Agent 2 en mode de test
COPY mock_agent1_output.json /app/mock_agent1_output.json

# Créer les dossiers pour le RAG
RUN mkdir -p /app/docs_rag /app/rag_db

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
