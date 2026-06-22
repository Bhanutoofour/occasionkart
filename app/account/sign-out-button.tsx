"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    setIsPending(true);
    setError("");

    try {
      const response = await fetch("/api/customer/sign-out", {
        method: "POST",
      });

      if (!response.ok) {
        setError("Unable to sign out right now. Please refresh and try again.");
        return;
      }

      router.push("/");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        disabled={isPending}
        className="rounded-full border border-[rgba(0,0,0,0.12)] px-5 py-3 text-[0.95rem] font-semibold text-stone-900 disabled:opacity-70"
        onClick={handleClick}
      >
        {isPending ? "Signing Out..." : "Sign Out"}
      </button>
      {error ? <p className="mt-2 text-[0.9rem] text-[#b93815]">{error}</p> : null}
    </div>
  );
}
