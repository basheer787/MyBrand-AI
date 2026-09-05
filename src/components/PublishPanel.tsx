"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Asset, CalendarPost, Publication, SocialConnection } from "@/lib/types";

export default function PublishPanel({
  brandId,
  calendar,
  metaError,
}: {
  brandId: string;
  calendar: CalendarPost[];
  metaError: string | null;
}) {
  const [connection, setConnection] = useState<SocialConnection | null>(null);
  const [assets, setAssets] = useState<(Asset & { previewUrl: string })[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishingIndex, setPublishingIndex] = useState<number | null>(null);
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const [captionDrafts, setCaptionDrafts] = useState<Record<number, string>>({});
  const [notice, setNotice] = useState("");

  const notify = (m: string) => { setNotice(m); window.setTimeout(() => setNotice(""), 3500); };

  async function load() {
    const supabase = createClient();
    const { data: conn } = await supabase.from("social_connections").select("*").eq("brand_id", brandId).eq("provider", "meta").maybeSingle();
    setConnection(conn ?? null);

    const { data: rawAssets } = await supabase.from("assets").select("id,brand_id,storage_path,created_at").eq("brand_id", brandId).order("created_at", { ascending: false });
    const withUrls = await Promise.all(
      (rawAssets ?? []).map(async (a) => {
        const { data: signed } = await supabase.storage.from("brand-assets").createSignedUrl(a.storage_path, 3600);
        return { ...a, previewUrl: signed?.signedUrl ?? "" };
      })
    );
    setAssets(withUrls);

    const { data: pubs } = await supabase.from("publications").select("*").eq("brand_id", brandId).order("created_at", { ascending: false });
    setPublications(pubs ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    if (metaError) notify(`Instagram/Facebook connection notice: ${metaError.replace(/_/g, " ")}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const postablePlatforms = new Set(["instagram", "facebook ads", "facebook"]);
  const eligiblePosts = calendar
    .map((post, index) => ({ post, index }))
    .filter(({ post }) => postablePlatforms.has(post.platform.toLowerCase()));

  async function publish(index: number, post: CalendarPost, assetPath: string) {
    setPublishingIndex(index);
    const platform = post.platform.toLowerCase().startsWith("instagram") ? "instagram" : "facebook";
    const response = await fetch("/api/publish/meta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brandId,
        platform,
        assetPath,
        caption: captionDrafts[index] ?? post.caption,
      }),
    });
    const data = await response.json();
    setPublishingIndex(null);
    setPickerIndex(null);
    if (!response.ok) { notify(data.error ?? "Publishing request failed."); return; }
    notify(`✓ Published successfully to ${platform === "instagram" ? "Instagram" : "Facebook"}!`);
    load();
  }

  if (loading) return (
    <div className="rounded-3xl border border-[#e1eae0] bg-white p-8 text-center shadow-sm">
      <p className="text-xs font-bold text-[#567568]">Loading publishing channels…</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {notice && <div className="toast">{notice}</div>}

      <div className="rounded-3xl border border-[#e1eae0] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#e8f5e5] text-xs">🔗</span>
          <p className="eyebrow">INSTAGRAM & FACEBOOK INTEGRATION</p>
        </div>
        
        {connection ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#f5faf3] p-4 border border-[#dcebd8]">
            <div className="text-xs">
              <p className="font-extrabold text-sm text-[#143c2f]">Connected Page: {connection.page_name}</p>
              <p className="mt-1 text-[#527365]">
                {connection.ig_username ? `Instagram Business: @${connection.ig_username}` : "No Instagram account linked to this Page."}
              </p>
            </div>
            <a href={`/api/auth/meta/start?brandId=${brandId}`} className="secondary-button text-xs">
              ↻ Reconnect Channel
            </a>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-xs leading-relaxed text-[#567568]">
              Connect your Meta Facebook Page and linked Instagram Business account to publish directly from your 7-day calendar.
            </p>
            <a
              href={`/api/auth/meta/start?brandId=${brandId}`}
              className="primary-button mt-4 inline-flex text-xs py-2.5 px-4"
            >
              ✦ Connect Instagram & Facebook Page
            </a>
          </div>
        )}
      </div>

      {connection && (
        <div className="rounded-3xl border border-[#e1eae0] bg-white p-6 shadow-sm">
          <p className="eyebrow">POST TO SOCIAL CHANNELS</p>
          {!eligiblePosts.length && <p className="mt-3 text-xs text-[#6e8a7d]">No Instagram or Facebook posts found in this calendar.</p>}
          {!assets.length && !!eligiblePosts.length && (
            <p className="mt-3 text-xs text-[#b45309]">
              ⚠️ Please upload at least one image in the Create wizard — Instagram and Facebook require an image asset to publish.
            </p>
          )}
          
          <div className="mt-5 space-y-4">
            {eligiblePosts.map(({ post, index }) => (
              <div key={index} className="rounded-2xl border border-[#e3ece0] bg-[#f8fbf6] p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="tag text-[10px] font-black">{post.day} · {post.platform}</span>
                </div>
                
                <textarea
                  className="mt-3 w-full rounded-xl border border-[#d2e2cf] p-3 text-xs font-medium text-[#12382b] outline-none transition focus:border-[#3b8764]"
                  rows={3}
                  value={captionDrafts[index] ?? post.caption}
                  onChange={(e) => setCaptionDrafts({ ...captionDrafts, [index]: e.target.value })}
                />

                {pickerIndex === index ? (
                  <div className="mt-4 rounded-2xl bg-white p-4 border border-[#dce8d9]">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-[#527365]">
                      Choose an uploaded photo to publish:
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {assets.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => publish(index, post, a.storage_path)}
                          disabled={publishingIndex === index}
                          className="group relative overflow-hidden rounded-xl border-2 border-transparent transition hover:border-[#3b8764] hover:scale-105 disabled:opacity-50"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={a.previewUrl} alt="" className="h-16 w-16 object-cover" />
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setPickerIndex(null)}
                      className="mt-3 text-xs font-bold text-[#6e8a7d] hover:underline"
                    >
                      Cancel Selection
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => setPickerIndex(index)}
                      disabled={!assets.length || publishingIndex === index}
                      className="primary-button text-xs py-2 px-3.5 disabled:opacity-40"
                    >
                      {publishingIndex === index ? "Publishing to Meta…" : "Select Image & Publish Now ✦"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-[#e1eae0] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#e8f5e5] text-xs">📜</span>
          <p className="eyebrow">PUBLISHING AUDIT LOG</p>
        </div>
        {publications.length ? (
          <div className="mt-4 space-y-2">
            {publications.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl bg-[#f6faf4] border border-[#e4ede1] p-3 text-xs">
                <span className="font-extrabold capitalize text-[#143c2f]">{p.platform}</span>
                <span className={`font-bold ${p.status === "published" ? "text-[#10b981]" : "text-[#b91c1c]"}`}>
                  {p.status}
                </span>
                <span className="text-[#648476]">{new Date(p.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-xs text-[#6e8a7d]">No posts published directly through API yet.</p>
        )}
      </div>
    </div>
  );
}
