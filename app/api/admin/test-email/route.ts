import { getAdminSession } from "@/lib/admin-auth";
import { sendSupportEmail } from "@/lib/server/support-mail";

export const runtime = "nodejs";

export async function POST() {
  const { session, isAdmin } = await getAdminSession();

  if (!isAdmin || !session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requestedAt = new Date().toISOString();

  try {
    await sendSupportEmail({
      to: session.user.email,
      subject: "OccasionKart email test",
      html: `
        <div style="font-family:Segoe UI,Trebuchet MS,sans-serif;color:#2b1812;">
          <h2>Email test successful</h2>
          <p>This email was sent from OccasionKart production mail configuration.</p>
          <p><strong>Requested at:</strong> ${requestedAt}</p>
        </div>
      `,
      text: [
        "OccasionKart email test",
        "",
        "This email was sent from OccasionKart production mail configuration.",
        `Requested at: ${requestedAt}`,
      ].join("\n"),
      idempotencyKey: `admin-test-email-${session.user.id}-${requestedAt}`,
    });

    return Response.json({ data: { sent: true } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send test email.";
    console.error("Admin test email failed", error);
    return Response.json({ error: message }, { status: 500 });
  }
}
