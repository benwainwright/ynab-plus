import z from "zod";

import { permissionSchema } from "@core";

export const userSchema = z.object({
  id: z.string().readonly(),
  passwordHash: z.string().readonly(),
  email: z.string().readonly(),
  permissions: z.array(permissionSchema)
});

export type IUser = z.output<typeof userSchema>;
