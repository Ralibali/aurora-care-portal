import { createServerFn } from "@tanstack/react-start";

export type CheckoutResult =
  | { status: "unconfigured"; message: string }
  | { status: "redirect"; url: string };

/**
 * Serverabstraktion för betalning. Stripe är förberett men inte aktiverat.
 * Vi returnerar aldrig en påhittad lyckad betalning.
 */
export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((input: { planSlug: string; email?: string }) => {
    if (!input || typeof input.planSlug !== "string" || input.planSlug.length === 0) {
      throw new Error("Plan saknas.");
    }
    return { planSlug: input.planSlug, email: input.email ?? null };
  })
  .handler(async ({ data }): Promise<CheckoutResult> => {
    const secret = process.env["STRIPE_SECRET_KEY"];
    if (!secret) {
      return {
        status: "unconfigured",
        message:
          "Betalning via kort är inte aktiverad ännu. Vi tar emot din förfrågan och återkommer med avtal och faktura.",
      };
    }
    // TODO (Kimi/AgentSwarm): skapa Stripe Checkout-session mot plans.stripe_price_id
    // och spegla resultatet till public.billing_state. Ingen implementation utan
    // verifierad prisidentitet och webhook-signaturkontroll.
    console.info("[billing] checkout begärd för plan", data.planSlug);
    return {
      status: "unconfigured",
      message: "Stripe-nyckel finns men kassan är inte färdigimplementerad i v0.1.",
    };
  });
