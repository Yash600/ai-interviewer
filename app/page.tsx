"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: "linear-gradient(150deg, #faf7f2 0%, #f3ede3 40%, #ede8f5 100%)" }}
    >
      {/* ── Background blobs ── */}
      <div className="absolute pointer-events-none" style={{
        top: "-140px", right: "-120px", width: 620, height: 620, borderRadius: "50%",
        background: "radial-gradient(circle at 40% 40%, rgba(251,191,100,0.38) 0%, rgba(249,168,77,0.2) 50%, transparent 72%)",
        filter: "blur(60px)",
      }} />
      <div className="absolute pointer-events-none" style={{
        bottom: "-100px", left: "-120px", width: 560, height: 560, borderRadius: "50%",
        background: "radial-gradient(circle at 60% 60%, rgba(167,139,250,0.22) 0%, rgba(139,92,246,0.1) 55%, transparent 75%)",
        filter: "blur(64px)",
      }} />
      <div className="absolute pointer-events-none" style={{
        top: "42%", left: "4%", width: 320, height: 320, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(252,211,154,0.28) 0%, transparent 70%)",
        filter: "blur(48px)",
      }} />
      <div className="absolute pointer-events-none" style={{
        top: "20%", right: "6%", width: 240, height: 240, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(196,181,253,0.22) 0%, transparent 70%)",
        filter: "blur(40px)",
      }} />

      {/* Decorative floating circles */}
      {[
        { top: "8%",  left: "6%",  size: 56 },
        { top: "72%", left: "3%",  size: 36 },
        { top: "14%", right: "8%", size: 44 },
        { top: "58%", right: "4%", size: 28 },
      ].map((c, i) => (
        <div key={i} className="absolute pointer-events-none" style={{
          top: c.top, left: c.left, right: c.right,
          width: c.size, height: c.size, borderRadius: "50%",
          background: "rgba(255,255,255,0.55)",
          border: "1.5px solid rgba(255,255,255,0.9)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        }} />
      ))}

      {/* ── Navbar ── */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5">
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

        <div className="hidden md:flex items-center gap-7">
          {["How it Works", "Interview Types", "About"].map(l => (
            <span key={l} style={{ fontSize: "13px", fontWeight: 500, color: "#6b7280", cursor: "pointer" }}
              className="hover:text-gray-900 transition-colors">{l}</span>
          ))}
        </div>

        <Link href="/signup">
          <button style={{
            fontSize: "13px", fontWeight: 700, color: "#111827",
            padding: "9px 20px", borderRadius: "50px",
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(12px)",
            border: "1.5px solid rgba(255,255,255,0.95)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            cursor: "pointer",
          }}>
            Get Started Free
          </button>
        </Link>
      </nav>

      {/* ── Hero ── */}
      <div className="relative z-10 text-center px-6 pt-10 pb-6">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>

          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "7px",
            background: "rgba(255,255,255,0.65)", backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.9)",
            borderRadius: "50px", padding: "6px 14px",
            fontSize: "12px", fontWeight: 600, color: "#6b7280",
            marginBottom: "24px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e",
              boxShadow: "0 0 8px rgba(34,197,94,0.7)", flexShrink: 0 }} />
            Voice-First · Fully Adaptive · No Scripts
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: "clamp(38px, 7vw, 64px)", fontWeight: 900,
            color: "#111827", letterSpacing: "-1.5px", lineHeight: 1.08,
            marginBottom: "20px",
          }}>
            Your #1 Copilot<br />
            from{" "}
            <em style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic", color: "#f97316",
            }}>Practice</em>
            {" "}to Hired.
          </h1>

          <p style={{
            fontSize: "16px", color: "#6b7280", lineHeight: 1.65,
            maxWidth: "440px", margin: "0 auto 32px",
          }}>
            A real AI interviewer that listens, pushes back, and adapts.<br />
            Not a quiz. A conversation.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
            <Link href="/signup">
              <button style={{
                display: "flex", alignItems: "center", gap: "8px",
                background: "#111827", color: "white",
                padding: "14px 26px", borderRadius: "50px",
                fontSize: "14px", fontWeight: 700,
                border: "none", cursor: "pointer",
                boxShadow: "0 8px 28px rgba(17,24,39,0.22)",
                letterSpacing: "0.1px",
              }}>
                🎙 Start Free Interview
                <span style={{ width: 26, height: 26, borderRadius: "50%",
                  background: "rgba(255,255,255,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px" }}>→</span>
              </button>
            </Link>
            <Link href="/login">
              <button style={{
                padding: "14px 24px", borderRadius: "50px",
                background: "rgba(255,255,255,0.65)", backdropFilter: "blur(12px)",
                border: "1.5px solid rgba(255,255,255,0.95)",
                fontSize: "14px", fontWeight: 600, color: "#374151",
                cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              }}>
                Sign In
              </button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* ── Hero Demo Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 px-5 pb-16 max-w-md mx-auto"
      >
        <div style={{
          background: "rgba(255,255,255,0.78)", backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          borderRadius: "24px",
          border: "1px solid rgba(255,255,255,0.95)",
          boxShadow: "0 12px 56px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
          padding: "22px",
        }}>
          {/* Card header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.7px", color: "#9ca3af", textTransform: "uppercase" }}>
              Live Session
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: 700, color: "#16a34a" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e",
                boxShadow: "0 0 6px rgba(34,197,94,0.7)" }} />
              AI Interviewing
            </span>
          </div>

          {/* Candidate row */}
          <div style={{
            background: "#f9fafb", borderRadius: "16px", padding: "14px 16px", marginBottom: "14px",
            border: "1px solid #f3f4f6",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "linear-gradient(135deg, #f59e0b, #f97316)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: "14px", color: "white", flexShrink: 0,
              }}>Y</div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>Yash Malik</div>
                <div style={{ fontSize: "11px", color: "#9ca3af" }}>Backend Engineer · 1–3 yrs</div>
              </div>
              <span style={{
                marginLeft: "auto", fontSize: "11px", fontWeight: 700,
                padding: "4px 10px", borderRadius: "20px",
                background: "rgba(249,115,22,0.1)", color: "#ea580c",
                border: "1px solid rgba(249,115,22,0.2)",
              }}>Behavioral</span>
            </div>
            <p style={{ fontSize: "12.5px", color: "#4b5563", lineHeight: 1.6, fontStyle: "italic" }}>
              &ldquo;That&apos;s interesting — you mentioned the team disagreed with your approach. Can you walk me through how you handled that pushback specifically?&rdquo;
            </p>
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px" }}>
            {[
              { v: "82", label: "Score",    color: "#7c3aed", bg: "#f5f3ff" },
              { v: "A-", label: "Clarity",  color: "#16a34a", bg: "#f0fdf4" },
              { v: "B+", label: "Structure",color: "#d97706", bg: "#fffbeb" },
              { v: "9",  label: "Qs Asked", color: "#0369a1", bg: "#eff6ff" },
            ].map(({ v, label, color, bg }) => (
              <div key={label} style={{
                background: bg, borderRadius: "12px", padding: "10px 4px",
                textAlign: "center", border: `1px solid ${bg}`,
              }}>
                <div style={{ fontSize: "18px", fontWeight: 900, color }}>{v}</div>
                <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "2px" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Feature pills ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="relative z-10 pb-16"
        style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px", padding: "0 24px 64px" }}
      >
        {[
          { icon: "🧠", text: "Adaptive follow-ups" },
          { icon: "🎙", text: "Real voice conversation" },
          { icon: "⚡", text: "Fast Paced mode" },
          { icon: "📊", text: "Detailed feedback report" },
          { icon: "🔄", text: "No hardcoded questions" },
        ].map(({ icon, text }) => (
          <div key={text} style={{
            display: "flex", alignItems: "center", gap: "7px",
            background: "rgba(255,255,255,0.65)", backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.9)",
            borderRadius: "50px", padding: "8px 16px",
            fontSize: "13px", fontWeight: 500, color: "#374151",
            boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
          }}>
            <span>{icon}</span>{text}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
