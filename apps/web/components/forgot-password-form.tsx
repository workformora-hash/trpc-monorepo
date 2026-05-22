"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { trpc } from "~/trpc/client"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [email, setEmail] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const forgotPasswordMutation = trpc.auth.forgotPassword.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setIsSuccess(true)
        toast.success("Reset link sent! Please check your email inbox.")
      } else {
        toast.error("Failed to send password reset link. Please try again.")
      }
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong. Please try again.")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error("Please enter a valid email address.")
      return
    }
    forgotPasswordMutation.mutate({ email })
  }

  if (isSuccess) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-sm text-balance text-muted-foreground">
            We have sent a secure password reset link to <strong className="text-foreground">{email}</strong>.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button variant="outline" asChild className="w-full">
            <Link href="/login">Back to Login</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Forgot Password</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email address and we will send you a password reset link
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email Address</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={forgotPasswordMutation.isPending}
            required
          />
        </Field>
        <Field>
          <Button type="submit" disabled={forgotPasswordMutation.isPending}>
            {forgotPasswordMutation.isPending ? "Sending Link..." : "Send Reset Link"}
          </Button>
        </Field>
        <Field className="text-center">
          <FieldDescription>
            Remembered your password?{" "}
            <Link href="/login" className="underline underline-offset-4 hover:text-primary">
              Sign in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
