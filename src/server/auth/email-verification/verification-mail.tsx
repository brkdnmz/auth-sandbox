import {
  Button,
  Container,
  Heading,
  Img,
  Tailwind,
  Text,
} from "@react-email/components";

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
    <Tailwind>
      <Container>
        <div className="rounded-2xl border-2 border-slate-800 bg-slate-950 p-10 font-mono text-xl text-slate-300">
          <Img
            src="https://i.ibb.co/PQfdNNH/logo.png"
            alt="Auth Sandbox Logo"
            width="10%"
            className="mx-auto"
          />
          <Heading as="h1" className="mb-10 text-center">
            Auth Sandbox
          </Heading>
          <Heading as="h2" className="mb-5 text-center">
            Hi {username},
          </Heading>
          <Text>
            Please click the button below to verify your email address{" "}
            <em>{userEmail}</em>.
          </Text>

          <div className="text-center">
            <Button
              href={`${redirect}/${verificationCode}`}
              className="rounded-md border border-slate-400 bg-slate-600 p-2 text-2xl text-slate-200 hover:contrast-125"
            >
              Verify Your Email
            </Button>
          </div>
        </div>
      </Container>
    </Tailwind>
  );
}
