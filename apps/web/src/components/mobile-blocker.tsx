"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MonitorSmartphone } from "lucide-react";

export function MobileBlocker() {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      // Consider anything under 768px (standard md breakpoint) as mobile
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Don't render anything until hydrated to prevent hydration mismatch
  if (!mounted) return null;

  // Allow public forms to be viewed on mobile
  if (pathname?.startsWith("/f/")) return null;

  // Block everything else
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#FCFBF8] flex flex-col items-center justify-center p-8 text-center bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border-4 border-[#333333] shadow-[8px_8px_0px_#333333] flex flex-col items-center relative overflow-hidden">
          
          {/* Decorative elements */}
          <div className="absolute -top-6 -left-6 w-16 h-16 bg-[#34D399] rounded-full border-2 border-[#333333] opacity-50"></div>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-[#FCD34D] rounded-full border-2 border-[#333333] opacity-50"></div>

          <div className="w-24 h-24 bg-[#E9D5FF] rounded-2xl flex items-center justify-center mb-6 border-4 border-[#333333] shadow-[4px_4px_0px_#333333] transform -rotate-6">
            <MonitorSmartphone className="w-12 h-12 text-[#8B5CF6]" />
          </div>
          
          <h1 className="text-3xl font-balsamiq font-bold text-[#333333] mb-4 relative z-10">
            Oops! Too Small!
          </h1>
          
          <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-xl p-4 mb-2 relative z-10">
            <p className="text-gray-700 font-comic text-lg leading-relaxed font-bold">
              FormForge's powerful builder and dashboard need more room to breathe.
            </p>
          </div>
          
          <p className="text-gray-500 font-comic text-md relative z-10 mt-4">
            Please switch to a <span className="font-bold text-[#8B5CF6]">Desktop</span> or <span className="font-bold text-[#8B5CF6]">Tablet</span> to unleash your creativity!
          </p>
        </div>
      </div>
    );
  }

  return null;
}
