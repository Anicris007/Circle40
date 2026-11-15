# Circle40

A friendship app for single adults whose friends have married and who want people to go out with: post a plan (brunch, a trek, a movie), join small groups nearby, and turn good meetups into regular friends. Friendship only, with safety built in: verified profiles, public meeting places, report and block.

## What's in this repo

| Folder | What |
|---|---|
| [`mobile/`](mobile/) | The iOS and Android app: React Native + Expo (TypeScript). See [mobile/README.md](mobile/README.md) to run it. |
| [`supabase/migrations/`](supabase/migrations/) | Database schema for the Supabase backend (Postgres + PostGIS, Row Level Security). |
| [`circle40.html`](circle40.html) | The original clickable prototype. Open it in a browser. |

## Status

- **Milestone 1 (now):** app screens running on sample data, with light and dark mode, plus the database design.
- **Milestone 2:** connect Supabase for phone sign-in, real plans, chat and reports.
- **Later:** ID verification, moderation, push notifications, app store releases.

## Contributing

`main` is protected: every change goes through a branch and a pull request. See [CLAUDE.md](CLAUDE.md) for the workflow.
