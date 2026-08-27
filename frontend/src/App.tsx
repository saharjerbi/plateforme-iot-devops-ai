import { useState } from "react";
import MqttLive from "./components/MqttLive";
import GrafanaDashboard from "./components/GrafanaDashboard";
import ChatRAG from "./components/ChatRAG";

function App() {
  const [urlGithub, setUrlGithub] = useState("");

  const soumettre = () => {
    if (!urlGithub.trim()) return;
    console.log("Soumission du dépôt :", urlGithub);
    alert("Pipeline lancé (simulation) pour :\n" + urlGithub);
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
            onKeyDown={(e) => e.key === "Enter" && soumettre()}
            style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
          <button
            onClick={soumettre}
            style={{ padding: "10px 20px", borderRadius: "6px", border: "none", background: "#007acc", color: "white", cursor: "pointer" }}
          >
            Analyser
          </button>
        </div>
      </section>

      {/* Section 2 : Pipeline */}
      <section style={{ marginTop: "24px", padding: "16px", background: "#f0f8ff", borderRadius: "8px" }}>
        <h2>⚙️ Pipeline de déploiement</h2>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", fontSize: "14px" }}>
          {["Analyse", "Architecture", "Génération", "Build", "Déploiement"].map((etape, i) => (
            <div key={etape} style={{ textAlign: "center", flex: 1, padding: "8px", opacity: i < 2 ? 1 : 0.4 }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%", background: i < 2 ? "#007acc" : "#ccc",
                color: "white", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px"
              }}>
                {i + 1}
              </div>
              <div>{etape}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
          Statut : en attente de soumission...
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
