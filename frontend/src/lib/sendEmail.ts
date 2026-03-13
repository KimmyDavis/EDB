import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (emailOptions: {
  from?: string;
  to: string;
  subject: string;
  html: string;
}) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const defaultFrom = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const emBody = { ...{ from: defaultFrom }, ...emailOptions };

  return await resend.emails.send(emBody);
};
