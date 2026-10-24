/**
 * GST added at checkout on top of every product's list price (prices in the
 * catalogue exclude it). The storefront shows the same rate and rounding in its
 * own src/lib/gst.ts — change both together.
 */
export const GST_PERCENT = 18;

/**
 * The GST on a subtotal and the amount to charge, in whole paise so floating
 * point never decides a customer's total.
 */
export function withGst(subtotalPaise: number) {
  const gstPaise = Math.round((subtotalPaise * GST_PERCENT) / 100);
  return { gstPaise, totalPaise: subtotalPaise + gstPaise };
}
