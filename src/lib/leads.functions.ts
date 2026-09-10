import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const leadSchema = z.object({
  company: z.string().trim().max(120).optional().default(""),
  contactName: z.string().trim().min(2, "Ange ditt namn").max(120),
  email: z.string().trim().email("Ange en giltig e-postadress").max(160),
  phone: z.string().trim().max(40).optional().default(""),
  website: z.string().trim().max(200).optional().default(""),
  planSlug: z.string().trim().max(40).optional().default(""),
  message: z.string().trim().min(5, "Beskriv kort vad du behöver hjälp med").max(4000),
});

export type LeadInput = z.input<typeof leadSchema>;

/**
 * Tar emot förfrågningar från den publika webbplatsen.
 * Publik endpoint: validerar strikt och skriver bara till leads-tabellen.
 */
export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((input: LeadInput) => leadSchema.parse(input))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("leads").insert({
      company: data.company || null,
      contact_name: data.contactName,
      email: data.email,
      phone: data.phone || null,
      website: data.website || null,
      plan_slug: data.planSlug || null,
      message: data.message,
      source: "website",
    });
    if (error) {
      console.error("[leads] kunde inte sparas", error.message);
      throw new Error("Förfrågan kunde inte tas emot just nu.");
    }
    return { ok: true };
  });
