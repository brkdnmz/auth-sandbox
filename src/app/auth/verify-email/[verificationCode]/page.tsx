import { TRPCClientError } from "@trpc/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/app/_components/ui/card";
import { api } from "~/trpc/server";

export default async function VerifyEmail({
  params,
}: {
  params: { verificationCode: string };
}) {
  let user;
  try {
    user = await api.auth.getVerifyingUser.query({
      verificationCode: params.verificationCode,
    });
  } catch (error) {
    if (error instanceof TRPCClientError) {
      return <>{error.message}</>;
    }
    return <>An error occurred</>;
  }

  return (
    <Card className="p-8">
      <CardHeader>
        <CardTitle>Verification Details</CardTitle>
        <CardDescription>
          See the user details, and verify using the button below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <h3 className="text-lg font-medium">User Information</h3>
        <div className="whitespace-pre font-mono">
          {JSON.stringify(
            {
              ...user,
              createdAt: new Date(user.createdAt + "Z").toLocaleString(),
            },
            null,
            2,
          )}
        </div>
      </CardContent>
    </Card>
  );
}
