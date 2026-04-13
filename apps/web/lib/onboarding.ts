import { API_KEY_PROVIDERS, CONTENT_TYPES, GENERATION_FREQUENCIES } from "@repo/types";
import { z } from "zod";

export const ONBOARDING_STEP_MIN = 1;
export const ONBOARDING_STEP_MAX = 6;

export const onboardingPayloadSchema = z.object({
  step: z.number().int().min(ONBOARDING_STEP_MIN).max(ONBOARDING_STEP_MAX),
  productName: z.string().min(1).optional(),
  productDescription: z.string().min(1).optional(),
  targetAudience: z.string().min(1).optional(),
  contentTypes: z.array(z.enum(CONTENT_TYPES)).optional(),
  generationFrequency: z.enum(GENERATION_FREQUENCIES).optional(),
  timezone: z.string().min(1).optional(),
  tone: z.string().min(1).optional(),
  apiProvider: z.enum(API_KEY_PROVIDERS).optional(),
});

export const ONBOARDING_STEPS = [
  "Product",
  "Content types",
  "Frequency",
  "Timezone",
  "Tone",
  "API key",
] as const;
