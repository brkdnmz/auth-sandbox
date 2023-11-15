import { Button } from "@react-email/button";
import { Html } from "@react-email/html";

type VerificationMailProps = {
  userEmail: string;
  username: string;
  verificationCode: string;
  redirect?: string;
};

/**
 * This is the email template that the app uses to send verification emails.
 * @param userEmail The user's email address to be verified.
 * @param username The user's username.
 * @param verificationCode The verification code to verify the email.
 * @param redirect Which URL the verification email should redirect to. The verification mail redirects to `<redirect>/:verificationCode`.
 */
export function VerificationMail({
  userEmail,
  username,
  verificationCode,
  redirect,
}: VerificationMailProps) {
  return (
    <Html>
      <h1>Hi {username},</h1>
      <p>
        Please click the button below to verify your email address{" "}
        <em>{userEmail}</em>:
      </p>
      <Button href={`${redirect}/${verificationCode}`}>
        Verify Your Email
      </Button>
    </Html>
  );
}
