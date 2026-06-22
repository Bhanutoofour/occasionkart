import nodemailer from "nodemailer";

type SendSupportEmailInput = {
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
  to?: string;
};

function getFromEmail() {
  return process.env.ORDER_NOTIFICATION_FROM_EMAIL ?? getSmtpUser();
}

function getSmtpUser() {
  return process.env.GMAIL_USER ?? process.env.SMTP_USER;
}

function getSmtpPass() {
  return process.env.GMAIL_APP_PASSWORD ?? process.env.SMTP_PASS;
}

async function sendViaResend({
  from,
  to,
  subject,
  html,
  text,
  idempotencyKey,
}: {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Support email failed with status ${response.status}`);
  }

  return true;
}

async function sendViaSmtp({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT ?? 465);
  const smtpSecure = (process.env.SMTP_SECURE ?? "true").toLowerCase() === "true";
  const smtpUser = getSmtpUser();
  const smtpPass = getSmtpPass();

  if (!smtpUser || !smtpPass) {
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost ?? "smtp.gmail.com",
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  await transporter.sendMail({
    from: smtpUser,
    to,
    subject,
    html,
    text,
  });

  return true;
}

export async function sendSupportEmail({
  subject,
  html,
  text,
  idempotencyKey,
  to = process.env.ADMIN_PASSWORD_SUPPORT_EMAIL ?? "support@occasionkart.com",
}: SendSupportEmailInput) {
  const from = getFromEmail();
  if (!from) {
    throw new Error("Missing sender email configuration for support email.");
  }

  const errors: string[] = [];

  try {
    const sentBySmtp = await sendViaSmtp({
      to,
      subject,
      html,
      text,
    });

    if (sentBySmtp) {
      return;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`SMTP: ${message}`);
    console.error("Support email SMTP send failed", error);
  }

  try {
    const sentByResend = await sendViaResend({
      from,
      to,
      subject,
      html,
      text,
      idempotencyKey,
    });

    if (sentByResend) {
      return;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`Resend: ${message}`);
    console.error("Support email Resend send failed", error);
  }

  throw new Error(
    errors.length > 0
      ? `All support email providers failed. ${errors.join(" | ")}`
      : "No mail provider configured. Set RESEND_API_KEY or SMTP/GMAIL environment variables.",
  );
}
