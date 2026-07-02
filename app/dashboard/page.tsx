"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

const TYPE_META: Record<string, { icon: string; bg: string; color: string }> = {
  behavioral:    { icon: "🧠", bg: "rgba(249,115,22,0.1)",  color: "#ea580c" },
  technical:     { icon: "💻", bg: "rgba(37,99,235,0.09)",  color: "#1d4ed8" },
  system_design: { icon: "🏗",  bg: "rgba(5,150,105,0.09)", color: "#047857" },
  hr:            { icon: "🤝", bg: "rgba(124,58,237,0.09)", color: "#6d28d9" },
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

  const completed = sessions.filter(s => s.overall_score);
  const avgScore  = completed.length
    ? Math.round(completed.reduce((a, s) => a + s.overall_score, 0) / completed.length) : 0;
  const bestScore = completed.length ? Math.max(...completed.map(s => s.overall_score)) : 0;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/login");
  }

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: "linear-gradient(150deg, #faf7f2 0%, #f3ede3 40%, #ede8f5 100%)" }}
    >
      {/* Blobs */}
      <div className="fixed pointer-events-none" style={{ top: "-140px", right: "-120px", width: 580, height: 580, borderRadius: "50%", background: "radial-gradient(circle at 40% 40%, rgba(251,191,100,0.36) 0%, rgba(249,168,77,0.18) 50%, transparent 72%)", filter: "blur(60px)" }} />
      <div className="fixed pointer-events-none" style={{ bottom: "-100px", left: "-120px", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle at 60% 60%, rgba(167,139,250,0.2) 0%, rgba(139,92,246,0.08) 55%, transparent 75%)", filter: "blur(64px)" }} />
      <div className="fixed pointer-events-none" style={{ top: "42%", left: "4%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(252,211,154,0.26) 0%, transparent 70%)", filter: "blur(48px)" }} />

      {/* Decorative circles */}
      {[
        { top: "6%",  right: "10%", size: 48 },
        { top: "65%", left: "3%",   size: 32 },
      ].map((c, i) => (
        <div key={i} className="fixed pointer-events-none" style={{
          top: c.top, left: c.left, right: c.right,
          width: c.size, height: c.size, borderRadius: "50%",
          background: "rgba(255,255,255,0.5)", border: "1.5px solid rgba(255,255,255,0.9)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        }} />
      ))}

      <div className="relative z-10 max-w-2xl mx-auto px-5 py-8">

        {/* Nav */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2.5">
            <div style={{
              width: 34, height: 34, borderRadius: "10px",
              background: "linear-gradient(135deg, #f59e0b, #f97316)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "16px", boxShadow: "0 4px 12px rgba(249,115,22,0.28)",
            }}>🎙</div>
            <span style={{ fontWeight: 800, fontSize: "15px", color: "#111827", letterSpacing: "-0.3px" }}>
              InterviewAI
            </span>
          </div>
          <button onClick={handleLogout} style={{
            fontSize: "13px", fontWeight: 600, color: "#6b7280",
            padding: "8px 18px", borderRadius: "50px",
            background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)",
            border: "1.5px solid rgba(255,255,255,0.95)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)", cursor: "pointer",
          }}>
            Sign out
          </button>
        </motion.div>

        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-8">
          <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#111827", letterSpacing: "-0.5px", marginBottom: "4px" }}>
            Hey,{" "}
            <em style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: "#f97316" }}>
              ready to practice?
            </em>
          </h1>
          <p style={{ fontSize: "14px", color: "#9ca3af" }}>
            {sessions.length === 0 ? "Start your first interview session below." : "Keep the momentum going."}
          </p>
        </motion.div>

        {/* Stats row */}
        {sessions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-3 mb-8">
            {[
              { val: String(sessions.length), label: "Sessions",   color: "#7c3aed" },
              { val: avgScore  > 0 ? String(avgScore)  : "—", label: "Avg Score",  color: SCORE_COLOR(avgScore)  },
              { val: bestScore > 0 ? String(bestScore) : "—", label: "Best Score", color: SCORE_COLOR(bestScore) },
            ].map(({ val, label, color }, i) => (
              <motion.div key={label}
                initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.12 + i * 0.05 }}
                style={{
                  background: "rgba(255,255,255,0.82)", backdropFilter: "blur(28px)",
                  WebkitBackdropFilter: "blur(28px)",
                  border: "1px solid rgba(255,255,255,0.95)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)",
                  borderRadius: "20px", padding: "20px 8px", textAlign: "center",
                }}>
                <div style={{ fontSize: "26px", fontWeight: 900, color, marginBottom: "4px" }}>{val}</div>
                <div style={{ fontSize: "12px", color: "#9ca3af", fontWeight: 500 }}>{label}</div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && sessions.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            style={{
              background: "rgba(255,255,255,0.78)", backdropFilter: "blur(28px)",
              border: "1px solid rgba(255,255,255,0.95)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.07)",
              borderRadius: "24px", padding: "40px 24px", textAlign: "center", marginBottom: "24px",
            }}>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>🎙</div>
            <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#111827", marginBottom: "6px" }}>No sessions yet</h2>
            <p style={{ fontSize: "13px", color: "#9ca3af" }}>Pick an interview type and start practicing.</p>
            <p style={{ fontSize: "12px", color: "#d1b896", marginTop: "4px" }}>Behavioral · Technical · System Design · HR</p>
          </motion.div>
        )}

        {/* Quick type grid (empty state) */}
        {sessions.length === 0 && !loading && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-3 mb-6">
            {Object.entries(TYPE_META).map(([type, meta], i) => (
              <motion.div key={type} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 + i * 0.05 }}>
                <Link href="/interview/setup">
                  <div style={{
                    background: "rgba(255,255,255,0.72)", backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.95)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                    borderRadius: "20px", padding: "18px 16px", cursor: "pointer",
                    transition: "transform 0.15s",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.02)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}>
                    <div style={{ fontSize: "22px", marginBottom: "8px" }}>{meta.icon}</div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{TYPE_LABEL[type]}</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Session list */}
        {loading ? (
          <div className="py-16 flex justify-center">
            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2.5px solid #f97316", borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
          </div>
        ) : sessions.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.8px", color: "#c4a882", textTransform: "uppercase", marginBottom: "12px" }}>
              Recent Sessions
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
              {sessions.map((s, i) => {
                const meta  = TYPE_META[s.interview_type] ?? TYPE_META.behavioral;
                const score = s.overall_score;
                return (
                  <motion.div key={s.id}
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18 + i * 0.04 }}>
                    <Link href={s.status === "completed" ? `/report/${s.id}` : "#"}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: "14px",
                        background: "rgba(255,255,255,0.78)", backdropFilter: "blur(24px)",
                        WebkitBackdropFilter: "blur(24px)",
                        border: "1px solid rgba(255,255,255,0.95)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,1)",
                        borderRadius: "18px", padding: "14px 16px", cursor: "pointer",
                        transition: "transform 0.15s",
                      }}
                        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.01)")}
                        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}>

                        {/* Icon */}
                        <div style={{
                          width: 44, height: 44, borderRadius: "14px", flexShrink: 0,
                          background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px",
                        }}>
                          {meta.icon}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{TYPE_LABEL[s.interview_type]}</p>
                          <p style={{ fontSize: "11px", color: "#9ca3af" }}>
                            {new Date(s.started_at).toLocaleDateString("en-GB")} · {s.status}
                          </p>
                        </div>

                        {/* Score */}
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          {score ? (
                            <>
                              <p style={{ fontSize: "20px", fontWeight: 900, color: SCORE_COLOR(score) }}>{score}</p>
                              <p style={{ fontSize: "11px", color: "#9ca3af" }}>
                                {score >= 80 ? "Strong" : score >= 65 ? "Good" : "Practice"}
                              </p>
                            </>
                          ) : (
                            <p style={{ fontSize: "14px", color: "#d1d5db" }}>
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
            <button style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
              gap: "10px", padding: "15px",
              background: "#111827", color: "white", border: "none", borderRadius: "50px",
              fontSize: "14px", fontWeight: 700, cursor: "pointer",
              boxShadow: "0 8px 32px rgba(17,24,39,0.22)",
              letterSpacing: "0.1px",
            }}>
              🎙 Start New Interview
              <span style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px" }}>→</span>
            </button>
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
