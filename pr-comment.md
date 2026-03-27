**PR Checklist**

- [ ] Run `npx tsc --noEmit` (type-check)
- [ ] Run `npx eslint 'app/**' 'components/**' 'context/**' 'lib/**' --ext .ts,.tsx` and fix warnings
- [ ] Run `npm test` and verify all Jest suites pass
- [ ] Confirm `npm ci` succeeds in CI (or acknowledge fallback to `npm install --legacy-peer-deps`)
- [ ] Smoke-test Expo app locally (simulator/device)
- [ ] Verify no runtime regressions in core flows (login/post/jobs/messages)
- [ ] Update `AUDIT-TRIAGE.md` with remaining advisories and mitigation plan
- [ ] Add reviewers and link to staging verification instructions
