# Circle40

A friendship app for single adults whose friends have married and who want people to go out with. Planned stack: React Native + Expo (TypeScript) for iOS and Android, Supabase (Postgres, Auth, Realtime, PostGIS) for the backend. `circle40.html` is the clickable prototype.

## Git workflow (required)

`main` is protected. Never commit to it or push to it directly.

1. Start every change from an up-to-date main: `git switch main`, `git pull`, then `git switch -c <type>/<short-name>` (for example `feat/plan-details`, `fix/chat-send`, `chore/setup-expo`).
2. Commit on that branch. Push only that branch: `git push -u origin <branch>`.
3. Open a pull request into main with `gh pr create`, with a clear title and a summary of what changed and how it was checked.
4. Do not merge the pull request. The repo owner reviews and merges it.

A PreToolUse hook (`.claude/hooks/block-main-push.ps1`) blocks `git push` to main and `gh pr merge`. Do not work around it.
