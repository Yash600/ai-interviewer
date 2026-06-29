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

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden py-8"
      style={{ background: "linear-gradient(135deg, #0f0520 0%, #1a0a3a 30%, #2d1b69 60%, #4c2fa0 100%)" }}>
      <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full opacity-25"
        style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
      <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full opacity-15"
        style={{ background: "radial-gradient(circle, #ec4899, transparent)" }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-sm mx-4">
        <div className="glass-strong rounded-3xl p-8" style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}>

          <div className="text-center mb-7">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 8px 24px rgba(124,58,237,0.4)" }}>
              🎙
            </div>
            <h1 className="text-xl font-black text-white">Create Account</h1>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Start practicing with your AI interviewer</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>Full Name</label>
              <input type="text" required className="input-glass" placeholder="Yash Malik" value={form.name} onChange={set("name")} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>Email</label>
              <input type="email" required className="input-glass" placeholder="you@example.com" value={form.email} onChange={set("email")} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>Password</label>
              <input type="password" required className="input-glass" placeholder="Min 6 characters" value={form.password} onChange={set("password")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>Role</label>
                <select required className="input-glass" value={form.jobRole} onChange={set("jobRole")}>
                  <option value="">Select...</option>
                  {JOB_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>Experience</label>
                <select required className="input-glass" value={form.experienceLevel} onChange={set("experienceLevel")}>
                  <option value="">Select...</option>
                  {EXP_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 rounded-xl px-4 py-3">{error}</p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2 disabled:opacity-60">
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: "rgba(255,255,255,0.4)" }}>
            Already have an account?{" "}
            <Link href="/login" className="text-brand-400 font-semibold hover:text-brand-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
