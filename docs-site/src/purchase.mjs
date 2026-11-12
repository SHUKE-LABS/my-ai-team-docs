// Purchase entry point shared by the site header CTA (src/components/BuyNow.astro)
// and the leak-guard purchase checks (scripts/leak-guard.mjs), so the current
// Personal Copy URL cannot drift between the rendered site and its guard.

/** Personal Copy purchase entry point: one-time licence for one machine with lifetime upgrades. */
export const CHECKOUT_URL = 'https://mat.shukelabs.com/buy';
