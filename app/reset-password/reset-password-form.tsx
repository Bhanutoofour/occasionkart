"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ResetPasswordFormProps = {
  token?: string;
  error?: string;
  mode?: string;
};

export function ResetPasswordForm({ token, error: initialError, mode }: ResetPasswordFormProps) {
  const router = useRouter();
  const isAdminReset = mode === "admin";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(initialError ?? "");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("This reset link is missing a valid token. Please request a new link.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsPending(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPassword: password, token }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to reset your password. Please request a new link.");
        return;
      }

      router.push(isAdminReset ? "/admin-login?reset=success" : "/login?reset=success");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="mx-auto max-w-[520px] rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.08)] sm:p-8">
      <h1 className="text-[2rem] font-semibold text-black">Reset Password</h1>
      <p className="mt-2 text-[1rem] text-[#6c7396]">
        Choose a new password for your OccasionKart account.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label
            className="text-[0.9rem] font-semibold text-stone-900"
            htmlFor="new-password"
          >
            New Password
          </label>
          <input
            id="new-password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            className="w-full rounded-[12px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label
            className="text-[0.9rem] font-semibold text-stone-900"
            htmlFor="confirm-password"
          >
            Confirm Password
          </label>
          <input
            id="confirm-password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirmPassword}
            className="w-full rounded-[12px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>

        {error ? (
          <p className="rounded-[12px] bg-[#fff3f0] px-4 py-3 text-[0.95rem] text-[#b93815]">
            {error === "INVALID_TOKEN"
              ? "This reset link is invalid or expired. Please request a new link."
              : error}
          </p>
        ) : null}

        <button
          disabled={isPending || !token}
          className="w-full rounded-full bg-[#ef7f41] px-6 py-3 text-[1rem] font-semibold text-white disabled:opacity-70"
        >
          {isPending ? "Resetting Password..." : "Reset Password"}
        </button>
      </form>

      <p className="mt-5 text-center text-[0.95rem] text-[#6c7396]">
        Remembered your password?{" "}
        <Link href={isAdminReset ? "/admin-login" : "/login"} className="text-[#ef7f41]">
          Sign in
        </Link>
      </p>
    </div>
  );
}
