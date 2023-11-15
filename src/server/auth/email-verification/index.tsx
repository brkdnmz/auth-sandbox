import { Resend } from "resend";
import { env } from "~/env.mjs";
import { VerificationMail } from "./verification-mail";

const resend = new Resend(env.RESEND_API_KEY);

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
  return resend.emails.send({
    from: env.RESEND_SENDER_EMAIL_ADDRESS,
    to: to,
    subject: "Verify Your Email for Auth Sandbox",
    react: (
      <VerificationMail
        userEmail={to}
        username={username}
        verificationCode={verificationCode}
        redirect={redirect}
      />
    ),
  });
}
