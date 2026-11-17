"use client";

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
} from "lucide-react";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Career Passport", href: "/passport", icon: Fingerprint },
  { label: "Evidence Vault", href: "/evidence-vault", icon: ShieldCheck },
  { label: "Truth Check", href: "/truth-check", icon: CheckCheck },
  { label: "Resume Builder", href: "/resume", icon: FileText },
  { label: "LinkedIn Builder", href: "/linkedin", icon: Network },
  { label: "Job Match", href: "/jobs", icon: BriefcaseBusiness },
  { label: "Applications", href: "/applications", icon: ClipboardList },
  { label: "Role Fit Explorer", href: "/role-fit-explorer", icon: Compass },
  { label: "30-Day Sprints", href: "/sprints", icon: Zap },
  { label: "Interview Prep", href: "/interview-prep", icon: HelpCircle },
  { label: "Value & Impact", href: "/value", icon: TrendingUp },
  { label: "Progress Ledger", href: "/progress", icon: Clock },
  { label: "Pricing & Plans", href: "/pricing", icon: Sparkles },
  { label: "SOP Builder", href: "/sop", icon: BookOpen },
  { label: "Counselling", href: "/counselling", icon: CalendarDays },
  { label: "Settings", href: "/settings", icon: Settings },
];

// Active implemented routes
const implementedRoutes = new Set([
  "/dashboard",
  "/passport",
  "/resume",
  "/evidence-vault",
  "/truth-check",
  "/linkedin",
  "/jobs",
  "/applications",
  "/role-fit-explorer",
  "/sprints",
  "/interview-prep",
  "/value",
  "/progress",
  "/pricing",
  "/sop",
  "/counselling",
  "/settings",
]);

interface StudentSidebarProps {
  onNavigate?: () => void;
}

export function StudentSidebar({ onNavigate }: StudentSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col bg-gradient-to-b from-[#4C0915] to-[#3A0710] text-white">
      {/* Logo / brand */}
      <div className="flex h-[72px] items-center gap-3 px-5">
        <Link
          href="/dashboard"
          className="flex items-center gap-3"
          onClick={onNavigate}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F2B63D] text-[#4C0915]">
            <GraduationCap size={20} strokeWidth={2.2} />
          </div>
          <div>
            <p className="font-heading text-[15px] font-bold leading-tight tracking-tight">
              CareerEdge
            </p>
            <p className="text-[11px] font-medium text-white/50">
              Student Portal
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const isImplemented = implementedRoutes.has(item.href);

          return (
            <Link
              key={item.href}
              href={isImplemented ? item.href : item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={[
                "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium transition-all duration-150",
                active
                  ? "bg-white/15 font-semibold text-white shadow-sm shadow-black/10"
                  : "text-white/60 hover:bg-white/8 hover:text-white/90",
              ].join(" ")}
            >
              <Icon
                size={18}
                strokeWidth={active ? 2 : 1.6}
                className={active ? "text-[#F2B63D]" : ""}
              />
              <span className="flex-1">{item.label}</span>
              {!isImplemented && !active && (
                <span className="rounded bg-white/8 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/30">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom branding */}
      <div className="border-t border-white/8 px-4 py-4">
        <div className="rounded-xl bg-white/6 px-3 py-3">
          <p className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">
            Vidhana Soudha Track
          </p>
          <p className="mt-0.5 text-[10px] leading-snug text-white/30">
            Statewide youth placement & skill empowerment initiative.
          </p>
        </div>
      </div>
    </aside>
  );
}
