# Onboarding checklist

This document describes the in-app onboarding checklist for new users and how it should behave.

Goals

- Guide new users through posting a job, setting up profile, and verifying contact details.
- Provide a persistent checklist with dismiss/complete actions.
- Allow users to resume incomplete steps and mark them as done.

Checklist items (minimum):

1. Add your name and photo (Profile)
2. Add a payment method (Customer)
3. Verify your phone number or email
4. Post your first job
5. Review your notification settings

Implementation notes

- The checklist will be shown to users on first login and accessible from Settings > Onboarding.
- Persist state in `AsyncStorage` under key `weejobs_onboarding_checklist_v1`.
- Each checklist item should have a deep-link to the relevant screen.
- Add analytics events for `onboarding_checklist_shown`, `onboarding_item_completed`, and `onboarding_completed`.

UI

- Use a simple list with checkboxes and a progress bar at the top.
- Allow skipping items (mark as dismissed) but keep them visible under "Skipped".

