import { useState } from "react"

export default function Navbar({ user, onLogout, activePage, setActivePage }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav style={{ background: "#13131f", borderBottom: "1px solid #ffffff10", padding: "0 24px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
      
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => setActivePage("dashboard")}>
        <span style={{ fontSize: "1.5rem" }}>⚡</span>
        <span style={{ fontSize: "1.1rem", fontWeight: "700", background: "linear-gradient(135deg, #00ff88, #0088ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          LegacyBridge
        </span>
      </div>

      {/* Nav Links */}
      <div style={{ display: "flex", gap: "4px" }}>
        {[
          { id: "dashboard", label: "📊 Dashboard" },
          { id: "translate", label: "⚡ Translate" },
          { id: "history", label: "📚 History" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            style={{
              padding: "8px 16px", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "500", transition: "all 0.2s",
              background: activePage === item.id ? "#00ff8822" : "transparent",
              color: activePage === item.id ? "#00ff88" : "#666"
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* User */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "0.85rem", fontWeight: "500", color: "#fff", margin: 0 }}>{user?.name}</p>
          <p style={{ fontSize: "0.75rem", color: "#555", margin: 0 }}>{user?.email}</p>
        </div>
        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #00ff88, #0088ff)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", color: "#000", fontSize: "0.9rem" }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <button
          onClick={onLogout}
          style={{ padding: "8px 14px", background: "#ff000015", border: "1px solid #ff000033", borderRadius: "8px", color: "#ff6666", cursor: "pointer", fontSize: "0.8rem" }}
        >
          Logout
        </button>
      </div>
    </nav>
  )
}