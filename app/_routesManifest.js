// Very-early import-time marker: runs before module manifest so we can detect cold-start.
try {
  if (typeof globalThis !== 'undefined') {
    globalThis.__EXPO_ROUTER_INSPECTOR_VERY_EARLY = { ts: Date.now(), source: '_routesManifest-top' };
  }
  if (typeof console !== 'undefined') {
    if (typeof console.error === 'function') {
      console.error('[expo-router-inspector-very-early] _routesManifest-top initialized', JSON.stringify({ ts: Date.now() }));
    } else if (typeof console.log === 'function') {
      console.log('[expo-router-inspector-very-early] _routesManifest-top initialized', Date.now());
    }
  }
} catch (e) {}

// Auto-generated fallback route keys for expo-router.
// This file provides a runtime fallback used when Metro's `require.context` keys
// are empty in the bundled/compiled artifact (Hermes bytecode builds).
// Keep this file minimal: it runs at import-time and populates a global variable.
globalThis.__EXPO_ROUTER_KEYS = [
  "./_layout.tsx",
  "./index.tsx",
  "./tradie/_layout.tsx",
  "./tradie/review-customer.tsx",
  "./tradie/profile.tsx",
  "./tradie/pricing.tsx",
  "./tradie/payout.tsx",
  "./tradie/messages.tsx",
  "./tradie/index.tsx",
  "./tradie/home.tsx",
  "./tradie/dashboard.tsx",
  "./tradie/current-jobs.tsx",
  "./settings.tsx",
  "./public-profile.tsx",
  "./onboarding/signup.tsx",
  "./onboarding/role-select.tsx",
  "./onboarding/reset-password.tsx",
  "./onboarding/login.tsx",
  "./onboarding/intro.tsx",
  "./onboarding/checklist.tsx",
  "./chat/[jobId].tsx",
  "./job/_layout.tsx",
  "./job/tracking.tsx",
  "./job/send-quote.tsx",
  "./job/review.tsx",
  "./job/receipt.tsx",
  "./job/pay-final.tsx",
  "./job/pay-deposit.tsx",
  "./job/choose-tradesman.tsx",
  "./job/approve-quote.tsx",
  "./admin/_layout.tsx",
  "./admin/users.tsx",
  "./admin/index.tsx",
  "./admin/settings.tsx",
  "./admin/jobs.tsx",
  "./+not-found.tsx",
  "./customer/_layout.tsx",
  "./customer/profile.tsx",
  "./customer/post-job.tsx",
  "./customer/messages.tsx",
  "./customer/jobs.tsx",
  "./customer/jobs.helpers.ts",
  "./customer/index.tsx",
  "./customer/edit-job.tsx",
  "./customer/dashboard.tsx"
];

// Adds on-demand route module resolution for the fallback route manifest path.
// This avoids undefined route components when Metro context is empty.
globalThis.__EXPO_ROUTER_MODULES = {
  "./_layout.tsx": () => require("./_layout.tsx"),
  "./index.tsx": () => require("./index.tsx"),
  "./tradie/_layout.tsx": () => require("./tradie/_layout.tsx"),
  "./tradie/review-customer.tsx": () => require("./tradie/review-customer.tsx"),
  "./tradie/profile.tsx": () => require("./tradie/profile.tsx"),
  "./tradie/pricing.tsx": () => require("./tradie/pricing.tsx"),
  "./tradie/payout.tsx": () => require("./tradie/payout.tsx"),
  "./tradie/messages.tsx": () => require("./tradie/messages.tsx"),
  "./tradie/index.tsx": () => require("./tradie/index.tsx"),
  "./tradie/home.tsx": () => require("./tradie/home.tsx"),
  "./tradie/dashboard.tsx": () => require("./tradie/dashboard.tsx"),
  "./tradie/current-jobs.tsx": () => require("./tradie/current-jobs.tsx"),
  "./settings.tsx": () => require("./settings.tsx"),
  "./public-profile.tsx": () => require("./public-profile.tsx"),
  "./onboarding/signup.tsx": () => require("./onboarding/signup.tsx"),
  "./onboarding/role-select.tsx": () => require("./onboarding/role-select.tsx"),
  "./onboarding/reset-password.tsx": () => require("./onboarding/reset-password.tsx"),
  "./onboarding/login.tsx": () => require("./onboarding/login.tsx"),
  "./onboarding/intro.tsx": () => require("./onboarding/intro.tsx"),
  "./onboarding/checklist.tsx": () => require("./onboarding/checklist.tsx"),
  "./chat/[jobId].tsx": () => require("./chat/[jobId].tsx"),
  "./job/_layout.tsx": () => require("./job/_layout.tsx"),
  "./job/tracking.tsx": () => require("./job/tracking.tsx"),
  "./job/send-quote.tsx": () => require("./job/send-quote.tsx"),
  "./job/review.tsx": () => require("./job/review.tsx"),
  "./job/receipt.tsx": () => require("./job/receipt.tsx"),
  "./job/pay-final.tsx": () => require("./job/pay-final.tsx"),
  "./job/pay-deposit.tsx": () => require("./job/pay-deposit.tsx"),
  "./job/choose-tradesman.tsx": () => require("./job/choose-tradesman.tsx"),
  "./job/approve-quote.tsx": () => require("./job/approve-quote.tsx"),
  "./admin/_layout.tsx": () => require("./admin/_layout.tsx"),
  "./admin/users.tsx": () => require("./admin/users.tsx"),
  "./admin/index.tsx": () => require("./admin/index.tsx"),
  "./admin/settings.tsx": () => require("./admin/settings.tsx"),
  "./admin/jobs.tsx": () => require("./admin/jobs.tsx"),
  "./+not-found.tsx": () => require("./+not-found.tsx"),
  "./customer/_layout.tsx": () => require("./customer/_layout.tsx"),
  "./customer/profile.tsx": () => require("./customer/profile.tsx"),
  "./customer/post-job.tsx": () => require("./customer/post-job.tsx"),
  "./customer/messages.tsx": () => require("./customer/messages.tsx"),
  "./customer/jobs.tsx": () => require("./customer/jobs.tsx"),
  "./customer/index.tsx": () => require("./customer/index.tsx"),
  "./customer/edit-job.tsx": () => require("./customer/edit-job.tsx"),
  "./customer/dashboard.tsx": () => require("./customer/dashboard.tsx"),
};

// Debug: log presence and size of the injected manifest at import-time.
try {
  if (typeof globalThis !== 'undefined' && Array.isArray(globalThis.__EXPO_ROUTER_KEYS)) {
    // eslint-disable-next-line no-console
    console.log('[routes-manifest] __EXPO_ROUTER_KEYS length=', globalThis.__EXPO_ROUTER_KEYS.length);
  }
} catch (e) {
  // eslint-disable-next-line no-console
  console.log('[routes-manifest] error logging manifest', e);
}
