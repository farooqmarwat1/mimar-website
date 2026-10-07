export type ContactLead = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  service?: string;
  source?: string;
  message: string;
};

const NOT_GIVEN = "Not specified";

// Visitor-supplied text ends up in the email subject and HTML body, so strip
// control characters from single-line values and escape everything in HTML.
function singleLine(value: string) {
  return value.replace(/[\u0000-\u001f\u007f]+/g, " ").trim();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildLeadEmail(lead: ContactLead) {
  const name = singleLine(`${lead.firstName} ${lead.lastName}`);
  const service = singleLine(lead.service ?? "");
  const rows: [string, string][] = [
    ["Name", name],
    ["Email", singleLine(lead.email)],
    ["Phone", singleLine(lead.phone ?? "") || NOT_GIVEN],
    ["Service", service || NOT_GIVEN],
    ["Heard about us via", singleLine(lead.source ?? "") || NOT_GIVEN],
  ];

  const subject = `New website enquiry from ${name}${service ? ` - ${service}` : ""}`;

  const text = [
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Message:",
    lead.message,
    "",
    "Reply to this email to answer the sender directly.",
  ].join("\n");

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#111">
<h2 style="margin:0 0 16px;font-size:18px">New website enquiry</h2>
<table style="border-collapse:collapse">
${rows
  .map(
    ([label, value]) =>
      `<tr><td style="padding:4px 16px 4px 0;color:#666;vertical-align:top">${escapeHtml(label)}</td><td style="padding:4px 0">${escapeHtml(value)}</td></tr>`,
  )
  .join("\n")}
</table>
<p style="margin:20px 0 6px;color:#666">Message</p>
<div style="white-space:pre-wrap;border-left:3px solid #ccc;padding-left:12px">${escapeHtml(lead.message)}</div>
<p style="margin:24px 0 0;color:#888;font-size:13px">Reply to this email to answer the sender directly.</p>
</div>`;

  return { subject, text, html };
}
