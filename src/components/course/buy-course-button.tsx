"use client";

import { useState } from "react";
import { createCheckoutSession } from "@/lib/actions/checkout";
import { Button } from "@/components/ui/button";

interface BuyCourseButtonProps {
  courseId: string;
  price: string;
  priceId?: string;
  label?: string;
  variant?: "default" | "outline";
}

export function BuyCourseButton({
  courseId,
  price,
  priceId,
  label,
  variant = "default",
}: BuyCourseButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBuy = async () => {
    setError("");
    setLoading(true);
    try {
      const url = await createCheckoutSession(courseId, priceId);
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
        disabled={loading}
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
