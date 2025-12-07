"use client";

import { useState, useEffect, type ReactNode } from "react";
import { Sidebar } from "@/components/app/sidebar";
import { AuthGuard } from "@/components/auth";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load preference from localStorage
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored !== null) {
      setIsCollapsed(stored === "true");
    }
  }, []);

  // Save preference to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("sidebar-collapsed", String(isCollapsed));
    }
  }, [isCollapsed, mounted]);

  const toggleCollapsed = () => setIsCollapsed((prev) => !prev);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 hidden border-r border-border lg:block",
            "transition-all duration-300 ease-in-out",
            isCollapsed ? "w-[72px]" : "w-64"
          )}
        >
          <Sidebar isCollapsed={isCollapsed} onToggleCollapse={toggleCollapsed} />
        </aside>

        {/* Main Content */}
        <main
          className={cn(
            "min-h-screen transition-all duration-300 ease-in-out",
            isCollapsed ? "lg:pl-[72px]" : "lg:pl-64"
          )}
        >
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
