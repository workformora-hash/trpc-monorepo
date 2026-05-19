import z from "zod";

export const createUserWithEmailAndPasswordInputModel = z.object({
    name: z.string()
        .describe("Name of the User")
        .max(128, "Name must be at most 128 characters long")
        .min(3, "Name must be at least 3 characters long"),

    email: z.email()
        .describe("Email Address of the User"),

    password: z.string()
        .describe("Password of the User")
        .min(8, "Password must be at least 8 characters long")
        .max(128, "Password must be at most 128 characters long")
})
export const createUserwithEmailAndPasswordOutputModel = z.object({
    id : z.string()
})

export const verifyEmailInputModel = z.object({
    token: z.string()
        .describe("Email verification token"),
})

export const verifyEmailOutputModel = z.object({
    success: z.boolean()
})

export const loginWithEmailAndPasswordInputModel = z.object({
    email: z.string()
        .email("Please provide a valid email address")
        .describe("Email Address of the User"),
    password: z.string()
        .min(1, "Password is required")
        .describe("Password of the User"),
})

export const loginWithEmailAndPasswordOutputModel = z.object({
    success: z.boolean(),
    token: z.string(),
    session: z.object({
        id: z.string(),
        expiresAt: z.date(),
    }),
    user: z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
        role: z.string(),
    })
})

export const resendVerificationEmailInputModel = z.object({
    email: z.string()
        .email("Please provide a valid email address")
        .describe("Email Address of the User"),
})

export const resendVerificationEmailOutputModel = z.object({
    success: z.boolean()
})

export const forgotPasswordInputModel = z.object({
    email: z.string()
        .email("Please provide a valid email address")
        .describe("Email Address of the User"),
})

export const forgotPasswordOutputModel = z.object({
    success: z.boolean()
})
