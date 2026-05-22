"use client"

import { useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
  FieldSeparator,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { trpc } from "~/trpc/client"
import { api } from "~/trpc/server"

const loginSchema = z.object({
  email: z.string()
    .email("Please provide a valid email address"),
  password: z.string()
    .min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginFormContent({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get("code")
  const googleLoginTriggered = useRef(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Google OAuth code exchange mutation
  const loginWithGoogleMutation = trpc.auth.loginWithGoogle.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Welcome back, ${data.user.name}!`)
        router.push("/dashboard")
        router.refresh()
      } else {
        toast.error("Google authentication failed. Please try again.")
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to log in with Google.")
      const url = new URL(window.location.href)
      url.searchParams.delete("code")
      window.history.replaceState({}, "", url.toString())
    },
  })

  // Trigger Google callback if code is present in URL
  useEffect(() => {
    if (code && !googleLoginTriggered.current) {
      googleLoginTriggered.current = true
      loginWithGoogleMutation.mutate({ code })
    }
  }, [code])

  const handleGoogleLogin = async () => {
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

  // Credential Login mutation
  const loginMutation = trpc.auth.loginWithEmailAndPassword.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Welcome back, ${data.user.name}!`)
        router.push("/dashboard")
        router.refresh()
      }
    },
    onError: (error) => {
      toast.error(error.message || "Invalid email or password.")
    },
  })

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate({ email: values.email, password: values.password })
  }

  // Render Google loading state if verifying code
  if (code) {
    return (
      <div className={cn("flex flex-col gap-6 items-center text-center py-8", className)}>
        <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-2" />
        <h1 className="text-xl font-bold">Verifying Google Account</h1>
        <p className="text-sm text-balance text-muted-foreground">
          Please wait while we establish your secure session...
        </p>
      </div>
    )
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            {...register("email")}
            disabled={loginMutation.isPending}
          />
          {errors.email && (
            <p className="text-xs text-destructive mt-1 font-medium">{errors.email.message}</p>
          )}
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              href="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            {...register("password")}
            disabled={loginMutation.isPending}
          />
          {errors.password && (
            <p className="text-xs text-destructive mt-1 font-medium">{errors.password.message}</p>
          )}
        </Field>
        <Field>
          <Button type="submit" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <Button
            variant="outline"
            type="button"
            onClick={handleGoogleLogin}
            disabled={loginMutation.isPending}
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
            Login with Google
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline underline-offset-4">
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}

export function LoginForm(props: React.ComponentProps<"form">) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading login form...</p>
        </div>
      }
    >
      <LoginFormContent {...props} />
    </Suspense>
  )
}
