---
date: 2026-04-13
topic: building-in-public-agent
---

# Building in Public Agent

## What We're Building

A platform for solo builders who are building in public to automatically generate marketing content for their products. The system integrates directly into their codebase via a GitHub App, analyzes the full codebase, and produces tailored marketing content (tweets, articles, social posts) based on the user's preferences.

The platform is fully open source with a BYOK (Bring Your Own Key) model — users provide their own LLM API keys (OpenRouter, Anthropic, OpenAI) which are encrypted per-user and decrypted at runtime.

## Target User

Solo builders, indie hackers, and developers who are building products in public and need help creating consistent marketing content without spending hours writing it themselves.

## Why This Approach

### Repository Access: GitHub App

We chose a GitHub App install over OAuth scopes or manual tokens because:
- Granular permissions (read-only access to specific repos)
- Supports webhooks for future features (auto-generate content on push)
- Better security model than broad OAuth scopes
- Professional installation flow that users trust

### Repository Analysis: Full Codebase Summary

The agent will clone/fetch the repo and analyze file structure, README, package configs, tech stack, and code patterns. This provides richer context than just README/metadata, leading to more accurate and specific marketing content. The analysis feeds into a structured product summary that the LLM uses as context for all content generation.

### Content Delivery: Dashboard with Scheduled Posts

Content appears in an in-app dashboard with a content calendar. Users can review, edit, and schedule when content goes live. Initially supports Twitter/X only — the most natural platform for the "building in public" audience. Other platforms (LinkedIn, Reddit) will be added later.

### Onboarding: Toggle-Based Content Presets

During onboarding, users see content types as simple toggles: Tweets, Thread ideas, LinkedIn posts, Reddit posts, Instagram captions, TikTok scripts. They enable what they want. Clean, low-friction, easy to understand.

### Content Generation Frequency: User-Configured

Users set their own generation frequency during onboarding (daily, every 3 days, weekly). Inngest cron triggers per-user at their chosen interval. This gives users control over their LLM costs since they're using their own keys.

### BYOK Key Management: Per-User Derived Keys

API keys are encrypted using AES-256-GCM with per-user derived encryption keys (user ID + app secret via HKDF). This provides user-level isolation — even if the app secret leaks, an attacker still needs the per-user derivation to decrypt keys.

### Orchestration Split: Mastra for AI, Inngest for Infra

- **Mastra** handles all AI-related orchestration: repo analysis workflows, content generation pipelines, LLM provider routing
- **Inngest** handles infrastructure: scheduling content posts, cron jobs for generation frequency, retries, and background tasks like posting to Twitter

## Key Decisions

- **Auth**: Better Auth with GitHub social login as the only auth method
- **Repo access**: GitHub App installation (not OAuth scopes)
- **Analysis depth**: Full codebase summary (clone + analyze)
- **Content delivery**: Dashboard with content calendar and scheduled posting
- **Initial platform**: Twitter/X only (expand later)
- **Onboarding**: Toggle-based content type presets
- **Generation frequency**: User-configured (daily / every 3 days / weekly)
- **BYOK encryption**: Per-user derived keys (HKDF from user ID + app secret, AES-256-GCM)
- **AI orchestration**: Mastra (AI workflows) + Inngest (infra/crons/scheduling)
- **Database**: PostgreSQL with Drizzle ORM
- **Env validation**: Zod everywhere
- **Twitter posting**: OAuth 2.0 (app posts on behalf of users)
- **Repo re-analysis**: Webhook-triggered (on push to default branch via GitHub App)
- **Content tone**: Agent infers from repo, user can adjust/override

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, shadcn/ui, Tailwind CSS |
| Auth | Better Auth (GitHub social login only) |
| Database | PostgreSQL + Drizzle |
| AI Orchestration | Mastra |
| Infra Orchestration | Inngest |
| Env Validation | Zod |
| Monorepo | Turborepo + pnpm |

## Monorepo Structure

```
apps/
  web/        # Next.js 16 app (UI, API routes, auth, dashboard)
  worker/     # Node.js service with Inngest function definitions
  agent/      # Mastra AI agent service (repo analysis, content generation)

packages/
  db/         # Drizzle schema, migrations, shared DB utilities
  types/      # Shared TypeScript types
  ui/         # shadcn component library (already exists)
  eslint-config/
  typescript-config/
```

## Core User Flow

1. **Sign up** via GitHub social login
2. **Install GitHub App** on their repo(s)
3. **Onboarding** — answer basic product questions, toggle content types, set generation frequency
4. **Agent analyzes** the full codebase and builds a product summary
5. **Provide BYOK API key** (OpenRouter / Anthropic / OpenAI) — encrypted and stored
6. **Content generation** runs on user's configured schedule via Inngest cron
7. **Review content** in dashboard — edit, approve, schedule
8. **Scheduled posts** go live via Twitter/X API at configured times

## Resolved Questions

- **Twitter/X API access**: OAuth 2.0 — the app posts on behalf of users. Users connect their Twitter account via OAuth. Better UX, no need for users to obtain their own Twitter API keys.
- **Repo re-analysis**: Webhook-triggered — re-analyze when the GitHub App detects a push to the default branch. Near real-time, efficient, leverages the GitHub App's webhook capability.
- **Content tone/voice**: Agent infers a tone from the repo analysis, then the user can adjust/override during onboarding. Best of both worlds — smart defaults with user control.

## Next Steps

-> `/workflows:plan` for implementation details
