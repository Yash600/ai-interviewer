"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

const TYPE_META: Record<string, { icon: string; color: string; bg: string }> = {
  behavioral:    { icon: "🧠", color: "#a78bfa", bg: "rgba(124,58,237,0.15)" },
  technical:     { icon: "💻", color: "#60a5fa", bg: "rgba(59,130,246,0.15)" },
  system_design: { icon: "🏗",  color: "#34d399", bg: "rgba(16,185,129,0.15)" },
  hr:            { icon: "🤝", color: "#f472b6", bg: "rgba(236,72,153,0.15)" },
};

const TYPE_LABEL: Record<string, string> = {
  behavioral: "Behavioral", technical: "Technical",
  system_design: "System Design", hr: "HR / Culture",
};

export default function DashboardPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sessions")
      .then(r => r.json())
      .then(d => { setSessions(d.sessions ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const avgScore = sessions.length
    ? Math.round(sessions.filter(s => s.overall_score).reduce((a, s) => a + s.overall_score, 0) / sessions.filter(s => s.overall_score).length) || 0
    : 0;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/login");
  }

  return (
    <div className="min-h-screen" style={{ background: "#0d0d1a" }}>
      <div className="max-w-sm mx-auto px-5 py-8">
        {/* Nav */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>🎙</div>
            <span className="text-base font-black text-white">InterviewAI</span>
          </div>
          <button onClick={handleLogout} className="text-xs px-3 py-1.5 rounded-full transition-colors"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.07)" }}>
            Sign out
          </button>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          {/* Greeting */}
          <div className="mb-6">
            <h1 className="text-2xl font-black text-white">
              Hey,{" "}
              <em style={{ fontFamily: "'Playfair Display', serif", color: "#a78bfa" }}>
                ready to practice?
              </em>
            </h1>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
              {sessions.length === 0 ? "Start your first interview session below." : "Keep the momentum going."}
            </p>
          </div>

          {/* Stats */}
          {sessions.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                [String(sessions.length), "#a78bfa", "Sessions"],
                [avgScore > 0 ? String(avgScore) : "—", "#a3e635", "Avg Score"],
                [String(sessions.filter(s => s.status === "completed").length), "#fbbf24", "Completed"],
              ].map(([v, c, l]) => (
                <div key={l} className="rounded-2xl py-4 text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="text-xl font-black" style={{ color: c }}>{v}</div>
                  <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>{l}</div>
                </div>
              ))}
            </div>
          )}

          {/* Sessions list */}
          {loading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mx-auto" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-12 text-center rounded-2xl mb-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="text-4xl mb-3">🎙</div>
              <p className="text-sm font-semibold text-white mb-1">No sessions yet</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Start your first interview below</p>
            </div>
          ) : (
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>Recent Sessions</p>
              {sessions.map((s, i) => {
                const meta = TYPE_META[s.interview_type] ?? TYPE_META.behavioral;
                return (
                  <motion.div key={s.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link href={s.status === "completed" ? `/report/${s.id}` : "#"}>
                      <div className="flex items-center gap-3 rounded-2xl p-4 mb-3 cursor-pointer transition-all hover:bg-white/5"
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                          style={{ background: meta.bg }}>
                          {meta.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white">{TYPE_LABEL[s.interview_type]}</p>
                          <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.35)" }}>
                            {new Date(s.started_at).toLocaleDateString()} · {s.status}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-black" style={{ color: s.overall_score ? meta.color : "rgba(255,255,255,0.3)" }}>
                            {s.overall_score ?? "—"}
                          </p>
                          <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>→</p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}

          <Link href="/interview/setup">
            <button className="btn-primary w-full flex items-center justify-center gap-2">
              + Start New Interview
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
