"use client";

import { useEffect, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Vapi from "@vapi-ai/web";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

type CallStatus = "idle" | "connecting" | "active" | "ai_speaking" | "ended";

const VAPI_PUBLIC_KEY   = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!;
const VAPI_ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!;

export default function InterviewRoomPage({ params }: PageProps) {
  const { sessionId } = use(params);
  const router        = useRouter();
  const vapiRef       = useRef<Vapi | null>(null);

  const [status,          setStatus         ] = useState<CallStatus>("idle");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [userTranscript,  setUserTranscript ] = useState("");
  const [elapsed,         setElapsed        ] = useState(0);
  const [ending,          setEnding         ] = useState(false);
  const [isMuted,         setIsMuted        ] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  useEffect(() => {
    const vapi = new Vapi(VAPI_PUBLIC_KEY);
    vapiRef.current = vapi;

    vapi.on("call-start", () => {
      setStatus("active");
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    });
    vapi.on("call-end", () => {
      setStatus("ended");
      if (timerRef.current) clearInterval(timerRef.current);
    });
    vapi.on("speech-start", () => setStatus("ai_speaking"));
    vapi.on("speech-end",   () => setStatus("active"));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vapi.on("message", (msg: any) => {
      if (msg.type === "transcript" && msg.transcriptType === "final" && msg.role === "user")
        setUserTranscript(msg.transcript);
      if (msg.type === "transcript" && msg.transcriptType === "final" && msg.role === "assistant")
        setCurrentQuestion(msg.transcript);
      if (msg.type === "conversation-update") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const conv: any[] = msg.conversation ?? [];
        const lastAI = [...conv].reverse().find(m => m.role === "assistant");
        if (lastAI?.content) setCurrentQuestion(lastAI.content);
      }
      if (msg.type === "model-output" && msg.output) setCurrentQuestion(msg.output);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vapi.on("error", (err: any) => { console.error("[vapi]", err); setStatus("idle"); });

    return () => { vapi.stop(); if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  async function handleStart() {
    const vapi = vapiRef.current;
    if (!vapi) return;
    setStatus("connecting");
    try {
      await vapi.start(VAPI_ASSISTANT_ID, { metadata: { sessionId } } as Parameters<typeof vapi.start>[1]);
    } catch (err) { console.error("[vapi start]", err); setStatus("idle"); }
  }

  function toggleMute() {
    try { const m = !isMuted; vapiRef.current?.setMuted(m); setIsMuted(m); } catch { /* ignore */ }
  }

  async function handleEnd() {
    if (ending) return;
    setEnding(true); vapiRef.current?.stop(); setStatus("ended");
    if (timerRef.current) clearInterval(timerRef.current);
    await new Promise(r => setTimeout(r, 4000));
    router.push(`/report/${sessionId}`);
  }

  const isAISpeaking = status === "ai_speaking";
  const isConnected  = status === "active" || status === "ai_speaking";
  const userActive   = isConnected && !isAISpeaking;

  // Status labels
  const aiLabel   = isAISpeaking ? "Speaking" : status === "connecting" ? "Connecting…" : status === "idle" ? "Ready" : "Listening";
  const userLabel = isMuted ? "Muted" : userActive ? "Your turn" : isAISpeaking ? "Listening" : status === "idle" ? "Ready" : "…";

  return (
    <div
      className="h-screen flex flex-col relative overflow-hidden select-none"
      style={{ background: "linear-gradient(150deg, #faf7f2 0%, #f3ede3 40%, #ede8f5 100%)" }}
    >
      {/* Background blobs */}
      <div className="absolute pointer-events-none" style={{ top: "-140px", right: "-120px", width: 580, height: 580, borderRadius: "50%", background: "radial-gradient(circle at 40% 40%, rgba(251,191,100,0.36) 0%, rgba(249,168,77,0.18) 50%, transparent 72%)", filter: "blur(60px)" }} />
      <div className="absolute pointer-events-none" style={{ bottom: "-100px", left: "-120px", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle at 60% 60%, rgba(167,139,250,0.2) 0%, rgba(139,92,246,0.08) 55%, transparent 75%)", filter: "blur(64px)" }} />
      <div className="absolute pointer-events-none" style={{ top: "40%", left: "8%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(252,211,154,0.22) 0%, transparent 70%)", filter: "blur(48px)" }} />

      {/* ── Header ── */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-5 pb-3 shrink-0">
        {/* Brand pill */}
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "8px 16px", borderRadius: "50px",
          background: "rgba(255,255,255,0.78)", backdropFilter: "blur(20px)",
          border: "1.5px solid rgba(255,255,255,0.95)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: "6px",
            background: "linear-gradient(135deg, #f59e0b, #f97316)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px",
          }}>🎙</div>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#111827" }}>AI Interview</span>
          {isConnected && (
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.7)" }} />
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#16a34a" }}>Live</span>
            </span>
          )}
        </div>

        {/* Timer */}
        <div style={{
          padding: "8px 18px", borderRadius: "50px",
          background: "rgba(255,255,255,0.78)", backdropFilter: "blur(20px)",
          border: "1.5px solid rgba(255,255,255,0.95)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          fontSize: "14px", fontWeight: 800, fontFamily: "monospace",
          color: elapsed > 0 ? "#111827" : "#9ca3af",
          letterSpacing: "1px",
        }}>
          {fmt(elapsed)}
        </div>
      </header>

      {/* ── Split panels ── */}
      <main className="relative z-10 flex-1 flex gap-4 px-5 pb-3 min-h-0">

        {/* Left — AI Interviewer */}
        <div className="flex-1 flex flex-col items-center justify-center rounded-3xl p-6 relative overflow-hidden" style={{
          background: "rgba(255,255,255,0.62)", backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: "1px solid rgba(255,255,255,0.95)",
          boxShadow: "0 16px 56px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.02)",
        }}>
          {/* Subtle tint */}
          <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{ background: "linear-gradient(145deg, rgba(249,115,22,0.03) 0%, transparent 60%)" }} />

          {/* Label */}
          <span style={{
            fontSize: "10px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase",
            padding: "5px 14px", borderRadius: "20px", marginBottom: "24px",
            background: "rgba(249,115,22,0.08)", color: "#ea580c", border: "1px solid rgba(249,115,22,0.18)",
          }}>AI Interviewer</span>

          {/* Avatar */}
          <div className="relative mb-5" style={{ position: "relative" }}>
            {/* Pulse rings */}
            {isAISpeaking && (
              <>
                <motion.div animate={{ scale: [1, 1.45, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                  style={{ position: "absolute", inset: -28, borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.2) 0%, transparent 70%)" }} />
                <motion.div animate={{ scale: [1, 1.65, 1], opacity: [0.15, 0, 0.15] }}
                  transition={{ duration: 2.2, repeat: Infinity, delay: 0.4 }}
                  style={{ position: "absolute", inset: -48, borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)" }} />
              </>
            )}
            {/* Avatar circle */}
            <motion.div
              animate={{ scale: isAISpeaking ? [1, 1.04, 1] : 1 }}
              transition={{ duration: 1.6, repeat: Infinity }}
              style={{
                width: 120, height: 120, borderRadius: "50%",
                background: "linear-gradient(145deg, #ffffff 0%, #fde8d0 35%, #f97316 80%, #ea580c 100%)",
                boxShadow: isAISpeaking
                  ? "0 0 0 4px rgba(249,115,22,0.15), 0 12px 48px rgba(249,115,22,0.28), inset 0 2px 0 rgba(255,255,255,0.8)"
                  : "0 8px 32px rgba(249,115,22,0.15), inset 0 2px 0 rgba(255,255,255,0.8)",
                border: "2px solid rgba(255,255,255,0.9)",
                display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
              }}>
              {/* Monogram */}
              <span style={{ fontSize: "38px", fontWeight: 900, color: "white", letterSpacing: "-1px", textShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>A</span>
              {/* Specular highlight */}
              <div style={{ position: "absolute", top: 10, left: 16, width: 28, height: 16, borderRadius: "50%", background: "rgba(255,255,255,0.45)", filter: "blur(6px)" }} />
            </motion.div>
          </div>

          <p style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: "2px" }}>Alex</p>
          <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "16px" }}>Senior Recruiter · AI</p>

          {/* Status badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: "7px",
            padding: "7px 16px", borderRadius: "50px",
            background: isAISpeaking ? "rgba(249,115,22,0.08)" : "rgba(0,0,0,0.04)",
            border: `1px solid ${isAISpeaking ? "rgba(249,115,22,0.22)" : "rgba(0,0,0,0.06)"}`,
            fontSize: "12px", fontWeight: 600,
            color: isAISpeaking ? "#ea580c" : "#9ca3af",
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: isAISpeaking ? "#f97316" : "#d1d5db",
              boxShadow: isAISpeaking ? "0 0 8px rgba(249,115,22,0.7)" : "none",
            }} />
            {aiLabel}
          </div>

          {/* Waveform */}
          {isAISpeaking && (
            <div style={{ display: "flex", alignItems: "center", gap: "2.5px", marginTop: "14px", height: "20px" }}>
              {Array.from({ length: 16 }).map((_, i) => (
                <motion.div key={i}
                  animate={{ scaleY: [0.18, 1, 0.18] }}
                  transition={{ duration: 0.5 + (i % 5) * 0.08, repeat: Infinity, delay: i * 0.045 }}
                  style={{ width: 2.5, height: "100%", borderRadius: 2, background: "linear-gradient(180deg, #f97316, #fcd19a)", transformOrigin: "center" }} />
              ))}
            </div>
          )}
        </div>

        {/* Right — Candidate */}
        <div className="flex-1 flex flex-col items-center justify-center rounded-3xl p-6 relative overflow-hidden" style={{
          background: "rgba(255,255,255,0.62)", backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: "1px solid rgba(255,255,255,0.95)",
          boxShadow: "0 16px 56px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.02)",
        }}>
          <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{ background: "linear-gradient(145deg, rgba(59,130,246,0.03) 0%, transparent 60%)" }} />

          <span style={{
            fontSize: "10px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase",
            padding: "5px 14px", borderRadius: "20px", marginBottom: "24px",
            background: "rgba(59,130,246,0.08)", color: "#1d4ed8", border: "1px solid rgba(59,130,246,0.18)",
          }}>You</span>

          {/* User avatar */}
          <div style={{ position: "relative", marginBottom: "20px" }}>
            {userActive && !isMuted && (
              <motion.div animate={{ scale: [1, 1.35, 1], opacity: [0.25, 0, 0.25] }}
                transition={{ duration: 1.9, repeat: Infinity }}
                style={{ position: "absolute", inset: -24, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)" }} />
            )}
            <div style={{
              width: 120, height: 120, borderRadius: "50%",
              background: isMuted
                ? "linear-gradient(145deg, #ffffff 0%, #fde8d0 40%, #f87171 80%, #ef4444 100%)"
                : "linear-gradient(145deg, #ffffff 0%, #dbeafe 35%, #3b82f6 80%, #1d4ed8 100%)",
              boxShadow: (userActive && !isMuted)
                ? "0 0 0 4px rgba(59,130,246,0.12), 0 12px 40px rgba(59,130,246,0.22), inset 0 2px 0 rgba(255,255,255,0.8)"
                : "0 8px 28px rgba(59,130,246,0.12), inset 0 2px 0 rgba(255,255,255,0.8)",
              border: "2px solid rgba(255,255,255,0.9)",
              display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
            }}>
              <span style={{ fontSize: "38px", fontWeight: 900, color: "white", letterSpacing: "-1px", textShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                {isMuted ? "✕" : "Y"}
              </span>
              <div style={{ position: "absolute", top: 10, left: 16, width: 28, height: 16, borderRadius: "50%", background: "rgba(255,255,255,0.45)", filter: "blur(6px)" }} />
            </div>
          </div>

          <p style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: "2px" }}>You</p>
          <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "16px" }}>Candidate</p>

          <div style={{
            display: "flex", alignItems: "center", gap: "7px",
            padding: "7px 16px", borderRadius: "50px",
            background: isMuted ? "rgba(239,68,68,0.07)" : userActive ? "rgba(59,130,246,0.08)" : "rgba(0,0,0,0.04)",
            border: `1px solid ${isMuted ? "rgba(239,68,68,0.22)" : userActive ? "rgba(59,130,246,0.2)" : "rgba(0,0,0,0.06)"}`,
            fontSize: "12px", fontWeight: 600,
            color: isMuted ? "#ef4444" : userActive ? "#1d4ed8" : "#9ca3af",
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: isMuted ? "#ef4444" : userActive ? "#3b82f6" : "#d1d5db",
              boxShadow: (userActive && !isMuted) ? "0 0 8px rgba(59,130,246,0.7)" : "none",
            }} />
            {userLabel}
          </div>

          {/* Last user transcript */}
          <AnimatePresence>
            {userTranscript && (
              <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{
                  marginTop: "14px", padding: "10px 14px", borderRadius: "16px",
                  fontSize: "12px", textAlign: "center", maxWidth: "220px", lineHeight: 1.6,
                  background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.12)", color: "#374151",
                }}>
                &ldquo;{userTranscript}&rdquo;
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 px-5 pb-5 flex flex-col gap-3 shrink-0">

        {/* Question bubble */}
        <AnimatePresence>
          {currentQuestion && status !== "idle" && (
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                background: "rgba(255,255,255,0.88)", backdropFilter: "blur(32px)",
                WebkitBackdropFilter: "blur(32px)",
                border: "1px solid rgba(255,255,255,0.98)",
                boxShadow: "0 4px 28px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,1)",
                borderRadius: "20px", padding: "14px 18px",
              }}>
              <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.8px", color: "#ea580c", textTransform: "uppercase", marginBottom: "6px" }}>
                Alex asked
              </p>
              <p style={{ fontSize: "13px", lineHeight: 1.65, fontWeight: 500, color: "#1f2937" }}>
                {currentQuestion}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        {status === "idle" ? (
          <button onClick={handleStart} style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
            gap: "10px", padding: "16px",
            background: "#111827", color: "white", border: "none", borderRadius: "50px",
            fontSize: "15px", fontWeight: 700, cursor: "pointer",
            boxShadow: "0 8px 32px rgba(17,24,39,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
            letterSpacing: "0.2px",
          }}>
            🎙 Start Interview
            <span style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>→</span>
          </button>
        ) : status === "connecting" ? (
          <div style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
            gap: "10px", padding: "16px",
            background: "rgba(255,255,255,0.78)", backdropFilter: "blur(20px)",
            border: "1.5px solid rgba(255,255,255,0.95)", borderRadius: "50px",
            fontSize: "14px", fontWeight: 600, color: "#6b7280",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #f97316", borderTopColor: "transparent" }} />
            Connecting…
          </div>
        ) : (
          <div style={{ display: "flex", gap: "10px" }}>
            {/* Mute */}
            <button onClick={toggleMute} disabled={!isConnected} style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              padding: "14px",
              background: isMuted ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.78)",
              backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
              border: `1.5px solid ${isMuted ? "rgba(239,68,68,0.25)" : "rgba(255,255,255,0.95)"}`,
              borderRadius: "50px", fontSize: "13px", fontWeight: 600,
              color: isMuted ? "#dc2626" : "#374151", cursor: "pointer",
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              opacity: isConnected ? 1 : 0.4,
            }}>
              {isMuted ? "🔇 Unmute" : "🎤 Mute"}
            </button>
            {/* End */}
            <button onClick={handleEnd} disabled={ending || status === "ended"} style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              padding: "14px",
              background: "rgba(239,68,68,0.07)", backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1.5px solid rgba(239,68,68,0.2)", borderRadius: "50px",
              fontSize: "13px", fontWeight: 600, color: "#dc2626", cursor: "pointer",
              boxShadow: "0 4px 16px rgba(239,68,68,0.06)",
              opacity: (ending || status === "ended") ? 0.5 : 1,
            }}>
              {ending ? "⏳ Generating report…" : "◼ End Interview"}
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}
