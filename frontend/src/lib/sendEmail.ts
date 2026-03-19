import nodemailer from "nodemailer";

const OUR_EMAIL = process.env.OUR_EMAIL;
const pass = process.env.GOOGLE_APP_PASSWORD;

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text?: string;
  html: string;
}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: OUR_EMAIL,
      pass,
    },
  });
  const info = await transporter.sendMail({
    from: `"Eglise de Boumerdes" <${OUR_EMAIL}>`,
    to,
    subject,
    text,
    html,
  });
};

export const sendPasswordResetEmail = async (
  url: string,
  user: { name: string; email: string },
) => {
  const messageTemplate = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Password Reset - Eglise de Boumerdes</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #2c2c2c;
        background-color: #f5f0e8;
        margin: 0;
        padding: 0;
      }
      .email-container {
        max-width: 600px;
        margin: 20px auto;
        background-color: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(188, 145, 6, 0.15);
        overflow: hidden;
      }
      .header {
        background: linear-gradient(135deg, #8a6a04 0%, #bc9106 100%);
        padding: 40px 20px;
        text-align: center;
        color: #ffffff;
      }
      .header h1 {
        margin: 0;
        font-size: 26px;
        font-weight: 600;
      }
      .header p {
        margin: 8px 0 0;
        font-size: 14px;
        opacity: 0.85;
        letter-spacing: 0.5px;
      }
      .content {
        padding: 40px 30px;
      }
      .greeting {
        font-size: 18px;
        font-weight: 500;
        color: #2c2c2c;
        margin-bottom: 20px;
      }
      .message {
        font-size: 15px;
        color: #4a4a4a;
        line-height: 1.8;
        margin-bottom: 30px;
      }
      .action-section {
        text-align: center;
        margin: 35px 0;
        padding: 30px;
        background-color: #fdfaf2;
        border: 1px solid #d8d080;
        border-radius: 10px;
      }
      .action-button {
        display: inline-block;
        padding: 14px 40px;
        background: linear-gradient(135deg, #bc9106 0%, #d8a908 100%);
        color: #ffffff !important;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 16px;
      }
      .button-note {
        font-size: 12px;
        color: #888;
        margin-top: 14px;
      }
      .button-note a {
        color: #4a82bc;
        word-break: break-all;
        text-decoration: none;
      }
      .warning-section {
        background-color: #fff8f0;
        border-left: 4px solid #bc9106;
        padding: 14px 16px;
        margin: 25px 0;
        border-radius: 4px;
        font-size: 13px;
        color: #5a4a20;
      }
      .info-section {
        background-color: #f0f6fc;
        border-left: 4px solid #4a82bc;
        padding: 14px 16px;
        margin: 20px 0;
        border-radius: 4px;
        font-size: 13px;
        color: #2c3e50;
      }
      .divider {
        border: none;
        border-top: 1px solid #e8e0c8;
        margin: 30px 0;
      }
      .footer {
        background-color: #f5f0e8;
        padding: 30px;
        text-align: center;
      }
      .footer-text {
        font-size: 14px;
        color: #5a5a5a;
        margin: 5px 0;
      }
      .footer-contact a {
        color: #bc9106;
        text-decoration: none;
        font-size: 13px;
      }
      .footer-copy {
        font-size: 12px;
        color: #aaa;
        margin-top: 18px;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <h1>🔐 Password Reset Request</h1>
        <p>Eglise de Boumerdes — Parish Portal</p>
      </div>
      <div class="content">
        <div class="greeting">Hello ${user.name},</div>
        <div class="message">
          We received a request to reset the password for your Eglise de Boumerdes account. Click the button below to create a new password and regain access to the parish portal.
        </div>

        <div class="action-section">
          <a href="${url}" class="action-button">Reset My Password</a>
          <div class="button-note">
            Or copy this link: <a href="${url}">${url}</a>
          </div>
        </div>

        <div class="info-section">
          <strong>Note:</strong> This link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email — your account remains secure.
        </div>

        <div class="warning-section">
          <strong>Security Reminder:</strong> Never share this link with anyone. Our team will never ask for your reset link via email or phone.
        </div>

        <div class="message" style="margin-top: 20px; font-size: 14px; color: #888;">
          Need help? Contact our support team at the address below.
        </div>
      </div>
      <hr class="divider" />
      <div class="footer">
        <div class="footer-text">Questions or need assistance?</div>
        <div class="footer-contact">
          <a href="mailto:${OUR_EMAIL}">${OUR_EMAIL}</a>
        </div>
        <div class="footer-copy">
          &copy; 2026 Eglise de Boumerdes. All rights reserved.
        </div>
      </div>
    </div>
  </body>
</html>
  `;
  await sendEmail({
    to: user.email,
    subject: "Password Reset Request — Eglise de Boumerdes",
    text: `Reset your password by visiting: ${url}`,
    html: messageTemplate,
  });
};

export const sendVerificationEmail = async (
  user: { name: string; email: string },
  url: string,
) => {
  const messageTemplate = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Verification - Eglise de Boumerdes</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #2c2c2c;
        background-color: #f5f0e8;
        margin: 0;
        padding: 0;
      }
      .email-container {
        max-width: 600px;
        margin: 20px auto;
        background-color: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(188, 145, 6, 0.15);
        overflow: hidden;
      }
      .header {
        background: linear-gradient(135deg, #8a6a04 0%, #bc9106 100%);
        padding: 40px 20px;
        text-align: center;
        color: #ffffff;
      }
      .header h1 {
        margin: 0;
        font-size: 26px;
        font-weight: 600;
      }
      .header p {
        margin: 8px 0 0;
        font-size: 14px;
        opacity: 0.85;
        letter-spacing: 0.5px;
      }
      .content {
        padding: 40px 30px;
      }
      .greeting {
        font-size: 18px;
        font-weight: 500;
        color: #2c2c2c;
        margin-bottom: 20px;
      }
      .message {
        font-size: 15px;
        color: #4a4a4a;
        line-height: 1.8;
        margin-bottom: 30px;
      }
      .action-section {
        text-align: center;
        margin: 35px 0;
        padding: 30px;
        background-color: #fdfaf2;
        border: 1px solid #d8d080;
        border-radius: 10px;
      }
      .action-button {
        display: inline-block;
        padding: 14px 40px;
        background: linear-gradient(135deg, #bc9106 0%, #d8a908 100%);
        color: #ffffff !important;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 16px;
      }
      .button-note {
        font-size: 12px;
        color: #888;
        margin-top: 14px;
      }
      .button-note a {
        color: #4a82bc;
        word-break: break-all;
        text-decoration: none;
      }
      .info-section {
        background-color: #f0f6fc;
        border-left: 4px solid #4a82bc;
        padding: 14px 16px;
        margin: 20px 0;
        border-radius: 4px;
        font-size: 13px;
        color: #2c3e50;
      }
      .divider {
        border: none;
        border-top: 1px solid #e8e0c8;
        margin: 30px 0;
      }
      .footer {
        background-color: #f5f0e8;
        padding: 30px;
        text-align: center;
      }
      .footer-text {
        font-size: 14px;
        color: #5a5a5a;
        margin: 5px 0;
      }
      .footer-contact a {
        color: #bc9106;
        text-decoration: none;
        font-size: 13px;
      }
      .footer-copy {
        font-size: 12px;
        color: #aaa;
        margin-top: 18px;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <h1>✓ Verify Your Email</h1>
        <p>Eglise de Boumerdes — Parish Portal</p>
      </div>
      <div class="content">
        <div class="greeting">Welcome, ${user.name}!</div>
        <div class="message">
          Thank you for joining the Eglise de Boumerdes parish community. To activate your account and access the parish portal — including Mass schedules, liturgical songs, and community events — please verify your email address.
        </div>

        <div class="action-section">
          <a href="${url}" class="action-button">Verify My Email</a>
          <div class="button-note">
            Or copy this link: <a href="${url}">${url}</a>
          </div>
        </div>

        <div class="info-section">
          <strong>Note:</strong> This link will expire in 24 hours. If you did not create an account, you can safely ignore this email.
        </div>
      </div>
      <hr class="divider" />
      <div class="footer">
        <div class="footer-text">Questions or need help?</div>
        <div class="footer-contact">
          <a href="mailto:${OUR_EMAIL}">${OUR_EMAIL}</a>
        </div>
        <div class="footer-copy">
          &copy; 2026 Eglise de Boumerdes. All rights reserved.
        </div>
      </div>
    </div>
  </body>
</html>
  `;
  await sendEmail({
    to: user.email,
    subject: "Verify your email — Eglise de Boumerdes",
    text: `Verify your email by visiting: ${url}`,
    html: messageTemplate,
  });
};
