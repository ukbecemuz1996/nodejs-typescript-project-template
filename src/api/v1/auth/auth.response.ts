import { User } from "@prisma/client";

export type TLoginResponse = User & { token: string };