import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import { env } from "~/env.mjs";
import { VerificationMail } from "./verification-mail";

// https://support.google.com/a/answer/176600
// (Option 2: Send email with the Gmail SMTP server)
const nodemailerTransporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: env.GMAIL_ACCOUNT_EMAIL_ADDRESS,
    pass: env.GMAIL_APP_PASSWORD,
  },
});

export function sendVerificationEmail({
  to,
  username,
  verificationCode,
  redirect,
}: {
  to: string;
  username: string;
  verificationCode: string;
  redirect: string;
}) {
  return nodemailerTransporter.sendMail({
    from: "noreply.authsandbox@gmail.com",
    to: to,
    subject: "Verify Your Email for Auth Sandbox",
    html: render(
      <VerificationMail
        userEmail={to}
        username={username}
        verificationCode={verificationCode}
        redirect={redirect}
      />,
    ),
  });
}
