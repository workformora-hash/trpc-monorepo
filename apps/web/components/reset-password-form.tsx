"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
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

function ResetPasswordFormContent({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const resetPasswordMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setIsSuccess(true)
        toast.success("Password reset successful! Please login.")
      } else {
        toast.error("Failed to reset password. Please request a new link.")
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reset password. Please try again.")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      toast.error("Invalid token. Please request a new reset password link.")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.")
      return
    }

    // Basic client side password complexity check
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.")
      return
    }

    if (!/[A-Z]/.test(password)) {
      toast.error("Password must contain at least one uppercase letter.")
      return
    }

    if (!/[a-z]/.test(password)) {
      toast.error("Password must contain at least one lowercase letter.")
      return
    }

    if (!/[0-9]/.test(password)) {
      toast.error("Password must contain at least one number.")
      return
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      toast.error("Password must contain at least one special character.")
      return
    }

    resetPasswordMutation.mutate({
      token,
      password,
    })
  }

  if (!token) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
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
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Invalid Reset Link</h1>
          <p className="text-sm text-balance text-muted-foreground">
            The password reset link is invalid or missing a token. Please request a new one.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/forgot-password">Request Reset Link</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/login">Back to Login</Link>
          </Button>
        </div>
      </div>
    )
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
          <h1 className="text-2xl font-bold">Password Reset Success</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Your password has been successfully reset. You can now log in using your new credentials.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/login">Login</Link>
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
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Please enter and confirm your new account password below
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="password">New Password</FieldLabel>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={resetPasswordMutation.isPending}
            required
          />
          <FieldDescription>
            Must contain at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special char.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={resetPasswordMutation.isPending}
            required
          />
        </Field>
        <Field>
          <Button type="submit" disabled={resetPasswordMutation.isPending}>
            {resetPasswordMutation.isPending ? "Resetting Password..." : "Reset Password"}
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

export function ResetPasswordForm(props: React.ComponentProps<"form">) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading password reset form...</p>
        </div>
      }
    >
      <ResetPasswordFormContent {...props} />
    </Suspense>
  )
}
