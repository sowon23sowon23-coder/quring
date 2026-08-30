# CURING Web

CURING is a calm desktop-first QT workspace for reading scripture, journaling, and sharing one-on-one with a QT Mate.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth and Database
- Lucide Icons

## Implemented Foundation

- Responsive dashboard shell with desktop 3-column layout and mobile bottom navigation
- Today's scripture hero and reader view
- QT workspace with split scripture/journal panels
- Local autosave for draft answers
- QT Mate invite/schedule screen
- Mutual unlock UI rule: both users must complete QT before entries are visible
- Archive, search preview, journey, notifications, profile, and admin starter screens
- Supabase schema draft in `supabase/schema.sql`

## Run

```bash
npm install
npm run dev
```

Add Supabase values to `.env.local` when connecting real auth/database APIs:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
