import nodemailer, { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;
let warnedMissingCreds = false;

/**
 * Determines whether SMTP credentials have been configured.
 * Email notifications are optional — when credentials are absent, sending is
 * skipped gracefully to avoid noisy errors slowing down or polluting logs.
 */
const isSmtpConfigured = (): boolean => {
  const hasHost = Boolean(process.env.SMTP_HOST);
  const hasUser = Boolean(process.env.SMTP_USER);
  const hasPass = Boolean(process.env.SMTP_PASS);
  return hasHost && hasUser && hasPass;
};

/**
 * Lazily creates the nodemailer transporter once SMTP credentials are present.
 * This avoids crashing/batching errors at import time before config exists.
 */
const getTransporter = (): Transporter | null => {
  if (!isSmtpConfigured()) {
    if (!warnedMissingCreds) {
      warnedMissingCreds = true;
      console.warn(
        '[notifications] SMTP not configured — email notifications are disabled. ' +
        'Set SMTP_HOST, SMTP_USER, and SMTP_PASS in your environment to enable them.'
      );
    }
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    });
  }

  return transporter;
};

// Fire-and-forget email delivery so API responses stay fast; failures are logged rather than failing the request.
export const sendMail = async (to: string, subject: string, html: string): Promise<void> => {
  const mailer = getTransporter();
  if (!mailer) {
    // SMTP not configured — skip silently (warning already emitted once).
    return;
  }

  try {
    await mailer.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@ems.local',
      to,
      subject,
      html
    });
  } catch (error) {
    console.error('Email send failed', error);
  }
};
