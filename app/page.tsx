"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "linear-gradient(180deg, #1a0533 0%, #2d1b69 20%, #4c3399 35%, #6366f1 55%, #818cf8 70%, #a5b4fc 82%, #c4b5fd 90%, #e9d5ff 100%)" }}>
      {/* Overlay */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,0,30,0.75) 0%, rgba(10,0,30,0.2) 45%, rgba(10,0,30,0.05) 70%, transparent 100%)" }} />

      {/* Stars */}
      {[...Array(10)].map((_, i) => (
        <div key={i} className="absolute rounded-full bg-white"
          style={{ width: i % 3 === 0 ? 2 : 1, height: i % 3 === 0 ? 2 : 1, top: `${5 + i * 2}%`, left: `${10 + i * 9}%`, opacity: 0.6 + (i % 3) * 0.2 }} />
      ))}

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.25)" }}>
            🎙
          </div>
          <span className="text-base font-bold text-white">InterviewAI</span>
        </div>
        <div className="hidden md:flex items-center gap-7">
          {["How it Works", "Interview Types", "About"].map(l => (
            <span key={l} className="text-sm font-medium cursor-pointer transition-colors" style={{ color: "rgba(255,255,255,0.65)" }}>{l}</span>
          ))}
        </div>
        <Link href="/signup">
          <button className="text-sm font-semibold text-white rounded-full px-5 py-2 transition-all hover:bg-white/15"
            style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.22)" }}>
            Get Started Free
          </button>
        </Link>
      </nav>

      {/* Hero */}
      <div className="relative z-10 text-center px-6 pt-12 pb-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold mb-6"
            style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.8)" }}>
            <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]" />
            AI-Powered · Voice-First · Fully Adaptive
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-white leading-tight tracking-tight mb-4">
            Your #1 Copilot<br />
            from{" "}
            <em className="font-display not-italic" style={{ fontFamily: "'Playfair Display', serif", color: "#c4b5fd" }}>
              Practice
            </em>{" "}
            to Hired.
          </h1>
          <p className="text-base md:text-lg mb-8 max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.6)" }}>
            A real AI interviewer that listens, pushes back, and adapts.<br />
            Not a quiz. A conversation.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Link href="/signup">
              <button className="flex items-center gap-2 bg-white text-[#1f0a4b] font-bold rounded-full px-6 py-3 text-sm transition-all hover:shadow-2xl hover:-translate-y-0.5"
                style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
                🎙 Start Free Interview
              </button>
            </Link>
            <Link href="/login">
              <button className="btn-glass text-sm">Sign In</button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Hero Card */}
      <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
        className="relative z-10 px-6 pb-16 max-w-lg mx-auto">
        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.45)" }}>Live Session</span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80]" />
              AI Interviewing
            </span>
          </div>
          <div className="rounded-xl p-4 mb-4" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>Y</div>
              <div>
                <div className="text-sm font-bold text-white">Yash Malik</div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Backend Engineer · 1–3 yrs</div>
              </div>
              <span className="ml-auto text-xs font-bold px-2 py-1 rounded-lg" style={{ background: "rgba(163,230,53,0.15)", color: "#a3e635" }}>● Behavioral</span>
            </div>
            <p className="text-xs leading-relaxed italic" style={{ color: "rgba(255,255,255,0.6)" }}>
              "That's interesting — you mentioned the team disagreed with your approach. Can you walk me through how you handled that pushback specifically?"
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[["82", "#a78bfa", "Overall"], ["A-", "#a3e635", "Communication"], ["B+", "#fbbf24", "Structure"], ["9", "#34d399", "Questions"]].map(([v, c, l]) => (
              <div key={l} className="rounded-xl p-2 text-center" style={{ background: "rgba(255,255,255,0.05)" }}>
                <div className="text-lg font-black" style={{ color: c }}>{v}</div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
