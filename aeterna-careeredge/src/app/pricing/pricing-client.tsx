"use client";

import React, { useState, useEffect } from "react";
import { StudentLayout } from "@/components/layouts/student-layout";
import { HowItWorksPanel } from "@/components/guidance/how-it-works-panel";
import {
  ShieldCheck,
  Check,
  Sparkles,
  Info,
  CheckCircle2,
} from "lucide-react";

interface PricingClientProps {
  studentName: string;
}

export function PricingClient({ studentName }: PricingClientProps) {
  const [currentPlan, setCurrentPlan] = useState<string>("FREE");
  const [upgrading, setUpgrading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/billing/plans")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.currentPlan?.id) {
          setCurrentPlan(data.currentPlan.id);
        }
      })
      .catch((err) => console.error("Error loading plans:", err));
  }, []);

  const handleUpgrade = async (isDev = false) => {
    setUpgrading(true);
    try {
      const res = await fetch("/api/billing/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: "PREMIUM",
          isDevUpgrade: isDev,
        }),
      });

      if (res.ok) {
        setCurrentPlan("PREMIUM");
        setSuccessMessage("🎉 Successfully upgraded to CareerEdge Pro! All features unlocked.");
        setTimeout(() => setSuccessMessage(null), 6000);
      }
    } catch (err) {
      console.error("Upgrade error:", err);
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <StudentLayout userName={studentName}>
      <div className="min-h-screen bg-[#FFF8F0]/40 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#7A0F1F]/10 text-[#7A0F1F]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#F2B63D]" />
            Fair Value-Proof Pricing
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Simple, Transparent Plans For Every Career Stage
          </h1>
          <p className="text-sm text-gray-700 leading-relaxed">
            No dark patterns. No false hiring promises. Free forever for baseline readiness, or upgrade to Pro when you need deep role-tailored optimization.
          </p>
        </div>

        {/* Guidance Helper */}
        <HowItWorksPanel toolKey="pricing" />

        {/* Success Alert */}
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-5 py-3 rounded-2xl flex items-center gap-3 max-w-xl mx-auto shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {/* Card 1: Free Starter */}
          <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Free Forever
                </span>
                {currentPlan === "FREE" && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    Current Plan
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900">Career Starter</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-extrabold text-gray-900">₹0</span>
                  <span className="text-sm text-gray-700">/ forever</span>
                </div>
                <p className="text-xs text-gray-700 mt-2">
                  Essential tools to build your authentic Career Passport and baseline resume.
                </p>
              </div>

              {/* Feature Checklist */}
              <ul className="space-y-3 pt-4 border-t border-gray-100 text-xs text-gray-700">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Comprehensive Multi-Domain Career Passport</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Evidence Vault (up to 10 verified artifacts)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>1 Profession-Specific Resume with PDF Export</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Basic Evidence Audit (Top 3 issue summary)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Full Application Journey Tracker</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>AI Career Guide (15 questions/month)</span>
                </li>
              </ul>
            </div>

            <div className="pt-4">
              <button
                disabled={currentPlan === "FREE"}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold border border-gray-200 text-gray-700 bg-gray-50 disabled:opacity-60 cursor-default"
              >
                {currentPlan === "FREE" ? "Active Starter Plan" : "Downgrade to Free"}
              </button>
            </div>
          </div>

          {/* Card 2: CareerEdge Pro */}
          <div className="bg-white rounded-3xl border-2 border-[#7A0F1F] p-8 shadow-xl flex flex-col justify-between space-y-6 relative">
            <div className="absolute -top-3.5 right-8">
              <span className="bg-[#7A0F1F] text-[#F2B63D] text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                Recommended
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7A0F1F]">
                  Complete Suite
                </span>
                {currentPlan === "PREMIUM" && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Active Pro Plan
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900">CareerEdge Pro</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-extrabold text-[#7A0F1F]">₹499</span>
                  <span className="text-sm text-gray-700">/ month</span>
                </div>
                <p className="text-xs text-gray-700 mt-2">
                  Tailored application packs, 30-day employability sprints, interview kits, and unlimited resume versions.
                </p>
              </div>

              {/* Feature Checklist */}
              <ul className="space-y-3 pt-4 border-t border-gray-100 text-xs text-gray-800">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Unlimited Resumes</strong> with Job Description tailoring</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>1-Click Application Packs</strong> (Cover note, outreach, talking points)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>30-Day Gap-to-Action Sprint</strong> with daily milestone tracking</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Role-Specific Interview Prep Kits</strong> with STAR response frameworks</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Full LinkedIn Optimization</strong> (FAST & QUALITY tiers)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Expanded Vault</strong> (up to 50 verified Proof Bank artifacts)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>AI Career Guide</strong> (150 questions/month)</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 space-y-2">
              <button
                onClick={() => handleUpgrade(false)}
                disabled={upgrading || currentPlan === "PREMIUM"}
                className="w-full py-3.5 px-4 rounded-xl text-xs font-bold bg-[#7A0F1F] text-white hover:bg-[#600C18] shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#F2B63D]" />
                {currentPlan === "PREMIUM"
                  ? "Current Active Plan"
                  : upgrading
                  ? "Processing..."
                  : "Upgrade with Razorpay"}
              </button>

              {/* Dev Test Upgrade Button */}
              {currentPlan !== "PREMIUM" && (
                <button
                  onClick={() => handleUpgrade(true)}
                  className="w-full py-2 px-3 text-[11px] font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  ⚡ Developer Instant Test Upgrade (Dev Mode)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Value Guarantee Note */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-4xl mx-auto flex items-start gap-3 text-xs text-gray-700">
          <Info className="w-5 h-5 text-[#7A0F1F] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-gray-900 font-semibold block">The CareerEdge Promise</strong>
            <p>
              We tell you honestly where you stand for your chosen career, and exactly what to do next. We never sell your data, never scrape protected websites, and never fabricate credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
    </StudentLayout>
  );
}
