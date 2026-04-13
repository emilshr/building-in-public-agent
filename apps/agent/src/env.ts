import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3002),
  DATABASE_URL: z.string().url(),
  GIT_CLONE_ROOT: z.string().default("/tmp/building-in-public-agent"),
  REPO_MAX_SIZE_MB: z.coerce.number().default(500),
});

export const env = envSchema.parse(process.env);
