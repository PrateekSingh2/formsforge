"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface AnimatedBackgroundProps {
  pattern: string;
}

export function AnimatedBackground({ pattern }: AnimatedBackgroundProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Configuration for 15 particles
  const particles = Array.from({ length: 15 });

  // Generate random values for each particle so they don't sync up perfectly
  const getRandomStyles = (index: number) => {
    const randomX = Math.random() * 100; // 0 to 100vw
    const randomY = Math.random() * 100; // 0 to 100vh
    const randomDuration = 10 + Math.random() * 20; // 10s to 30s
    const randomDelay = Math.random() * -20; // Start at random points in animation
    const scale = 0.5 + Math.random() * 1.5;

    return {
      x: `${randomX}vw`,
      y: `${randomY}vh`,
      duration: randomDuration,
      delay: randomDelay,
      scale,
    };
  };

  const getThemeElements = (patternType: string, index: number) => {
    switch (patternType) {
      case "programmer":
        const progIcons = ["{ }", "< />", "js", "ts", "py", "#", "()", "=>"];
        return (
          <div className="text-emerald-500/20 font-mono font-bold text-4xl">
            {progIcons[index % progIcons.length]}
          </div>
        );
      case "healthcare":
        const healthIcons = ["✚", "💊", "🏥", "❤️", "🩺", "💉"];
        return (
          <div className="text-red-500/20 text-4xl">
            {healthIcons[index % healthIcons.length]}
          </div>
        );
      case "education":
        const eduIcons = ["📚", "✏️", "🎓", "🔬", "📐", "🧠"];
        return (
          <div className="opacity-20 text-4xl grayscale hover:grayscale-0 transition-all duration-1000">
            {eduIcons[index % eduIcons.length]}
          </div>
        );
      case "playful":
      default:
        // Abstract shapes (circles, squares, triangles)
        const shapes = [
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500/20 to-pink-500/20 blur-xl"></div>,
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl rotate-12 blur-lg"></div>,
          <div className="w-12 h-12 border-4 border-yellow-500/20 rounded-full blur-[2px]"></div>
        ];
        return shapes[index % shapes.length];
    }
  };

  if (!["programmer", "healthcare", "education", "playful"].includes(pattern)) {
    return null; // Don't render for standard/static themes
  }

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {particles.map((_, i) => {
        const style = getRandomStyles(i);
        return (
          <motion.div
            key={i}
            className="absolute top-0 left-0"
            initial={{
              x: style.x,
              y: style.y,
              scale: style.scale,
              rotate: 0,
            }}
            animate={{
              y: ["-10vh", "110vh"],
              rotate: [0, 360],
              x: [style.x, `calc(${style.x} + ${Math.random() > 0.5 ? '10vw' : '-10vw'})`],
            }}
            transition={{
              duration: style.duration,
              repeat: Infinity,
              ease: "linear",
              delay: style.delay,
            }}
          >
            {getThemeElements(pattern, i)}
          </motion.div>
        );
      })}
    </div>
  );
}
