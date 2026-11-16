"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Copy, Check } from "lucide-react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  type Variants,
} from "motion/react";
import AuthLayout from "@/components/layouts/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const inputClass = "h-12 rounded-xl border-[#EBDDD1] bg-white pl-10";
const labelClass = "mb-2 block text-sm font-semibold text-[#352020]";
const iconClass =
  "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A8580] transition-colors duration-200 group-focus-within:text-[#7A0F1F]";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to process request. Please try again.");
        return;
      }

      setSubmitted(true);
      if (data.devResetUrl) {
        setDevResetUrl(data.devResetUrl);
      }
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopyDevLink() {
    if (devResetUrl) {
      navigator.clipboard.writeText(devResetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <AuthLayout activeTab="login">
      <MotionConfig reducedMotion="user">
        <div>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mb-7"
          >
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#765F5D] hover:text-[#7A0F1F] mb-4 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Login
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-[#2B1B1B]">
              Reset your password
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#765F5D]">
              Enter your email address and we will provide you with a secure link to reset your account credentials.
            </p>
          </motion.div>

          {submitted ? (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="space-y-6"
            >
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 text-emerald-950">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-emerald-900">
                      Reset Instructions Dispatched
                    </h3>
                    <p className="mt-1 text-sm text-emerald-800 leading-relaxed">
                      If an account is associated with <span className="font-semibold">{email}</span>, a secure password reset link has been dispatched.
                    </p>
                    <p className="mt-2 text-xs text-emerald-700">
                      Please check your inbox and follow the instructions within 60 minutes.
                    </p>
                  </div>
                </div>
              </div>

              {devResetUrl && (
                <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-4 text-amber-950 text-sm">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-200">
                    <span className="font-semibold text-amber-900 flex items-center gap-1.5 text-xs tracking-wider uppercase">
                      🛠️ Dev Email Delivery Simulation
                    </span>
                    <span className="text-[11px] bg-amber-200/80 px-2 py-0.5 rounded text-amber-800 font-mono">
                      NODE_ENV !== production
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 mb-3">
                    In development mode without an SMTP provider configured, your reset link is ready for immediate testing:
                  </p>
                  <div className="flex items-center gap-2">
                    <Link
                      href={devResetUrl}
                      className="flex-1 truncate rounded-lg bg-white border border-amber-300 px-3 py-2 text-xs font-mono text-[#7A0F1F] hover:underline"
                    >
                      {devResetUrl}
                    </Link>
                    <button
                      type="button"
                      onClick={handleCopyDevLink}
                      className="inline-flex items-center gap-1 shrink-0 rounded-lg bg-amber-200 px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-300 transition-colors"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-2 flex flex-col gap-3">
                <Link
                  href="/login"
                  className="flex h-12 w-full items-center justify-center rounded-xl bg-[#7A0F1F] text-base font-semibold text-white shadow-md shadow-[#7A0F1F]/20 hover:bg-[#4C0915] transition-colors"
                >
                  Return to Login
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setDevResetUrl(null);
                  }}
                  className="text-xs text-center font-medium text-[#765F5D] hover:text-[#7A0F1F] transition-colors"
                >
                  Need to try a different email?
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.form
              variants={fadeUp}
              initial="hidden"
              animate="show"
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label htmlFor="reset-email" className={labelClass}>
                  Email Address
                </label>
                <div className="group relative">
                  <Mail aria-hidden="true" className={iconClass} />
                  <Input
                    id="reset-email"
                    name="email"
                    type="email"
                    placeholder="student@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <AnimatePresence initial={false}>
                {error && (
                  <motion.div
                    role="alert"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Button
                  type="submit"
                  fullWidth
                  loading={loading}
                  className="h-12 rounded-xl bg-[#7A0F1F] text-base font-semibold text-white shadow-md shadow-[#7A0F1F]/20 hover:bg-[#4C0915]"
                >
                  {loading ? "Sending link…" : "Send Reset Link"}
                </Button>
              </motion.div>

              <p className="pt-2 text-center text-sm text-[#765F5D]">
                Remembered your credentials?{" "}
                <Link
                  href="/login"
                  className="font-bold text-[#7A0F1F] hover:underline"
                >
                  Log in
                </Link>
              </p>
            </motion.form>
          )}
        </div>
      </MotionConfig>
    </AuthLayout>
  );
}
