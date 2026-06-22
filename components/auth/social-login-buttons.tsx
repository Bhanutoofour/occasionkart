"use client";

import { useState } from "react";

import { authClient } from "@/lib/auth-client";

type SocialProvider = "google" | "facebook";

const providers: {
  provider: SocialProvider;
  label: string;
  enabled: boolean;
}[] = [
  {
    provider: "google",
    label: "Continue with Google",
    enabled: process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true",
  },
  {
    provider: "facebook",
    label: "Continue with Facebook",
    enabled: process.env.NEXT_PUBLIC_FACEBOOK_AUTH_ENABLED === "true",
  },
];

function SocialProviderIcon({ provider }: { provider: SocialProvider }) {
  if (provider === "google") {
    return (
      <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
      <path
        fill="#1877F2"
        d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07c0 6.02 4.39 11.01 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.96.93-1.96 1.89v2.27h3.33l-.53 3.49h-2.8V24C19.61 23.08 24 18.09 24 12.07z"
      />
      <path
        fill="#fff"
        d="m16.67 15.56.53-3.49h-3.33V9.8c0-.96.47-1.89 1.96-1.89h1.51V4.95s-1.37-.24-2.68-.24c-2.74 0-4.53 1.67-4.53 4.7v2.66H7.08v3.49h3.05V24a12.22 12.22 0 0 0 3.74 0v-8.44h2.8z"
      />
    </svg>
  );
}

export function SocialLoginButtons() {
  const [pendingProvider, setPendingProvider] = useState<SocialProvider | null>(null);
  const [error, setError] = useState("");
  const enabledProviders = providers.filter((provider) => provider.enabled);

  if (enabledProviders.length === 0) {
    return null;
  }

  const signInWithProvider = async (provider: SocialProvider) => {
    setError("");
    setPendingProvider(provider);

    try {
      const result = await authClient.signIn.social({
        provider,
        callbackURL: "/account",
        newUserCallbackURL: "/account",
        errorCallbackURL: "/login",
      });

      if (result.error) {
        setError(result.error.message ?? "Unable to start social login right now.");
        setPendingProvider(null);
      }
    } catch {
      setError("Unable to start social login right now.");
      setPendingProvider(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-[rgba(0,0,0,0.12)]" />
        <span className="text-[0.82rem] font-semibold uppercase text-[#6c7396]">
          Or use
        </span>
        <span className="h-px flex-1 bg-[rgba(0,0,0,0.12)]" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {enabledProviders.map((item) => {
          const isPending = pendingProvider === item.provider;

          return (
            <button
              key={item.provider}
              type="button"
              disabled={pendingProvider !== null}
              onClick={() => signInWithProvider(item.provider)}
              className="flex min-h-12 items-center justify-center gap-3 rounded-full border border-[rgba(0,0,0,0.14)] bg-white px-4 py-3 text-[0.95rem] font-semibold text-stone-900 transition duration-200 hover:border-stone-900 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f7f7f9]">
                <SocialProviderIcon provider={item.provider} />
              </span>
              {isPending ? "Connecting..." : item.label}
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="rounded-[12px] bg-[#fff3f0] px-4 py-3 text-[0.95rem] text-[#b93815]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
