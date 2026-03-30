"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCheckoutSession } from "@/lib/actions/checkout";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";

interface BuyCourseButtonProps {
  courseId: string;
  price: string;
  label?: string;
  variant?: "default" | "outline";
  planType?: "lifetime" | "subscription";
}

export function BuyCourseButton({
  courseId,
  price,
  label,
  variant = "default",
  planType = "lifetime",
}: BuyCourseButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const handleBuy = async () => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setError("");
    setLoading(true);
    try {
      const url = await createCheckoutSession(courseId, planType);
      window.location.href = url;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start checkout."
      );
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        onClick={handleBuy}
        disabled={loading || authLoading}
        size="lg"
        variant={variant}
        className="w-full"
      >
        {loading
          ? "Redirecting to checkout..."
          : label || `Buy Course — ${price}`}
      </Button>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
