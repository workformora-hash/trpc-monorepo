import { router, publicProcedure } from "./trpc";
import { authRouter } from "./routes/auth/route";
import { formRouter } from "./routes/form/route";

const healthRouter = router({
  getHealth: publicProcedure.query(() => {
    return { status: "ok" };
  }),
});

export const serverRouter = router({
  auth: authRouter,
  form: formRouter,
  health: healthRouter,
});


export { createContext } from "./context";
export type ServerRouter = typeof serverRouter;

