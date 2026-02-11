# SlideIn

SlideIn is an AI cold outreach assistant. You give it a URL - a professor’s lab page, a job posting, or a company about page - and it drafts a personalized email for you. You choose the goal and tone, then send from Gmail or Outlook with optional open tracking and attachments.

## What it does

The main flow is simple: paste a URL, describe what you want (e.g. “ask about joining the lab” or “express interest in the role”), pick a tone, and generate. The app fetches the page, figures out the context (academic, job, or company), tries to pull the recipient’s name from the page or URL, and uses that plus your goal and tone to create a tailored draft. You can edit the draft, attach files, and send it through a connected Gmail or Outlook account. If you enable tracking, you get open counts and last-opened timestamps in the inbox/analytics view.

So in practice it’s built for things like grad students emailing professors, job seekers reaching out to hiring managers, or anyone doing cold outreach where the first step is “turn this webpage into a solid, personalized email.”

## Technical overview

- **Stack**: Next.js 15 (App Router), React 18, TypeScript. UI is Tailwind CSS with Radix UI and Framer Motion.
- **Auth**: Supabase Auth. Sign up/sign in with email; middleware protects app routes and redirects unauthenticated users to sign-in.
- **Email generation**: The `/api/generate-email` route accepts the page content (or a URL that the client can resolve), your goal, tone, and optional recipient/name hints. The server uses Cheerio to clean and parse the HTML (strip nav/footer, limit length), detects context (academic vs job vs company), runs name extraction (patterns + optional Gemini fallback), then calls the Google Gemini API to produce the email body and subject. Content length sent to Gemini is capped to stay within model limits.
- **Sending**: Sending is done via `/api/send-email`. It supports Gmail (OAuth + Gmail API) and Outlook (Microsoft Graph). Tokens are refreshed when close to expiry. Emails can include file attachments (multipart MIME, base64); total attachment size is limited (e.g. 25MB). Optional tracking injects a tracking pixel and records events in Supabase.
- **Tracking**: Open tracking uses a 1x1 pixel that hits a Supabase Edge Function; the function updates an `email_events`-style table (open count, last opened, status). The app’s inbox/analytics UI reads from that data.
- **Data**: Supabase is used for auth, email event/tracking tables, and any app settings or user-linked data. Migrations live under `supabase/migrations/`.

## Main pieces of the codebase

- **Landing**: `app/page.tsx` and `components/landing-page-client.tsx` — landing page, sign-in/sign-up links, and redirect to the app when already authenticated.
- **App shell**: `app/(main)/` — email generator, inbox, analytics, settings. Layout and nav live in the main layout and sidebar components.
- **Email generator**: `components/email-generator.tsx` and `email-generator-client.tsx` — URL input, goal/tone, generate button, editor, attach/send. Client checks Supabase session and redirects to sign-in if needed.
- **APIs**: `app/api/generate-email/route.ts` (fetch/parse, context detection, name extraction, Gemini), `app/api/send-email/route.ts` (Gmail/Outlook send, optional tracking and attachments).
- **Auth**: Supabase in `lib/` and `utils/supabase/`; middleware in `middleware.ts` for route protection and redirects.
- **Tracking**: `utils/email-tracking.ts` and the Supabase Edge Function (e.g. `supabase/functions/tracker/`) for the pixel and event updates.

## Getting started

1. Clone the repo and install dependencies: `npm install`.
2. Set up environment variables. You’ll need at least:
   - Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (and any server-side keys if you use them).
   - Google Gemini: `GEMINI_API_KEY` for the generate-email API.
   - Gmail/Outlook: configured OAuth credentials and any client secrets used by the send-email and OAuth callback routes (see README-GMAIL.md / README-OUTLOOK.md if present).
3. Run Supabase migrations so auth and tracking/email tables exist.
4. Run the app: `npm run dev` (and optionally build with `npm run build`).

## File attachments

Attachments are supported in the composer and send flow: common document and image types, with a per-file and total size limit (e.g. 25MB). The send API builds a multipart MIME message with base64-encoded parts and correct MIME types. Frontend validation warns before send if files are too large or disallowed.

## License and use

This project is private. Use it according to your own terms and any applicable OAuth and API policies (Google, Microsoft, Supabase).
