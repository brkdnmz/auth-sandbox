"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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

const signupFormSchema = z.object({
  email: z
    .string()
    .email("Not a valid email")
    .max(150, "Email length must be at most 150"),
  username: z
    .string()
    .min(1, "Username must not be empty")
    .max(100, "Username length must be at most 100"),
  fullName: z
    .string()
    .max(100, "Username length must be at most 100")
    .optional(),
  password: z
    .string()
    .min(1, "Password must not be empty")
    .max(100, "Password length must be at most 100"),
});

type SignupForm = z.infer<typeof signupFormSchema>;

const fields: {
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
  const form = useForm<SignupForm>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    console.log(data);
  });

  return (
    <section className="flex h-full items-center justify-center">
      <Card className="grow px-8 py-4">
        <CardTitle className="text-center text-4xl font-bold">
          Sign Up
        </CardTitle>
        <Form {...form}>
          <form onSubmit={onSubmit} className="grid gap-4">
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
              <Button type="submit" variant={"secondary"}>
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </section>
  );
}
