"use client";

import { useEffect, useRef, useCallback } from "react";

const TURNSTILE_SCRIPT_ID = "cf-turnstile-script";
const TURNSTILE_SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
}

/**
 * Cloudflare Turnstile widget. Renders an invisible/managed challenge
 * and calls onVerify with a token on success.
 *
 * Requires NEXT_PUBLIC_TURNSTILE_SITE_KEY env var.
 */
export function Turnstile({ onVerify, onExpire, onError }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onVerifyRef.current = onVerify;
    onExpireRef.current = onExpire;
    onErrorRef.current = onError;
  });

  const renderWidget = useCallback(() => {
    if (
      !containerRef.current ||
      widgetIdRef.current !== null ||
      !window.turnstile
    )
      return;

    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) return;

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: (token: string) => onVerifyRef.current(token),
      "expired-callback": () => onExpireRef.current?.(),
      "error-callback": () => onErrorRef.current?.(),
      theme: "auto",
      size: "flexible",
    });
  }, []);

  useEffect(() => {
    // If script already loaded, render immediately
    if (window.turnstile) {
      renderWidget();
      return;
    }

    // If script tag already exists, wait for it to load
    if (document.getElementById(TURNSTILE_SCRIPT_ID)) {
      const check = setInterval(() => {
        if (window.turnstile) {
          clearInterval(check);
          renderWidget();
        }
      }, 100);
      return () => clearInterval(check);
    }

    // Load the script
    const script = document.createElement("script");
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = TURNSTILE_SCRIPT_URL;
    script.async = true;
    script.onload = () => renderWidget();
    document.head.appendChild(script);

    return () => {
      if (widgetIdRef.current !== null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [renderWidget]);

  return <div ref={containerRef} />;
}

// Extend Window for Turnstile global
declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: Record<string, unknown>
      ) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}
