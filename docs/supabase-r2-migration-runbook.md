# Supabase + R2 Migration Runbook

This runbook migrates Firestore data into Supabase and configures Cloudflare R2 for quote video storage.

## 1) Environment setup

Copy `.env.example` to `.env.local` and set values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_PASSWORD`
- `SUPABASE_ACCESS_TOKEN`
- `R2_ACCOUNT_ID`
- `R2_BUCKET_NAME=takeshape-quote-videos`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_S3_API`
- `R2_CORS_ORIGINS=http://localhost:3000,https://takeshapehome.com,https://app.takeshapehome.com`

## 2) Install/update dependencies

```bash
npm install
```

## 3) Apply Supabase schema migrations

```bash
npx supabase login --token "$SUPABASE_ACCESS_TOKEN"
npx supabase link --project-ref mfqxogzcanmoicfbgfwj
npx supabase db push
```

The main collection rename is already modeled:

- Firestore `painters` -> Supabase `providers`

## 4) Configure R2 bucket + CORS

```bash
npm run setup:r2
```

This creates `R2_BUCKET_NAME` if missing and configures CORS.

## 5) Backfill Firestore data into Supabase

```bash
npm run backfill:supabase
npm run verify:backfill
```

Mapped collections:

- `painters` -> `providers`
- `homeowners` -> `homeowners`
- `houses` -> `houses`
- `sessions` -> `sessions`
- `rooms` -> `rooms`
- `painters/{providerId}/quotes/*` -> `quotes`

## 6) Cut over API reads/writes gradually

Enable:

```bash
USE_SUPABASE_DATA_LAYER=true
COPY_SIGNALWIRE_RECORDINGS_TO_R2=true
```

Current routes wired for phased cutover:

- `/api/sessions/list`
- `/api/painter/addSession` (supports provider data in Supabase mode)
- `/api/stripe/confirm` (updates `providers` when Supabase mode is on)
- `/api/quotes/by-conference` (reads Supabase first in Supabase mode)
- `/api/quotes/sync` (mirrors a Firestore quote into Supabase for dual-write testing)
- `/api/quotes/finalize-recording` (copies SignalWire recording to R2 + tracks `video_assets` in Supabase mode)
- `/api/video/r2/upload-url`
- `/api/video/r2/download-url`

## 7) Rollback

Set:

```bash
USE_SUPABASE_DATA_LAYER=false
```

This returns the updated routes to Firestore behavior.

## 8) Security follow-up

- Rotate secrets that were shared during setup.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.
- Keep R2 write credentials server-only.
