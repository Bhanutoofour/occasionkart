"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { SocialLoginButtons } from "@/components/auth/social-login-buttons";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [isForgotPending, setIsForgotPending] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsPending(true);

    try {
      const response = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          callbackURL: "/account",
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        message?: string;
        error?: string;
      } | null;

      if (!response.ok) {
        setError(payload?.message ?? payload?.error ?? "Unable to sign in right now.");
        return;
      }

      router.push("/account");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  };

  const handleForgotPassword = async () => {
    setForgotError("");
    setForgotMessage("");

    if (!email.trim()) {
      setForgotError("Enter your email first, then click forgot password.");
      return;
    }

    setIsForgotPending(true);
    try {
      const response = await fetch("/api/customer/forgot-password", {
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
        setForgotError(payload.error ?? "Unable to send reset request right now.");
        return;
      }

      setForgotMessage(
        payload.data?.message ?? "If an account exists for this email, a reset link has been sent.",
      );
    } finally {
      setIsForgotPending(false);
    }
  };

  return (
    <div className="mx-auto max-w-[560px] rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.08)] sm:p-8">
      <div className="mb-6 grid grid-cols-2 gap-2 rounded-full bg-[#f7f7f9] p-1">
        <span className="rounded-full bg-white px-4 py-2 text-center text-[0.9rem] font-semibold text-stone-950 shadow-sm">
          Sign in
        </span>
        <Link
          href="/register"
          className="rounded-full px-4 py-2 text-center text-[0.9rem] font-semibold text-[#6c7396] transition hover:text-stone-950"
        >
          Create account
        </Link>
      </div>

      <h1 className="text-[2rem] font-semibold text-black">Login</h1>
      <p className="mt-2 text-[1rem] text-[#6c7396]">
        Welcome back. Sign in to manage your orders.
      </p>

      <div className="mt-6">
        <SocialLoginButtons />
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-[0.9rem] font-semibold text-stone-900" htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            required
            autoComplete="email"
            className="w-full rounded-[12px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label
            className="text-[0.9rem] font-semibold text-stone-900"
            htmlFor="login-password"
          >
            Password
          </label>
          <div className="flex items-center justify-between gap-4">
            <input
              id="login-password"
              type="password"
              value={password}
              required
              autoComplete="current-password"
              className="w-full rounded-[12px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={isForgotPending}
            className="text-[0.88rem] font-semibold text-[#ef7f41] disabled:opacity-70"
          >
            {isForgotPending ? "Sending reset link..." : "Forgot password?"}
          </button>
        </div>

        {error ? (
          <p className="rounded-[12px] bg-[#fff3f0] px-4 py-3 text-[0.95rem] text-[#b93815]">
            {error}
          </p>
        ) : null}

        {forgotError ? (
          <p className="rounded-[12px] bg-[#fff3f0] px-4 py-3 text-[0.95rem] text-[#b93815]">
            {forgotError}
          </p>
        ) : null}

        {forgotMessage ? (
          <p className="rounded-[12px] bg-[#f3fff2] px-4 py-3 text-[0.95rem] text-[#2f8f2f]">
            {forgotMessage}
          </p>
        ) : null}

        <button
          disabled={isPending}
          className="w-full rounded-full bg-[#ef7f41] px-6 py-3 text-[1rem] font-semibold text-white disabled:opacity-70"
        >
          {isPending ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <p className="mt-5 text-center text-[0.95rem] text-[#6c7396]">
        New to OccasionKart?{" "}
        <Link href="/register" className="text-[#ef7f41]">
          Create an account
        </Link>
      </p>
    </div>
  );
}
