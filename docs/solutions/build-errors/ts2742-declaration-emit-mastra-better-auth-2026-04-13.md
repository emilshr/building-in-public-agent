---
title: TS2742 failures when typechecking apps that depend on Mastra or Better Auth
date: 2026-04-13
category: build-errors
module: monorepo-typescript
problem_type: build_error
component: tooling
symptoms:
  - TypeScript TS2742 errors during `tsc` / turbo typecheck for apps consuming `@mastra/core` or Better Auth, often complaining that inferred types refer to inaccessible names when generating declaration files
  - Typecheck failures spanning `apps/agent`, `apps/worker`, and `apps/web` while shared packages still emitted declarations as expected
root_cause: config_error
resolution_type: config_change
severity: medium
tags:
  - typescript
  - ts2742
  - declaration-emit
  - monorepo
  - mastra
  - better-auth
  - turbo
---

# TS2742 failures when typechecking apps that depend on Mastra or Better Auth

## Problem

Application packages extended shared TypeScript config with declaration emit enabled (via the shared `node-library` / Next.js presets). Running the repo typecheck surfaced **TS2742**: the compiler could not emit stable `.d.ts` files because public APIs inferred types from dependency internals (Mastra, Better Auth) that were not valid declaration emit targets.

## Symptoms

- `tsc` reported **TS2742** (inferred type cannot be named without a reference to an inaccessible module) when building or typechecking `apps/agent`, `apps/worker`, and `apps/web`.
- Failures clustered around entrypoints and handlers that touched Mastra or Better Auth types, blocking a green `turbo` typecheck across the monorepo.
- A separate strictness issue: indexed assignment on a Node `Buffer` in `packages/db` tests tripped typechecking under `noUncheckedIndexedAccess`-style rules.

## What Didn't Work

- Relying on default `declaration: true` from extended configs for **apps** that are not published as type libraries — declaration emit is unnecessary for deployable Next/Express services and amplifies TS2742 when dependencies expose complex inferred types.
- Leaving `apps/web` without direct `drizzle-orm` / `@types/pg` typings when code imported those modules for DB typing — produced missing-type errors independent of TS2742.

## Solution

1. **Disable declaration emit for application packages** by overriding in each app `tsconfig.json`:

```json
"compilerOptions": {
  "declaration": false,
  "declarationMap": false
}
```

Applied to `apps/agent`, `apps/worker`, and `apps/web` (see commit `2c497cc`). Libraries intended for consumption (`packages/*`) kept declaration emit where appropriate.

2. **`apps/agent` Mastra instance export** — use a local `const` and `export { mastra }` so the public surface stays explicit and tooling-friendly:

```ts
const mastra = new Mastra({
  agents: {},
});

export { mastra };
```

3. **`packages/db` crypto test** — avoid indexed write on `Buffer` that triggers strict indexed access; use `writeUInt8`:

```ts
tampered.writeUInt8(tampered[tampered.length - 1]! ^ 0xff, tampered.length - 1);
```

4. **`apps/web` dependencies** — add `drizzle-orm` and `@types/pg` where the app imports or types against those modules so typecheck resolves DB-related types.

## Why This Works

TS2742 appears when TypeScript must **write** a `.d.ts` that names a type originating from a module not visible in the consumer’s public API graph. **Turning off declaration emit for apps** stops the compiler from needing to serialize those inferred types to declaration files; typechecking still validates implementation code. Fixing the Buffer mutation and adding explicit typings removes orthogonal errors so the pipeline reflects the real TS2742 class of issues.

## Prevention

- Treat **declaration emit as a product decision**: enable only for packages you publish (`types` / `main` / `exports` for consumers). For Next.js and internal Node services, prefer `declaration: false` unless you intentionally ship `.d.ts` from that package.
- When adopting heavy SDKs (agents, auth), run `pnpm exec tsc --noEmit` in the app **before** wiring CI `turbo` typecheck; catch TS2742 early.
- For tamper/mutation tests on `Buffer`, prefer `readUInt8` / `writeUInt8` over indexed assignment when `noUncheckedIndexedAccess` is in play.
- Keep **runtime deps that carry types** (`drizzle-orm`, `@types/pg`) declared in the package that imports them, not only in transitive workspace packages.

## Related Issues

- No overlapping `docs/solutions/` entries at time of writing.
- `gh issue list --search "TS2742 typescript mastra"` returned no open/closed matches in this repository.
