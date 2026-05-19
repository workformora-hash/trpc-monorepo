import { z } from "zod";

const envSchema = z.object({
  RESEND_API_KEY: z.string().nonempty(),
  EMAIL_FROM: z.string().nonempty(),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

export const env = createEnv(process.env);