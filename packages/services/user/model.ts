import { z } from "zod";

export const getAuthenticationMethodOutputSchema = z.object({
  provider: z.enum(["GOOGLE_OAUTH"]),
  displayName: z.string().optional(),
  displayText: z.string().optional(),
  authUrl: z.string(),
});
export const createUserWithEmailAndPasswordInput = z.object({
  name: z.string()
         .describe("Name of the User")
         .max(128, "Name must be at most 128 characters long")
         .min(3, "Name must be at least 3 characters long"),

  email: z.string()
          .email("Please provide a valid email address")
          .describe("Email Address of the User"),

  password: z.string()
             .describe("Password of the User")
             .min(8, "Password must be at least 8 characters long")
             .max(128, "Password must be at most 128 characters long")
             .refine((val) => /[A-Z]/.test(val), {
               message: "Password must contain at least one uppercase letter",
             })
             .refine((val) => /[a-z]/.test(val), {
               message: "Password must contain at least one lowercase letter",
             })
             .refine((val) => /[0-9]/.test(val), {
               message: "Password must contain at least one number",
             })
             .refine((val) => /[^A-Za-z0-9]/.test(val), {
               message: "Password must contain at least one special character",
             })
})
export const loginWithEmailAndPasswordInput = z.object({
  email: z.string()
          .email("Please provide a valid email address")
          .describe("Email Address of the User"),
  password: z.string()
             .min(1, "Password is required")
             .describe("Password of the User"),
});

export type CreateUserWithEmailAndPasswordInputType = z.infer<
  typeof createUserWithEmailAndPasswordInput
>;
export type LoginWithEmailAndPasswordInputType = z.infer<
  typeof loginWithEmailAndPasswordInput
>;
export type GetAuthenticationMethodOutputSchema = z.infer<
  typeof getAuthenticationMethodOutputSchema
>;

