"use client";

import { useState } from "react";
import { createCheckoutSession } from "@/lib/actions/checkout";
import { Button } from "@/components/ui/button";

interface BuyCourseButtonProps {
  courseId: string;
  price: string;
}

export function BuyCourseButton({ courseId, price }: BuyCourseButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBuy = async () => {
    setError("");
    setLoading(true);
    try {
      const url = await createCheckoutSession(courseId);
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
        className="w-full"
      >
        {loading ? "Redirecting to checkout..." : `Buy Course — ${price}`}
      </Button>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
