"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { StudentSidebar } from "@/components/navigation/student-sidebar";
import { StudentHeader } from "@/components/navigation/student-header";

interface StudentLayoutProps {
  children: React.ReactNode;
  userName?: string;
  userInitial?: string;
  onLogout?: () => void;
}

export function StudentLayout({
  children,
  userName,
  userInitial,
  onLogout,
}: StudentLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="fixed inset-y-0 left-0 z-40 hidden w-64 md:block">
        <StudentSidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close navigation overlay"
            onClick={closeMobileMenu}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          <div className="absolute inset-y-0 left-0 w-64">
            <div className="absolute right-3 top-4 z-10">
              <button
                type="button"
                onClick={closeMobileMenu}
                aria-label="Close navigation menu"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <StudentSidebar onNavigate={closeMobileMenu} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="min-h-screen md:pl-64">
        <StudentHeader
          userName={userName}
          userInitial={userInitial}
          onMenuClick={() => setMobileMenuOpen(true)}
          onLogout={onLogout}
        />

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
