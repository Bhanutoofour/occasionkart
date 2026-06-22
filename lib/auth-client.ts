"use client";

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

import type { auth } from "@/lib/auth";

function getClientAuthBaseUrl() {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL;

  if (
    process.env.NODE_ENV === "production" &&
    configuredBaseUrl?.includes("localhost")
  ) {
    return undefined;
  }

  return configuredBaseUrl;
}

export const authClient = createAuthClient({
  baseURL: getClientAuthBaseUrl(),
  plugins: [inferAdditionalFields<typeof auth>()],
});
