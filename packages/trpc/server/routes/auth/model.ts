import z from "zod";

export const createUserWithEmailAndPasswordInputModel = z.object({
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

export const resetPasswordInputModel = z.object({
    token: z.string()
        .describe("Password reset token"),
    password: z.string()
        .describe("New Password of the User")
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
        }),
})

export const resetPasswordOutputModel = z.object({
    success: z.boolean()
})

export const logoutInputModel = z.object({}).optional();

export const logoutOutputModel = z.object({
    success: z.boolean()
})

export const getCurrentUserInputModel = z.object({}).optional();

export const getCurrentUserOutputModel = z.object({
    user: z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
        role: z.string(),
    })
}).nullable()

export const getGoogleAuthUrlInputModel = z.object({}).optional();

export const getGoogleAuthUrlOutputModel = z.object({
    provider: z.enum(["GOOGLE_OAUTH"]),
    displayName: z.string().optional(),
    displayText: z.string().optional(),
    authUrl: z.string(),
});

export const loginWithGoogleInputModel = z.object({
    code: z.string().describe("Google Authorization Code"),
});

export const loginWithGoogleOutputModel = z.object({
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
});

export const getActiveSessionsInputModel = z.object({}).optional();

export const getActiveSessionsOutputModel = z.object({
    sessions: z.array(
        z.object({
            id: z.string(),
            ipAddress: z.string().nullable(),
            userAgent: z.string().nullable(),
            metadata: z.object({
                os: z.string().optional(),
                browser: z.string().optional(),
                deviceType: z.enum(["desktop", "mobile", "tablet"]).optional(),
            }).nullable(),
            lastActiveAt: z.date().nullable(),
            isCurrent: z.boolean(),
        })
    )
});

export const revokeSessionByIdInputModel = z.object({
    sessionId: z.string().uuid("Invalid session ID format"),
});

export const revokeSessionByIdOutputModel = z.object({
    success: z.boolean(),
});

export const refreshSessionInputModel = z.object({}).optional();

export const refreshSessionOutputModel = z.object({
    success: z.boolean(),
    expiresAt: z.date(),
});

export const changePasswordInputModel = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string()
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
        }),
});

export const changePasswordOutputModel = z.object({
    success: z.boolean(),
});

export const deleteAccountInputModel = z.object({}).optional();

export const deleteAccountOutputModel = z.object({
    success: z.boolean(),
});

export const updateProfileInputModel = z.object({
    name: z.string()
        .max(128, "Name must be at most 128 characters long")
        .min(3, "Name must be at least 3 characters long")
        .optional(),
});

export const updateProfileOutputModel = z.object({
    success: z.boolean(),
    user: z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
    }),
});



