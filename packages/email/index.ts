import { Resend } from "resend";
import { env } from "./env";

export const resend = new Resend(env.RESEND_API_KEY);

export interface SendEmailPayload {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}

export class EmailService {

  public async sendEmail(payload: SendEmailPayload) {
    if (!resend) {
      console.warn("RESEND_API_KEY is not set. Skipping email send:", payload.subject);
      return null;
    }

    try {
      const { data, error } = await resend.emails.send({
        from: env.EMAIL_FROM,
        to: Array.isArray(payload.to) ? payload.to : [payload.to],
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      } as any);

      if (error) {
        throw new Error(`Failed to send email: ${error.message}`);
      }

      return data;
    } catch (error: any) {
      console.error("Email sending error:", error);
      throw error;
    }
  }
}

export const emailService = new EmailService();