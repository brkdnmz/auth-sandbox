import { TRPCClientError } from "@trpc/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/app/_components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/app/_components/ui/table";
import { api } from "~/trpc/server";

export default async function VerifyEmail({
  params,
}: {
  params: { verificationCode: string };
}) {
  let user;
  try {
    user = await api.auth.verify.query({
      verificationCode: params.verificationCode,
    });
  } catch (error) {
    if (error instanceof TRPCClientError) {
      return <>{error.message}</>;
    }
    return <>An error occurred</>;
  }

  const userDetails = [
    { label: "ID", value: user.id },
    { label: "Email", value: user.email },
    { label: "Username", value: user.username },
    {
      label: "Full Name",
      value: user.fullName ?? <span className="text-slate-500">—</span>,
    },
    {
      label: "Registered At",
      value: new Date(user.createdAt + "Z").toLocaleString(),
    },
  ];

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>User Verified!</CardTitle>
        <CardDescription>The user details are shown below.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Info</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userDetails.map(({ label, value }) => (
              <TableRow key={label}>
                <TableCell>{label}</TableCell>
                <TableCell>{value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
