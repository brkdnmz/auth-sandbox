import { Resend } from "resend";
import { VerificationMail } from "./verification-mail";

const resend = new Resend(""); // todo

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
    from: "onboarding@resend.dev",
    to: "brkdnmz99@gmail.com",
    subject: "Sample Sign Up Email",
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
