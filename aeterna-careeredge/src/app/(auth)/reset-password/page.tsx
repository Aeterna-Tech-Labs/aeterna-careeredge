"use client";

import Link from "next/link";
import { Suspense, useState, useEffect, type FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  type Variants,
} from "motion/react";
import AuthLayout from "@/components/layouts/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const inputClass = "h-12 rounded-xl border-[#EBDDD1] bg-white pl-10 pr-11";
const labelClass = "mb-2 block text-sm font-semibold text-[#352020]";
const iconClass =
  "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A8580] transition-colors duration-200 group-focus-within:text-[#7A0F1F]";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const hasToken = Boolean(token);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(hasToken);
  const [tokenValid, setTokenValid] = useState<boolean | null>(hasToken ? null : false);
  const [tokenError, setTokenError] = useState<string | null>(
    hasToken ? null : "Missing reset token in link. Please request a new password reset link."
  );
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Verify token on mount if present
  useEffect(() => {
    if (!token) {
      return;
    }

    async function checkToken() {
      try {
        const res = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token as string)}`);
        const data = await res.json();

        if (res.ok && data.valid) {
          setTokenValid(true);
          if (data.email) setUserEmail(data.email);
        } else {
          setTokenValid(false);
          setTokenError(data.error || "The reset link is invalid or has expired.");
        }
      } catch {
        setTokenValid(false);
        setTokenError("Unable to verify link. Please check your internet connection.");
      } finally {
        setVerifying(false);
      }
    }

    checkToken();
  }, [token]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Missing reset token.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (verifying) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#7A0F1F] border-r-transparent align-[-0.125em]" />
        <p className="mt-4 text-sm text-[#765F5D]">Verifying your security credentials…</p>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-950">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-bold text-red-900">Invalid or Expired Link</h2>
              <p className="mt-1 text-sm text-red-800 leading-relaxed">
                {tokenError || "This password reset link is invalid or has expired for security reasons."}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <Link
            href="/forgot-password"
            className="flex h-12 w-full items-center justify-center rounded-xl bg-[#7A0F1F] text-base font-semibold text-white shadow-md shadow-[#7A0F1F]/20 hover:bg-[#4C0915] transition-colors"
          >
            Request New Reset Link
          </Link>
          <Link
            href="/login"
            className="flex h-12 w-full items-center justify-center rounded-xl border border-[#EBDDD1] bg-white text-base font-semibold text-[#765F5D] hover:bg-[#f8efe7] transition-colors"
          >
            Return to Login
          </Link>
        </div>
      </motion.div>
    );
  }

  if (success) {
    return (
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-950">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-bold text-emerald-900">Password Reset Complete</h2>
              <p className="mt-1 text-sm text-emerald-800 leading-relaxed">
                Your account password has been updated securely. You can now log in with your new credentials.
              </p>
              <p className="mt-3 text-xs text-emerald-700 flex items-center gap-1 font-medium">
                Redirecting you to the login screen in 3 seconds…
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/login"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#7A0F1F] text-base font-semibold text-white shadow-md shadow-[#7A0F1F]/20 hover:bg-[#4C0915] transition-colors"
        >
          <span>Continue to Login</span>
          <ArrowRight size={18} />
        </Link>
      </motion.div>
    );
  }

  return (
    <div>
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-7">
        <h1 className="text-3xl font-bold tracking-tight text-[#2B1B1B]">
          Set new password
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#765F5D]">
          {userEmail ? (
            <>Creating new password for <span className="font-semibold text-[#2B1B1B]">{userEmail}</span>.</>
          ) : (
            "Please choose a strong password with at least 8 characters."
          )}
        </p>
      </motion.div>

      <motion.form
        variants={fadeUp}
        initial="hidden"
        animate="show"
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div>
          <label htmlFor="new-password" className={labelClass}>
            New Password
          </label>
          <div className="group relative">
            <Lock aria-hidden="true" className={iconClass} />
            <Input
              id="new-password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md text-[#9A8580] transition-colors hover:text-[#7A0F1F]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirm-password" className={labelClass}>
            Confirm New Password
          </label>
          <div className="group relative">
            <Lock aria-hidden="true" className={iconClass} />
            <Input
              id="confirm-password"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md text-[#9A8580] transition-colors hover:text-[#7A0F1F]"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
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
            {loading ? "Updating password…" : "Reset Password"}
          </Button>
        </motion.div>

        <p className="pt-2 text-center text-sm text-[#765F5D]">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-bold text-[#7A0F1F] hover:underline"
          >
            Log in
          </Link>
        </p>
      </motion.form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout activeTab="login">
      <MotionConfig reducedMotion="user">
        <Suspense
          fallback={
            <div className="py-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#7A0F1F] border-r-transparent align-[-0.125em]" />
              <p className="mt-4 text-sm text-[#765F5D]">Loading security interface…</p>
            </div>
          }
        >
          <ResetPasswordContent />
        </Suspense>
      </MotionConfig>
    </AuthLayout>
  );
}
