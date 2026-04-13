import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().url(),
  AGENT_URL: z.string().url().default("http://localhost:3002"),
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),
  ENCRYPTION_SECRET: z.string().min(32),
  TWITTER_API_BASE_URL: z.string().url().default("https://api.twitter.com/2"),
});

export const env = envSchema.parse(process.env);
