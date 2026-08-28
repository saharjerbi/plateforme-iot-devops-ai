import { useState, useEffect, useRef } from "react";
import mqtt from "mqtt";

const MQTT_WS_URL = import.meta.env.VITE_MQTT_WS_URL || "ws://localhost:9001";

interface MqttMessage {
  time: string;
  temp: number;
  hum: number;
  source: string;
}

export default function MqttLive() {
  const [lastMsg, setLastMsg] = useState<MqttMessage | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [debugInfo, setDebugInfo] = useState("Initialisation...");
  const clientRef = useRef<mqtt.MqttClient | null>(null);

  useEffect(() => {
    if (clientRef.current) return;

    const client = mqtt.connect(MQTT_WS_URL, {
      reconnectPeriod: 5000,
      connectTimeout: 30 * 1000,
      keepalive: 30,
      clean: true,
    });

    clientRef.current = client;

    client.on("connect", () => {
      setConnected(true);
      setDebugInfo("Connecté. Abonnement...");
      client.subscribe("sensor/dht22", (err) => {
        if (err) setDebugInfo("Erreur subscribe: " + err.message);
        else setDebugInfo("Abonné. En attente de messages...");
      });
    });

    client.on("message", (topic, payload) => {
      let raw = "";
      if (typeof payload === "string") {
        raw = payload;
      } else if (payload instanceof Uint8Array) {
        raw = new TextDecoder().decode(payload);
      } else {
        raw = String(payload);
      }

      const time = new Date().toLocaleTimeString("fr-FR");
      setLogs((prev) => [`[${time}] ${topic} → ${raw.substring(0, 120)}`, ...prev].slice(0, 50));

      if (topic === "sensor/dht22") {
        try {
          const data = JSON.parse(raw);
          const entry: MqttMessage = {
            time,
            temp: data.temperature ?? 0,
            hum: data.humidity ?? 0,
            source: data.source || "simulateur",
          };
          setLastMsg(entry);
          setDebugInfo(`✅ Reçu: ${entry.temp}°C / ${entry.hum}%`);
        } catch (e) {
          console.log("JSON invalide");
        }
      }
    });

    client.on("error", (err) => {
      setDebugInfo("❌ Erreur: " + err.message);
    });

    client.on("offline", () => {
      setConnected(false);
      setDebugInfo("Hors ligne — reconnexion auto...");
    });

    client.on("reconnect", () => {
      setDebugInfo("Reconnexion en cours...");
    });

    client.on("close", () => {
      setConnected(false);
      setDebugInfo("Connexion fermée");
    });

    return () => {
      client.end();
      clientRef.current = null;
    };
  }, []);

  return (
    <section style={{ marginTop: "24px" }}>
      <h2>
        🌡️ Données Capteur (DHT22){" "}
        <span style={{ fontSize: "14px", color: connected ? "green" : "red" }}>
          {connected ? "● Connecté" : "● Déconnecté"}
        </span>
      </h2>
      <p style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
        {debugInfo}
      </p>

      <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
        <div style={{ flex: 1, padding: "24px", borderRadius: "12px", background: "#e3f2fd", textAlign: "center" }}>
          <div style={{ fontSize: "42px", fontWeight: "bold", color: "#1565c0" }}>
            {lastMsg ? `${lastMsg.temp.toFixed(1)}°C` : "--"}
          </div>
          <div style={{ color: "#555", marginTop: "4px" }}>Température</div>
        </div>
        <div style={{ flex: 1, padding: "24px", borderRadius: "12px", background: "#e8f5e9", textAlign: "center" }}>
          <div style={{ fontSize: "42px", fontWeight: "bold", color: "#2e7d32" }}>
            {lastMsg ? `${lastMsg.hum.toFixed(1)}%` : "--"}
          </div>
          <div style={{ color: "#555", marginTop: "4px" }}>Humidité</div>
        </div>
      </div>

      <div style={{ marginTop: "16px", padding: "12px", borderRadius: "8px", background: "#1e1e1e", color: "#00ff88", fontFamily: "monospace", fontSize: "12px", maxHeight: "280px", overflowY: "auto" }}>
        <div style={{ color: "#aaa", marginBottom: "8px", borderBottom: "1px solid #444", paddingBottom: "4px" }}>
          📡 Logs MQTT
        </div>
        {logs.length === 0 && <div style={{ color: "#666" }}>En attente de messages...</div>}
        {logs.map((log, i) => (
          <div key={i} style={{ marginBottom: "3px", wordBreak: "break-all" }}>{log}</div>
        ))}
      </div>
    </section>
  );
}
