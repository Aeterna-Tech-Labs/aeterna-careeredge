"use client";

import { Bell, Menu, Search, LogOut } from "lucide-react";

interface StudentHeaderProps {
  title: string;
  description?: string;
  onMenuClick?: () => void;
  onLogout?: () => void;
}

export function StudentHeader({
  title,
  description,
  onMenuClick,
  onLogout,
}: StudentHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between border-b border-border bg-surface/95 px-5 py-3 backdrop-blur sm:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-secondary-text hover:bg-surface-muted md:hidden"
        >
          <Menu size={21} />
        </button>

        <div>
          <h1 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
            {title}
          </h1>

          {description && (
            <p className="mt-1 text-sm text-secondary-text">{description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Search"
          className="hidden h-10 w-10 items-center justify-center rounded-full text-secondary-text transition hover:bg-surface-muted hover:text-primary sm:flex"
        >
          <Search size={19} />
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-secondary-text transition hover:bg-surface-muted hover:text-primary"
        >
          <Bell size={19} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-gold" />
        </button>

        <div className="flex items-center gap-2 border-l border-border pl-3 sm:gap-3 sm:pl-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-soft text-sm font-bold text-primary">
            S
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-foreground">Student</p>
            <p className="text-xs text-secondary-text">CareerEdge Member</p>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              aria-label="Sign out"
              className="hidden h-9 w-9 items-center justify-center rounded-full text-secondary-text transition hover:bg-surface-muted hover:text-primary sm:flex"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
