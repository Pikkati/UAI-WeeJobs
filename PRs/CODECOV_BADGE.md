Codecov Badge
=============

To add a Codecov coverage badge to the README, add the following Markdown snippet (replace `Pikkati/UAI-WeeJobs` and branch as required):

```
[![codecov](https://codecov.io/gh/Pikkati/UAI-WeeJobs/branch/UAI-Development/graph/badge.svg)](https://codecov.io/gh/Pikkati/UAI-WeeJobs)
```

Notes:
- The GitHub Action `.github/workflows/ci-tests.yml` now uploads `coverage` and uses `codecov/codecov-action@v4`.
- For private repos set `CODECOV_TOKEN` in repository secrets; public repos do not require a token.
