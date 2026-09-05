import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { metaAuthUrl, metaConfigured } from "@/lib/meta";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const brandId = searchParams.get("brandId");
  if (!brandId) return NextResponse.json({ error: "Missing brandId." }, { status: 400 });

  if (!metaConfigured()) {
    return NextResponse.redirect(`${origin}/workspace/${brandId}?tab=publish&metaError=not_configured`);
  }

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return NextResponse.redirect(`${origin}/auth`);

  const { data: brand } = await supabase.from("brands").select("id").eq("id", brandId).single();
  if (!brand) return NextResponse.json({ error: "Brand not found." }, { status: 404 });

  const redirectUri = `${origin}/api/auth/meta/callback`;
  return NextResponse.redirect(metaAuthUrl(redirectUri, brandId));
}
