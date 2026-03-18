import fs from 'fs/promises';
import path from 'path';
import nodemailer from 'nodemailer';
import { EmailSchema } from './schemas.mail';
import type { EmailPayload } from './types.mail';
import { SMTP_PASSWORD, SMTP_HOST, SMTP_PORT, SMTP_USER } from '../../../configs/env.configs';





// Resolve templates relative to the project root using Bun.main.
// Bun.main is the absolute path of the entry file (index.ts at project root).
// It is a global constant — never re-evaluated by --hot reloads — making it
// the only reliable path anchor in Bun's hot-reload module system.
const TEMPLATES_DIR = path.join(path.dirname(Bun.main), 'src', 'notification', 'core', 'mail', 'templates');

async function compileTemplate(templateName: string, data: Record<string, any>) {
  const templatePath = path.join(TEMPLATES_DIR, `${templateName}.html`);
  let html = await fs.readFile(templatePath, 'utf8');
  Object.entries(data).forEach(([key, value]) => {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  });

  return html;
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT) || 587,
  secure: Number(SMTP_PORT) === 465,
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

export async function sendMail(mailOptions: EmailPayload): Promise<string> {
  const validated = EmailSchema.parse(mailOptions);
  let htmlBody = validated.html;

  if (validated.templateName && validated.templateData) {
    htmlBody = await compileTemplate(validated.templateName, validated.templateData);
  }

  const info = await transporter.sendMail({
    from: validated.from || SMTP_USER,
    to: validated.to.join(', '),
    subject: validated.subject,
    text: validated.text,
    html: htmlBody,
    cc: validated.cc?.join(', '),
  });

  console.log("Message sent:", info.messageId);
  return info.messageId;
}
