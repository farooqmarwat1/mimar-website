export type ContactLead = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  service?: string;
  source?: string;
  message: string;
  /** "quote" for the "Get a quote" pop-up; the contact page form otherwise. */
  formType?: "contact" | "quote";
  organisation?: string;
};

const NOT_GIVEN = "Not specified";

// Visitor-supplied text ends up in the email subject and HTML body, so strip
// control characters from single-line values and escape everything in HTML.
export function singleLine(value: string) {
  return value.replace(/[\u0000-\u001f\u007f]+/g, " ").trim();
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Auto-reply sent to the person who submitted the form. Deliberately does not
// repeat their message back: the address is unverified visitor input, so the
// less this email carries, the less use it is for abusing the form.
export function buildConfirmationEmail(lead: Pick<ContactLead, "firstName">, studioEmail: string) {
  const name = singleLine(lead.firstName);
  const subject = "We received your enquiry - Mimar Studios";

  const text = [
    `Hi ${name},`,
    "",
    "Thank you for getting in touch with Mimar Studios. We have received your enquiry and a member of our team will get back to you shortly.",
    "",
    `If you need to add anything, just reply to this email or write to ${studioEmail}.`,
    "",
    "Mimar Studios",
  ].join("\n");

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#111">
<p>Hi ${escapeHtml(name)},</p>
<p>Thank you for getting in touch with Mimar Studios. We have received your enquiry and a member of our team will get back to you shortly.</p>
<p>If you need to add anything, just reply to this email or write to <a href="mailto:${escapeHtml(studioEmail)}">${escapeHtml(studioEmail)}</a>.</p>
<p style="margin-top:24px">Mimar Studios</p>
</div>`;

  return { subject, text, html };
}

export function buildLeadEmail(lead: ContactLead) {
  const quote = lead.formType === "quote";
  const name = singleLine(`${lead.firstName} ${lead.lastName}`);
  const service = singleLine(lead.service ?? "");
  const rows: [string, string][] = [
    ["Name", name],
    ["Email", singleLine(lead.email)],
    ["Phone", singleLine(lead.phone ?? "") || NOT_GIVEN],
    ...(quote ? ([["Company", singleLine(lead.organisation ?? "") || NOT_GIVEN]] as [string, string][]) : []),
    [quote ? "Services" : "Service", service || NOT_GIVEN],
    ...(quote ? [] : ([["Heard about us via", singleLine(lead.source ?? "") || NOT_GIVEN]] as [string, string][])),
  ];

  const kind = quote ? "quote request" : "enquiry";
  const subject = `New website ${kind} from ${name}${service ? ` - ${service}` : ""}`;
  const heading = quote ? "New quote request (Get a quote pop-up)" : "New website enquiry";

  const text = [
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    quote ? "Project description:" : "Message:",
    lead.message,
    "",
    "Reply to this email to answer the sender directly.",
  ].join("\n");

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#111">
<h2 style="margin:0 0 16px;font-size:18px">${heading}</h2>
<table style="border-collapse:collapse">
${rows
  .map(
    ([label, value]) =>
      `<tr><td style="padding:4px 16px 4px 0;color:#666;vertical-align:top">${escapeHtml(label)}</td><td style="padding:4px 0">${escapeHtml(value)}</td></tr>`,
  )
  .join("\n")}
</table>
<p style="margin:20px 0 6px;color:#666">${quote ? "Project description" : "Message"}</p>
<div style="white-space:pre-wrap;border-left:3px solid #ccc;padding-left:12px">${escapeHtml(lead.message)}</div>
<p style="margin:24px 0 0;color:#888;font-size:13px">Reply to this email to answer the sender directly.</p>
</div>`;

  return { subject, text, html };
}
