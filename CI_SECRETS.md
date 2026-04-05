CI secrets required for this repository

Add these repository secrets in GitHub: Settings → Secrets → Actions.

- EXPO_PUBLIC_SUPABASE_URL: Your Supabase project URL (e.g. https://xyz.supabase.co)
- EXPO_PUBLIC_SUPABASE_ANON_KEY: Supabase anon/public key

Optional (if you use them):

- NODE_AUTH_TOKEN: npm auth token for private package installs (if needed)
- GH_TOKEN: GitHub token for auth-requiring actions (only if workflow needs it)
- NPM_TOKEN: Token used by `semantic-release` or `npm publish` for publishing packages. Add this if you plan to publish packages from CI.

Recommended secrets for release workflows:

- `NPM_TOKEN`: npm automation token created from your npm account (read the npm docs on automation tokens). Store as a repository secret named `NPM_TOKEN`.
- `EAS_TOKEN`: Expo Application Services token for EAS builds (already used in staging workflows).
- `SENTRY_AUTH_TOKEN`: If using Sentry releases, create a scoped token and store as `SENTRY_AUTH_TOKEN`.

If you plan to use Sentry releases from CI, also add:

- `SENTRY_ORG`: your Sentry organization slug (e.g., `my-company`)
- `SENTRY_PROJECT`: your Sentry project slug (e.g., `weejobs-mobile`)

Example `gh` CLI commands:

gh secret set NPM_TOKEN --body "<your-npm-token>" --repo getnudged/weejobs
gh secret set SENTRY_AUTH_TOKEN --body "<your-sentry-token>" --repo getnudged/weejobs
gh secret set SENTRY_ORG --body "<your-sentry-org>" --repo getnudged/weejobs
gh secret set SENTRY_PROJECT --body "<your-sentry-project>" --repo getnudged/weejobs

How to add using `gh` CLI (replace values):

```bash
gh secret set EXPO_PUBLIC_SUPABASE_URL --body "https://your-project.supabase.co" --repo getnudged/weejobs
gh secret set EXPO_PUBLIC_SUPABASE_ANON_KEY --body "your-anon-key" --repo getnudged/weejobs
gh secret set NPM_TOKEN --body "<your-npm-token>" --repo getnudged/weejobs
gh secret set SENTRY_AUTH_TOKEN --body "<your-sentry-token>" --repo getnudged/weejobs
```

Notes:

- Only repo admins can add secrets.
- Do not commit secret values to the repo.
- Once added, rerun the CI workflow or push a trivial commit to trigger it.

## Troubleshooting & verification

If a workflow appears to fail due to a missing secret, verify the secret is present in the repository settings (Settings → Secrets and variables → Actions).

You can also add a short, temporary workflow step to assert a secret is available (the value will be masked in workflow logs). Example:

```yaml
- name: Verify secrets present
	run: |
		if [ -z "$EXPO_PUBLIC_SUPABASE_URL" ]; then
			echo "MISSING: EXPO_PUBLIC_SUPABASE_URL"
			exit 1
		else
			echo "OK: EXPO_PUBLIC_SUPABASE_URL present"
		fi
	env:
		EXPO_PUBLIC_SUPABASE_URL: ${{ secrets.EXPO_PUBLIC_SUPABASE_URL }}
```

If a secret is missing in CI but present in the repo settings, confirm whether the workflow runs on a fork or from a contributor branch — repository secrets are not available to workflows triggered from forked repositories for security reasons.

For organization-managed repositories, consider using organization-level secrets or environments with protection rules.
