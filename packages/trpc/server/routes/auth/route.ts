import { userService } from "../../services";
import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { createUserWithEmailAndPasswordInputModel, createUserwithEmailAndPasswordOutputModel } from "./model";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

export const authRouter = router({
  createUserwithEmailAndPassword: publicProcedure.meta(
    {
      openapi:
      {
        method: "POST",
        path: getPath("/createUserwithEmailAndPassword"),
        tags: TAGS
      }
    })
    .input(createUserWithEmailAndPasswordInputModel)
    .output(createUserwithEmailAndPasswordOutputModel)
    .mutation(async ({ input }) => {
      const { name, email, password } = input;
      const { id } = await userService.createUserWithEmailAndPassword({
        name,
        email,
        password
      });
      return {
        id
      }
    }),
});
