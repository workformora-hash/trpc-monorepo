import { z } from "zod";

export const zodUndefinedModel = z.undefined().describe("undefined");
export const verifyEmailInput = z.object({
  token: z.string().min(1),
});
export { z };
