"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
type RegisterValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
};

const initialValues: RegisterValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
};

export function RegisterForm() {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const updateValue = (key: keyof RegisterValues, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsPending(true);

    try {
      const fullName = `${values.firstName} ${values.lastName}`.trim();
      const response = await fetch("/api/auth/sign-up/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName,
          email: values.email,
          password: values.password,
          phone: values.phone.trim() || undefined,
          callbackURL: "/account",
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        message?: string;
        error?: string;
      } | null;

      if (!response.ok) {
        setError(payload?.message ?? payload?.error ?? "Unable to create your account.");
        return;
      }

      router.push("/account");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="mx-auto max-w-[620px] rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-8 shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
      <h1 className="text-[2rem] font-semibold text-black">Create Account</h1>
      <p className="mt-2 text-[1rem] text-[#6c7396]">
        Join OccasionKart to track orders and save delivery addresses.
      </p>

      <form className="mt-6" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-[0.9rem] font-semibold text-stone-900" htmlFor="first-name">
              First Name
            </label>
            <input
              id="first-name"
              required
              value={values.firstName}
              className="w-full rounded-[12px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
              onChange={(event) => updateValue("firstName", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[0.9rem] font-semibold text-stone-900" htmlFor="last-name">
              Last Name
            </label>
            <input
              id="last-name"
              value={values.lastName}
              className="w-full rounded-[12px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
              onChange={(event) => updateValue("lastName", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[0.9rem] font-semibold text-stone-900" htmlFor="register-email">
              Email
            </label>
            <input
              id="register-email"
              type="email"
              required
              autoComplete="email"
              value={values.email}
              className="w-full rounded-[12px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
              onChange={(event) => updateValue("email", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[0.9rem] font-semibold text-stone-900" htmlFor="register-phone">
              Phone Number
            </label>
            <input
              id="register-phone"
              type="tel"
              autoComplete="tel"
              value={values.phone}
              className="w-full rounded-[12px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
              onChange={(event) => updateValue("phone", event.target.value)}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label
              className="text-[0.9rem] font-semibold text-stone-900"
              htmlFor="register-password"
            >
              Password
            </label>
            <input
              id="register-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={values.password}
              className="w-full rounded-[12px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
              onChange={(event) => updateValue("password", event.target.value)}
            />
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-[12px] bg-[#fff3f0] px-4 py-3 text-[0.95rem] text-[#b93815]">
            {error}
          </p>
        ) : null}

        <button
          disabled={isPending}
          className="mt-6 w-full rounded-full bg-[#ef7f41] px-6 py-3 text-[1rem] font-semibold text-white disabled:opacity-70"
        >
          {isPending ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <div className="mt-6">
        <SocialLoginButtons />
      </div>

      <p className="mt-5 text-center text-[0.95rem] text-[#6c7396]">
        Already have an account?{" "}
        <Link href="/login" className="text-[#ef7f41]">
          Sign in
        </Link>
      </p>
    </div>
  );
}
