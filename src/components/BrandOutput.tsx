"use client";
import { useState } from "react";
import type { BrandKit, CalendarPost, SalesCopy } from "@/lib/types";

export function BrandKitView({ kit }: { kit: BrandKit }) {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Voice & Personality */}
        <div className="rounded-3xl border border-[#e2ece0] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#e8f5e5] text-xs">🎙️</span>
            <p className="eyebrow">VOICE & TONE</p>
          </div>
          <p className="mt-3 text-lg font-extrabold text-[#12382b]">{kit.tone || "Empowering, modern and approachable"}</p>
          
          <div className="mt-6">
            <p className="eyebrow">MESSAGING PILLARS</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(kit.pillars ?? []).map((p) => (
                <span className="tag" key={p}>
                  <span className="text-[#3b8764]">✦</span> {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Color Palette */}
        <div className="rounded-3xl border border-[#e2ece0] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#e8f5e5] text-xs">🎨</span>
              <p className="eyebrow">BRAND COLOR PALETTE</p>
            </div>
            <span className="text-[11px] font-semibold text-[#678477]">Click to copy HEX</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(kit.colors ?? []).map((c, i) => (
              <button
                key={c + i}
                onClick={() => copyHex(c)}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#dfe8dc] bg-[#fafcf9] p-2 text-left transition hover:border-[#7cb47a] hover:shadow-md"
              >
                <div
                  className="h-14 w-full rounded-xl transition group-hover:scale-[1.02]"
                  style={{ backgroundColor: c }}
                />
                <div className="mt-2 flex items-center justify-between px-1">
                  <span className="font-mono text-xs font-bold text-[#143c2f]">{c}</span>
                  <span className="text-[10px] font-extrabold text-[#3b8764]">
                    {copiedHex === c ? "✓ Copied" : "Copy"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Font Suggestions */}
      <div className="rounded-3xl border border-[#e2ece0] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#e8f5e5] text-xs">🔤</span>
          <p className="eyebrow">TYPOGRAPHY RECOMMENDATIONS</p>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(kit.fonts ?? []).map((font, idx) => (
            <div key={font + idx} className="rounded-2xl border border-[#e8efe6] bg-[#fbfdfa] p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#698a7c]">
                {idx === 0 ? "Primary / Headline" : idx === 1 ? "Secondary / Body" : "Accent font"}
              </p>
              <p className="mt-1 text-base font-black text-[#12382b]">{font}</p>
              <p className="mt-2 text-xs text-[#526f63] leading-relaxed">
                The quick brown fox jumps over the lazy dog. 1234567890
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Logo Direction */}
      <div className="rounded-3xl border border-[#e2ece0] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#e8f5e5] text-xs">✨</span>
          <p className="eyebrow">LOGO DIRECTION & SYMBOLISM</p>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-[#143c2f] font-medium">{kit.logoSuggestion || "—"}</p>
        
        {!!kit.logoVariations?.length && (
          <div className="mt-5">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#527365]">Variation Concepts</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {kit.logoVariations.map((v, i) => (
                <div key={i} className="flex gap-3 rounded-2xl bg-[#f5f9f3] p-4 text-xs font-semibold text-[#20493a]">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#d6ff55] font-black text-[#133529] text-[11px]">
                    {i + 1}
                  </span>
                  <p className="leading-relaxed">{v}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function CalendarView({ posts }: { posts: CalendarPost[] }) {
  const [activePlatform, setActivePlatform] = useState<string>("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const platforms = ["All", ...Array.from(new Set(posts.map((p) => p.platform)))];

  const filteredPosts = activePlatform === "All" ? posts : posts.filter((p) => p.platform === activePlatform);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Platform Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {platforms.map((plat) => (
            <button
              key={plat}
              onClick={() => setActivePlatform(plat)}
              className={`rounded-full px-4 py-1.5 text-xs font-extrabold transition ${
                activePlatform === plat
                  ? "bg-[#12382b] text-white shadow-sm"
                  : "border border-[#dfe7dc] bg-white text-[#486b5c] hover:bg-[#f6faf4]"
              }`}
            >
              {plat} {plat === "All" ? `(${posts.length})` : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Posts */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredPosts.map((post, i) => {
          const cardId = `post-${i}`;
          return (
            <div key={i} className="flex flex-col justify-between rounded-3xl border border-[#e1eae0] bg-white p-5 shadow-sm transition hover:border-[#9cbda8] hover:shadow-md">
              <div>
                <div className="flex items-center justify-between">
                  <span className="tag font-black">{post.day}</span>
                  <span className="rounded-lg bg-[#eaf4e8] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#245842]">
                    {post.platform}
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#698a7c]">Caption</p>
                  <p className="mt-1 text-sm font-semibold leading-relaxed text-[#143c2f]">{post.caption}</p>
                </div>

                <div className="mt-4 rounded-2xl bg-[#f7faf5] p-3 border border-[#e6efe4]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#527365]">🖼️ AI Image Prompt</p>
                  <p className="mt-1 text-xs text-[#4a6b5d] italic leading-relaxed">{post.imagePrompt}</p>
                </div>
              </div>

              <div className="mt-5 border-t border-[#edf4ec] pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#2a684f]">
                    CTA: {post.cta}
                  </span>
                  <button
                    onClick={() => copyText(`${post.caption}\n\n[Prompt: ${post.imagePrompt}]\nCTA: ${post.cta}`, cardId)}
                    className="rounded-xl border border-[#d6e3d4] bg-white px-3 py-1.5 text-xs font-bold text-[#1f503c] transition hover:bg-[#edf6eb]"
                  >
                    {copiedId === cardId ? "✓ Copied!" : "📋 Copy Post"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SalesCopyView({ copy }: { copy: SalesCopy }) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copySection = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const blocks: { key: string; label: string; icon: string; value: string | undefined }[] = [
    { key: "landing", label: "Landing Page Headline & Tagline", icon: "🌐", value: copy.landingPageHeadline },
    { key: "product", label: "Core Product / Service Description", icon: "📦", value: copy.productDescription },
    { key: "google", label: "High-Intent Google Ads Copy", icon: "🎯", value: copy.googleAd },
    { key: "facebook", label: "High-Converting Facebook / Meta Ad", icon: "📱", value: copy.facebookAd },
    { key: "tiktok", label: "TikTok Viral Hook & Script", icon: "🎬", value: copy.tiktokScript },
    { key: "video", label: "Short-Form Video Script (Reels/Shorts)", icon: "🎥", value: copy.shortVideoScript },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        {blocks.map((b) => (
          <div key={b.key} className="flex flex-col justify-between rounded-3xl border border-[#e1eae0] bg-white p-6 shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{b.icon}</span>
                  <p className="eyebrow">{b.label}</p>
                </div>
                {b.value && (
                  <button
                    onClick={() => copySection(b.value!, b.key)}
                    className="text-xs font-extrabold text-[#3b8764] hover:underline"
                  >
                    {copiedKey === b.key ? "✓ Copied" : "Copy"}
                  </button>
                )}
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#143c2f] font-medium">
                {b.value || "—"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Email Sequence */}
      {!!copy.emailSequence?.length && (
        <div className="rounded-3xl border border-[#e1eae0] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">📧</span>
              <p className="eyebrow">AUTOMATED EMAIL NURTURE SEQUENCE</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {copy.emailSequence.map((email, i) => {
              const key = `email-${i}`;
              return (
                <div key={i} className="flex flex-col justify-between rounded-2xl border border-[#e8efe5] bg-[#f8fbf6] p-5">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="tag text-[11px] font-black">Email #{i + 1}</span>
                      <button
                        onClick={() => copySection(email, key)}
                        className="text-xs font-bold text-[#3b8764] hover:underline"
                      >
                        {copiedKey === key ? "✓ Copied" : "Copy"}
                      </button>
                    </div>
                    <p className="mt-3 whitespace-pre-line text-xs font-medium leading-relaxed text-[#20493a]">
                      {email}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
