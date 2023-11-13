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
  redirect = "http://localhost:3000/api/auth/verify-email",
}: VerificationMailProps) {
  return (
    <Html>
      <h1>Hi, {username},</h1>
      <p>
        Please click{" "}
        <a href={`${redirect}/${verificationCode}`}>
          <em>here</em>
        </a>{" "}
        to verify your email address <em>{userEmail}</em>.
      </p>
    </Html>
  );
}
