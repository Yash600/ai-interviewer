"use client";

import { useEffect, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { RetellWebClient } from "retell-client-js-sdk";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

type CallStatus = "idle" | "connecting" | "active" | "ai_speaking" | "user_speaking" | "ended";

export default function InterviewRoomPage({ params }: PageProps) {
  const { sessionId } = use(params);
  const router = useRouter();
  const clientRef = useRef<RetellWebClient | null>(null);
  const [status, setStatus] = useState<CallStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [ending, setEnding] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Format elapsed seconds → MM:SS
  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  useEffect(() => {
    const accessToken = sessionStorage.getItem(`retell_token_${sessionId}`);
    if (!accessToken) { router.push("/interview/setup"); return; }

    const client = new RetellWebClient();
    clientRef.current = client;

    client.on("call_started", () => {
      setStatus("active");
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    });

    client.on("call_ended", () => {
      setStatus("ended");
      if (timerRef.current) clearInterval(timerRef.current);
    });

    client.on("agent_start_talking", () => setStatus("ai_speaking"));
    client.on("agent_stop_talking",  () => setStatus("active"));

    client.on("update", (update) => {
      if (update.transcript) {
        const last = update.transcript[update.transcript.length - 1];
        if (last) setTranscript(last.content);
      }
    });

    client.on("error", (err) => {
      console.error("[retell error]", err);
      setStatus("ended");
    });

    // Async init: request mic then start call
    const startInterview = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
      } catch {
        console.error("[mic permission denied]");
        setStatus("idle");
        return;
      }

      setStatus("connecting");
      try {
        await client.startCall({
          accessToken,
          sampleRate: 24000,
        });
      } catch (err) {
        console.error("[startCall error]", err);
        setStatus("idle");
      }
    };

    startInterview();

    return () => {
      client.stopCall();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionId, router]);

  async function handleEnd() {
    if (ending) return;
    setEnding(true);
    clientRef.current?.stopCall();
    setStatus("ended");
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      await fetch("/api/interview/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
    } catch (err) {
      console.error("[end error]", err);
    }
    router.push(`/report/${sessionId}`);
  }

  const statusLabel: Record<CallStatus, string> = {
    idle:          "Preparing...",
    connecting:    "Connecting...",
    active:        "Listening to you",
    ai_speaking:   "AI Interviewer Speaking",
    user_speaking: "Listening to you",
    ended:         "Session Ended",
  };

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: "radial-gradient(ellipse at 50% 30%, #2d1b69 0%, #0d0d1a 60%)" }}>

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 600px 400px at 50% 30%, rgba(124,58,237,0.12) 0%, transparent 70%)" }} />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "white", backdropFilter: "blur(10px)" }}>
          🧠 Behavioral Interview
        </div>
        <div className="text-sm font-bold px-4 py-2 rounded-full font-mono"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#a78bfa", backdropFilter: "blur(10px)" }}>
          ⏱ {formatTime(elapsed)}
        </div>
      </div>

      {/* Center — Orb */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-6">
        <div className="relative mb-6">
          {/* Pulse rings */}
          {status === "ai_speaking" && (
            <>
              <div className="absolute rounded-full border orb-ring"
                style={{ inset: "-20px", borderColor: "rgba(167,139,250,0.2)" }} />
              <div className="absolute rounded-full border orb-ring-2"
                style={{ inset: "-38px", borderColor: "rgba(167,139,250,0.1)" }} />
            </>
          )}
          {/* Orb */}
          <motion.div
            animate={{ scale: status === "ai_speaking" ? [1, 1.03, 1] : 1 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-40 h-40 rounded-full flex items-center justify-center text-5xl"
            style={{
              background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.3), rgba(124,58,237,0.7) 45%, rgba(88,28,220,0.9))",
              boxShadow: "0 0 60px rgba(124,58,237,0.5), 0 0 120px rgba(124,58,237,0.2), inset 0 2px 0 rgba(255,255,255,0.25)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}>
            🎙
          </motion.div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full"
            style={{ background: status === "ai_speaking" ? "#a3e635" : status === "active" ? "#a78bfa" : "#6b7280",
              boxShadow: status === "ai_speaking" ? "0 0 8px #a3e635" : "none" }} />
          <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.75)" }}>
            {statusLabel[status]}
          </span>
        </div>

        {/* Waveform */}
        <div className="flex items-center gap-1 h-8 mb-8">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={`w-1 rounded-full wave-bar ${status === "ai_speaking" ? "" : "opacity-20"}`}
              style={{ height: `${16 + (i % 4) * 6}px`, background: "linear-gradient(180deg, #a78bfa, #7c3aed)" }} />
          ))}
        </div>

        {/* Transcript */}
        {transcript && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm rounded-2xl p-4 mb-6"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(10px)" }}>
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>Just said</p>
            <p className="text-sm leading-relaxed italic" style={{ color: "rgba(255,255,255,0.7)" }}>{transcript}</p>
          </motion.div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="relative z-10 px-6 pb-8 flex gap-3 max-w-sm mx-auto w-full">
        <div className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
          🎤 {status === "active" || status === "user_speaking" ? "Listening..." : "Mic"}
        </div>
        <button onClick={handleEnd} disabled={ending || status === "ended"}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-all disabled:opacity-50"
          style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}>
          {ending ? "Ending..." : "⬛ End Interview"}
        </button>
      </div>
    </div>
  );
}
