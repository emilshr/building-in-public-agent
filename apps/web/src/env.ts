import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
  GITHUB_CLIENT_ID: z.string().min(1, "GITHUB_CLIENT_ID is required"),
  GITHUB_CLIENT_SECRET: z.string().min(1, "GITHUB_CLIENT_SECRET is required"),
  GITHUB_APP_ID: z.string().min(1, "GITHUB_APP_ID is required"),
  GITHUB_APP_PRIVATE_KEY: z
    .string()
    .min(1, "GITHUB_APP_PRIVATE_KEY is required"),
  GITHUB_APP_SLUG: z.string().min(1, "GITHUB_APP_SLUG is required"),
  GITHUB_WEBHOOK_SECRET: z
    .string()
    .min(1, "GITHUB_WEBHOOK_SECRET is required"),
  INNGEST_EVENT_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
