import { useState } from "react"
import axios from "axios"

const API_URL = "http://localhost:8000"

export default function TranslatePage({ token, setActivePage }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleTranslate = async () => {
    if (!file) return alert("Please select a COBOL file!")
    setLoading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await axios.post(`${API_URL}/translate`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong!")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result.generated_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([result.generated_code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${result.program_name.toLowerCase()}_api.py`
    a.click()
  }

  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: "700", margin: 0 }}>
          ⚡ <span style={{ background: "linear-gradient(135deg, #00ff88, #0088ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Translate COBOL</span>
        </h1>
        <p style={{ color: "#555", marginTop: "8px" }}>Upload your COBOL file and get a modern Python API instantly</p>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); setFile(e.dataTransfer.files[0]) }}
        style={{ background: dragOver ? "#00ff8808" : "#13131f", border: `2px dashed ${dragOver ? "#00ff88" : "#ffffff15"}`, borderRadius: "16px", padding: "48px", textAlign: "center", marginBottom: "24px", transition: "all 0.2s", cursor: "pointer" }}
      >
        <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📂</div>
        <p style={{ color: "#888", marginBottom: "16px", fontSize: "1rem" }}>
          Drag and drop your COBOL file here, or click to browse
        </p>
        <input
          type="file"
          accept=".cbl,.txt"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ display: "none" }}
          id="fileInput"
        />
        <label
          htmlFor="fileInput"
          style={{ padding: "10px 24px", background: "#ffffff10", border: "1px solid #ffffff20", borderRadius: "8px", color: "#fff", cursor: "pointer", fontSize: "0.9rem" }}
        >
          Browse Files
        </label>
        {file && (
          <div style={{ marginTop: "16px", padding: "12px 20px", background: "#00ff8815", border: "1px solid #00ff8833", borderRadius: "8px", display: "inline-block" }}>
            <span style={{ color: "#00ff88" }}>✅ {file.name}</span>
            <span style={{ color: "#555", marginLeft: "12px", fontSize: "0.85rem" }}>({(file.size / 1024).toFixed(1)} KB)</span>
          </div>
        )}
      </div>

      {/* Translate Button */}
      <button
        onClick={handleTranslate}
        disabled={loading || !file}
        style={{ width: "100%", padding: "16px", background: loading || !file ? "#1a1a2e" : "linear-gradient(135deg, #00ff88, #0088ff)", border: "none", borderRadius: "12px", color: loading || !file ? "#444" : "#000", fontSize: "1.1rem", fontWeight: "700", cursor: loading || !file ? "not-allowed" : "pointer", marginBottom: "24px", transition: "all 0.2s" }}
      >
        {loading ? "🤖 AI is translating your COBOL..." : "⚡ Translate to Python API"}
      </button>

      {/* Loading Animation */}
      {loading && (
        <div style={{ background: "#13131f", border: "1px solid #00ff8833", borderRadius: "12px", padding: "24px", marginBottom: "24px", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "12px" }}>🤖</div>
          <p style={{ color: "#00ff88", fontWeight: "600", marginBottom: "8px" }}>AI is working...</p>
          <p style={{ color: "#555", fontSize: "0.85rem" }}>Reading COBOL → Understanding logic → Generating Python API</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: "#ff000015", border: "1px solid #ff000033", borderRadius: "12px", padding: "16px", marginBottom: "24px", color: "#ff6666" }}>
          ❌ {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={{ background: "#13131f", border: "1px solid #00ff8833", borderRadius: "16px", padding: "32px" }}>
          
          {/* Result Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: "700", color: "#00ff88", margin: 0 }}>
                ✅ {result.program_name}
              </h2>
              <p style={{ color: "#555", margin: "4px 0 0", fontSize: "0.85rem" }}>Translation successful</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ background: result.confidence_score >= 80 ? "#00ff8822" : "#ffaa0022", border: `1px solid ${result.confidence_score >= 80 ? "#00ff8844" : "#ffaa0044"}`, borderRadius: "20px", padding: "8px 16px" }}>
                <span style={{ color: result.confidence_score >= 80 ? "#00ff88" : "#ffaa00", fontWeight: "700" }}>
                  {result.confidence_score}% Confidence
                </span>
              </div>
            </div>
          </div>

          {/* Understanding */}
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "1rem", color: "#888", marginBottom: "12px" }}>📖 AI Understanding</h3>
            <div style={{ background: "#0a0a0f", borderRadius: "10px", padding: "20px", color: "#ccc", lineHeight: "1.7", fontSize: "0.9rem", borderLeft: "3px solid #00ff88" }}>
              {result.understanding}
            </div>
          </div>

          {/* Generated Code */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ fontSize: "1rem", color: "#888", margin: 0 }}>🐍 Generated Python API</h3>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={handleCopy}
                  style={{ padding: "8px 16px", background: copied ? "#00ff8822" : "#ffffff10", border: `1px solid ${copied ? "#00ff8844" : "#ffffff20"}`, borderRadius: "8px", color: copied ? "#00ff88" : "#fff", cursor: "pointer", fontSize: "0.85rem" }}
                >
                  {copied ? "✅ Copied!" : "📋 Copy Code"}
                </button>
                <button
                  onClick={handleDownload}
                  style={{ padding: "8px 16px", background: "linear-gradient(135deg, #00ff88, #0088ff)", border: "none", borderRadius: "8px", color: "#000", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600" }}
                >
                  ⬇️ Download .py
                </button>
              </div>
            </div>
            <pre style={{ background: "#0a0a0f", padding: "24px", borderRadius: "10px", overflow: "auto", color: "#00ff88", fontSize: "0.85rem", lineHeight: "1.6", maxHeight: "500px", border: "1px solid #ffffff10" }}>
              {result.generated_code}
            </pre>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
            <button
              onClick={() => { setFile(null); setResult(null) }}
              style={{ padding: "12px 24px", background: "#ffffff10", border: "1px solid #ffffff15", borderRadius: "8px", color: "#fff", cursor: "pointer" }}
            >
              🔄 Translate Another
            </button>
            <button
              onClick={() => setActivePage("history")}
              style={{ padding: "12px 24px", background: "#ffffff10", border: "1px solid #ffffff15", borderRadius: "8px", color: "#fff", cursor: "pointer" }}
            >
              📚 View History
            </button>
          </div>
        </div>
      )}
    </div>
  )
}