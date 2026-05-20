import UserService from "@repo/services/user";
import FormService from "@repo/services/form";
import { emailService } from "@repo/email";

export const userService = new UserService();
export const formService = new FormService(emailService);
