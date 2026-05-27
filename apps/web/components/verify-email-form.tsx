"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
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

const verifyEmailSchema = z.object({
  email: z.string()
    .email("Please provide a valid email address"),
});

type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;

function VerifyEmailFormContent({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const hasTriggered = useRef(false)

  const [verificationState, setVerificationState] = useState<
    "idle" | "verifying" | "success" | "error"
  >(token ? "verifying" : "idle")
  
  const [registeredEmail, setRegisteredEmail] = useState("")
  const [isResendSuccess, setIsResendSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: "",
    },
  });

  const verifyEmailMutation = trpc.auth.verifyEmail.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setVerificationState("success")
        toast.success("Email verified successfully! You can now log in.")
      } else {
        setVerificationState("error")
        setErrorMessage("The verification link might be expired or invalid.")
        toast.error("Verification failed.")
      }
    },
    onError: (error) => {
      setVerificationState("error")
      setErrorMessage(error.message || "Something went wrong during verification.")
      toast.error(error.message || "Failed to verify email.")
    },
  })

  const resendEmailMutation = trpc.auth.resendVerificationEmail.useMutation({
    onSuccess: (data, variables) => {
      if (data.success) {
        setRegisteredEmail(variables.email)
        setIsResendSuccess(true)
        toast.success("Verification email resent! Please check your inbox.")
      } else {
        toast.error("Failed to resend verification email. Please try again.")
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to resend verification email.")
    },
  })

  useEffect(() => {
    if (token && !hasTriggered.current) {
      hasTriggered.current = true
      verifyEmailMutation.mutate({ token })
    }
  }, [token, verifyEmailMutation])

  const onSubmit = (values: VerifyEmailFormValues) => {
    resendEmailMutation.mutate({ email: values.email })
  }

  // Loading/Verifying state
  if (verificationState === "verifying") {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <h1 className="text-2xl font-bold">Verifying your email</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Please wait while we verify your email token...
          </p>
        </div>
      </div>
    )
  }

  // Success state
  if (verificationState === "success") {
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
          <h1 className="text-2xl font-bold">Email Verified!</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Your email has been successfully verified. You can now login to your account.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Resend email success state
  if (isResendSuccess) {
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
                d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Check your inbox</h1>
          <p className="text-sm text-balance text-muted-foreground">
            We have sent a fresh verification link to <strong className="text-foreground">{registeredEmail}</strong>.
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

  // Verification error state or general resend request
  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          {verificationState === "error" ? (
            <>
              <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-2">
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
              <h1 className="text-2xl font-bold">Verification Failed</h1>
              <p className="text-sm text-balance text-destructive font-medium mb-1">
                {errorMessage}
              </p>
              <p className="text-sm text-balance text-muted-foreground">
                Enter your email address below to resend a verification link.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold">Verify Email</h1>
              <p className="text-sm text-balance text-muted-foreground">
                Enter your email below to request an account verification email link
              </p>
            </>
          )}
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email Address</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            {...register("email")}
            disabled={resendEmailMutation.isPending}
          />
          {errors.email && (
            <p className="text-xs text-destructive mt-1 font-medium">{errors.email.message}</p>
          )}
        </Field>
        <Field>
          <Button type="submit" disabled={resendEmailMutation.isPending}>
            {resendEmailMutation.isPending ? "Resending Link..." : "Resend Verification Email"}
          </Button>
        </Field>
        <Field className="text-center">
          <FieldDescription>
            Back to login?{" "}
            <Link href="/login" className="underline underline-offset-4 hover:text-primary">
              Sign in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}

export function VerifyEmailForm(props: React.ComponentProps<"form">) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Initializing email verification...</p>
        </div>
      }
    >
      <VerifyEmailFormContent {...props} />
    </Suspense>
  )
}
