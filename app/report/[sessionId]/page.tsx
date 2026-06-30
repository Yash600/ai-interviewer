"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

interface PageProps { params: Promise<{ sessionId: string }> }

export default function ReportPage({ params }: PageProps) {
  const { sessionId } = use(params);
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timer: NodeJS.Timeout;

    async function poll() {
      try {
        const r = await fetch(`/api/report/${sessionId}`);
        const d = await r.json();
        if (cancelled) return;
        if (d?.feedback) {
          setData(d);
          setLoading(false);
        } else if (attempts < 15) {
          // retry every 2s for up to 30s
          timer = setTimeout(() => { setAttempts(a => a + 1); }, 2000);
        } else {
          setData(d);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }

    poll();
    return () => { cancelled = true; clearTimeout(timer); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, attempts]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d0d1a" }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Generating your feedback report…</p>
          {attempts > 2 && (
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>This can take up to 30 seconds</p>
          )}
        </div>
      </div>
    );
  }

  const { session, feedback } = data ?? {};
  if (!feedback) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#0d0d1a" }}>
        <div className="text-center">
          <div className="text-4xl mb-4">🎙</div>
          <h2 className="text-xl font-bold text-white mb-2">Report not ready yet</h2>
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>The interview may have been too short, or feedback is still processing. Check back in a moment.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setLoading(true); setAttempts(0); }} className="btn-primary">Retry</button>
            <Link href="/dashboard"><button className="btn-secondary">Dashboard</button></Link>
          </div>
        </div>
      </div>
    );
  }

  const scoreColor = feedback.overall_score >= 80 ? "#a3e635" : feedback.overall_score >= 65 ? "#a78bfa" : "#fbbf24";
  const typeLabel: Record<string, string> = { behavioral: "Behavioral", technical: "Technical", system_design: "System Design", hr: "HR / Culture" };

  return (
    <div className="min-h-screen" style={{ background: "#0d0d1a" }}>
      <div className="max-w-sm mx-auto px-5 py-8">
        {/* Header */}
        <button onClick={() => router.push("/dashboard")} className="flex items-center gap-1.5 text-xs mb-6 transition-colors hover:text-white/60" style={{ color: "rgba(255,255,255,0.3)" }}>
          ← Dashboard
        </button>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-black text-white mb-1">Interview Report</h1>
          <p className="text-xs mb-6" style={{ color: "rgba(255,255,255,0.35)" }}>
            {typeLabel[session?.interview_type] ?? "Interview"} · {new Date(session?.started_at).toLocaleDateString()}
          </p>

          {/* Score hero */}
          <div className="rounded-2xl p-5 flex items-center gap-5 mb-4"
            style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", boxShadow: "0 4px 24px rgba(124,58,237,0.1)" }}>
            <div className="w-20 h-20 rounded-full flex flex-col items-center justify-center flex-shrink-0"
              style={{ border: `3px solid ${scoreColor}`, background: "rgba(0,0,0,0.3)", boxShadow: `0 0 24px ${scoreColor}40` }}>
              <span className="text-2xl font-black text-white">{feedback.overall_score}</span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>/100</span>
            </div>
            <div>
              <p className="text-base font-bold text-white mb-3">
                {feedback.overall_score >= 80 ? "Strong Performance" : feedback.overall_score >= 65 ? "Good Effort" : "Needs Practice"}
              </p>
              <div className="flex flex-wrap gap-2">
                {[["Communication", feedback.communication], ["Structure", feedback.structure]].map(([l, v]) => (
                  <span key={l} className="text-xs font-bold px-2 py-1 rounded-lg"
                    style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa" }}>
                    {l}: {v}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Stat row */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              [String(feedback.overall_score), "#a78bfa", "Score"],
              [String(data.messages?.filter((m: any) => m.role === "assistant").length ?? 0), "#a3e635", "Questions"],
              [String(data.messages?.length ?? 0), "#fbbf24", "Turns"],
              [String(feedback.topics_covered?.length ?? 0), "#34d399", "Topics"],
            ].map(([v, c, l]) => (
              <div key={l} className="rounded-xl py-3 text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="text-lg font-black" style={{ color: c }}>{v}</div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Summary */}
          {feedback.summary && (
            <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>Summary</p>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>{feedback.summary}</p>
            </div>
          )}

          {/* Strengths */}
          {feedback.strengths?.length > 0 && (
            <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-sm font-bold text-white mb-3">✅ Strengths</p>
              {feedback.strengths.map((s: string, i: number) => (
                <div key={i} className="flex gap-3 mb-3 pb-3 last:mb-0 last:pb-0" style={{ borderBottom: i < feedback.strengths.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>{s}</p>
                </div>
              ))}
            </div>
          )}

          {/* Improvements */}
          {feedback.improvements?.length > 0 && (
            <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-sm font-bold text-white mb-3">⚡ Areas to Improve</p>
              {feedback.improvements.map((s: string, i: number) => (
                <div key={i} className="flex gap-3 mb-3 pb-3 last:mb-0 last:pb-0" style={{ borderBottom: i < feedback.improvements.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>{s}</p>
                </div>
              ))}
            </div>
          )}

          {/* Topics */}
          {feedback.topics_covered?.length > 0 && (
            <div className="rounded-2xl p-4 mb-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-sm font-bold text-white mb-3">🏷 Topics Covered</p>
              <div className="flex flex-wrap gap-2">
                {feedback.topics_covered.map((t: string, i: number) => (
                  <span key={i} className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <Link href="/interview/setup">
            <button className="btn-primary w-full">🎙 Practice Again →</button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
