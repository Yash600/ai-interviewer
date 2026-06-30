"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

const TYPE_META: Record<string, { icon: string; color: string; accent: string }> = {
  behavioral:    { icon: "🧠", color: "#7c3aed", accent: "rgba(124,58,237,0.15)" },
  technical:     { icon: "💻", color: "#2563eb", accent: "rgba(37,99,235,0.15)"  },
  system_design: { icon: "🏗",  color: "#059669", accent: "rgba(5,150,105,0.15)"  },
  hr:            { icon: "🤝", color: "#db2777", accent: "rgba(219,39,119,0.15)" },
};

const TYPE_LABEL: Record<string, string> = {
  behavioral: "Behavioral", technical: "Technical",
  system_design: "System Design", hr: "HR / Culture",
};

const SCORE_COLOR = (s: number) =>
  s >= 80 ? "#16a34a" : s >= 65 ? "#7c3aed" : "#d97706";

export default function DashboardPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch("/api/sessions")
      .then(r => r.json())
      .then(d => { setSessions(d.sessions ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const completed  = sessions.filter(s => s.overall_score);
  const avgScore   = completed.length
    ? Math.round(completed.reduce((a, s) => a + s.overall_score, 0) / completed.length)
    : 0;
  const bestScore  = completed.length ? Math.max(...completed.map(s => s.overall_score)) : 0;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/login");
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden"
      style={{ background: "linear-gradient(160deg, #f5f0ff 0%, #edf4ff 45%, #f8f0ff 100%)" }}>

      {/* Blobs */}
      <div className="fixed pointer-events-none" style={{ top: "-15%", left: "-10%", width: 600, height: 600, borderRadius: "50%", background: "rgba(167,139,250,0.2)", filter: "blur(100px)" }} />
      <div className="fixed pointer-events-none" style={{ top: "30%", right: "-15%", width: 500, height: 500, borderRadius: "50%", background: "rgba(96,165,250,0.15)", filter: "blur(90px)" }} />
      <div className="fixed pointer-events-none" style={{ bottom: "-10%", left: "30%", width: 450, height: 450, borderRadius: "50%", background: "rgba(216,180,254,0.2)", filter: "blur(80px)" }} />

      <div className="relative z-10 max-w-2xl mx-auto px-5 py-8">

        {/* Nav */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 4px 16px rgba(124,58,237,0.3)" }}>🎙</div>
            <span className="text-base font-black" style={{ color: "#1e1b4b" }}>InterviewAI</span>
          </div>
          <button onClick={handleLogout}
            className="text-xs px-4 py-2 rounded-full font-medium transition-all"
            style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.7)", color: "#6b7280", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            Sign out
          </button>
        </motion.div>

        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-8">
          <h1 className="text-3xl font-black mb-1" style={{ color: "#1e1b4b" }}>
            Hey,{" "}
            <em style={{ fontFamily: "'Playfair Display', serif", color: "#7c3aed", fontStyle: "italic" }}>
              ready to practice?
            </em>
          </h1>
          <p className="text-sm" style={{ color: "#9ca3af" }}>
            {sessions.length === 0 ? "Start your first interview session below." : "Keep the momentum going."}
          </p>
        </motion.div>

        {/* Stats row */}
        {sessions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-3 mb-8">
            {[
              { val: String(sessions.length), label: "Sessions",  color: "#7c3aed" },
              { val: avgScore > 0 ? String(avgScore) : "—", label: "Avg Score", color: SCORE_COLOR(avgScore) },
              { val: bestScore > 0 ? String(bestScore) : "—", label: "Best Score", color: SCORE_COLOR(bestScore) },
            ].map(({ val, label, color }, i) => (
              <motion.div key={label}
                initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.12 + i * 0.05 }}
                className="rounded-2xl py-5 text-center relative overflow-hidden"
                style={{ background: "rgba(255,255,255,0.45)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.7)", boxShadow: "0 4px 20px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)" }}>
                <div className="text-2xl font-black mb-1" style={{ color }}>{val}</div>
                <div className="text-xs font-medium" style={{ color: "#9ca3af" }}>{label}</div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Quick start banner (if no sessions) */}
        {!loading && sessions.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-3xl p-8 mb-6 text-center"
            style={{ background: "rgba(255,255,255,0.4)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.7)", boxShadow: "0 8px 32px rgba(124,58,237,0.08)" }}>
            <div className="text-5xl mb-4">🎙</div>
            <h2 className="text-lg font-bold mb-2" style={{ color: "#1e1b4b" }}>No sessions yet</h2>
            <p className="text-sm mb-1" style={{ color: "#9ca3af" }}>Pick an interview type and start practicing.</p>
            <p className="text-xs" style={{ color: "#c4b5fd" }}>Behavioral · Technical · System Design · HR</p>
          </motion.div>
        )}

        {/* Interview types quick pick */}
        {sessions.length === 0 && !loading && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-3 mb-6">
            {Object.entries(TYPE_META).map(([type, meta], i) => (
              <motion.div key={type} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 + i * 0.05 }}>
                <Link href="/interview/setup">
                  <div className="rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: "rgba(255,255,255,0.4)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.65)", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
                    <div className="text-2xl mb-2">{meta.icon}</div>
                    <div className="text-sm font-bold" style={{ color: "#1e1b4b" }}>{TYPE_LABEL[type]}</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Sessions list */}
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#a78bfa", borderTopColor: "transparent" }} />
          </div>
        ) : sessions.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#c4b5fd" }}>Recent Sessions</p>
            <div className="flex flex-col gap-3 mb-6">
              {sessions.map((s, i) => {
                const meta = TYPE_META[s.interview_type] ?? TYPE_META.behavioral;
                const score = s.overall_score;
                return (
                  <motion.div key={s.id}
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18 + i * 0.04 }}>
                    <Link href={s.status === "completed" ? `/report/${s.id}` : "#"}>
                      <div className="flex items-center gap-4 rounded-2xl p-4 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                        style={{ background: "rgba(255,255,255,0.4)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.65)", boxShadow: "0 4px 16px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.9)" }}>

                        {/* Icon */}
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                          style={{ background: meta.accent, border: `1px solid ${meta.color}22` }}>
                          {meta.icon}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold" style={{ color: "#1e1b4b" }}>{TYPE_LABEL[s.interview_type]}</p>
                          <p className="text-xs" style={{ color: "#9ca3af" }}>
                            {new Date(s.started_at).toLocaleDateString("en-GB")} · {s.status}
                          </p>
                        </div>

                        {/* Score */}
                        <div className="text-right flex-shrink-0">
                          {score ? (
                            <>
                              <p className="text-xl font-black" style={{ color: SCORE_COLOR(score) }}>{score}</p>
                              <p className="text-xs" style={{ color: "#c4b5fd" }}>
                                {score >= 80 ? "Strong" : score >= 65 ? "Good" : "Practice"}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm font-medium" style={{ color: "#d1d5db" }}>
                              {s.status === "pending" ? "—" : "→"}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Link href="/interview/setup">
            <button className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold transition-all active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.9) 0%, rgba(91,33,182,0.92) 100%)", color: "white", boxShadow: "0 8px 32px rgba(124,58,237,0.28), inset 0 1px 0 rgba(255,255,255,0.2)", border: "1px solid rgba(167,139,250,0.4)" }}>
              🎙 Start New Interview
            </button>
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
