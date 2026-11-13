
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
  Video,
  FolderKanban,
  ClipboardList,
  MessageCircle,
  CalendarDays,
  Settings,
  ChevronLeft,
  GraduationCap,
  Network,
} from "lucide-react";

const navigation = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Career Passport", href: "/passport", icon: Fingerprint },
    ],
  },
  {
    label: "Career Toolkit",
    items: [
      { label: "Resume Builder", href: "/resume", icon: FileText },
      { label: "SOP Builder", href: "/sop", icon: BookOpen },
      { label: "LinkedIn Builder", href: "/linkedin", icon: Network },
      { label: "Career Discovery", href: "/career-discovery", icon: Compass },
    ],
  },
  {
    label: "Employability",
    items: [
      { label: "Job Matcher", href: "/job-matcher", icon: BriefcaseBusiness },
      { label: "Interview Coach", href: "/interview-coach", icon: Video },
      { label: "My Portfolio", href: "/portfolio", icon: FolderKanban },
      { label: "Application Tracker", href: "/applications", icon: ClipboardList },
    ],
  },
  {
    label: "Support",
    items: [
      { label: "AI Career Mentor", href: "/mentor", icon: MessageCircle },
      { label: "Counselling", href: "/counselling", icon: CalendarDays },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

interface StudentSidebarProps {
  onNavigate?: () => void;
}

export function StudentSidebar({ onNavigate }: StudentSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col bg-primary-dark text-white">
      <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
        <Link href="/dashboard" className="flex items-center gap-3" onClick={onNavigate}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold text-primary-dark">
            <GraduationCap size={23} />
          </div>
          <div>
            <p className="font-heading text-base font-bold">Aeterna</p>
            <p className="text-xs text-white/60">CareerEdge</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {navigation.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
              {group.label}
            </p>

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "bg-white/15 font-semibold text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white",
                    ].join(" ")}
                  >
                    <Icon size={18} strokeWidth={1.8} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold font-semibold text-primary-dark">
            S
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">Student Account</p>
            <p className="text-xs text-white/50">CareerEdge Member</p>
          </div>
          <ChevronLeft size={16} className="rotate-180 text-white/50" />
        </div>
      </div>
    </aside>
  );
}
