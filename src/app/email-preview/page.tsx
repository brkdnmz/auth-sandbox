import { VerificationMail } from "~/server/auth/email-verification/verification-mail";

export default function Email() {
  return (
    <VerificationMail
      userEmail="foo@gmail.com"
      username="brkdnmz"
      verificationCode="124235"
    />
  );
}
