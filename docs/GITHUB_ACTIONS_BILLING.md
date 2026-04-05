## GitHub Actions Billing & Self-hosted Runners

If GitHub Actions jobs are blocked with messages like "recent account payments have failed" or "your spending limit needs to be increased":

- Owners: check GitHub Organization > Settings > Billing & plans to review payment status and spending limits.
- Increase the Actions billing limit or update the payment method to restore runner capacity.
- As an alternative, configure self-hosted runners:
  - Add runner hosts in the repository or organization settings under Actions > Runners.
  - Install the runner software per https://docs.github.com/actions/hosting-your-own-runners
  - Update workflows to include `runs-on: [self-hosted, linux]` or use runner labels.

Local-first recommendation:

- Use the `act` emulator for local verification and pin modern container images when required, e.g. in the workflow or via `act -P ubuntu-latest=nektos/act-environments-ubuntu:22.04`.

If you want, I can draft a short admin checklist to share with organization owners to restore billing quickly.
