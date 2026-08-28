import { useState } from "react";
import MqttLive from "./components/MqttLive";
import GrafanaDashboard from "./components/GrafanaDashboard";
import ChatRAG from "./components/ChatRAG";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface AnalysisResult {
  framework: string;
  fichiers_detectes: string[];
  carte_cible: string;
  protocoles: string[];
  confiance: string;
  raisonnement: string;
}

interface ArchitectureResult {
  build_strategy: string;
  ota_active: boolean;
  monitoring: boolean;
  mqtt_broker: string;
  justification: string;
  mode: string;
}

function App() {
  const [urlGithub, setUrlGithub] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    analysis: AnalysisResult | null;
    decision: ArchitectureResult | null;
  }>({ analysis: null, decision: null });

  const soumettre = async () => {
    if (!urlGithub.trim()) return;
    setLoading(true);
    setResults({ analysis: null, decision: null });

    try {
      // ── Appel Agent 1 : /analyze ─────────────────────────────────────
      const res1 = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url_github: urlGithub }),
      });
      const analysis: AnalysisResult = await res1.json();

      // ── Appel Agent 2 : /architect (pipeline complet) ─────────────────
      const res2 = await fetch(`${API_BASE}/architect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url_github: urlGithub }),
      });
      const architectResponse = await res2.json();
      const decision: ArchitectureResult = architectResponse.agent2_decision || architectResponse;

      setResults({ analysis, decision });
    } catch (err: any) {
      alert(`Erreur de connexion au backend :\n${err.message}\nVérifiez que le serveur FastAPI tourne sur ${API_BASE}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "24px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ borderBottom: "2px solid #007acc", paddingBottom: "12px" }}>
        🚀 Plateforme IoT DevOps AI
      </h1>

      {/* Section 1 : Soumission GitHub */}
      <section style={{ marginTop: "24px" }}>
        <h2>📁 Soumettre un projet</h2>
        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
          <input
            type="text"
            placeholder="https://github.com/utilisateur/projet-zephyr"
            value={urlGithub}
            onChange={(e) => setUrlGithub(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && soumettre()}
            disabled={loading}
            style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
          <button
            onClick={soumettre}
            disabled={loading || !urlGithub.trim()}
            style={{
              padding: "10px 20px", borderRadius: "6px", border: "none",
              background: loading ? "#ccc" : "#007acc", color: "white", cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "⏳ Analyse..." : "Analyser"}
          </button>
        </div>
      </section>

      {/* Section 2 : Résultats de l'analyse */}
      {results.analysis && (
        <section style={{ marginTop: "24px", padding: "16px", background: "#f0f8ff", borderRadius: "8px" }}>
          <h3>📊 Résultat de l'analyse (Agent 1)</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "14px" }}>
            <div><b>Framework :</b> {results.analysis.framework}</div>
            <div><b>Carte cible :</b> {results.analysis.carte_cible}</div>
            <div><b>Protocoles :</b> {results.analysis.protocoles?.join(", ") || "aucun"}</div>
            <div><b>Confiance :</b> {results.analysis.confiance}</div>
            {results.analysis.fichiers_detectes && (
              <div style={{ gridColumn: "1 / -1" }}><b>Fichiers :</b> {results.analysis.fichiers_detectes.join(", ")}</div>
            )}
          </div>
        </section>
      )}

      {/* Section 3 : Décision d'architecture */}
      {results.decision && (
        <section style={{ marginTop: "16px", padding: "16px", background: "#e8f5e9", borderRadius: "8px" }}>
          <h3>🏗️ Décision d'architecture (Agent 2 — mode {results.decision.mode || "mock"})</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "14px" }}>
            <div><b>Stratégie de build :</b> {results.decision.build_strategy}</div>
            <div><b>OTA :</b> {results.decision.ota_active ? "✅ Activé" : "❌ Désactivé"}</div>
            <div><b>Monitoring :</b> {results.decision.monitoring ? "✅ Actif" : "❌ Inactif"}</div>
            <div><b>Broker MQTT :</b> {results.decision.mqtt_broker}</div>
            <div style={{ gridColumn: "1 / -1" }}><b>Justification :</b> {results.decision.justification}</div>
          </div>
        </section>
      )}

      {/* Section 4 : Pipeline visuel */}
      <section style={{ marginTop: "24px", padding: "16px", background: "#f0f8ff", borderRadius: "8px" }}>
        <h2>⚙️ Pipeline de déploiement</h2>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", fontSize: "14px" }}>
          {["Analyse", "Architecture", "Génération", "Build", "Déploiement"].map((etape, i) => (
            <div key={etape} style={{ textAlign: "center", flex: 1, padding: "8px", opacity: i < (results.analysis && results.decision ? 2 : 0) ? 1 : 0.4 }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                background: i < (results.analysis && results.decision ? 2 : 0) ? "#007acc" : "#ccc",
                color: "white", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px"
              }}>
                {i + 1}
              </div>
              <div>{etape}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
          Statut : {results.analysis && results.decision ? "2 étapes terminées" : "en attente de soumission..."}
        </p>
      </section>

      {/* Section 3 : MQTT Temps Réel */}
      <MqttLive />

      {/* Section 4 : Grafana */}
      <GrafanaDashboard />

      {/* Section 5 : Chat RAG */}
      <ChatRAG />
    </div>
  );
}

export default App;
