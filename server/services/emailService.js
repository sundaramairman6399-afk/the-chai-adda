
const nodemailer = require("nodemailer");

const createTransporter = () => {
  // Use SMTP credentials from environment
  // Falls back to Ethereal (dev catch-all) if not configured
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Development fallback — log to console
  return nodemailer.createTransport({
    jsonTransport: true,
  });
};

const FROM = process.env.SMTP_FROM || "The Chai Adda <noreply@chaiadda.com>";
const BASE_URL = process.env.CLIENT_URL || "http://localhost:3000";

const sendEmail = async (to, subject, html) => {
  const transporter = createTransporter();
  const info = await transporter.sendMail({ from: FROM, to, subject, html });

  // In dev (jsonTransport) print to console
  if (info && info.message) {
    console.log("[EmailService] Would have sent:", JSON.parse(info.message));
  }
  return info;
};

const sendVerificationEmail = async (user, token) => {
  const link = `${BASE_URL}/verify-email?token=${token}`;
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:auto">
      <h2 style="color:#68452F">Verify your email — The Chai Adda</h2>
      <p>Hi ${user.name},</p>
      <p>Click the button below to verify your email address. The link expires in 24 hours.</p>
      <a href="${link}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#68452F;color:#fff;border-radius:5px;text-decoration:none">Verify Email</a>
      <p style="color:#827366;font-size:12px">If you did not create an account, ignore this email.</p>
    </div>`;
  return sendEmail(user.email, "Verify your email — The Chai Adda", html);
};

const sendPasswordResetEmail = async (user, token) => {
  const link = `${BASE_URL}/reset-password?token=${token}`;
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:auto">
      <h2 style="color:#68452F">Reset your password — The Chai Adda</h2>
      <p>Hi ${user.name},</p>
      <p>You requested a password reset. Click the button below — the link expires in 1 hour.</p>
      <a href="${link}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#68452F;color:#fff;border-radius:5px;text-decoration:none">Reset Password</a>
      <p style="color:#827366;font-size:12px">If you did not request this, ignore this email. Your password will not change.</p>
    </div>`;
  return sendEmail(user.email, "Reset your password — The Chai Adda", html);
};

const sendOrderConfirmationEmail = async (user, order) => {
  const itemRows = order.items
    .map(
      (i) =>
        `<tr><td>${i.name}${i.variantLabel ? ` (${i.variantLabel})` : ""}</td><td>×${i.quantity}</td><td>₹${i.lineTotal}</td></tr>`
    )
    .join("");
  const html = `
    <div style="font-family:sans-serif;max-width:580px;margin:auto">
      <h2 style="color:#68452F">Order Received — The Chai Adda</h2>
      <p>Hi ${user.name || order.customerName},</p>
      <p>We have received your order <strong>${order.orderNumber}</strong>. It is currently <strong>pending payment verification</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <thead><tr style="background:#68452F;color:#fff"><th>Item</th><th>Qty</th><th>Total</th></tr></thead>
        <tbody>${itemRows}</tbody>
        <tfoot>
          <tr><td colspan="2"><strong>Grand Total</strong></td><td><strong>₹${order.totalAmount}</strong></td></tr>
        </tfoot>
      </table>
      <p>We will notify you once the payment is verified and your order is confirmed.</p>
      <p style="color:#827366;font-size:12px">Track your order using order number: ${order.orderNumber}</p>
    </div>`;
  return sendEmail(
    order.customerEmail || user.email,
    `Order ${order.orderNumber} received — The Chai Adda`,
    html
  );
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
};
