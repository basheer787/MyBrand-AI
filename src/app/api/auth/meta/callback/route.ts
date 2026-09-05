import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeCodeForUserToken, getLongLivedUserToken, getPagesForUser } from "@/lib/meta";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const brandId = searchParams.get("state");
  const oauthError = searchParams.get("error_description") || searchParams.get("error");

  if (!brandId) return NextResponse.json({ error: "Missing state (brandId)." }, { status: 400 });
  const back = (query: string) => NextResponse.redirect(`${origin}/workspace/${brandId}?tab=publish&${query}`);

  if (oauthError) return back(`metaError=${encodeURIComponent(oauthError)}`);
  if (!code) return back("metaError=missing_code");

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return NextResponse.redirect(`${origin}/auth`);

  const { data: brand } = await supabase.from("brands").select("id").eq("id", brandId).single();
  if (!brand) return NextResponse.json({ error: "Brand not found." }, { status: 404 });

  try {
    const redirectUri = `${origin}/api/auth/meta/callback`;
    const shortToken = await exchangeCodeForUserToken(code, redirectUri);
    const userToken = await getLongLivedUserToken(shortToken);
    const pages = await getPagesForUser(userToken);

    if (!pages.length) return back("metaError=no_pages_found");

    // Prefer a Page that already has an Instagram Business account linked.
    const page = pages.find((p) => p.instagram_business_account) ?? pages[0];

    const { error: saveError } = await supabase.from("social_connections").upsert(
      {
        brand_id: brandId,
        provider: "meta",
        page_id: page.id,
        page_name: page.name,
        page_access_token: page.access_token,
        ig_business_id: page.instagram_business_account?.id ?? null,
        ig_username: page.instagram_business_account?.username ?? null,
        connected_at: new Date().toISOString(),
      },
      { onConflict: "brand_id,provider" }
    );
    if (saveError) return back(`metaError=${encodeURIComponent(saveError.message)}`);

    return back("connected=1");
  } catch (err) {
    return back(`metaError=${encodeURIComponent(err instanceof Error ? err.message : "unknown_error")}`);
  }
}
