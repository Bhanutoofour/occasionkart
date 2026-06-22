"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("support@occasionkart.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isResetPending, setIsResetPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsPending(true);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/admin",
      });

      if (result.error) {
        setError(result.error.message ?? "Unable to sign in as admin.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  };

  const handleForgotPassword = async () => {
    setResetError("");
    setResetMessage("");

    if (!email.trim()) {
      setResetError("Enter the admin email first, then request a reset link.");
      return;
    }

    setIsResetPending(true);
    try {
      const response = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const payload = (await response.json()) as {
        data?: {
          message?: string;
        };
        error?: string;
      };

      if (!response.ok) {
        setResetError(payload.error ?? "Unable to send reset link right now.");
        return;
      }

      setResetMessage(
        payload.data?.message ?? "If an admin account exists for this email, a reset link has been sent.",
      );
    } finally {
      setIsResetPending(false);
    }
  };

  return (
    <div className="mx-auto max-w-[560px] rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.08)] sm:p-8">
      <p className="section-kicker">Admin</p>
      <h1 className="mt-3 text-[2rem] font-semibold text-black">Admin Login</h1>
      <p className="mt-2 text-[1rem] text-[#6c7396]">
        Sign in with the approved admin email and password.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-[0.9rem] font-semibold text-stone-900" htmlFor="admin-email">
            Admin Email
          </label>
          <input
            id="admin-email"
            type="email"
            value={email}
            required
            autoComplete="email"
            className="w-full rounded-[12px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[0.9rem] font-semibold text-stone-900" htmlFor="admin-password">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            required
            autoComplete="current-password"
            className="w-full rounded-[12px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={isResetPending}
            className="text-[0.88rem] font-semibold text-[#ef7f41] disabled:opacity-70"
          >
            {isResetPending ? "Sending reset link..." : "Forgot admin password?"}
          </button>
        </div>

        {error ? (
          <p className="rounded-[12px] bg-[#fff3f0] px-4 py-3 text-[0.95rem] text-[#b93815]">
            {error}
          </p>
        ) : null}

        {resetError ? (
          <p className="rounded-[12px] bg-[#fff3f0] px-4 py-3 text-[0.95rem] text-[#b93815]">
            {resetError}
          </p>
        ) : null}

        {resetMessage ? (
          <p className="rounded-[12px] bg-[#f3fff2] px-4 py-3 text-[0.95rem] text-[#2f8f2f]">
            {resetMessage}
          </p>
        ) : null}

        <button
          disabled={isPending}
          className="w-full rounded-full bg-[#ef7f41] px-6 py-3 text-[1rem] font-semibold text-white disabled:opacity-70"
        >
          {isPending ? "Signing In..." : "Sign In to Admin"}
        </button>
      </form>

    </div>
  );
}
