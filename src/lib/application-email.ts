import { escapeHtml, singleLine } from "@/lib/contact-email";

export type ApplicationEmailInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  portfolioUrl: string;
  message: string;
};

const NOT_GIVEN = "Not given";

/** The notification HR receives. Applicant text is stripped of control characters and HTML-escaped, like the contact email. */
export function buildApplicationEmail(app: ApplicationEmailInput) {
  const name = singleLine(`${app.firstName} ${app.lastName}`);
  const role = singleLine(app.role);
  const portfolio = singleLine(app.portfolioUrl);
  const rows: [string, string][] = [
    ["Name", name],
    ["Email", singleLine(app.email)],
    ["Phone", singleLine(app.phone ?? "") || NOT_GIVEN],
    ["Applying for", role],
    ["CV / portfolio", portfolio],
  ];

  const subject = `New job application from ${name} - ${role}`;

  const text = [
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Cover note:",
    app.message,
    "",
    "Reply to this email to answer the applicant directly. The application is also saved in /admin/applications.",
  ].join("\n");

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#111">
<h2 style="margin:0 0 16px;font-size:18px">New job application</h2>
<table style="border-collapse:collapse">
${rows
  .map(
    ([label, value]) =>
      `<tr><td style="padding:4px 16px 4px 0;color:#666;vertical-align:top">${escapeHtml(label)}</td><td style="padding:4px 0">${escapeHtml(value)}</td></tr>`,
  )
  .join("\n")}
</table>
<p style="margin:20px 0 6px;color:#666">Cover note</p>
<div style="white-space:pre-wrap;border-left:3px solid #ccc;padding-left:12px">${escapeHtml(app.message)}</div>
<p style="margin:24px 0 0;color:#888;font-size:13px">Reply to this email to answer the applicant directly. The application is also saved in /admin/applications.</p>
</div>`;

  return { subject, text, html };
}

/** Auto-reply to the applicant. Does not repeat their text back: the address is unverified input. */
export function buildApplicationConfirmation(app: Pick<ApplicationEmailInput, "firstName">, hrEmail: string) {
  const name = singleLine(app.firstName);
  const subject = "We received your application - Mimar Studios";

  const text = [
    `Hi ${name},`,
    "",
    "Thank you for applying to Mimar Studios. We have received your application and our team will review it. If there is a suitable opening, we will be in touch.",
    "",
    `If you need to add anything, reply to this email or write to ${hrEmail}.`,
    "",
    "Mimar Studios",
  ].join("\n");

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#111">
<p>Hi ${escapeHtml(name)},</p>
<p>Thank you for applying to Mimar Studios. We have received your application and our team will review it. If there is a suitable opening, we will be in touch.</p>
<p>If you need to add anything, reply to this email or write to <a href="mailto:${escapeHtml(hrEmail)}">${escapeHtml(hrEmail)}</a>.</p>
<p style="margin-top:24px">Mimar Studios</p>
</div>`;

  return { subject, text, html };
}
