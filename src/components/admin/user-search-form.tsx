"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function UserSearchForm({ defaultValue }: { defaultValue: string }) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/admin/users?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/admin/users");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-md">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, email, or UID..."
        className="flex-1 rounded-md border border-border/50 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Search
      </button>
      {defaultValue && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            router.push("/admin/users");
          }}
          className="rounded-md border border-border/50 px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
        >
          Clear
        </button>
      )}
    </form>
  );
}
