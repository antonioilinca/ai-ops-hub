import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Gère le callback de confirmation d'email Supabase
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Check if user has completed onboarding
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: member } = await supabase
          .from("org_members")
          .select("id")
          .eq("user_id", user.id)
          .limit(1)
          .single();
        if (!member) {
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // En cas d'erreur → retour login avec message
  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`);
}
