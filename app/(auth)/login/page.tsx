"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
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

  return (
    <div
      className="min-h-screen relative flex items-center justify-center overflow-hidden"
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
        top: "38%", left: "10%",
        width: 280, height: 280, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(252,211,154,0.28) 0%, transparent 70%)",
        filter: "blur(40px)",
      }} />
      {/* Decorative circle accent */}
      <div className="absolute pointer-events-none" style={{
        top: "12%", left: "18%",
        width: 64, height: 64, borderRadius: "50%",
        background: "rgba(255,255,255,0.55)",
        border: "1.5px solid rgba(255,255,255,0.9)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }} />
      <div className="absolute pointer-events-none" style={{
        bottom: "18%", right: "14%",
        width: 40, height: 40, borderRadius: "50%",
        background: "rgba(255,255,255,0.45)",
        border: "1.5px solid rgba(255,255,255,0.85)",
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

          {/* Header row — brand left, sign up right */}
          <div className="flex items-center justify-between mb-8">
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
            <Link href="/signup" style={{ fontSize: "13px", fontWeight: 600, color: "#6b7280" }}
              className="hover:text-gray-900 transition-colors">
              Sign up
            </Link>
          </div>

          {/* Title */}
          <div className="mb-7">
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#111827", letterSpacing: "-0.5px", lineHeight: 1.2 }}>
              Log in
            </h1>
            <p style={{ fontSize: "13px", color: "#9ca3af", marginTop: "4px" }}>
              Welcome back — let&apos;s get you practicing
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Email */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 4px 0 16px",
                background: "#f9fafb", border: "1.5px solid #f3f4f6", borderRadius: "14px",
                transition: "border-color 0.2s" }}>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <input
                  type="email" required
                  placeholder="e-mail address"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  style={{ flex: 1, border: "none", outline: "none", background: "transparent",
                    padding: "13px 0", fontSize: "14px", color: "#111827" }}
                />
              </label>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 4px 0 16px",
                background: "#f9fafb", border: "1.5px solid #f3f4f6", borderRadius: "14px" }}>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <input
                  type="password" required
                  placeholder="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  style={{ flex: 1, border: "none", outline: "none", background: "transparent",
                    padding: "13px 0", fontSize: "14px", color: "#111827" }}
                />
                <button type="button" style={{ fontSize: "12px", color: "#9ca3af", paddingRight: "12px",
                  background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>
                  forgot
                </button>
              </label>
            </div>

            {error && (
              <p style={{ fontSize: "13px", color: "#dc2626", background: "rgba(239,68,68,0.07)",
                borderRadius: "10px", padding: "10px 14px", border: "1px solid rgba(239,68,68,0.15)" }}>
                {error}
              </p>
            )}

            {/* Small disclaimer */}
            <p style={{ fontSize: "11px", color: "#9ca3af", lineHeight: 1.5 }}>
              For use by adults only (18 years of age and older). In case of accidental data loss, contact our{" "}
              <span style={{ textDecoration: "underline", cursor: "pointer" }}>support</span>.
            </p>

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
                transition: "background 0.2s, transform 0.1s",
                letterSpacing: "0.1px",
              }}
            >
              {loading ? "Signing in…" : (
                <>
                  Sign in
                  <span style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>
                    →
                  </span>
                </>
              )}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "13px", color: "#9ca3af", marginTop: "20px" }}>
            Please practice responsibly!
          </p>
        </div>
      </motion.div>
    </div>
  );
}
