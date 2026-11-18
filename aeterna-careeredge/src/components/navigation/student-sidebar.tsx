"use client";

// src/components/navigation/student-sidebar.tsx
// Upgraded accessible student sidebar driven by central feature registry.
// Groups tools clearly, highlights active links, and cleanly marks coming soon items.

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Fingerprint,
  FileText,
  BookOpen,
  Compass,
  BriefcaseBusiness,
  ClipboardList,
  CalendarDays,
  Settings,
  GraduationCap,
  Network,
  ShieldCheck,
  CheckCheck,
  Zap,
  HelpCircle,
  Clock,
  TrendingUp,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { FEATURE_REGISTRY } from "@/config/features";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  featureId?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Build & Document",
    items: [
      { label: "Career Passport", href: "/passport", icon: Fingerprint, featureId: "career-passport" },
      { label: "Resume Builder", href: "/resume", icon: FileText, featureId: "resume-builder" },
      { label: "SOP Builder", href: "/sop", icon: BookOpen, featureId: "sop-builder" },
    ],
  },
  {
    title: "Improve & Verify",
    items: [
      { label: "Evidence Vault", href: "/evidence-vault", icon: ShieldCheck, featureId: "evidence-vault" },
      { label: "Truth Check", href: "/truth-check", icon: CheckCheck, featureId: "truth-check" },
      { label: "LinkedIn Builder", href: "/linkedin", icon: Network, featureId: "linkedin-optimizer" },
    ],
  },
  {
    title: "Explore & Apply",
    items: [
      { label: "Job Match", href: "/jobs", icon: BriefcaseBusiness, featureId: "job-matches" },
      { label: "Applications", href: "/applications", icon: ClipboardList, featureId: "applications-tracker" },
      { label: "Role Fit Explorer", href: "/role-fit-explorer", icon: Compass, featureId: "role-fit-explorer" },
    ],
  },
  {
    title: "Track & Accelerate",
    items: [
      { label: "30-Day Sprints", href: "/sprints", icon: Zap, featureId: "employability-sprints" },
      { label: "Interview Prep", href: "/interview-prep", icon: HelpCircle, featureId: "interview-prep" },
      { label: "1-on-1 Counselling", href: "/counselling", icon: CalendarDays, featureId: "career-counselling" },
      { label: "Progress Ledger", href: "/progress", icon: Clock, featureId: "progress-ledger" },
      { label: "Value & Impact", href: "/value", icon: TrendingUp, featureId: "value-roi" },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Pricing & Plans", href: "/pricing", icon: Sparkles, featureId: "pricing" },
      { label: "Settings", href: "/settings", icon: Settings, featureId: "settings" },
    ],
  },
];

interface StudentSidebarProps {
  onNavigate?: () => void;
}

export function StudentSidebar({ onNavigate }: StudentSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Student Portal Navigation"
      data-tour="sidebar"
      className="flex h-full w-64 flex-col bg-gradient-to-b from-[#4C0915] to-[#3A0710] text-white"
    >
      {/* Brand Header */}
      <div className="flex h-[72px] items-center gap-3 px-5 border-b border-white/10 shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B63D] rounded-lg p-1"
          onClick={onNavigate}
          aria-label="Aeterna CareerEdge Home"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F2B63D] text-[#4C0915] font-bold shadow-xs group-hover:scale-105 transition-transform">
            <GraduationCap size={20} strokeWidth={2.4} aria-hidden="true" />
          </div>
          <div>
            <p className="font-heading text-[15px] font-bold leading-tight tracking-tight text-white">
              CareerEdge
            </p>
            <p className="text-[11px] font-medium text-white/60">
              Student Portal
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4 focus-visible:outline-none scrollbar-thin">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-white/40">
              {section.title}
            </p>

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);

                const feat = item.featureId ? FEATURE_REGISTRY[item.featureId] : undefined;
                const isComingSoon = feat?.status === "COMING_SOON";

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    aria-describedby={isComingSoon ? `soon-${item.href.replace(/\//g, "")}` : undefined}
                    className={[
                      "group flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B63D]",
                      active
                        ? "bg-white/20 font-bold text-white shadow-xs"
                        : isComingSoon
                          ? "text-white/45 hover:bg-white/8 hover:text-white/70"
                          : "text-white/75 hover:bg-white/10 hover:text-white",
                    ].join(" ")}
                  >
                    <Icon
                      size={17}
                      strokeWidth={active ? 2.2 : 1.7}
                      className={active ? "text-[#F2B63D]" : isComingSoon ? "text-white/40" : "text-white/60 group-hover:text-white/90"}
                      aria-hidden="true"
                    />
                    <span className="flex-1 truncate">{item.label}</span>

                    {isComingSoon && (
                      <span
                        id={`soon-${item.href.replace(/\//g, "")}`}
                        className="rounded-full bg-white/10 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider text-white/50"
                      >
                        Soon
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer / Vidhana Soudha Track */}
      <div className="border-t border-white/10 px-4 py-3 shrink-0">
        <div className="rounded-xl bg-white/6 px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#F2B63D]">
            Vidhana Soudha Track
          </p>
          <p className="mt-0.5 text-[10px] leading-snug text-white/50">
            Karnataka youth career &amp; verifiable placement initiative.
          </p>
        </div>
      </div>
    </aside>
  );
}
