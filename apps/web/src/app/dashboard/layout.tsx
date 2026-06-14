// ============================================================================
// DASHBOARD LAYOUT
// ============================================================================

"use client";

import { useAuth } from "@/providers/auth-provider";
import { redirect } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { LayoutDashboard, Users, Settings, Plus, LogOut, Star, Webhook } from "lucide-react";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  if (loading) return <div className="min-h-screen bg-[#FCFBF8] flex items-center justify-center font-balsamiq text-xl">Loading...</div>;
  if (!user) return redirect("/login");

  const navItems = [
    { name: "My Forms", href: "/dashboard", icon: LayoutDashboard },
    { name: "Templates", href: "/dashboard/templates", icon: Star },
    { name: "Audiences", href: "/dashboard/audiences", icon: Users },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FCFBF8] flex">
      {/* Sidebar */}
      <aside className="w-64 border-r-2 border-gray-200 bg-white flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b-2 border-dashed border-gray-200">
          <Link href="/" className="inline-flex items-center gap-2 text-[#8B5CF6]">
            <Star className="w-5 h-5 fill-current" />
            <span className="font-balsamiq font-bold text-xl">FormForge</span>
          </Link>
        </div>

        <div className="flex-1 p-4 space-y-2 font-comic">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  isActive ? "bg-[#8B5CF6] text-white shadow-[2px_2px_0px_#333333] border-2 border-[#333333]" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}>
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t-2 border-gray-200">
          <Link href="/builder" className="w-full flex items-center justify-center gap-2 py-3 bg-[#34D399] border-2 border-[#333333] rounded-xl font-balsamiq font-bold text-[#333333] shadow-[2px_2px_0px_#333333] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#333333] active:translate-y-[2px] active:shadow-none transition-all mb-4">
            <Plus className="w-5 h-5" /> New Form
          </Link>
          
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#E9D5FF] border-2 border-[#8B5CF6] flex items-center justify-center font-balsamiq font-bold text-[#8B5CF6]">
              {user.displayName?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-balsamiq font-bold text-sm text-[#333333] truncate">{user.displayName}</p>
              <p className="font-comic text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>

          <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2 text-sm font-comic font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="h-16 flex items-center px-8 border-b border-gray-200 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          <h2 className="font-balsamiq font-bold text-xl text-[#333333]">Dashboard</h2>
        </div>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
