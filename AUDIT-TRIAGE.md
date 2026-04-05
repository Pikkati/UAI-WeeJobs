# npm Audit Triage

Date: 2026-03-24

Summary:

- Total advisories: 21 (5 high, 7 moderate, 9 low)
- Most high/moderate findings are transitive under `jest-expo` and `@expo/config` (dev dependencies/test tooling).

For each advisory below: Name, Severity, Affected node path, Fix suggestion, Recommended priority

1. `@expo/config`
   - Severity: high
   - Nodes: `node_modules/jest-expo/node_modules/@expo/config`
   - Fix: Upgrade `jest-expo` to 55.0.11 (fix is semver-major)
   - Priority: High (dev-only); schedule in a dedicated PR because it's breaking

2. `@expo/config-plugins`
   - Severity: moderate
   - Nodes: `node_modules/jest-expo/node_modules/@expo/config-plugins`
   - Fix: Upgrade `jest-expo` to 55.0.11 (semver-major)
   - Priority: Medium (dev-only)

3. `@jest/core`
   - Severity: low
   - Nodes: `node_modules/@jest/core`
   - Fix: bump `jest` to a later compatible release (audit suggests v30.x)
   - Priority: Low (dev)

4. `@jest/transform`
   - Severity: moderate
   - Nodes: `node_modules/jest-expo/node_modules/@jest/transform`
   - Fix: upgrading `jest-expo` or `@jest/transform` transitively (released in newer jest)
   - Priority: Medium (dev)

5. `@tootallnate/once`
   - Severity: low
   - Nodes: `node_modules/@tootallnate/once` (via `http-proxy-agent`)
   - Fix: bump packages that depend on it (audit suggests jest -> 30.x), or accept as dev-only
   - Priority: Low

6. `anymatch`
   - Severity: moderate
   - Nodes: `node_modules/sane/node_modules/anymatch`
   - Fix: upgrade `jest-expo` / `sane` chain (fix available via jest-expo 55.x)
   - Priority: Medium

7. `babel-jest`
   - Severity: moderate
   - Nodes: `node_modules/jest-expo/node_modules/babel-jest`
   - Fix: upgrade `jest-expo` (55.x) which pulls newer babel-jest
   - Priority: Medium

8. `braces`
   - Severity: high
   - Nodes: `node_modules/sane/node_modules/braces`
   - Fix: upgrade `jest-expo` to 55.x (breaking)
   - Priority: High (dev)

9. `http-proxy-agent`
   - Severity: low
   - Nodes: `node_modules/http-proxy-agent` (affects `jsdom`)
   - Fix: upgrade consumers (jest/jsdom) or accept for dev
   - Priority: Low

10. `jest` (top-level)
    - Severity: low
    - Nodes: `node_modules/jest`
    - Fix: Upgrade to 30.x to address several transitive advisories (breaking relative to 27.x)
    - Priority: Medium (dev)

11. `jest-cli`, `jest-config`, `jest-environment-jsdom`, `jest-runner`
    - Severity: low/moderate
    - Nodes: under `node_modules/jest-expo/node_modules/*` and top-level `node_modules/*`
    - Fix: align jest/jest-expo versions (upgrade jest-expo to 55.x and bump jest to 30.x)
    - Priority: Medium

12. `jest-expo`
    - Severity: high
    - Nodes: `node_modules/jest-expo`
    - Fix: Upgrade to `jest-expo@55.0.11` (semver-major). This is the single change that fixes many advisories.
    - Priority: High (dev). Requires CI and test updates.

13. `jest-haste-map`, `sane`, `micromatch`
    - Severity: moderate/high
    - Nodes: under `node_modules/jest-expo/node_modules/*` and `node_modules/sane`.
    - Fix: upgrade jest-expo chain (55.x) or replace tooling that depends on `sane`.
    - Priority: Medium

14. `jsdom`
    - Severity: low
    - Nodes: `node_modules/jsdom`
    - Fix: upgrade `jsdom` via `jest`/`jest-environment-jsdom` bump
    - Priority: Low

15. `semver`, `xml2js`
    - Severity: high / moderate
    - Nodes: `node_modules/jest-expo/node_modules/semver`, `node_modules/jest-expo/node_modules/xml2js`
    - Fix: upgrade `jest-expo` (55.x)
    - Priority: High for `semver`, Medium for `xml2js` (dev-only)

Notes & recommended approach:

- All high-severity items are in devDependencies (test tooling). They do not directly affect production runtime.
- Recommended path: create a dedicated branch `audit/jest-expo-upgrade` to upgrade `jest-expo` to 55.x and `jest` to 30.x in one PR.
  - Steps: bump `jest-expo` and `jest`, run `npm ci`, fix or update mocks (`__mocks__/*`, `jest.config.cjs`, `jest-setup.js`), run full test suite, run CI, and smoke-test Expo app.
- If you prefer lower risk: accept dev-only advisories short-term and schedule the breaking upgrade in a planned release window.

Reproduce commands:

```bash
npm ci
npm audit --json > /tmp/npm-audit.json
```

Next actions (suggested):

- [ ] Open `audit/jest-expo-upgrade` branch and implement upgrades + tests (recommended if you want to remediate now).
- [ ] Or, accept dev-only advisories and schedule a planned upgrade (create an issue linking to this file).

File created by automated triage on behalf of repository maintainers. Review and approve next action.
