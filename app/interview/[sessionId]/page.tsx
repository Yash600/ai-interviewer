"use client";

import { useEffect, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Vapi from "@vapi-ai/web";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

type CallStatus = "idle" | "connecting" | "active" | "ai_speaking" | "ended";

const VAPI_PUBLIC_KEY  = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!;
const VAPI_ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!;

export default function InterviewRoomPage({ params }: PageProps) {
  const { sessionId } = use(params);
  const router = useRouter();
  const vapiRef = useRef<Vapi | null>(null);

  const [status,          setStatus         ] = useState<CallStatus>("idle");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [userTranscript,  setUserTranscript ] = useState("");
  const [elapsed,         setElapsed        ] = useState(0);
  const [ending,          setEnding         ] = useState(false);
  const [isMuted,         setIsMuted        ] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (s: number) =>
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
      // User transcript
      if (msg.type === "transcript" && msg.transcriptType === "final" && msg.role === "user") {
        setUserTranscript(msg.transcript);
      }
      // AI question — several event shapes VAPI may use
      if (msg.type === "transcript" && msg.transcriptType === "final" && msg.role === "assistant") {
        setCurrentQuestion(msg.transcript);
      }
      if (msg.type === "conversation-update") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const conv: any[] = msg.conversation ?? [];
        const lastAI = [...conv].reverse().find(m => m.role === "assistant");
        if (lastAI?.content) setCurrentQuestion(lastAI.content);
      }
      if (msg.type === "model-output" && msg.output) {
        setCurrentQuestion(msg.output);
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vapi.on("error", (err: any) => {
      console.error("[vapi error]", err);
      setStatus("idle");
    });

    return () => {
      vapi.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  async function handleStart() {
    const vapi = vapiRef.current;
    if (!vapi) return;
    setStatus("connecting");
    try {
      await vapi.start(VAPI_ASSISTANT_ID, {
        metadata: { sessionId },
      } as Parameters<typeof vapi.start>[1]);
    } catch (err) {
      console.error("[vapi start]", err);
      setStatus("idle");
    }
  }

  function toggleMute() {
    try {
      const newMuted = !isMuted;
      vapiRef.current?.setMuted(newMuted);
      setIsMuted(newMuted);
    } catch { /* ignore */ }
  }

  async function handleEnd() {
    if (ending) return;
    setEnding(true);
    vapiRef.current?.stop();
    setStatus("ended");
    if (timerRef.current) clearInterval(timerRef.current);
    await new Promise(r => setTimeout(r, 4000));
    router.push(`/report/${sessionId}`);
  }

  const isAISpeaking  = status === "ai_speaking";
  const isConnected   = status === "active" || status === "ai_speaking";
  const userActive    = isConnected && !isAISpeaking;

  return (
    <div className="h-screen flex flex-col relative overflow-hidden select-none"
      style={{ background: "linear-gradient(160deg, #f5f0ff 0%, #edf4ff 45%, #f8f0ff 100%)" }}>

      {/* Floating blobs */}
      <div className="absolute pointer-events-none" style={{ top: "-15%", left: "-12%", width: 550, height: 550, borderRadius: "50%", background: "rgba(167,139,250,0.22)", filter: "blur(90px)" }} />
      <div className="absolute pointer-events-none" style={{ top: "25%", right: "-12%", width: 480, height: 480, borderRadius: "50%", background: "rgba(96,165,250,0.18)", filter: "blur(80px)" }} />
      <div className="absolute pointer-events-none" style={{ bottom: "-8%", left: "35%", width: 420, height: 420, borderRadius: "50%", background: "rgba(216,180,254,0.22)", filter: "blur(80px)" }} />

      {/* ── Header ── */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-5 pb-3 shrink-0">
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold"
          style={glass({ tint: "purple", shadow: true })}>
          🧠 AI Interview
        </div>

        <div className="flex items-center gap-2">
          {isConnected && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
              style={glass({})}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px #34d399" }} />
              <span style={{ color: "#374151" }}>Live</span>
            </div>
          )}
          <div className="px-4 py-2 rounded-2xl text-sm font-bold font-mono"
            style={{ ...glass({ tint: "purple" }), color: "#7c3aed" }}>
            ⏱ {formatTime(elapsed)}
          </div>
        </div>
      </header>

      {/* ── Split panels ── */}
      <main className="relative z-10 flex-1 flex gap-4 px-6 pb-4 min-h-0">

        {/* Left — AI Interviewer */}
        <div className="flex-1 flex flex-col items-center justify-center rounded-3xl p-6 relative overflow-hidden"
          style={panelStyle("purple")}>

          <div className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.07) 0%, transparent 55%)" }} />

          <span className="text-xs font-bold uppercase tracking-widest mb-5 px-3 py-1 rounded-full"
            style={{ background: "rgba(124,58,237,0.1)", color: "#7c3aed", border: "1px solid rgba(124,58,237,0.2)" }}>
            AI Interviewer
          </span>

          {/* Orb */}
          <div className="relative mb-5">
            {isAISpeaking && (
              <>
                <motion.div className="absolute rounded-full"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.35, 0, 0.35] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ inset: -24, background: "radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)" }} />
                <motion.div className="absolute rounded-full"
                  animate={{ scale: [1, 1.6, 1], opacity: [0.18, 0, 0.18] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.35 }}
                  style={{ inset: -40, background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)" }} />
              </>
            )}
            <motion.div
              animate={{ scale: isAISpeaking ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="w-32 h-32 rounded-full flex items-center justify-center text-5xl relative"
              style={{
                background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9) 0%, rgba(167,139,250,0.55) 40%, rgba(109,40,217,0.75) 100%)",
                boxShadow: isAISpeaking
                  ? "0 0 48px rgba(124,58,237,0.4), 0 0 100px rgba(124,58,237,0.12), inset 0 2px 0 rgba(255,255,255,0.65)"
                  : "0 6px 28px rgba(124,58,237,0.2), inset 0 2px 0 rgba(255,255,255,0.65)",
                border: "1.5px solid rgba(255,255,255,0.75)",
              }}>
              🤖
            </motion.div>
          </div>

          <p className="text-base font-bold mb-0.5" style={{ color: "#1e1b4b" }}>Alex</p>
          <p className="text-xs mb-5" style={{ color: "#9ca3af" }}>Senior Recruiter · AI</p>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all"
            style={{
              background: isAISpeaking ? "rgba(124,58,237,0.1)" : "rgba(0,0,0,0.04)",
              border: `1px solid ${isAISpeaking ? "rgba(124,58,237,0.28)" : "rgba(0,0,0,0.07)"}`,
              color: isAISpeaking ? "#7c3aed" : "#9ca3af",
            }}>
            <span className="w-2 h-2 rounded-full transition-all"
              style={{ background: isAISpeaking ? "#7c3aed" : "#d1d5db", boxShadow: isAISpeaking ? "0 0 8px #7c3aed" : "none" }} />
            {isAISpeaking ? "Speaking…" : status === "connecting" ? "Connecting…" : status === "idle" ? "Ready" : "Listening"}
          </div>

          {/* Speaking waveform */}
          {isAISpeaking && (
            <div className="flex items-center gap-0.5 mt-4 h-5">
              {Array.from({ length: 18 }).map((_, i) => (
                <motion.div key={i}
                  animate={{ scaleY: [0.2, 1, 0.2] }}
                  transition={{ duration: 0.5 + (i % 5) * 0.08, repeat: Infinity, delay: i * 0.04 }}
                  style={{ width: 2, height: "100%", borderRadius: 2, background: "linear-gradient(180deg, #7c3aed, #c4b5fd)", transformOrigin: "center" }} />
              ))}
            </div>
          )}
        </div>

        {/* Right — Candidate */}
        <div className="flex-1 flex flex-col items-center justify-center rounded-3xl p-6 relative overflow-hidden"
          style={panelStyle("blue")}>

          <div className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{ background: "linear-gradient(135deg, rgba(96,165,250,0.06) 0%, transparent 55%)" }} />

          <span className="text-xs font-bold uppercase tracking-widest mb-5 px-3 py-1 rounded-full"
            style={{ background: "rgba(59,130,246,0.1)", color: "#1d4ed8", border: "1px solid rgba(59,130,246,0.2)" }}>
            You
          </span>

          {/* User orb */}
          <div className="relative mb-5">
            {userActive && !isMuted && (
              <motion.div className="absolute rounded-full"
                animate={{ scale: [1, 1.3, 1], opacity: [0.28, 0, 0.28] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                style={{ inset: -22, background: "radial-gradient(circle, rgba(59,130,246,0.22) 0%, transparent 70%)" }} />
            )}
            <div className="w-32 h-32 rounded-full flex items-center justify-center text-5xl"
              style={{
                background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9) 0%, rgba(147,197,253,0.5) 40%, rgba(37,99,235,0.65) 100%)",
                boxShadow: (userActive && !isMuted)
                  ? "0 0 40px rgba(59,130,246,0.3), 0 0 80px rgba(59,130,246,0.1), inset 0 2px 0 rgba(255,255,255,0.65)"
                  : "0 6px 28px rgba(59,130,246,0.15), inset 0 2px 0 rgba(255,255,255,0.65)",
                border: "1.5px solid rgba(255,255,255,0.75)",
              }}>
              {isMuted ? "🔇" : "🎤"}
            </div>
          </div>

          <p className="text-base font-bold mb-0.5" style={{ color: "#1e1b4b" }}>You</p>
          <p className="text-xs mb-5" style={{ color: "#9ca3af" }}>Candidate</p>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all"
            style={{
              background: isMuted ? "rgba(239,68,68,0.08)" : userActive ? "rgba(59,130,246,0.1)" : "rgba(0,0,0,0.04)",
              border: `1px solid ${isMuted ? "rgba(239,68,68,0.25)" : userActive ? "rgba(59,130,246,0.25)" : "rgba(0,0,0,0.07)"}`,
              color: isMuted ? "#ef4444" : userActive ? "#1d4ed8" : "#9ca3af",
            }}>
            <span className="w-2 h-2 rounded-full transition-all"
              style={{ background: isMuted ? "#ef4444" : userActive ? "#3b82f6" : "#d1d5db", boxShadow: (userActive && !isMuted) ? "0 0 8px #3b82f6" : "none" }} />
            {isMuted ? "Muted" : userActive ? "Your turn…" : isAISpeaking ? "Listening" : status === "idle" ? "Ready" : "…"}
          </div>

          {/* Last thing user said */}
          <AnimatePresence>
            {userTranscript && (
              <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-4 px-4 py-2 rounded-2xl text-xs text-center max-w-xs leading-relaxed"
                style={{ background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.14)", color: "#374151" }}>
                &ldquo;{userTranscript}&rdquo;
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 px-6 pb-6 flex flex-col gap-3 shrink-0">

        {/* Dynamic question bubble */}
        <AnimatePresence>
          {currentQuestion && status !== "idle" && (
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="w-full rounded-2xl px-5 py-3.5"
              style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.75)", boxShadow: "0 4px 24px rgba(124,58,237,0.06), inset 0 1px 0 rgba(255,255,255,0.95)" }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#7c3aed" }}>
                💬 Alex asked
              </p>
              <p className="text-sm leading-relaxed font-medium" style={{ color: "#1f2937" }}>
                {currentQuestion}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        {status === "idle" ? (
          <button onClick={handleStart}
            className="w-full flex items-center justify-center gap-3 rounded-2xl py-4 text-sm font-bold transition-all active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.88) 0%, rgba(91,33,182,0.92) 100%)", backdropFilter: "blur(10px)", border: "1px solid rgba(167,139,250,0.45)", color: "white", boxShadow: "0 8px 32px rgba(124,58,237,0.28), inset 0 1px 0 rgba(255,255,255,0.22)" }}>
            🎙 Start Interview
          </button>
        ) : (
          <div className="flex gap-3">
            <button onClick={toggleMute} disabled={!isConnected}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-40"
              style={{ background: isMuted ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.5)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${isMuted ? "rgba(239,68,68,0.28)" : "rgba(255,255,255,0.75)"}`, color: isMuted ? "#dc2626" : "#374151", boxShadow: "0 4px 16px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)" }}>
              {isMuted ? "🔇 Unmute" : "🎤 Mute"}
            </button>
            <button onClick={handleEnd} disabled={ending || status === "ended"}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-50"
              style={{ background: "rgba(239,68,68,0.09)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(239,68,68,0.22)", color: "#dc2626", boxShadow: "0 4px 16px rgba(239,68,68,0.07), inset 0 1px 0 rgba(255,255,255,0.6)" }}>
              {ending ? "⏳ Generating report…" : "⬛ End Interview"}
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}

// ── Style helpers ──────────────────────────────────────────────
function glass({ tint, shadow }: { tint?: "purple" | "blue"; shadow?: boolean } = {}) {
  return {
    background: "rgba(255,255,255,0.45)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.7)",
    boxShadow: [
      shadow ? `0 4px 20px rgba(${tint === "purple" ? "124,58,237" : "59,130,246"},0.1)` : "",
      "inset 0 1px 0 rgba(255,255,255,0.9)",
    ].filter(Boolean).join(", "),
  };
}

function panelStyle(tint: "purple" | "blue") {
  const c = tint === "purple" ? "124,58,237" : "59,130,246";
  return {
    background: "rgba(255,255,255,0.28)",
    backdropFilter: "blur(28px)",
    WebkitBackdropFilter: "blur(28px)",
    border: "1px solid rgba(255,255,255,0.65)",
    boxShadow: `0 8px 40px rgba(${c},0.07), inset 0 1px 0 rgba(255,255,255,0.9)`,
  };
}
