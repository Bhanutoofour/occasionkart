import { randomUUID } from "node:crypto";

import { db } from "@/lib/db";
import { siteSeo } from "@/lib/seo";
import { sendSupportEmail } from "@/lib/server/support-mail";

export const runtime = "nodejs";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { email?: string };
    const email = payload.email?.trim().toLowerCase() ?? "";

    if (!email || !isValidEmail(email)) {
      return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const existingUser = await db.query<{ id: string; email: string; name: string }>(
      'select id, email, name from "user" where lower(email) = lower($1) limit 1',
      [email],
    );

    const user = existingUser.rows[0];

    if (!user) {
      return Response.json(
        { error: "No customer account exists for this email." },
        { status: 404 },
      );
    }

    const token = randomUUID().replace(/-/g, "");
    const resetUrl = new URL("/reset-password", siteSeo.siteUrl);
    resetUrl.searchParams.set("token", token);
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
      [randomUUID(), `reset-password:${token}`, user.id, expiresAt],
    );

    await sendSupportEmail({
      to: user.email,
      subject: "Reset your OccasionKart password",
      html: `
        <div style="font-family:Segoe UI,Trebuchet MS,sans-serif;color:#2b1812;">
          <h2 style="margin-bottom:8px;">Reset your password</h2>
          <p style="margin:0 0 16px;">Hi ${user.name}, use the button below to reset your OccasionKart account password.</p>
          <p style="margin:0 0 20px;">
            <a href="${resetUrl.toString()}" style="display:inline-block;border-radius:999px;background:#ef7f41;color:#fff;padding:12px 20px;text-decoration:none;font-weight:700;">
              Reset Password
            </a>
          </p>
          <p style="margin:0;color:#6c7396;">This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
        </div>
      `,
      text: [
        "Reset your OccasionKart password",
        "",
        `Hi ${user.name}, use this link to reset your password:`,
        resetUrl.toString(),
        "",
        "This link expires in 1 hour. If you did not request this, you can ignore this email.",
      ].join("\n"),
      idempotencyKey: `customer-password-reset-${user.id}-${token}`,
    });

    return Response.json({
      data: {
        message: "If an account exists for this email, a reset link has been sent.",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Customer forgot password request failed", error);
    return Response.json(
      {
        error: message.toLowerCase().includes("email") || message.toLowerCase().includes("mail")
          ? "Email provider rejected the reset email. Please contact support."
          : "Unable to send reset request right now. Please try again shortly.",
      },
      { status: 500 },
    );
  }
}
