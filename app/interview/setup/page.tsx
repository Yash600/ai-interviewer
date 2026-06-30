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
  {
    id: "fast",
    icon: "⚡",
    name: "Fast Paced",
    duration: "2-3 min",
    desc: "3 focused questions. No filler. Perfect for quick practice or recording.",
  },
  {
    id: "full",
    icon: "🎯",
    name: "Full Interview",
    duration: "7-8 min",
    desc: "6 questions with intelligent follow-ups based on your answers.",
  },
];

export default function SetupPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState("behavioral");
  const [selectedMode, setSelectedMode] = useState("fast");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");

  async function handleStart() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/interview/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewType: selectedType, mode: selectedMode }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push(`/interview/${data.sessionId}`);
    } catch {
      setError("Failed to start interview. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden"
      style={{ background: "linear-gradient(160deg, #f5f0ff 0%, #edf4ff 45%, #f8f0ff 100%)" }}>

      {/* Blobs */}
      <div className="fixed pointer-events-none" style={{ top: "-20%", left: "-10%", width: 550, height: 550, borderRadius: "50%", background: "rgba(167,139,250,0.22)", filter: "blur(90px)" }} />
      <div className="fixed pointer-events-none" style={{ bottom: "-10%", right: "-10%", width: 450, height: 450, borderRadius: "50%", background: "rgba(96,165,250,0.18)", filter: "blur(80px)" }} />

      <div className="relative z-10 max-w-lg mx-auto px-5 py-10">
        {/* Back */}
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-1.5 text-xs mb-8 font-medium"
          style={{ color: "#9ca3af" }}>
          ← Dashboard
        </motion.button>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <h1 className="text-3xl font-black mb-0.5" style={{ color: "#1e1b4b" }}>Set Up</h1>
          <h1 className="text-3xl font-black mb-7"
            style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: "#7c3aed" }}>
            Your Interview
          </h1>

          {/* ── Mode ── */}
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#c4b5fd" }}>Interview Mode</p>
          <div className="grid grid-cols-2 gap-3 mb-7">
            {MODES.map((m, i) => (
              <motion.button key={m.id} onClick={() => setSelectedMode(m.id)}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="rounded-2xl p-4 text-left transition-all"
                style={{
                  background: selectedMode === m.id ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.45)",
                  backdropFilter: "blur(16px)",
                  border: selectedMode === m.id ? "1.5px solid rgba(124,58,237,0.5)" : "1px solid rgba(255,255,255,0.7)",
                  boxShadow: selectedMode === m.id ? "0 0 0 1px rgba(124,58,237,0.15), 0 4px 20px rgba(124,58,237,0.1)" : "0 2px 12px rgba(0,0,0,0.03)",
                }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{m.icon}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: selectedMode === m.id ? "rgba(124,58,237,0.15)" : "rgba(0,0,0,0.05)", color: selectedMode === m.id ? "#7c3aed" : "#9ca3af" }}>
                    {m.duration}
                  </span>
                </div>
                <div className="text-sm font-bold mb-1" style={{ color: "#1e1b4b" }}>{m.name}</div>
                <div className="text-xs leading-relaxed" style={{ color: "#9ca3af" }}>{m.desc}</div>
              </motion.button>
            ))}
          </div>

          {/* ── Type ── */}
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#c4b5fd" }}>Interview Type</p>
          <div className="grid grid-cols-2 gap-3 mb-7">
            {TYPES.map((t, i) => (
              <motion.button key={t.id} onClick={() => setSelectedType(t.id)}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.05 }}
                className="rounded-2xl p-4 text-left transition-all"
                style={{
                  background: selectedType === t.id ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.45)",
                  backdropFilter: "blur(16px)",
                  border: selectedType === t.id ? "1.5px solid rgba(124,58,237,0.5)" : "1px solid rgba(255,255,255,0.7)",
                  boxShadow: selectedType === t.id ? "0 0 0 1px rgba(124,58,237,0.15), 0 4px 20px rgba(124,58,237,0.1)" : "0 2px 12px rgba(0,0,0,0.03)",
                }}>
                <div className="text-2xl mb-2">{t.icon}</div>
                <div className="text-sm font-bold mb-1" style={{ color: "#1e1b4b" }}>{t.name}</div>
                <div className="text-xs leading-relaxed" style={{ color: "#9ca3af" }}>{t.desc}</div>
                <div className="mt-3">
                  <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center"
                    style={{ background: selectedType === t.id ? "#7c3aed" : "transparent", border: selectedType === t.id ? "none" : "1.5px solid rgba(0,0,0,0.15)" }}>
                    {selectedType === t.id && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {error && (
            <p className="text-sm rounded-xl px-4 py-3 mb-4"
              style={{ background: "rgba(239,68,68,0.08)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </p>
          )}

          <motion.button onClick={handleStart} disabled={loading}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.9), rgba(91,33,182,0.92))", color: "white", boxShadow: "0 8px 32px rgba(124,58,237,0.28), inset 0 1px 0 rgba(255,255,255,0.2)", border: "1px solid rgba(167,139,250,0.4)" }}>
            {loading ? "Starting…" : `${selectedMode === "fast" ? "⚡" : "🎯"} Start ${selectedMode === "fast" ? "Fast Paced" : "Full"} Interview →`}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
