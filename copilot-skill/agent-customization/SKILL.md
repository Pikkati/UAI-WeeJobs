# Agent Customization Notes

Purpose: record the repository branch policy and instructions for automation agents.

- Default working branch: `UAI-Development` — all active development, audits, and upgrades must target this branch.
- `main` is reserved for stable releases only. Do NOT merge experimental or upgrade branches directly into `main`.
- If you are an automation agent or CI workflow: when creating long-running upgrade changes, create a dedicated branch under `audit/` or `UAI-Development`, run tests, and open a PR against `UAI-Development`.

If a mistaken merge to `main` occurs:

1. Create a backup branch from the current `main` (example: `backup/main-post-merge`).
2. Reset `main` to the intended stable commit and force-push (only with repo admin approval).
3. Continue development on `UAI-Development` and open PRs as needed.
