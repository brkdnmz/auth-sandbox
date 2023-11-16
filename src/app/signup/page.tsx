"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { TRPCClientError } from "@trpc/client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FaCheck } from "react-icons/fa";
import { api } from "~/trpc/react";
import { signupFormSchema, type SignupForm } from "~/types";
import { Button } from "../_components/ui/button";
import { Card, CardTitle } from "../_components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../_components/ui/form";
import { Input } from "../_components/ui/input";
import { useToast } from "../_components/ui/use-toast";

const fields: readonly {
  name: keyof SignupForm;
  label: string;
  placeholder?: string;
}[] = [
  { name: "email", label: "Email", placeholder: "monkey@gmail.com" },
  { name: "username", label: "Username", placeholder: "luffymonkey" },
  { name: "password", label: "Password", placeholder: "kingofpirates" },
  { name: "fullName", label: "Full Name" },
] as const;

export default function SignUpPage() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
    },
  });

  const signUpMutation = api.auth.signUp.useMutation();

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await signUpMutation.mutateAsync(data);
      toast({
        title: "Success",
        description: `A verification email has been sent to ${
          form.getValues().email
        }`,
      });
      setTimeout(() => {
        void router.push("/");
      }, 1000);
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
      <CardTitle className="text-center text-4xl font-bold">Sign Up</CardTitle>
      <Form {...form}>
        <form onSubmit={onSubmit} action={"/signup"} className="grid gap-4">
          {fields.map(({ name, label, placeholder }) => (
            <FormField
              key={name}
              control={form.control}
              name={name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">
                    {label}
                    {signupFormSchema.shape[name].isOptional()
                      ? " (Optional)"
                      : " *"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={placeholder}
                      {...field}
                      type={
                        name === "password"
                          ? "password"
                          : name === "email"
                          ? "email"
                          : "text"
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    {/* This is your public display name. */}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

          <div className="text-center">
            <Button
              type="submit"
              variant={"secondary"}
              disabled={signUpMutation.isLoading || signUpMutation.isSuccess}
            >
              {signUpMutation.isLoading ? (
                <Loader2 className="animate-spin" />
              ) : !signUpMutation.isSuccess ? (
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
