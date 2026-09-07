// Purchase entry point shared by the site header CTA (src/components/BuyNow.astro)
// and the leak-guard purchase checks (scripts/leak-guard.mjs), so the checkout URL
// cannot drift between the rendered site and the guard that verifies it.
//
// The brackets in the checkout[discount_code] parameter MUST stay percent-encoded
// (%5B / %5D): links carrying raw brackets get truncated by chat clients and
// linkifiers before they reach LemonSqueezy, which then opens checkout with an
// empty discount code. The encoded form survives and lands the code pre-filled.

/** Store discount code: 50% off the first year, published on the LemonSqueezy store. */
export const DISCOUNT_CODE = '50OFF';

/** Direct LemonSqueezy checkout for my-ai-team with the first-year discount pre-applied. */
export const CHECKOUT_URL =
  'https://shukelabs.lemonsqueezy.com/checkout/buy/bf6b12fb-ac4f-4d08-a22c-977c191b1361' +
  `?checkout%5Bdiscount_code%5D=${DISCOUNT_CODE}`;
