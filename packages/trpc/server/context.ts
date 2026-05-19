import * as trpcExpress from "@trpc/server/adapters/express";

export async function createContext(opts?: Partial<trpcExpress.CreateExpressContextOptions>) {
  return {
    req: opts?.req,
    res: opts?.res,
  };
}
export type Context = Awaited<ReturnType<typeof createContext>>;

