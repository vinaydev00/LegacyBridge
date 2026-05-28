import { useState, useEffect } from "react"
import axios from "axios"

const API_URL = "http://localhost:8000"

export default function App() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [error, setError] = useState(null)

  // Load history when page opens
  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/history`)
      setHistory(res.data.translations)
    } catch (err) {
      console.log("History error:", err)
    }
  }

  const handleTranslate = async () => {
    if (!file) return alert("Please select a COBOL file!")
    
    setLoading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await axios.post(`${API_URL}/translate`, formData)
      setResult(res.data)
      fetchHistory()
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: "monospace", maxWidth: "1200px", margin: "0 auto", padding: "20px", background: "#0f0f0f", minHeight: "100vh", color: "#fff" }}>
      
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ fontSize: "2.5rem", color: "#00ff88", margin: 0 }}>⚡ LegacyBridge</h1>
        <p style={{ color: "#888", marginTop: "8px" }}>AI-powered COBOL → Modern Python API Translator</p>
      </div>

      {/* Upload Box */}
      <div style={{ background: "#1a1a1a", border: "2px dashed #333", borderRadius: "12px", padding: "40px", textAlign: "center", marginBottom: "30px" }}>
        <p style={{ color: "#888", marginBottom: "20px" }}>Upload your COBOL file (.cbl)</p>
        <input
          type="file"
          accept=".cbl,.txt"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ color: "#fff", marginBottom: "20px", display: "block", margin: "0 auto 20px" }}
        />
        {file && <p style={{ color: "#00ff88", marginBottom: "15px" }}>✅ Selected: {file.name}</p>}
        <button
          onClick={handleTranslate}
          disabled={loading}
          style={{ background: loading ? "#333" : "#00ff88", color: "#000", border: "none", padding: "12px 30px", borderRadius: "8px", fontSize: "1rem", cursor: loading ? "not-allowed" : "pointer", fontWeight: "bold" }}
        >
          {loading ? "🤖 AI is translating..." : "⚡ Translate to Python API"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "#ff000022", border: "1px solid #ff0000", borderRadius: "8px", padding: "15px", marginBottom: "20px", color: "#ff4444" }}>
          ❌ {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={{ background: "#1a1a1a", borderRadius: "12px", padding: "30px", marginBottom: "30px", border: "1px solid #00ff8844" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ color: "#00ff88", margin: 0 }}>✅ {result.program_name}</h2>
            <span style={{ background: "#00ff8822", color: "#00ff88", padding: "5px 15px", borderRadius: "20px", fontSize: "0.9rem" }}>
              Confidence: {result.confidence_score}%
            </span>
          </div>
          
          <h3 style={{ color: "#888", marginBottom: "10px" }}>📖 AI Understanding:</h3>
          <p style={{ color: "#ccc", lineHeight: "1.6", marginBottom: "20px", background: "#111", padding: "15px", borderRadius: "8px" }}>
            {result.understanding}
          </p>

          <h3 style={{ color: "#888", marginBottom: "10px" }}>🐍 Generated Python API:</h3>
          <pre style={{ background: "#111", padding: "20px", borderRadius: "8px", overflow: "auto", color: "#00ff88", fontSize: "0.85rem", lineHeight: "1.5" }}>
            {result.generated_code}
          </pre>
        </div>
      )}

      {/* History */}
      <div style={{ background: "#1a1a1a", borderRadius: "12px", padding: "30px" }}>
        <h2 style={{ color: "#fff", marginBottom: "20px" }}>📚 Translation History ({history.length})</h2>
        {history.length === 0 ? (
          <p style={{ color: "#555" }}>No translations yet. Upload a COBOL file to get started!</p>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              onClick={() => setResult(item)}
              style={{ background: "#111", borderRadius: "8px", padding: "15px", marginBottom: "10px", cursor: "pointer", border: "1px solid #222", display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <div>
                <p style={{ color: "#00ff88", margin: 0, fontWeight: "bold" }}>{item.program_name}</p>
                <p style={{ color: "#555", margin: "4px 0 0", fontSize: "0.85rem" }}>{item.filename}</p>
              </div>
              <span style={{ background: "#00ff8822", color: "#00ff88", padding: "4px 12px", borderRadius: "20px", fontSize: "0.85rem" }}>
                {item.confidence_score}%
              </span>
            </div>
          ))
        )}
      </div>

    </div>
  )
}