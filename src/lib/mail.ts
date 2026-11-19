import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null = null;

function getTransporter() {
  if (!process.env.SMTP_HOST) return null;
  transporter ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  return transporter;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Strip CR/LF so user input can never inject extra email headers. */
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

/**
 * Send a notification email to the doctor (NOTIFY_EMAIL).
 * If SMTP isn't configured the message is logged instead. Never throws –
 * a failed email must not lose the visitor's message (it's already saved).
 */
export async function notifyAdmin({ subject, rows, replyTo }: { subject: string; rows: [string, string][]; replyTo?: string }) {
  const to = process.env.NOTIFY_EMAIL;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px">
      <h2 style="color:#26402c;font-family:Georgia,serif">${esc(subject)}</h2>
      <table style="border-collapse:collapse;width:100%">
        ${rows
          .map(([k, v]) => `<tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;vertical-align:top;width:140px">${esc(k)}</td><td style="padding:8px;border-bottom:1px solid #eee;white-space:pre-wrap">${esc(v)}</td></tr>`)
          .join("")}
      </table>
      <p style="color:#888;font-size:12px;margin-top:20px">Sent from your website. Open the admin panel to manage it.</p>
    </div>`;

  const t = getTransporter();
  if (!t || !to) {
    console.info(`[mail] (not sent – SMTP_HOST / NOTIFY_EMAIL not configured)\n${subject}\n${text}`);
    return { sent: false };
  }
  try {
    await t.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to,
      subject: oneLine(subject),
      text,
      html,
      ...(replyTo ? { replyTo: oneLine(replyTo) } : {}),
    });
    return { sent: true };
  } catch (e) {
    console.error("[mail] failed:", (e as Error).message);
    return { sent: false };
  }
}
