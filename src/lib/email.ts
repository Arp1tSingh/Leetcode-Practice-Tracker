import { Resend } from "resend";

interface ContactNotificationParams {
  id: string;
  name: string;
  email?: string | null;
  category: string;
  subject: string;
  message: string;
  clientIp?: string | null;
  userId?: string | null;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendContactNotificationEmail(params: ContactNotificationParams) {
  const { id, name, email, category, subject, message, clientIp, userId } = params;

  const apiKey = process.env.RESEND_API_KEY;
  const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || "arpitsingh8534@gmail.com";
  // onboarding@resend.dev is Resend's default sender that allows sending directly to your account email for free without domain verification
  const fromEmail = process.env.RESEND_FROM_EMAIL || "LeetCode Repetition <onboarding@resend.dev>";

  let emailDispatched = false;
  let emailError: string | null = null;

  if (apiKey) {
    try {
      const resend = new Resend(apiKey);
      const categoryUpper = category.toUpperCase();

      const senderEmailDisplay = email
        ? `&bull; <a href="mailto:${escapeHtml(email)}" style="color: #60a5fa; text-decoration: none;">${escapeHtml(email)}</a>`
        : `&bull; <span style="color: #64748b;">No email provided</span>`;

      const quickReplySection = email
        ? `<div style="margin-top: 20px; padding: 12px 16px; background-color: #0c1c38; border: 1px solid #1e3a8a; border-radius: 8px; color: #93c5fd; font-size: 13px;">
            💡 <strong>Direct Reply:</strong> Just hit <strong>Reply</strong> in your email client to respond directly to <strong>${escapeHtml(email)}</strong>.
           </div>`
        : "";

      const emailHtml = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #030712; color: #f3f4f6; margin: 0; padding: 24px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);">
      
      <!-- Header Banner -->
      <div style="background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); padding: 24px; border-bottom: 1px solid #1f2937;">
        <div style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background-color: #312e81; color: #a5b4fc; border-radius: 6px; border: 1px solid #4338ca; margin-bottom: 12px;">
          ${escapeHtml(categoryUpper)}
        </div>
        <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; line-height: 1.3;">
          ${escapeHtml(subject)}
        </h1>
        <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 13px;">
          Sender: <strong style="color: #f1f5f9;">${escapeHtml(name)}</strong> ${senderEmailDisplay}
        </p>
      </div>

      <!-- Message Content -->
      <div style="padding: 24px;">
        <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 8px;">
          Message Content
        </div>
        <div style="background-color: #030712; border: 1px solid #1f2937; border-radius: 8px; padding: 18px; color: #e5e7eb; font-size: 14px; line-height: 1.6; white-space: pre-wrap; word-break: break-word;">${escapeHtml(message)}</div>

        ${quickReplySection}
      </div>

      <!-- Metadata -->
      <div style="background-color: #0b0f17; border-top: 1px solid #1f2937; padding: 16px 24px; font-size: 12px; color: #64748b; line-height: 1.6;">
        <div><strong>Message ID:</strong> ${escapeHtml(id)}</div>
        <div><strong>User ID:</strong> ${escapeHtml(userId || "Anonymous / Not Logged In")}</div>
        <div><strong>IP Address:</strong> ${escapeHtml(clientIp || "Unknown")}</div>
        <div><strong>Received:</strong> ${new Date().toUTCString()}</div>
      </div>

    </div>
  </body>
</html>`;

      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [receiverEmail],
        replyTo: email && email.includes("@") ? email : undefined,
        subject: `[Support - ${categoryUpper}] ${subject}`,
        html: emailHtml,
      });

      if (error) {
        console.error("[Email Dispatch] Resend API error:", error);
        emailError = error.message;
      } else {
        emailDispatched = true;
        console.log("[Email Dispatch] Successfully sent email notification via Resend, id:", data?.id);
      }
    } catch (err: any) {
      console.error("[Email Dispatch] Unexpected error calling Resend:", err);
      emailError = err?.message || "Unknown error";
    }
  } else {
    console.warn("[Email Dispatch] RESEND_API_KEY is not set in .env. Message saved to database only.");
  }

  // Optional: Discord Webhook instant ping (if user configured DISCORD_WEBHOOK_URL)
  const discordWebhook = process.env.DISCORD_WEBHOOK_URL;
  if (discordWebhook) {
    try {
      await fetch(discordWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [
            {
              title: `[Support - ${category.toUpperCase()}] ${subject}`,
              description: message.length > 2000 ? message.slice(0, 1997) + "..." : message,
              color: category === "bug" ? 0xef4444 : category === "feature" ? 0x10b981 : 0x6366f1,
              fields: [
                { name: "Sender", value: `${name} (${email || "No email"})`, inline: true },
                { name: "User ID", value: userId || "Anonymous", inline: true },
              ],
              footer: { text: `ID: ${id}` },
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });
      console.log("[Discord Dispatch] Dispatched contact message to Discord webhook.");
    } catch (dErr) {
      console.error("[Discord Dispatch] Failed to send to Discord webhook:", dErr);
    }
  }

  return {
    dispatched: emailDispatched,
    error: emailError,
  };
}

export async function sendPasswordResetEmail({
  toEmail,
  userName,
  resetUrl,
}: {
  toEmail: string;
  userName: string;
  resetUrl: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "LeetCode Repetition <onboarding@resend.dev>";

  const emailHtml = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset your password</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #030712; color: #f3f4f6; margin: 0; padding: 24px;">
    <div style="max-width: 560px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); padding: 28px 24px; text-align: center; border-bottom: 1px solid #1f2937;">
        <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 12px; background-color: #4f46e5; color: #ffffff; font-weight: 800; font-size: 20px; margin-bottom: 12px;">
          LF
        </div>
        <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700;">Password Reset Request</h1>
        <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 14px;">LeetCode Spaced Repetition (FSRS)</p>
      </div>

      <!-- Content -->
      <div style="padding: 28px 24px;">
        <p style="margin: 0 0 16px 0; font-size: 15px; color: #e2e8f0; line-height: 1.6;">
          Hello <strong style="color: #ffffff;">${escapeHtml(userName)}</strong>,
        </p>
        <p style="margin: 0 0 24px 0; font-size: 14px; color: #94a3b8; line-height: 1.6;">
          We received a request to reset the password for your LeetCode FSRS account. Click the button below to choose a new password:
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${escapeHtml(resetUrl)}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 14px 0 rgba(99, 102, 241, 0.4);">
            Reset Password
          </a>
        </div>

        <p style="margin: 24px 0 0 0; font-size: 13px; color: #64748b; line-height: 1.6;">
          ⏳ <strong>Security Notice:</strong> This link is valid for <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email; your existing password will remain unchanged.
        </p>

        <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #1f2937; word-break: break-all; font-size: 12px; color: #475569;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${escapeHtml(resetUrl)}" style="color: #818cf8; text-decoration: underline;">${escapeHtml(resetUrl)}</a>
        </div>
      </div>

    </div>
  </body>
</html>
  `;

  if (apiKey) {
    try {
      const resend = new Resend(apiKey);
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [toEmail],
        subject: "Reset your LeetCode FSRS password",
        html: emailHtml,
      });

      if (error) {
        console.error("[Email Dispatch] Resend error sending password reset:", error);
        return { dispatched: false, error: error.message };
      }
      return { dispatched: true, id: data?.id };
    } catch (err: any) {
      console.error("[Email Dispatch] Failed to send password reset email:", err);
      return { dispatched: false, error: err.message };
    }
  } else {
    console.warn(`[Email Dispatch] RESEND_API_KEY is not set. Reset link for ${toEmail}: ${resetUrl}`);
    return { dispatched: false, reason: "NO_API_KEY", resetUrl };
  }
}

