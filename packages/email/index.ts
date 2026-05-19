import { Resend } from "resend";
import { env } from "./env";
import * as React from "react";
import { VerifyEmail } from "./templates/VerifyEmail";
import { PasswordReset } from "./templates/PasswordReset";

export const resend = new Resend(env.RESEND_API_KEY);

export interface SendEmailPayload {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  react?: React.ReactElement | null;
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
        react: payload.react,
      });

      if (error) {
        throw new Error(`Failed to send email: ${error.message}`);
      }

      return data;
    } catch (error: any) {
      console.error("Email sending error:", error);
      throw error;
    }
  }

  public async sendVerificationEmail(to: string, name: string, verificationLink: string) {
    return this.sendEmail({
      to,
      subject: "Verify your email address",
      react: React.createElement(VerifyEmail, { name, verificationLink }),
    });
  }

  public async sendPasswordResetEmail(to: string, name: string, resetLink: string) {
    return this.sendEmail({
      to,
      subject: "Reset your password",
      react: React.createElement(PasswordReset, { name, resetLink }),
    });
  }
}

export const emailService = new EmailService();