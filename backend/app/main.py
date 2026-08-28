from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.agent1 import analyser_depot_complet
from app.agent4 import indexer_tous_les_documents, repondre_question, repondre_avec_llm
from src.agent2.architect import ArchitectAgent
from src.agent2.config import AgentConfig
import os

app = FastAPI(title="IoT Backend - Sahar")

# ── CORS : autoriser le frontend React à appeler l'API ──────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

class RequeteAnalyse(BaseModel):
    url_github: str

class QuestionRAG(BaseModel):
    question: str

# ═════════════════════════════════════════════════════════════════════
# Racine
# ═════════════════════════════════════════════════════════════════════
@app.get("/")
def racine():
    return {"message": "Backend is running"}

# ═════════════════════════════════════════════════════════════════════
# Agent 1 — Analyseur de projets embarqués
# ═════════════════════════════════════════════════════════════════════
@app.post("/analyze")
def analyser(requete: RequeteAnalyse):
    rapport = analyser_depot_complet(requete.url_github)
    return {
        "framework": rapport.get("framework"),
        "fichiers_detectes": rapport.get("fichiers_detectes", []),
        "carte_cible": rapport.get("carte_cible", "unknown"),
        "protocoles": rapport.get("protocoles", []),
        "confiance": rapport.get("confiance"),
        "raisonnement": rapport.get("raisonnement"),
    }

@app.post("/analyze/details")
def analyser_details(requete: RequeteAnalyse):
    return analyser_depot_complet(requete.url_github)

# ═════════════════════════════════════════════════════════════════════
# Agent 2 — Architecte (via Groq, avec mock mode de secours)
# ═════════════════════════════════════════════════════════════════════
@app.post("/architect")
def architect(requete: RequeteAnalyse):
    """
    Chaîne complète: Agent 1 (analyse) → Agent 2 (decision d'architecture)

    Utilise Groq (same key as Agent 1) ou mock mode si GROQ_API_KEY absent.
    """
    rapport = analyser_depot_complet(requete.url_github)

    # Décider du mode (mock ou LLM)
    mock_mode = os.getenv("AGENT2_MOCK", "0") == "1" or not os.getenv("GROQ_API_KEY")

    try:
        config = AgentConfig()
        agent2 = ArchitectAgent(config, mock_mode=mock_mode)
        decision = agent2.analyze(rapport)
        return {
            "agent1_analysis": rapport,
            "agent2_decision": decision,
            "mode": "mock" if mock_mode else "groq",
        }
    except Exception as e:
        return {
            "agent1_analysis": rapport,
            "agent2_decision": None,
            "error": str(e),
            "mode": "mock",
        }

@app.post("/architect/mock")
def architect_mock():
    """
    Endpoint de test rapide avec le mock_agent1_output.json fourni.
    Aucun token consommé, fonctionne offline.
    """
    mock_mode = True
    try:
        config = AgentConfig()
        agent2 = ArchitectAgent(config, mock_mode=mock_mode)
        analysis = agent2.load_analysis(config.input_file)
        decision = agent2.analyze(analysis)
        return decision
    except Exception as e:
        return {"error": str(e)}

# ═════════════════════════════════════════════════════════════════════
# Agent 4 — Assistant RAG
# ═════════════════════════════════════════════════════════════════════
@app.post("/assistant")
def assistant(requete: QuestionRAG):
    """
    Endpoint RAG mock — retourne les extraits trouvés sans LLM.
    Consomme 0 token Groq.
    """
    return repondre_question(requete.question)

@app.post("/assistant/llm")
def assistant_llm(requete: QuestionRAG):
    """
    Endpoint RAG complet avec LLM Groq.
    À utiliser quand les tokens sont revenus.
    """
    return repondre_avec_llm(requete.question)

# ═════════════════════════════════════════════════════════════════════
# Indexation au démarrage
# ═════════════════════════════════════════════════════════════════════
@app.on_event("startup")
def on_startup():
    print("🚀 Démarrage du backend...")
    indexer_tous_les_documents()
    print("✅ Backend prêt")
