"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { TRPCClientError } from "@trpc/client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FaCheck } from "react-icons/fa";
import { Button } from "~/app/_components/ui/button";
import { Card, CardTitle } from "~/app/_components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/app/_components/ui/form";
import { Input } from "~/app/_components/ui/input";
import { useToast } from "~/app/_components/ui/use-toast";
import { useSession } from "~/hooks/use-session";
import { useAuthStore } from "~/store/auth-store";
import { signinFormSchema, type SigninForm } from "~/types";

const fields: readonly {
  name: keyof SigninForm;
  label: string;
  placeholder?: string;
}[] = [
  {
    name: "emailOrUsername",
    label: "Email or Username",
    placeholder: "luffy (or monkeydluffy@gmail.com)",
  },
  { name: "password", label: "Password", placeholder: "kingofpirates" },
] as const;

export default function SignInPage() {
  const { toast } = useToast();
  const router = useRouter();
  const {
    actions: { handleTokens },
  } = useAuthStore();
  const form = useForm<SigninForm>({
    resolver: zodResolver(signinFormSchema),
    defaultValues: {
      emailOrUsername: "",
      password: "",
    },
  });
  const { signIn } = useSession();

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const { accessToken, refreshToken } = await signIn.mutateAsync(data);
      handleTokens(accessToken, refreshToken);
      toast({
        title: "Success",
        description: "Redirecting to home page",
        duration: 1000,
      });
      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof TRPCClientError
            ? error.message
            : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  return (
    <Card className="grow px-8 py-4">
      <CardTitle className="text-center text-4xl font-bold">Sign In</CardTitle>
      <Form {...form}>
        <form onSubmit={onSubmit} className="grid gap-4">
          {fields.map(({ name, label, placeholder }) => (
            <FormField
              key={name}
              control={form.control}
              name={name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">{label}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={placeholder}
                      {...field}
                      value={field.value ?? undefined}
                      type={name === "password" ? "password" : "text"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

          <div className="text-center">
            <Button
              type="submit"
              variant={"secondary"}
              disabled={signIn.isLoading || signIn.isSuccess}
            >
              {signIn.isLoading ? (
                <Loader2 className="animate-spin" />
              ) : !signIn.isSuccess ? (
                "Submit"
              ) : (
                <FaCheck />
              )}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
