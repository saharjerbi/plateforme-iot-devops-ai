import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const MOCK_RAG = import.meta.env.VITE_MOCK_RAG === "true";

export default function ChatRAG() {
  const [question, setQuestion] = useState("");
  const [historique, setHistorique] = useState<{ q: string; r: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const envoyer = async () => {
    if (!question.trim()) return;
    setLoading(true);
    const q = question;
    setQuestion("");

    let reponse = "";

    if (MOCK_RAG) {
      await new Promise((r) => setTimeout(r, 800));
      reponse = `[MOCK] Diagnostic pour "${q}" :\n\n1. Vérifiez que le broker Mosquitto est actif (sudo service mosquitto status)\n2. Vérifiez l'adresse IP dans prj.conf\n3. Assurez-vous que le WiFi est configuré correctement\n\nSi le problème persiste, consultez les logs de build Zephyr.`;
    } else {
      try {
        const res = await fetch(`${API_BASE}/assistant`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q }),
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();
        reponse = data.reponse || data.answer || JSON.stringify(data);
      } catch (err: any) {
        reponse = `❌ Erreur de connexion au backend : ${err.message}\nVérifie que Sahar a lancé son API FastAPI.`;
      }
    }

    setHistorique((prev) => [...prev, { q, r: reponse }]);
    setLoading(false);
  };

  return (
    <div style={{ marginTop: "24px", padding: "16px", border: "1px solid #ddd", borderRadius: "8px", background: "#fafafa" }}>
      <h3>🤖 Assistant Technique (RAG)</h3>

      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <input
          type="text"
          placeholder="Décris ton problème (ex: build échoue sur Zephyr)..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && envoyer()}
          style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
        />
        <button
          onClick={envoyer}
          disabled={loading}
          style={{ padding: "10px 18px", borderRadius: "6px", border: "none", background: "#007acc", color: "white", cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "Analyse..." : "Demander"}
        </button>
      </div>

      {MOCK_RAG && (
        <p style={{ fontSize: "11px", color: "#c60", marginBottom: "10px" }}>
          ⚠️ Mode mock actif — l'Agent 4 de Sahar n'est pas encore branché.
        </p>
      )}

      <div style={{ maxHeight: "300px", overflowY: "auto" }}>
        {historique.map((item, idx) => (
          <div key={idx} style={{ marginBottom: "12px" }}>
            <div style={{ fontWeight: "bold", color: "#007acc", marginBottom: "4px" }}>
              👤 {item.q}
            </div>
            <div style={{ background: "white", padding: "10px", borderRadius: "6px", border: "1px solid #eee", whiteSpace: "pre-wrap", fontSize: "14px" }}>
              {item.r}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
