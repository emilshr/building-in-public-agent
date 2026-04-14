// Content status state machine
export const CONTENT_STATUSES = ["draft", "approved", "discarded"] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

// Content types
export const CONTENT_TYPES = [
  "tweet",
  "thread",
  "linkedin",
  "reddit",
  "instagram",
  "tiktok",
  "article",
] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

// LLM providers for BYOK
export const API_KEY_PROVIDERS = ["openai", "anthropic", "openrouter"] as const;
export type ApiKeyProvider = (typeof API_KEY_PROVIDERS)[number];

// Tone options
export const TONE_OPTIONS = [
  "casual",
  "professional",
  "technical",
  "witty",
] as const;
export type ToneOption = (typeof TONE_OPTIONS)[number];

// Generation frequency
export const GENERATION_FREQUENCIES = [
  "daily",
  "every_3_days",
  "weekly",
] as const;
export type GenerationFrequency = (typeof GENERATION_FREQUENCIES)[number];

// Content generation log status
export const GENERATION_LOG_STATUSES = ["success", "failed"] as const;
export type GenerationLogStatus = (typeof GENERATION_LOG_STATUSES)[number];

// Valid content status transitions
export const VALID_TRANSITIONS: Record<ContentStatus, ContentStatus[]> = {
  draft: ["approved", "discarded"],
  approved: ["discarded"],
  discarded: [],
};
