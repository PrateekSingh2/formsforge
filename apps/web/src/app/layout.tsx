import type { Metadata } from "next";
import { Toaster } from "sonner";
import { TRPCReactProvider } from "@/providers/trpc-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { MobileBlocker } from "@/components/mobile-blocker";
import "../globals.css";

export const metadata: Metadata = {
  title: "FormForge — Create Forms That Feel Alive",
  description:
    "The next-generation form creation platform. Build, customize, publish, and analyze beautiful forms with AI-powered generation, stunning themes, and a vibrant community marketplace.",
  keywords: [
    "form builder",
    "form creator",
    "AI forms",
    "survey builder",
    "custom forms",
    "form templates",
    "form themes",
  ],
  openGraph: {
    title: "FormForge — Create Forms That Feel Alive",
    description:
      "Build stunning forms with drag-and-drop, AI generation, custom themes, and a community marketplace.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Balsamiq+Sans:wght@400;700&family=Comic+Neue:wght@300;400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased font-comic text-[#333333] bg-[#FCFBF8] overflow-x-hidden">
        <TRPCReactProvider>
          <AuthProvider>
            <MobileBlocker />
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  fontFamily: "var(--font-body)",
                  borderRadius: "var(--radius-soft)",
                },
              }}
            />
          </AuthProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
