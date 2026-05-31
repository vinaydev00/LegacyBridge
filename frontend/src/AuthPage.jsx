import { useState } from "react"
import axios from "axios"

const API_URL = "https://legacybridge.onrender.com"

export default function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ name: "", email: "", password: "" })

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const endpoint = isLogin ? "/login" : "/register"
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password }

      const res = await axios.post(`${API_URL}${endpoint}`, payload)
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("user", JSON.stringify(res.data.user))
      onLogin(res.data.user)
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0a0a0f 0%, #0d1117 100%)" }}>
      
      {/* Background decoration */}
      <div style={{ position: "fixed", top: "20%", left: "10%", width: "300px", height: "300px", background: "#00ff8811", borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "20%", right: "10%", width: "250px", height: "250px", background: "#0088ff11", borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: "440px", padding: "20px" }}>
        
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "10px" }}>⚡</div>
          <h1 style={{ fontSize: "2rem", fontWeight: "700", background: "linear-gradient(135deg, #00ff88, #0088ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            LegacyBridge
          </h1>
          <p style={{ color: "#666", marginTop: "8px", fontSize: "0.9rem" }}>
            AI-powered COBOL → Modern Python API Translator
          </p>
        </div>

        {/* Card */}
        <div style={{ background: "#13131f", border: "1px solid #ffffff15", borderRadius: "16px", padding: "32px" }}>
          
          {/* Tabs */}
          <div style={{ display: "flex", background: "#0a0a0f", borderRadius: "10px", padding: "4px", marginBottom: "28px" }}>
            {["Login", "Register"].map((tab) => (
              <button
                key={tab}
                onClick={() => { setIsLogin(tab === "Login"); setError(null) }}
                style={{
                  flex: 1, padding: "10px", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.9rem", fontWeight: "500", transition: "all 0.2s",
                  background: (isLogin && tab === "Login") || (!isLogin && tab === "Register") ? "#00ff88" : "transparent",
                  color: (isLogin && tab === "Login") || (!isLogin && tab === "Register") ? "#000" : "#666"
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Fields */}
          {!isLogin && (
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "0.85rem", color: "#888", marginBottom: "8px", display: "block" }}>Full Name</label>
              <input
                type="text"
                placeholder="Vinay Narwal"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{ width: "100%", padding: "12px 16px", background: "#0a0a0f", border: "1px solid #ffffff15", borderRadius: "8px", color: "#fff", fontSize: "0.95rem", outline: "none" }}
              />
            </div>
          )}

          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "0.85rem", color: "#888", marginBottom: "8px", display: "block" }}>Email</label>
            <input
              type="email"
              placeholder="vinay@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{ width: "100%", padding: "12px 16px", background: "#0a0a0f", border: "1px solid #ffffff15", borderRadius: "8px", color: "#fff", fontSize: "0.95rem", outline: "none" }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "0.85rem", color: "#888", marginBottom: "8px", display: "block" }}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              style={{ width: "100%", padding: "12px 16px", background: "#0a0a0f", border: "1px solid #ffffff15", borderRadius: "8px", color: "#fff", fontSize: "0.95rem", outline: "none" }}
            />
          </div>

          {error && (
            <div style={{ background: "#ff000015", border: "1px solid #ff000033", borderRadius: "8px", padding: "12px", marginBottom: "16px", color: "#ff6666", fontSize: "0.85rem" }}>
              ❌ {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: "100%", padding: "13px", background: loading ? "#333" : "linear-gradient(135deg, #00ff88, #0088ff)", border: "none", borderRadius: "8px", color: loading ? "#666" : "#000", fontSize: "1rem", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Please wait..." : isLogin ? "Login →" : "Create Account →"}
          </button>

        </div>

        <p style={{ textAlign: "center", color: "#444", fontSize: "0.8rem", marginTop: "20px" }}>
          Transforming legacy banking systems with AI
        </p>
      </div>
    </div>
  )
}