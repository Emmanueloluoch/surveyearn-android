# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Native Android App (SurveyPesa KE)

Located at `artifacts/surveypesa-native/` — a full native Kotlin + Jetpack Compose Android app.

- **Target APK size**: ~6–10 MB (arm64-only, R8 minification)
- **Package**: `com.surveypesa.ke`
- **API**: `https://survey-creator-surveypesa-ke.replit.app/`
- **Build**: GitHub Actions (no Android Studio required)
- **Stack**: Kotlin, Jetpack Compose, Retrofit, DataStore, Navigation Compose, Material 3

### How to Build the APK
1. Create a GitHub repo and push `artifacts/surveypesa-native/` to it
2. GitHub Actions runs automatically and builds a debug APK
3. Download the APK from the Actions → Artifacts section
4. For signed release APK: run the "Generate Keystore" workflow once, add secrets, then rebuild
