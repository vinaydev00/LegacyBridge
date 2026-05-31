import { useState, useEffect } from "react"
import axios from "axios"

const API_URL = "https://legacybridge.onrender.com"

export default function HistoryPage({ token }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setHistory(res.data.translations)
    } catch (err) {
      console.log("History error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setHistory(history.filter(t => t.id !== id))
      if (selected?.id === id) setSelected(null)
    } catch (err) {
      console.log("Delete error:", err)
    }
  }

  const handleDownload = (item) => {
    const blob = new Blob([item.generated_code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${item.program_name.toLowerCase()}_api.py`
    a.click()
  }

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const filtered = history.filter(t =>
    t.program_name.toLowerCase().includes(search.toLowerCase()) ||
    t.filename.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: "700", margin: 0 }}>
          📚 <span style={{ background: "linear-gradient(135deg, #00ff88, #0088ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Translation History</span>
        </h1>
        <p style={{ color: "#555", marginTop: "8px" }}>{history.length} total translations</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1.5fr" : "1fr", gap: "24px" }}>

        {/* Left — List */}
        <div>
          {/* Search */}
          <input
            type="text"
            placeholder="🔍 Search by program name or filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "12px 16px", background: "#13131f", border: "1px solid #ffffff15", borderRadius: "10px", color: "#fff", fontSize: "0.9rem", outline: "none", marginBottom: "16px" }}
          />

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#555" }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#555" }}>
              <div style={{ fontSize: "3rem", marginBottom: "12px" }}>📭</div>
              <p>No translations found</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelected(item)}
                style={{ background: selected?.id === item.id ? "#00ff8808" : "#13131f", border: `1px solid ${selected?.id === item.id ? "#00ff8844" : "#ffffff10"}`, borderRadius: "12px", padding: "16px 20px", marginBottom: "10px", cursor: "pointer", transition: "all 0.2s" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ color: "#00ff88", fontWeight: "600", margin: "0 0 4px", fontSize: "0.95rem" }}>{item.program_name}</p>
                    <p style={{ color: "#444", margin: 0, fontSize: "0.8rem" }}>{item.filename}</p>
                    <p style={{ color: "#333", margin: "4px 0 0", fontSize: "0.75rem" }}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ background: item.confidence_score >= 80 ? "#00ff8822" : "#ffaa0022", color: item.confidence_score >= 80 ? "#00ff88" : "#ffaa00", padding: "4px 10px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "600" }}>
                      {item.confidence_score}%
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id) }}
                      style={{ background: "#ff000015", border: "1px solid #ff000033", borderRadius: "6px", color: "#ff6666", cursor: "pointer", padding: "4px 10px", fontSize: "0.8rem" }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right — Detail */}
        {selected && (
          <div style={{ background: "#13131f", border: "1px solid #ffffff10", borderRadius: "16px", padding: "24px", height: "fit-content", position: "sticky", top: "80px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ color: "#00ff88", fontSize: "1.2rem", margin: 0 }}>{selected.program_name}</h2>
              <button
                onClick={() => setSelected(null)}
                style={{ background: "#ffffff10", border: "none", borderRadius: "6px", color: "#888", cursor: "pointer", padding: "6px 12px" }}
              >
                ✕
              </button>
            </div>

            {/* Understanding */}
            <h3 style={{ fontSize: "0.9rem", color: "#555", marginBottom: "10px" }}>📖 AI Understanding</h3>
            <div style={{ background: "#0a0a0f", borderRadius: "8px", padding: "16px", color: "#ccc", lineHeight: "1.7", fontSize: "0.85rem", marginBottom: "20px", borderLeft: "3px solid #00ff88", maxHeight: "200px", overflow: "auto" }}>
              {selected.understanding}
            </div>

            {/* Code */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <h3 style={{ fontSize: "0.9rem", color: "#555", margin: 0 }}>🐍 Generated API</h3>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => handleCopy(selected.generated_code)}
                  style={{ padding: "6px 12px", background: copied ? "#00ff8822" : "#ffffff10", border: `1px solid ${copied ? "#00ff8844" : "#ffffff20"}`, borderRadius: "6px", color: copied ? "#00ff88" : "#fff", cursor: "pointer", fontSize: "0.8rem" }}
                >
                  {copied ? "✅ Copied!" : "📋 Copy"}
                </button>
                <button
                  onClick={() => handleDownload(selected)}
                  style={{ padding: "6px 12px", background: "linear-gradient(135deg, #00ff88, #0088ff)", border: "none", borderRadius: "6px", color: "#000", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" }}
                >
                  ⬇️ Download
                </button>
              </div>
            </div>
            <pre style={{ background: "#0a0a0f", padding: "16px", borderRadius: "8px", overflow: "auto", color: "#00ff88", fontSize: "0.8rem", lineHeight: "1.5", maxHeight: "400px", border: "1px solid #ffffff10" }}>
              {selected.generated_code}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}