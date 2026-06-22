import { sendSupportEmail } from "@/lib/server/support-mail";

export const runtime = "nodejs";

type InquiryEntry = {
  label?: unknown;
  value?: unknown;
};

type InquiryPayload = {
  subject?: unknown;
  intro?: unknown;
  entries?: unknown;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function parseEntries(entries: unknown) {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries
    .map((entry: InquiryEntry) => ({
      label: isNonEmptyString(entry.label) ? entry.label.trim() : "",
      value: isNonEmptyString(entry.value) ? entry.value.trim() : "",
    }))
    .filter((entry) => entry.label && entry.value)
    .slice(0, 20);
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as InquiryPayload;
    const subject = isNonEmptyString(payload.subject)
      ? payload.subject.trim().slice(0, 160)
      : "OccasionKart Customer Enquiry";
    const intro = isNonEmptyString(payload.intro)
      ? payload.intro.trim().slice(0, 500)
      : "New OccasionKart inquiry received.";
    const entries = parseEntries(payload.entries);

    if (entries.length === 0) {
      return Response.json(
        { error: "Please enter at least one detail before sending." },
        { status: 400 },
      );
    }

    const submittedAt = new Date().toISOString();
    const htmlRows = entries
      .map(
        (entry) => `
          <tr>
            <td style="padding:10px 12px;border-bottom:1px solid #f0e3dc;font-weight:700;color:#2b1812;">${escapeHtml(entry.label)}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #f0e3dc;color:#4d3128;">${escapeHtml(entry.value)}</td>
          </tr>
        `,
      )
      .join("");
    const text = [
      intro,
      "",
      ...entries.map((entry) => `${entry.label}: ${entry.value}`),
      "",
      `Submitted at: ${submittedAt}`,
    ].join("\n");

    await sendSupportEmail({
      subject,
      html: `
        <div style="font-family:Segoe UI,Trebuchet MS,sans-serif;color:#2b1812;">
          <h2 style="margin:0 0 12px;">${escapeHtml(subject)}</h2>
          <p style="margin:0 0 18px;color:#6c4a3f;">${escapeHtml(intro)}</p>
          <table style="width:100%;border-collapse:collapse;border:1px solid #f0e3dc;">
            <tbody>${htmlRows}</tbody>
          </table>
          <p style="margin:18px 0 0;color:#80675d;">Submitted at: ${escapeHtml(submittedAt)}</p>
        </div>
      `,
      text,
      idempotencyKey: `inquiry-${crypto.randomUUID()}`,
    });

    return Response.json({ data: { sent: true } });
  } catch (error) {
    console.error("Inquiry email failed", error);
    return Response.json(
      { error: "Unable to send your inquiry right now. Please try WhatsApp or call support." },
      { status: 500 },
    );
  }
}
