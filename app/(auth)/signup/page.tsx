"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

const JOB_ROLES = ["Frontend Engineer","Backend Engineer","Full Stack Engineer","Software Engineer","Data Engineer","ML Engineer","DevOps Engineer","Product Manager","Designer","Other"];
const EXP_LEVELS = ["0–1 years","1–3 years","3–5 years","5–8 years","8+ years"];

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", jobRole: "", experienceLevel: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputWrap: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: "8px",
    padding: "0 4px 0 16px",
    background: "#f9fafb", border: "1.5px solid #f3f4f6", borderRadius: "14px",
  };
  const inputStyle: React.CSSProperties = {
    flex: 1, border: "none", outline: "none", background: "transparent",
    padding: "12px 0", fontSize: "14px", color: "#111827",
  };
  const selectStyle: React.CSSProperties = {
    flex: 1, border: "none", outline: "none", background: "transparent",
    padding: "12px 0", fontSize: "14px", color: "#111827", cursor: "pointer",
    appearance: "none" as const,
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center overflow-hidden py-10"
      style={{ background: "linear-gradient(150deg, #faf7f2 0%, #f3ede3 40%, #ede8f5 100%)" }}
    >
      {/* ── Background organic blobs ── */}
      <div className="absolute pointer-events-none" style={{
        top: "-120px", right: "-100px",
        width: 520, height: 520, borderRadius: "50%",
        background: "radial-gradient(circle at 40% 40%, rgba(251,191,100,0.35) 0%, rgba(249,168,77,0.18) 50%, transparent 75%)",
        filter: "blur(48px)",
      }} />
      <div className="absolute pointer-events-none" style={{
        bottom: "-80px", left: "-100px",
        width: 460, height: 460, borderRadius: "50%",
        background: "radial-gradient(circle at 60% 60%, rgba(167,139,250,0.22) 0%, rgba(139,92,246,0.1) 55%, transparent 75%)",
        filter: "blur(56px)",
      }} />
      <div className="absolute pointer-events-none" style={{
        top: "45%", left: "8%",
        width: 260, height: 260, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(252,211,154,0.28) 0%, transparent 70%)",
        filter: "blur(40px)",
      }} />
      {/* Decorative circles */}
      <div className="absolute pointer-events-none" style={{
        top: "8%", left: "16%", width: 56, height: 56, borderRadius: "50%",
        background: "rgba(255,255,255,0.55)", border: "1.5px solid rgba(255,255,255,0.9)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }} />
      <div className="absolute pointer-events-none" style={{
        bottom: "14%", right: "12%", width: 36, height: 36, borderRadius: "50%",
        background: "rgba(255,255,255,0.45)", border: "1.5px solid rgba(255,255,255,0.85)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
      }} />

      {/* ── Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        <div style={{
          background: "rgba(255,255,255,0.82)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          borderRadius: "24px",
          border: "1px solid rgba(255,255,255,0.95)",
          boxShadow: "0 8px 48px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
          padding: "36px 32px 32px",
        }}>

          {/* Header row */}
          <div className="flex items-center justify-between mb-7">
            <div className="flex items-center gap-2">
              <div style={{
                width: 32, height: 32, borderRadius: "10px",
                background: "linear-gradient(135deg, #f59e0b, #f97316)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "15px",
                boxShadow: "0 4px 12px rgba(249,115,22,0.3)",
              }}>🎙</div>
              <span style={{ fontWeight: 700, fontSize: "15px", color: "#1a1a1a", letterSpacing: "-0.2px" }}>
                InterviewAI
              </span>
            </div>
            <Link href="/login" style={{ fontSize: "13px", fontWeight: 600, color: "#6b7280" }}
              className="hover:text-gray-900 transition-colors">
              Log in
            </Link>
          </div>

          {/* Title */}
          <div className="mb-6">
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#111827", letterSpacing: "-0.5px", lineHeight: 1.2 }}>
              Create Account
            </h1>
            <p style={{ fontSize: "13px", color: "#9ca3af", marginTop: "4px" }}>
              Start practicing with your AI interviewer
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* Full Name */}
            <label style={inputWrap}>
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <input type="text" required placeholder="Full name"
                value={form.name} onChange={set("name")} style={inputStyle} />
            </label>

            {/* Email */}
            <label style={inputWrap}>
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <input type="email" required placeholder="e-mail address"
                value={form.email} onChange={set("email")} style={inputStyle} />
            </label>

            {/* Password */}
            <label style={inputWrap}>
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              <input type="password" required placeholder="password (min 6 chars)"
                value={form.password} onChange={set("password")} style={inputStyle} />
            </label>

            {/* Role + Experience */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <label style={{ ...inputWrap, padding: "0 10px 0 14px" }}>
                <select required value={form.jobRole} onChange={set("jobRole")} style={selectStyle}>
                  <option value="">Role</option>
                  {JOB_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </label>
              <label style={{ ...inputWrap, padding: "0 10px 0 14px" }}>
                <select required value={form.experienceLevel} onChange={set("experienceLevel")} style={selectStyle}>
                  <option value="">Exp.</option>
                  {EXP_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </label>
            </div>

            {error && (
              <p style={{ fontSize: "13px", color: "#dc2626", background: "rgba(239,68,68,0.07)",
                borderRadius: "10px", padding: "10px 14px", border: "1px solid rgba(239,68,68,0.15)" }}>
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                gap: "8px", padding: "14px",
                background: loading ? "#374151" : "#111827",
                color: "white", border: "none", borderRadius: "50px",
                fontSize: "14px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 20px rgba(17,24,39,0.2)",
                transition: "background 0.2s",
                letterSpacing: "0.1px",
                marginTop: "4px",
              }}
            >
              {loading ? "Creating account…" : (
                <>
                  Create Account
                  <span style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>
                    →
                  </span>
                </>
              )}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "13px", color: "#9ca3af", marginTop: "18px" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#111827", fontWeight: 700, textDecoration: "none" }}>
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
