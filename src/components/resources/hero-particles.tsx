"use client";

import { useEffect, useRef } from "react";

const ICONS = ["✨", "💜", "🎮", "🎵", "⭐", "👑", "💬", "🎤", "🩷", "🌸", "🎀", "💫"];

interface FloatingIcon {
  x: number;
  y: number;
  vx: number;
  vy: number;
  icon: string;
  size: number;
  opacity: number;
  spin: number;
  spinSpeed: number;
  phase: number;
}

export function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resize();

    const count = 18;
    const icons: FloatingIcon[] = [];

    const spawnIcon = (randomY = false): FloatingIcon => ({
      x: Math.random() * canvas.width,
      y: randomY ? Math.random() * canvas.height : canvas.height + 20,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(Math.random() * 0.3 + 0.15),
      icon: ICONS[Math.floor(Math.random() * ICONS.length)],
      size: Math.random() * 10 + 14,
      opacity: Math.random() * 0.25 + 0.1,
      spin: (Math.random() - 0.5) * 0.3,
      spinSpeed: (Math.random() - 0.5) * 0.008,
      phase: Math.random() * Math.PI * 2,
    });

    // Initial spread across the canvas
    for (let i = 0; i < count; i++) {
      icons.push(spawnIcon(true));
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    canvas.addEventListener("mousemove", handleMouseMove, { passive: true });
    canvas.addEventListener("mouseleave", handleMouseLeave);

    let time = 0;
    let isVisible = true;

    // Pause animation when scrolled out of view
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animRef.current) {
          animRef.current = requestAnimationFrame(animate);
        }
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(canvas);

    const animate = () => {
      if (!isVisible) {
        animRef.current = 0;
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mouse = mouseRef.current;
      time += 0.015;

      for (let i = 0; i < icons.length; i++) {
        const ic = icons[i];

        // Mouse repulsion
        const dx = ic.x - mouse.x;
        const dy = ic.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120;
          ic.vx += (dx / dist) * force * 0.4;
          ic.vy += (dy / dist) * force * 0.4;
        }

        // Gentle horizontal sway
        ic.vx += Math.sin(time + ic.phase) * 0.008;

        ic.vx *= 0.985;
        ic.vy *= 0.985;
        // Keep a minimum upward drift
        if (ic.vy > -0.1) ic.vy = -0.1;

        ic.x += ic.vx;
        ic.y += ic.vy;
        ic.spin += ic.spinSpeed;

        // Wrap horizontally
        if (ic.x < -30) ic.x = canvas.width + 30;
        if (ic.x > canvas.width + 30) ic.x = -30;

        // Respawn at bottom when off top
        if (ic.y < -30) {
          icons[i] = spawnIcon(false);
          continue;
        }

        // Fade in near bottom, fade out near top
        const fadeIn = Math.min(1, (canvas.height - ic.y) / 80);
        const fadeOut = Math.min(1, ic.y / 60);
        const alpha = ic.opacity * fadeIn * fadeOut;

        ctx.save();
        ctx.translate(ic.x, ic.y);
        ctx.rotate(ic.spin);
        ctx.globalAlpha = alpha;
        ctx.font = `${ic.size}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(ic.icon, 0, 0);
        ctx.restore();
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas.parentElement!);

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ pointerEvents: "auto" }}
    />
  );
}
