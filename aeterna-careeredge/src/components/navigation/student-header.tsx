"use client";

import { Bell, Menu, Search, LogOut, Shield } from "lucide-react";

interface StudentHeaderProps {
  userName?: string;
  userInitial?: string;
  onMenuClick?: () => void;
  onLogout?: () => void;
}

export function StudentHeader({
  userName = "Student",
  userInitial = "S",
  onMenuClick,
  onLogout,
}: StudentHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white/95 px-4 backdrop-blur sm:px-6">
      {/* Left: hamburger + search */}
      <div className="flex items-center gap-3 flex-1">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-secondary-text hover:bg-surface-muted md:hidden"
        >
          <Menu size={20} />
        </button>

        {/* Search bar */}
        <div className="relative hidden sm:block max-w-md flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text"
          />
          <input
            type="text"
            placeholder="Search verified skills, jobs, mock assessments…"
            className="h-9 w-full rounded-lg border border-border bg-surface-muted pl-9 pr-4 text-[13px] text-foreground placeholder:text-muted-text focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-colors"
          />
        </div>
      </div>

      {/* Right: language, ESG, notifications, user */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language badge */}
        <span className="hidden sm:inline-flex h-7 items-center rounded-md border border-border bg-surface-muted px-2 text-[11px] font-semibold text-secondary-text">
          EN
        </span>

        {/* ESG badge */}
        <span className="hidden lg:inline-flex h-7 items-center gap-1 rounded-md border border-border bg-surface-muted px-2 text-[11px] font-semibold text-secondary-text">
          <Shield size={12} />
          ESG
        </span>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-secondary-text transition hover:bg-surface-muted hover:text-primary"
        >
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#F2B63D] ring-2 ring-white" />
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-border" />

        {/* User */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:block text-right">
            <p className="text-[13px] font-semibold text-foreground leading-tight">
              {userName}
            </p>
            <p className="text-[10px] font-medium text-primary">
              Tier 1 Verified Student
            </p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#F2B63D] to-[#E8A020] text-sm font-bold text-[#4C0915] shadow-sm">
            {userInitial}
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              aria-label="Sign out"
              className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg text-secondary-text transition hover:bg-surface-muted hover:text-primary"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
