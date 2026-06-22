import { betterAuth } from "better-auth";

import { db } from "@/lib/db";
import { siteSeo } from "@/lib/seo";
import { sendSupportEmail } from "@/lib/server/support-mail";

const fallbackSecret = "dev-only-better-auth-secret-change-me-1234";
const fallbackBaseUrl = "http://localhost:3000";

function getAuthBaseUrl() {
  const configuredBaseUrl = process.env.BETTER_AUTH_URL;

  if (
    process.env.NODE_ENV === "production" &&
    configuredBaseUrl?.includes("localhost")
  ) {
    return siteSeo.siteUrl;
  }

  return configuredBaseUrl ?? (process.env.NODE_ENV === "production" ? siteSeo.siteUrl : fallbackBaseUrl);
}

function getTrustedOrigins() {
  return [
    siteSeo.siteUrl,
    "https://occasionkart.com",
    "https://www.occasionkart.com",
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined,
    process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : undefined,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ].filter((origin): origin is string => {
    if (!origin) {
      return false;
    }

    return process.env.NODE_ENV !== "production" || !origin.includes("localhost");
  });
}

function getSocialProviders() {
  const providers: Parameters<typeof betterAuth>[0]["socialProviders"] = {};

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.google = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    };
  }

  if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
    providers.facebook = {
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    };
  }

  return providers;
}

export const auth = betterAuth({
  database: db,
  baseURL: getAuthBaseUrl(),
  trustedOrigins: getTrustedOrigins(),
  secret: process.env.BETTER_AUTH_SECRET ?? fallbackSecret,
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, token }) => {
      const resetUrl = new URL("/reset-password", siteSeo.siteUrl);
      resetUrl.searchParams.set("token", token);
      const passwordResetUrl = resetUrl.toString();
      const subject = "Reset your OccasionKart password";
      const html = `
        <div style="font-family:Segoe UI,Trebuchet MS,sans-serif;color:#2b1812;">
          <h2 style="margin-bottom:8px;">Reset your password</h2>
          <p style="margin:0 0 16px;">
            We received a request to reset your OccasionKart account password.
          </p>
          <p style="margin:0 0 20px;">
            <a href="${passwordResetUrl}" style="display:inline-block;border-radius:999px;background:#ef7f41;color:#fff;padding:12px 20px;text-decoration:none;font-weight:700;">
              Reset Password
            </a>
          </p>
          <p style="margin:0;color:#6c7396;">
            If you did not request this, you can ignore this email.
          </p>
        </div>
      `;
      const text = [
        "Reset your OccasionKart password",
        "",
        "We received a request to reset your OccasionKart account password.",
        `Reset password: ${passwordResetUrl}`,
        "",
        "If you did not request this, you can ignore this email.",
      ].join("\n");

      await sendSupportEmail({
        to: user.email,
        subject,
        html,
        text,
        idempotencyKey: `customer-password-reset-${user.id}-${token}`,
      });
    },
  },
  socialProviders: getSocialProviders(),
  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: false,
      },
    },
  },
});
