// ============================================================================
// ADMIN LAYOUT — Dark-mode admin shell with glassmorphic sidebar
// ============================================================================

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, redirect } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Palette,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  Loader2,
} from "lucide-react";

const sidebarLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/forms", label: "Forms", icon: FileText },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/themes", label: "Themes", icon: Palette },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-light animate-spin" />
      </div>
    );
  }

  if (!user || userRole !== 'admin') {
    redirect("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text flex">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
        className="fixed top-0 left-0 h-screen glass-dark border-r border-dark-border flex flex-col z-40"
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-dark-border shrink-0">
          <motion.div
            whileHover={{ rotate: 12, scale: 1.1 }}
            className="w-8 h-8 rounded-lg bg-violet flex items-center justify-center shrink-0"
          >
            <Sparkles className="w-4 h-4 text-white" />
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <span className="font-heading text-xl font-bold text-white">
                  FormForge
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <Shield className="w-3 h-3 text-violet-light" />
                  <span className="text-[10px] text-violet-light font-medium uppercase tracking-wider">
                    Admin
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/admin" && pathname.startsWith(link.href));

            return (
              <Link key={link.href} href={link.href}>
                <motion.div
                  whileHover={{ x: collapsed ? 0 : 4 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-violet/15 text-violet-light"
                      : "text-dark-text-secondary hover:text-white hover:bg-white/5"
                  )}
                >
                  <link.icon
                    className={cn(
                      "w-5 h-5 shrink-0",
                      isActive ? "text-violet-light" : ""
                    )}
                  />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="text-sm font-medium overflow-hidden whitespace-nowrap"
                      >
                        {link.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-dark-border space-y-1">
          <Link href="/">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-dark-text-secondary hover:text-white hover:bg-white/5 transition-all">
              <LogOut className="w-5 h-5 shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium">Back to App</span>
              )}
            </div>
          </Link>

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center py-2 rounded-xl text-dark-text-secondary hover:text-white hover:bg-white/5 transition-all"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <motion.main
        animate={{ marginLeft: collapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
        className="flex-1 min-h-screen"
      >
        <div className="p-8">{children}</div>
      </motion.main>
    </div>
  );
}
