"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const TYPES = [
  { id: "behavioral",    icon: "🧠", name: "Behavioral",    desc: "STAR method, leadership, conflict, teamwork" },
  { id: "technical",     icon: "💻", name: "Technical",     desc: "Depth of knowledge, problem-solving" },
  { id: "system_design", icon: "🏗",  name: "System Design", desc: "Architecture, trade-offs, scalability" },
  { id: "hr",            icon: "🤝", name: "HR / Culture",  desc: "Values, motivation, situational judgment" },
];

const MODES = [
  { id: "fast", icon: "⚡", name: "Fast Paced",      duration: "2-3 min", desc: "3 focused questions. No filler. Perfect for quick practice or recording." },
  { id: "full", icon: "🎯", name: "Full Interview",  duration: "7-8 min", desc: "6 questions with intelligent follow-ups based on your answers." },
];

export default function SetupPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState("behavioral");
  const [selectedMode, setSelectedMode] = useState("fast");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");

  async function handleStart() {
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/interview/create", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewType: selectedType, mode: selectedMode }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push(`/interview/${data.sessionId}`);
    } catch { setError("Failed to start interview. Try again."); }
    finally   { setLoading(false); }
  }

  const activeCard: React.CSSProperties = {
    background: "rgba(255,255,255,0.92)", backdropFilter: "blur(28px)",
    WebkitBackdropFilter: "blur(28px)",
    border: "2px solid rgba(249,115,22,0.45)",
    boxShadow: "0 0 0 4px rgba(249,115,22,0.08), 0 8px 28px rgba(249,115,22,0.1)",
    borderRadius: "20px",
  };
  const idleCard: React.CSSProperties = {
    background: "rgba(255,255,255,0.72)", backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1.5px solid rgba(255,255,255,0.95)",
    boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
    borderRadius: "20px",
  };

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: "linear-gradient(150deg, #faf7f2 0%, #f3ede3 40%, #ede8f5 100%)" }}
    >
      {/* Blobs */}
      <div className="fixed pointer-events-none" style={{ top: "-120px", right: "-100px", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle at 40% 40%, rgba(251,191,100,0.35) 0%, rgba(249,168,77,0.18) 50%, transparent 75%)", filter: "blur(56px)" }} />
      <div className="fixed pointer-events-none" style={{ bottom: "-80px", left: "-100px", width: 460, height: 460, borderRadius: "50%", background: "radial-gradient(circle at 60% 60%, rgba(167,139,250,0.2) 0%, rgba(139,92,246,0.09) 55%, transparent 75%)", filter: "blur(60px)" }} />
      <div className="fixed pointer-events-none" style={{ top: "45%", right: "5%", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(252,211,154,0.24) 0%, transparent 70%)", filter: "blur(44px)" }} />

      {/* Floating circles */}
      <div className="fixed pointer-events-none" style={{ top: "8%", left: "6%", width: 50, height: 50, borderRadius: "50%", background: "rgba(255,255,255,0.55)", border: "1.5px solid rgba(255,255,255,0.9)", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }} />
      <div className="fixed pointer-events-none" style={{ bottom: "14%", right: "8%", width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.45)", border: "1.5px solid rgba(255,255,255,0.85)" }} />

      <div className="relative z-10 max-w-lg mx-auto px-5 py-10">

        {/* Back */}
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          onClick={() => router.push("/dashboard")}
          style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 500, color: "#9ca3af", background: "none", border: "none", cursor: "pointer", marginBottom: "32px" }}>
          ← Dashboard
        </motion.button>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <h1 style={{ fontSize: "30px", fontWeight: 900, color: "#111827", letterSpacing: "-0.5px", marginBottom: "2px" }}>Set Up</h1>
          <h1 style={{ fontSize: "30px", fontWeight: 900, fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: "#f97316", marginBottom: "28px" }}>
            Your Interview
          </h1>

          {/* ── Mode ── */}
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.8px", color: "#c4a882", textTransform: "uppercase", marginBottom: "12px" }}>
            Interview Mode
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "28px" }}>
            {MODES.map((m, i) => (
              <motion.button key={m.id} onClick={() => setSelectedMode(m.id)}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                style={{ ...(selectedMode === m.id ? activeCard : idleCard), padding: "16px", textAlign: "left", cursor: "pointer", border: "none", transition: "box-shadow 0.2s, border-color 0.2s", ...(selectedMode === m.id ? activeCard : idleCard) }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontSize: "20px" }}>{m.icon}</span>
                  <span style={{
                    fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px",
                    background: selectedMode === m.id ? "rgba(249,115,22,0.12)" : "rgba(0,0,0,0.05)",
                    color: selectedMode === m.id ? "#ea580c" : "#9ca3af",
                  }}>{m.duration}</span>
                </div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#111827", marginBottom: "4px" }}>{m.name}</div>
                <div style={{ fontSize: "12px", lineHeight: 1.55, color: "#9ca3af" }}>{m.desc}</div>
              </motion.button>
            ))}
          </div>

          {/* ── Type ── */}
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.8px", color: "#c4a882", textTransform: "uppercase", marginBottom: "12px" }}>
            Interview Type
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "28px" }}>
            {TYPES.map((t, i) => (
              <motion.button key={t.id} onClick={() => setSelectedType(t.id)}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.05 }}
                style={{ ...(selectedType === t.id ? activeCard : idleCard), padding: "16px", textAlign: "left", cursor: "pointer", border: selectedType === t.id ? "2px solid rgba(249,115,22,0.45)" : "1.5px solid rgba(255,255,255,0.95)" }}>
                <div style={{ fontSize: "22px", marginBottom: "8px" }}>{t.icon}</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#111827", marginBottom: "4px" }}>{t.name}</div>
                <div style={{ fontSize: "12px", lineHeight: 1.55, color: "#9ca3af", marginBottom: "12px" }}>{t.desc}</div>
                {/* Radio dot */}
                <div style={{
                  width: 16, height: 16, borderRadius: "50%",
                  background: selectedType === t.id ? "#f97316" : "transparent",
                  border: selectedType === t.id ? "none" : "2px solid #d1d5db",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: selectedType === t.id ? "0 0 0 3px rgba(249,115,22,0.15)" : "none",
                }}>
                  {selectedType === t.id && (
                    <span style={{ color: "white", fontSize: "9px", fontWeight: 900 }}>✓</span>
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {error && (
            <p style={{ fontSize: "13px", color: "#dc2626", background: "rgba(239,68,68,0.07)", borderRadius: "12px", padding: "12px 16px", border: "1px solid rgba(239,68,68,0.15)", marginBottom: "16px" }}>
              {error}
            </p>
          )}

          <motion.button onClick={handleStart} disabled={loading}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
              gap: "10px", padding: "15px",
              background: loading ? "#374151" : "#111827", color: "white", border: "none", borderRadius: "50px",
              fontSize: "14px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 8px 28px rgba(17,24,39,0.22)", letterSpacing: "0.1px",
              opacity: loading ? 0.7 : 1,
            }}>
            {loading ? "Starting…" : (
              <>
                {selectedMode === "fast" ? "⚡" : "🎯"} Start {selectedMode === "fast" ? "Fast Paced" : "Full"} Interview
                <span style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px" }}>→</span>
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
