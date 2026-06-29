"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const TYPES = [
  { id: "behavioral",    icon: "🧠", name: "Behavioral",    desc: "STAR method, self-awareness, communication" },
  { id: "technical",     icon: "💻", name: "Technical",     desc: "Depth of knowledge, problem-solving" },
  { id: "system_design", icon: "🏗",  name: "System Design", desc: "Architecture, tradeoffs, scalability" },
  { id: "hr",            icon: "🤝", name: "HR / Culture",  desc: "Values, motivation, situational judgment" },
];

export default function SetupPage() {
  const router = useRouter();
  const [selected, setSelected] = useState("behavioral");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleStart() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/interview/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewType: selected }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      // Pass access token via sessionStorage (client-side only)
      sessionStorage.setItem(`retell_token_${data.sessionId}`, data.accessToken);
      router.push(`/interview/${data.sessionId}`);
    } catch {
      setError("Failed to start interview. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #0d0d1a 0%, #1a0a3a 40%, #0d1a3a 100%)" }}>
      <div className="max-w-sm mx-auto px-6 py-10">
        {/* Back */}
        <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2 text-xs mb-8 transition-colors hover:text-white/70" style={{ color: "rgba(255,255,255,0.35)" }}>
          ← Dashboard
        </button>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-3xl font-black text-white leading-tight mb-1">
            Choose Your
          </h1>
          <h1 className="text-3xl font-black mb-2" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: "#a78bfa" }}>
            Interview Type
          </h1>
          <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>
            One type done properly beats four done poorly.
          </p>

          {/* Type grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {TYPES.map(t => (
              <button key={t.id} onClick={() => setSelected(t.id)}
                className="rounded-2xl p-4 text-left transition-all"
                style={{
                  background: selected === t.id ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.04)",
                  border: selected === t.id ? "1px solid rgba(124,58,237,0.6)" : "1px solid rgba(255,255,255,0.07)",
                  boxShadow: selected === t.id ? "0 0 0 1px rgba(124,58,237,0.3), 0 4px 20px rgba(124,58,237,0.15)" : "none",
                }}>
                <div className="text-2xl mb-2">{t.icon}</div>
                <div className="text-sm font-bold text-white mb-1">{t.name}</div>
                <div className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>{t.desc}</div>
                <div className="mt-3">
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${selected === t.id ? "bg-brand-600" : ""}`}
                    style={{ border: selected === t.id ? "none" : "1.5px solid rgba(255,255,255,0.2)" }}>
                    {selected === t.id && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {error && <p className="text-sm text-red-400 bg-red-500/10 rounded-xl px-4 py-3 mb-4">{error}</p>}

          <button onClick={handleStart} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? "Starting..." : "🎙 Start Interview Session →"}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
