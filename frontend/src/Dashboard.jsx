import { useState, useEffect } from "react"
import axios from "axios"

const API_URL = "http://localhost:8000"

export default function Dashboard({ user, token, setActivePage }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(res.data)
    } catch (err) {
      console.log("Stats error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* Welcome */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: "700", margin: 0 }}>
          Welcome back, <span style={{ background: "linear-gradient(135deg, #00ff88, #0088ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{user?.name}! 👋</span>
        </h1>
        <p style={{ color: "#555", marginTop: "8px" }}>Here's your LegacyBridge overview</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        {[
          { label: "Total Translations", value: loading ? "..." : stats?.total_translations || 0, icon: "⚡", color: "#00ff88" },
          { label: "Avg Confidence", value: loading ? "..." : `${stats?.avg_confidence || 0}%`, icon: "📊", color: "#0088ff" },
          { label: "Highest Confidence", value: loading ? "..." : `${stats?.highest_confidence || 0}%`, icon: "🏆", color: "#ff88000" },
          { label: "Programs Translated", value: loading ? "..." : stats?.programs?.length || 0, icon: "🔄", color: "#ff0088" },
        ].map((stat) => (
          <div key={stat.label} style={{ background: "#13131f", border: "1px solid #ffffff10", borderRadius: "12px", padding: "24px" }}>
            <div style={{ fontSize: "2rem", marginBottom: "12px" }}>{stat.icon}</div>
            <p style={{ color: "#555", fontSize: "0.85rem", margin: "0 0 8px" }}>{stat.label}</p>
            <p style={{ fontSize: "1.8rem", fontWeight: "700", color: stat.color, margin: 0 }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ background: "#13131f", border: "1px solid #ffffff10", borderRadius: "12px", padding: "24px", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "16px" }}>Quick Actions</h2>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            onClick={() => setActivePage("translate")}
            style={{ padding: "12px 24px", background: "linear-gradient(135deg, #00ff88, #0088ff)", border: "none", borderRadius: "8px", color: "#000", fontWeight: "600", cursor: "pointer", fontSize: "0.95rem" }}
          >
            ⚡ New Translation
          </button>
          <button
            onClick={() => setActivePage("history")}
            style={{ padding: "12px 24px", background: "#ffffff10", border: "1px solid #ffffff15", borderRadius: "8px", color: "#fff", cursor: "pointer", fontSize: "0.95rem" }}
          >
            📚 View History
          </button>
        </div>
      </div>

      {/* Recent Programs */}
      {stats?.programs?.length > 0 && (
        <div style={{ background: "#13131f", border: "1px solid #ffffff10", borderRadius: "12px", padding: "24px" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "16px" }}>Recently Translated Programs</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {stats.programs.map((program, i) => (
              <span key={i} style={{ background: "#00ff8815", border: "1px solid #00ff8833", color: "#00ff88", padding: "6px 14px", borderRadius: "20px", fontSize: "0.85rem" }}>
                {program}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* How it works */}
      <div style={{ background: "#13131f", border: "1px solid #ffffff10", borderRadius: "12px", padding: "24px", marginTop: "24px" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "20px" }}>How LegacyBridge Works</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          {[
            { step: "01", title: "Upload COBOL", desc: "Upload your legacy .cbl file", icon: "📤" },
            { step: "02", title: "AI Analyzes", desc: "Our AI reads and understands the code", icon: "🤖" },
            { step: "03", title: "API Generated", desc: "Modern FastAPI code is generated", icon: "⚡" },
            { step: "04", title: "Download", desc: "Download and use immediately", icon: "⬇️" },
          ].map((item) => (
            <div key={item.step} style={{ textAlign: "center", padding: "20px" }}>
              <div style={{ fontSize: "2rem", marginBottom: "8px" }}>{item.icon}</div>
              <div style={{ fontSize: "0.75rem", color: "#00ff88", fontWeight: "600", marginBottom: "6px" }}>STEP {item.step}</div>
              <div style={{ fontWeight: "600", marginBottom: "6px" }}>{item.title}</div>
              <div style={{ fontSize: "0.85rem", color: "#555" }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}