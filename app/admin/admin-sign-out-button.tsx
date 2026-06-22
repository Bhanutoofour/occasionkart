"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminSignOutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    setIsPending(true);

    try {
      await fetch("/api/customer/sign-out", {
        method: "POST",
      });

      router.push("/admin-login");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleClick}
      className="rounded-full border border-[rgba(255,255,255,0.18)] px-4 py-2 text-[0.88rem] font-semibold text-white transition hover:bg-white hover:text-[#1f2731] disabled:opacity-70"
    >
      {isPending ? "Signing out..." : "Sign Out"}
    </button>
  );
}
