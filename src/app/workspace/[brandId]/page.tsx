"use client";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Shell from "@/components/Shell";
import { BrandKitView, CalendarView, SalesCopyView } from "@/components/BrandOutput";
import FeedbackForm from "@/components/FeedbackForm";
import PublishPanel from "@/components/PublishPanel";
import type { Brand, CalendarPost, Feedback, SalesCopy } from "@/lib/types";

type Tab = "brand-kit" | "calendar" | "sales-copy" | "feedback" | "publish";

export default function BrandDetailPageWrapper() {
  return (
    <Suspense fallback={null}>
      <BrandDetailPage />
    </Suspense>
  );
}

function BrandDetailPage() {
  const params = useParams<{ brandId: string }>();
  const brandId = params.brandId;
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab | null) ?? "brand-kit";
  const metaError = searchParams.get("metaError");

  const [email, setEmail] = useState<string | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [calendar, setCalendar] = useState<CalendarPost[]>([]);
  const [salesCopy, setSalesCopy] = useState<SalesCopy | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [tab, setTab] = useState<Tab>(initialTab);
  const [status, setStatus] = useState("Loading brand system…");
  const [regenerating, setRegenerating] = useState(false);
  const [notice, setNotice] = useState("");

  const notify = (m: string) => { setNotice(m); window.setTimeout(() => setNotice(""), 3500); };

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { location.href = "/auth"; return; }
    setEmail(user.email ?? null);

    const { data: b, error } = await supabase.from("brands").select("*").eq("id", brandId).single();
    if (error || !b) { setStatus(error?.message ?? "Brand not found."); return; }
    setBrand(b);

    const { data: g } = await supabase
      .from("generations")
      .select("id,brand_id,type,content,created_at")
      .eq("brand_id", brandId)
      .order("created_at", { ascending: false });
    const latestCalendar = g?.find((x) => x.type === "calendar");
    if (latestCalendar) {
      const content = latestCalendar.content as { calendar: CalendarPost[]; salesCopy: SalesCopy };
      setCalendar(content.calendar ?? []);
      setSalesCopy(content.salesCopy ?? null);
    }

    const { data: fb } = await supabase
      .from("performance_feedback")
      .select("*")
      .eq("brand_id", brandId)
      .order("created_at", { ascending: false });
    setFeedback(fb ?? []);
    setStatus("");
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (brandId) load();
    if (searchParams.get("connected") === "1") notify("✓ Instagram & Facebook connected successfully!");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandId]);

  async function regenerate() {
    setRegenerating(true);
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId }),
    });
    const data = await response.json();
    setRegenerating(false);
    if (!response.ok) { notify(data.error ?? "Regeneration failed."); return; }
    notify("✓ Regenerated successfully using your latest feedback & Brand DNA!");
    load();
  }

  if (status) {
    return (
      <Shell userEmail={email}>
        <div className="mx-auto max-w-4xl px-5 py-8 pl-16 sm:px-9 lg:pl-9">
          <Link href="/workspace" className="inline-flex items-center gap-1 text-xs font-extrabold uppercase text-[#357556]">
            ← Back to workspace
          </Link>
          <div className="mt-8 rounded-3xl border border-[#e1eae0] bg-white p-8 text-center shadow-sm">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-3 border-[#3b8764] border-t-transparent" />
            <p className="mt-3 text-xs font-bold text-[#567568]">{status}</p>
          </div>
        </div>
      </Shell>
    );
  }

  const tabs: { id: Tab; label: string; icon: string; count?: number }[] = [
    { id: "brand-kit", label: "Brand Kit & DNA", icon: "🎨" },
    { id: "calendar", label: "7-Day Social Calendar", icon: "📅", count: calendar.length },
    { id: "sales-copy", label: "Sales Copy & Scripts", icon: "✍️" },
    { id: "feedback", label: "Performance Feedback", icon: "📈", count: feedback.length },
    { id: "publish", label: "Social Publishing", icon: "🚀" },
  ];

  return (
    <Shell userEmail={email}>
      {notice && <div className="toast">{notice}</div>}
      
      <div className="mx-auto max-w-7xl px-5 py-8 pl-16 sm:px-9 lg:pl-9">
        <Link href="/workspace" className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-[#357556] hover:underline">
          ← Back to all brands
        </Link>
        
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="tag text-[10px] font-black">{brand?.business_type} · {brand?.location}</span>
            <h1 className="mt-2 text-3xl font-black text-[#12382b] sm:text-4xl">{brand?.name}</h1>
            <p className="mt-1 text-xs text-[#527365]">
              Target Audience: {brand?.target_audience || "General"} · Language: {brand?.language || "English"}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={regenerate}
              disabled={regenerating}
              className="primary-button text-xs py-2.5 px-4 disabled:opacity-50"
            >
              {regenerating ? "Regenerating with Gemini…" : "↻ Regenerate with Feedback"}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 flex flex-wrap gap-2 border-b border-[#e1eae0] pb-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-extrabold transition ${
                tab === t.id
                  ? "bg-[#12382b] text-white shadow-sm"
                  : "border border-[#dfe8dc] bg-white text-[#486b5c] hover:bg-[#f6faf4]"
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                  tab === t.id ? "bg-white/20 text-white" : "bg-[#edf6eb] text-[#245842]"
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {tab === "brand-kit" && (
            brand?.brand_dna ? (
              <BrandKitView kit={brand.brand_dna} />
            ) : (
              <EmptyState text="No Brand Kit generated yet. Click 'Regenerate' to generate now." />
            )
          )}

          {tab === "calendar" && (
            calendar.length ? (
              <CalendarView posts={calendar} />
            ) : (
              <EmptyState text="No content calendar generated yet. Click 'Regenerate' to create a 7-day multi-channel plan." />
            )
          )}

          {tab === "sales-copy" && (
            salesCopy ? (
              <SalesCopyView copy={salesCopy} />
            ) : (
              <EmptyState text="No sales copy generated yet. Click 'Regenerate' to create high-converting copy." />
            )
          )}

          {tab === "feedback" && (
            <div className="space-y-6">
              <FeedbackForm brandId={brandId} onSaved={(row) => setFeedback((prev) => [row, ...prev])} />

              <div className="rounded-3xl border border-[#e1eae0] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#e8f5e5] text-xs">📊</span>
                    <p className="eyebrow">SAVED PERFORMANCE HISTORY</p>
                  </div>
                  <span className="text-xs font-extrabold text-[#527365]">
                    {feedback.length} Logged {feedback.length === 1 ? "Entry" : "Entries"}
                  </span>
                </div>

                {feedback.length ? (
                  <div className="mt-4 space-y-3">
                    {feedback.map((f) => (
                      <div key={f.id} className="rounded-2xl border border-[#e5eee3] bg-[#f8fbf6] p-4 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <b className="font-extrabold text-sm text-[#143c2f]">
                            {f.platform} {f.campaign_name ? `· ${f.campaign_name}` : ""}
                          </b>
                          <span className="text-[11px] font-semibold text-[#678779]">
                            {new Date(f.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-[#235841]">
                          {f.impressions != null && <span className="tag text-[10px]">{f.impressions.toLocaleString()} views</span>}
                          {f.clicks != null && <span className="tag text-[10px]">{f.clicks.toLocaleString()} clicks</span>}
                          {f.conversions != null && <span className="tag text-[10px]">{f.conversions} conversions</span>}
                          {f.engagement_rate != null && <span className="tag text-[10px]">{f.engagement_rate}% engagement</span>}
                        </div>

                        {f.notes && (
                          <p className="mt-3 rounded-xl bg-white p-3 border border-[#e2ede0] text-xs leading-relaxed text-[#355a4b]">
                            &quot;{f.notes}&quot;
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-xs text-[#6e8a7d]">
                    No performance feedback logged yet. Add your campaign results above to guide the AI for future content generations.
                  </p>
                )}
              </div>
            </div>
          )}

          {tab === "publish" && (
            <PublishPanel brandId={brandId} calendar={calendar} metaError={metaError} />
          )}
        </div>
      </div>
    </Shell>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-[#a8cda4] bg-white p-12 text-center text-xs font-semibold text-[#6e8a7d] shadow-sm">
      {text}
    </div>
  );
}
