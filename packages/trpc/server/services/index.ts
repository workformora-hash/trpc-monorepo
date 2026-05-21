import UserService from "@repo/services/user";
import FormService, { formEvents } from "@repo/services/form";
import { emailService } from "@repo/email";
import { redis } from "@repo/services/clients/redis";

export const userService = new UserService();
export const formService = new FormService(emailService);
export { formEvents, redis };
