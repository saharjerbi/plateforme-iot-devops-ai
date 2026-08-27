const GRAFANA_URL = import.meta.env.VITE_GRAFANA_URL || "http://localhost:3000";
const DASHBOARD_ID = import.meta.env.VITE_GRAFANA_DASHBOARD || "mon-dashboard";

export default function GrafanaDashboard() {
  const isMock = import.meta.env.VITE_MOCK_GRAFANA === "true" || !import.meta.env.VITE_GRAFANA_URL;

  if (isMock) {
    return (
      <div style={{ marginTop: "24px", padding: "16px", border: "2px dashed #ccc", borderRadius: "8px" }}>
        <h3>📊 Dashboard Grafana (mode mock)</h3>
        <p style={{ color: "#666" }}>
          Ici s'affichera le dashboard d'Ameni une fois son URL fournie.
        </p>
        <p style={{ fontSize: "12px", color: "#999" }}>
          URL attendue : <code>{GRAFANA_URL}/d/{DASHBOARD_ID}?kiosk</code>
        </p>
      </div>
    );
  }

  const iframeSrc = `${GRAFANA_URL}/d/${DASHBOARD_ID}?orgId=1&refresh=5s&theme=light&kiosk`;

  return (
    <div style={{ marginTop: "24px" }}>
      <h3>📊 Dashboard Supervision</h3>
      <iframe
        src={iframeSrc}
        width="100%"
        height="500"
        style={{ border: "1px solid #ddd", borderRadius: "8px" }}
        title="Dashboard capteurs"
      />
    </div>
  );
}
