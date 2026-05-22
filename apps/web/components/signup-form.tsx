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
  FieldSeparator,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { trpc } from "~/trpc/client"
import { api } from "~/trpc/server"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)



  const handleGoogleSignup = async () => {
    const loadingToast = toast.loading("Connecting to Google...")
    try {
      const data = await api.auth.getGoogleAuthUrl.query()
      toast.dismiss(loadingToast)
      if (data?.authUrl) {
        window.location.href = data.authUrl
      } else {
        toast.error("Could not retrieve Google login link.")
      }
    } catch (err) {
      console.error("Google Auth error:", err)
      toast.dismiss(loadingToast)
      toast.error("Failed to initialize Google authentication.")
    }
  }

  // 2. Email Signup mutation
  const signupMutation = trpc.auth.createUserwithEmailAndPassword.useMutation({
    onSuccess: (data) => {
      setIsSuccess(true)
      toast.success("Account created successfully! Verification email sent.")
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create account. Please try again.")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all required fields.")
      return
    }

    if (name.length < 3) {
      toast.error("Name must be at least 3 characters long.")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.")
      return
    }

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

    signupMutation.mutate({
      name,
      email,
      password,
    })
  }

  // Success screen rendering
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
                d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Verify your email</h1>
          <p className="text-sm text-balance text-muted-foreground">
            We have sent a verification link to <strong className="text-foreground">{email}</strong>. Please click the link inside the email to activate your account.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/login">Go to Login</Link>
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
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Fill in the form below to create your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={signupMutation.isPending}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={signupMutation.isPending}
            required
          />
          <FieldDescription>
            We&apos;ll use this to contact you. We will not share your email
            with anyone else.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={signupMutation.isPending}
            required
          />
          <FieldDescription>
            Must be at least 8 characters long, with 1 uppercase, 1 lowercase, 1 number, and 1 special char.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={signupMutation.isPending}
            required
          />
          <FieldDescription>Please confirm your password.</FieldDescription>
        </Field>
        <Field>
          <Button type="submit" disabled={signupMutation.isPending}>
            {signupMutation.isPending ? "Creating Account..." : "Create Account"}
          </Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <Button
            variant="outline"
            type="button"
            onClick={handleGoogleSignup}
            disabled={signupMutation.isPending}
          >
            <svg
              className="mr-2 size-4"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
              ></path>
            </svg>
            Sign up with Google
          </Button>
          <FieldDescription className="px-6 text-center">
            Already have an account?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Sign in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
