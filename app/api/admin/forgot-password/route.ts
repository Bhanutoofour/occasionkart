import { randomUUID } from "node:crypto";

import { db } from "@/lib/db";
import { siteSeo } from "@/lib/seo";
import { sendSupportEmail } from "@/lib/server/support-mail";

export const runtime = "nodejs";

type AdminUser = {
  id: string;
  email: string;
  name: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getAllowedAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "support@occasionkart.com")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

async function ensureAdminUserExists(email: string) {
  const existingUser = await db.query<AdminUser>(
    'select id, email, name from "user" where lower(email) = lower($1) limit 1',
    [email],
  );

  if (existingUser.rows[0]) {
    return existingUser.rows[0];
  }

  const user: AdminUser = {
    id: randomUUID(),
    name: "OccasionKart Admin",
    email,
  };

  await db.query(
    `
      insert into "user" (
        id,
        name,
        email,
        "emailVerified",
        "createdAt",
        "updatedAt"
      ) values ($1, $2, $3, true, now(), now())
      on conflict (email) do nothing
    `,
    [user.id, user.name, user.email],
  );

  const savedUser = await db.query<AdminUser>(
    'select id, email, name from "user" where lower(email) = lower($1) limit 1',
    [email],
  );

  return savedUser.rows[0] ?? user;
}

async function createPasswordResetToken(userId: string) {
  const token = randomUUID().replace(/-/g, "");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await db.query(
    `
      insert into verification (
        id,
        identifier,
        value,
        "expiresAt",
        "createdAt",
        "updatedAt"
      ) values ($1, $2, $3, $4, now(), now())
    `,
    [randomUUID(), `reset-password:${token}`, userId, expiresAt],
  );

  return token;
}

async function sendAdminPasswordResetEmail(user: AdminUser, token: string) {
  const resetUrl = new URL("/reset-password", siteSeo.siteUrl);
  resetUrl.searchParams.set("token", token);
  resetUrl.searchParams.set("mode", "admin");

  await sendSupportEmail({
    to: user.email,
    subject: "Reset your OccasionKart admin password",
    html: `
      <div style="font-family:Segoe UI,Trebuchet MS,sans-serif;color:#2b1812;">
        <h2 style="margin-bottom:8px;">Reset your admin password</h2>
        <p style="margin:0 0 16px;">Hi ${user.name}, use the button below to reset your OccasionKart admin password.</p>
        <p style="margin:0 0 20px;">
          <a href="${resetUrl.toString()}" style="display:inline-block;border-radius:999px;background:#ef7f41;color:#fff;padding:12px 20px;text-decoration:none;font-weight:700;">
            Reset Password
          </a>
        </p>
        <p style="margin:0;color:#6c7396;">This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
      </div>
    `,
    text: [
      "Reset your OccasionKart admin password",
      "",
      `Hi ${user.name}, use this link to reset your admin password:`,
      resetUrl.toString(),
      "",
      "This link expires in 1 hour. If you did not request this, you can ignore this email.",
    ].join("\n"),
    idempotencyKey: `admin-password-reset-${user.id}-${token}`,
  });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { email?: string };
    const email = payload.email?.trim().toLowerCase() ?? "";

    if (!email || !isValidEmail(email)) {
      return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (!getAllowedAdminEmails().includes(email)) {
      return Response.json(
        { error: "This email is not allowed for admin password reset." },
        { status: 403 },
      );
    }

    const user = await ensureAdminUserExists(email);
    const token = await createPasswordResetToken(user.id);
    await sendAdminPasswordResetEmail(user, token);

    return Response.json({
      data: {
        message:
          "If the admin account exists, a reset link has been sent to the admin email.",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Admin forgot password request failed", error);
    return Response.json(
      {
        error: message.toLowerCase().includes("email") || message.toLowerCase().includes("mail")
          ? "Email provider rejected the reset email. Please check the Vercel mail environment variables."
          : "Unable to send reset request right now. Please try again shortly.",
      },
      { status: 500 },
    );
  }
}
