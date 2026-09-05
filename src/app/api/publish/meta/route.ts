import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { publishFacebookPhotoPost, publishInstagramPost } from "@/lib/meta";

const requestSchema = z.object({
  brandId: z.string().uuid(),
  platform: z.enum(["instagram", "facebook"]),
  assetPath: z.string().min(1),
  caption: z.string().min(1).max(2200),
});

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { brandId, platform, assetPath, caption } = parsed.data;

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return NextResponse.json({ error: "Sign in to publish." }, { status: 401 });

  const { data: brand } = await supabase.from("brands").select("id").eq("id", brandId).single();
  if (!brand) return NextResponse.json({ error: "Brand not found." }, { status: 404 });

  const { data: connection } = await supabase
    .from("social_connections")
    .select("*")
    .eq("brand_id", brandId)
    .eq("provider", "meta")
    .single();
  if (!connection) return NextResponse.json({ error: "Connect Instagram/Facebook for this brand first." }, { status: 400 });

  if (platform === "instagram" && !connection.ig_business_id) {
    return NextResponse.json({ error: "No Instagram Business account is linked to the connected Page." }, { status: 400 });
  }

  const { data: signed, error: signError } = await supabase.storage
    .from("brand-assets")
    .createSignedUrl(assetPath, 600);
  if (signError || !signed) return NextResponse.json({ error: "Could not access that image." }, { status: 400 });

  try {
    const externalId =
      platform === "instagram"
        ? await publishInstagramPost({
            igBusinessId: connection.ig_business_id!,
            pageAccessToken: connection.page_access_token,
            imageUrl: signed.signedUrl,
            caption,
          })
        : await publishFacebookPhotoPost({
            pageId: connection.page_id,
            pageAccessToken: connection.page_access_token,
            imageUrl: signed.signedUrl,
            caption,
          });

    await supabase.from("publications").insert({
      brand_id: brandId,
      platform,
      caption,
      asset_path: assetPath,
      external_post_id: externalId,
      status: "published",
    });

    return NextResponse.json({ success: true, postId: externalId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Publish failed.";
    await supabase.from("publications").insert({
      brand_id: brandId,
      platform,
      caption,
      asset_path: assetPath,
      status: "failed",
    });
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
