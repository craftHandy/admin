import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export interface ILoginResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
}
