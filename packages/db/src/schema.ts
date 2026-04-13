import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// ─── Better Auth tables ─────────────────────────────────────────────────────
// These follow Better Auth's expected schema for the Drizzle adapter.

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Application tables ─────────────────────────────────────────────────────

export const githubInstallation = pgTable("github_installation", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  installationId: integer("installation_id").notNull(),
  accountLogin: text("account_login").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const repo = pgTable("repo", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  githubInstallationId: text("github_installation_id")
    .notNull()
    .references(() => githubInstallation.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  defaultBranch: text("default_branch").notNull().default("main"),
  cloneUrl: text("clone_url").notNull(),
  productSummary: text("product_summary"),
  inferredTone: text("inferred_tone"),
  summaryVersion: integer("summary_version").notNull().default(0),
  lastAnalyzedAt: timestamp("last_analyzed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const apiKey = pgTable("api_key", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  encryptedKey: text("encrypted_key").notNull(),
  keyVersion: integer("key_version").notNull().default(1),
  isValid: boolean("is_valid").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userPreferences = pgTable("user_preferences", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  contentTypes: text("content_types"),
  tone: text("tone"),
  generationFrequency: text("generation_frequency").default("weekly"),
  timezone: text("timezone").default("UTC"),
  onboardingStep: integer("onboarding_step").default(0),
  onboardingComplete: boolean("onboarding_complete").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const twitterConnection = pgTable("twitter_connection", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  twitterUserId: text("twitter_user_id").notNull(),
  twitterUsername: text("twitter_username").notNull(),
  encryptedAccessToken: text("encrypted_access_token").notNull(),
  encryptedRefreshToken: text("encrypted_refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const content = pgTable("content", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  repoId: text("repo_id")
    .notNull()
    .references(() => repo.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  body: text("body").notNull(),
  status: text("status").notNull().default("draft"),
  twitterPostId: text("twitter_post_id"),
  errorMessage: text("error_message"),
  summaryVersion: integer("summary_version"),
  idempotencyKey: text("idempotency_key").unique(),
  scheduledFor: timestamp("scheduled_for"),
  postedAt: timestamp("posted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const contentGenerationLog = pgTable("content_generation_log", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  repoId: text("repo_id")
    .notNull()
    .references(() => repo.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  model: text("model").notNull(),
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  status: text("status").notNull(),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notification = pgTable("notification", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Relations ──────────────────────────────────────────────────────────────

export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  githubInstallations: many(githubInstallation),
  repos: many(repo),
  apiKeys: many(apiKey),
  preferences: one(userPreferences),
  twitterConnection: one(twitterConnection),
  content: many(content),
  contentGenerationLogs: many(contentGenerationLog),
  notifications: many(notification),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const githubInstallationRelations = relations(
  githubInstallation,
  ({ one, many }) => ({
    user: one(user, {
      fields: [githubInstallation.userId],
      references: [user.id],
    }),
    repos: many(repo),
  }),
);

export const repoRelations = relations(repo, ({ one, many }) => ({
  user: one(user, { fields: [repo.userId], references: [user.id] }),
  githubInstallation: one(githubInstallation, {
    fields: [repo.githubInstallationId],
    references: [githubInstallation.id],
  }),
  content: many(content),
  contentGenerationLogs: many(contentGenerationLog),
}));

export const apiKeyRelations = relations(apiKey, ({ one }) => ({
  user: one(user, { fields: [apiKey.userId], references: [user.id] }),
}));

export const userPreferencesRelations = relations(
  userPreferences,
  ({ one }) => ({
    user: one(user, {
      fields: [userPreferences.userId],
      references: [user.id],
    }),
  }),
);

export const twitterConnectionRelations = relations(
  twitterConnection,
  ({ one }) => ({
    user: one(user, {
      fields: [twitterConnection.userId],
      references: [user.id],
    }),
  }),
);

export const contentRelations = relations(content, ({ one }) => ({
  user: one(user, { fields: [content.userId], references: [user.id] }),
  repo: one(repo, { fields: [content.repoId], references: [repo.id] }),
}));

export const contentGenerationLogRelations = relations(
  contentGenerationLog,
  ({ one }) => ({
    user: one(user, {
      fields: [contentGenerationLog.userId],
      references: [user.id],
    }),
    repo: one(repo, {
      fields: [contentGenerationLog.repoId],
      references: [repo.id],
    }),
  }),
);

export const notificationRelations = relations(notification, ({ one }) => ({
  user: one(user, { fields: [notification.userId], references: [user.id] }),
}));
