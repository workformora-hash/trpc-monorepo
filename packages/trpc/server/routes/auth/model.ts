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

