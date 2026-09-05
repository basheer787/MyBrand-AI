"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Shell from "@/components/Shell";
import type { Brand, Generation, CalendarPost, SalesCopy } from "@/lib/types";

const DEMO_POSTS = [
  ["MON", "Start stronger this week: 3 power habits for real fitness progress", "Instagram", "Motivation"],
  ["TUE", "Beginner-friendly gym guide: How to conquer gym anxiety today", "LinkedIn", "Education"],
  ["WED", "Member transformation spotlight: From tired to energized", "Facebook", "Community"],
  ["THU", "Behind the scenes: Why our coaches train differently", "TikTok", "Brand Voice"],
  ["FRI", "Flash Weekend Pass: Bring a workout buddy on us", "Google Ads", "Conversion"],
  ["SAT", "Weekend recovery checklist: Stretch, hydrate, refuel", "Email", "Wellness"],
  ["SUN", "Reset & Plan: Your upcoming week of strength starts tomorrow", "Instagram", "Mindset"],
] as const;

type LoadState = "loading" | "signed-out" | "empty" | "ready";

export default function Home() {
  const [state, setState] = useState<LoadState>("loading");
  const [email, setEmail] = useState<string | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [notice, setNotice] = useState("");

  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  };

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setState("signed-out"); return; }
      setEmail(user.email ?? null);
      const { data: b } = await supabase
        .from("brands")
        .select("id,name,location,business_type,target_audience,language,questionnaire,brand_dna,created_at")
        .order("created_at", { ascending: false });
      if (!b?.length) { setState("empty"); return; }
      setBrands(b);
      setActiveId(b[0].id);
      const { data: g } = await supabase
        .from("generations")
        .select("id,brand_id,type,content,created_at")
        .in("brand_id", b.map((x) => x.id))
        .order("created_at", { ascending: false });
      setGenerations(g ?? []);
      setState("ready");
    }
    load();
  }, []);

  const activeBrand = brands.find((b) => b.id === activeId);
  const latestCalendar = useMemo(() => {
    const rec = generations.find((g) => g.brand_id === activeId && g.type === "calendar");
    return rec ? (rec.content as { calendar: CalendarPost[]; salesCopy: SalesCopy }) : null;
  }, [generations, activeId]);
  const kit = activeBrand?.brand_dna;
  const savedOutputs = generations.filter((g) => g.brand_id === activeId).length;

  if (state === "loading") {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f8faf7]">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#3b8764] border-t-transparent" />
          <p className="mt-3 text-xs font-extrabold uppercase tracking-wider text-[#5f8173]">
            Loading your brand workspace…
          </p>
        </div>
      </main>
    );
  }

  if (state === "signed-out" || state === "empty") {
    return (
      <main className="min-h-screen bg-[#f8faf7] text-[#12382b]">
        <header className="flex items-center justify-between border-b border-[#e5ede4] bg-white/80 px-5 py-4 backdrop-blur sm:px-9">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#d6ff55] font-black text-[#12382b] text-base shadow-sm">
              M
            </div>
            <div>
              <p className="text-lg font-black tracking-tight text-[#12382b]">
                MyBrand <span className="text-[#597d6e]">AI</span>
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#799488]">
                AI Branding & Content Studio
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {state === "empty" ? (
              <Link href="/create" className="primary-button">
                ✦ Create Your First Brand
              </Link>
            ) : (
              <>
                <Link href="/auth" className="secondary-button">
                  Sign In
                </Link>
                <Link href="/auth" className="primary-button">
                  Get Started Free →
                </Link>
              </>
            )}
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-9">
          {state === "empty" && (
            <section className="mb-8 rounded-3xl border border-dashed border-[#a8cda4] bg-white p-8 sm:p-12 text-center shadow-sm">
              <span className="text-4xl">🚀</span>
              <h2 className="mt-4 text-2xl font-black text-[#12382b]">
                Your workspace is ready, {email}!
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-[#567568]">
                You haven&apos;t generated any brands yet. Start our 4-step wizard to upload your photos and generate your Brand DNA, 7-day social calendar, and conversion copy.
              </p>
              <Link className="primary-button mt-6 inline-flex" href="/create">
                ✦ Create Your First Brand Now
              </Link>
            </section>
          )}

          {/* Sample Preview Banner */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="eyebrow">PREVIEW DEMONSTRATION WORKSPACE</p>
              <h2 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                See what MyBrand AI creates for your business.
              </h2>
            </div>
            <span className="rounded-full bg-[#edf6eb] border border-[#d2e8cc] px-4 py-1.5 text-xs font-extrabold text-[#265e46]">
              Sample: FitnessEdge Gym
            </span>
          </div>

          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-[#567568]">
            Below is an example of what our multimodal Gemini AI generates from 3 gym photos and a brief business questionnaire. Sign in to generate a real system for your own business.
          </p>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.65fr_1fr]">
            <section className="hero-card overflow-hidden rounded-3xl p-7 text-white sm:p-9">
              <div className="relative z-10 max-w-lg">
                <span className="pill">FITNESSEDGE GYM · PUNJAB · SAMPLE SYSTEM</span>
                <h3 className="mt-6 text-3xl font-black leading-tight sm:text-4xl">
                  Complete AI brand & marketing system.
                </h3>
                <p className="mt-4 max-w-md text-xs leading-relaxed text-[#d6eade]">
                  Logo directions, color harmonies, font pairings, 7-day multi-platform calendars, landing page headlines, Google/Meta ads, and short-form video scripts.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/create" className="accent-button">
                    ✦ Create Your Brand Now
                  </Link>
                  <Link href="/auth" className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-bold backdrop-blur hover:bg-white/20 transition">
                    Sign in to account
                  </Link>
                </div>
              </div>
              <div className="hero-orb one" />
              <div className="hero-orb two" />
              <div className="hero-grid" />
            </section>

            <section className="flex flex-col justify-between rounded-3xl border border-[#e1eae0] bg-white p-6 shadow-sm">
              <div>
                <p className="eyebrow">BRAND DNA HEALTH</p>
                <h3 className="mt-2 text-xl font-black text-[#12382b]">Consistency Score: 94%</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#527365]">
                  Brand DNA ensures every Instagram post, ad draft, and email sounds cohesive and reinforces your core messaging pillars.
                </p>
                
                <div className="mt-6 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-[#3c6453]">Tone Alignment</span>
                      <span className="text-[#12382b]">98%</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#eef5ed]">
                      <div className="h-full w-[98%] rounded-full bg-[#10b981]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-[#3c6453]">Visual Palette Uniformity</span>
                      <span className="text-[#12382b]">92%</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#eef5ed]">
                      <div className="h-full w-[92%] rounded-full bg-[#10b981]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-[#f8faf6] p-4 border border-[#e4ede2]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#567568]">Sample Palette</p>
                <div className="mt-2 flex gap-2">
                  {["#12382b", "#d6ff55", "#10b981", "#ffffff", "#f4fbf1"].map((c) => (
                    <span
                      key={c}
                      className="h-8 w-8 rounded-full border border-black/10 shadow-sm"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Sample 7-Day Plan */}
          <section className="mt-8 rounded-3xl border border-[#e1eae0] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="eyebrow">SAMPLE 7-DAY CONTENT ENGINE</p>
                <h3 className="mt-1 text-xl font-black text-[#12382b]">
                  Seven customized posts across Instagram, LinkedIn, TikTok & Ads
                </h3>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
              {DEMO_POSTS.map(([day, title, platform, type]) => (
                <div key={day} className="post-card">
                  <div className="flex items-center justify-between w-full">
                    <span className="tag text-[10px] font-black">{day}</span>
                    <span className="text-[10px] font-bold text-[#567d6c] uppercase">{platform}</span>
                  </div>
                  <b className="mt-2 text-xs leading-snug">{title}</b>
                  <small className="mt-auto">{type}</small>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <Shell userEmail={email}>
      {notice && <div className="toast">✓ {notice}</div>}
      
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e1eae0] bg-[#fbfdfa]/95 px-5 py-4 pl-16 backdrop-blur sm:px-9 lg:pl-9">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[.14em] text-[#6b8c7d]">
            ACTIVE WORKSPACE / {activeBrand?.name}
          </p>
          <h1 className="mt-0.5 text-xl font-black text-[#12382b]">
            Brand Strategy Dashboard
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          {brands.length > 1 && (
            <select
              value={activeId}
              onChange={(e) => setActiveId(e.target.value)}
              className="rounded-xl border border-[#d2e2cf] bg-white px-3 py-2 text-xs font-extrabold text-[#12382b] shadow-sm outline-none"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}
          <Link href="/create" className="primary-button text-xs py-2.5 px-4">
            ✦ New Campaign
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-9">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">AI BRAND STUDIO</p>
            <h2 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl text-[#12382b]">
              {activeBrand?.name}
            </h2>
            <p className="mt-2 text-xs text-[#527365]">
              {activeBrand?.business_type} in {activeBrand?.location} · Target: {activeBrand?.target_audience}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href={`/workspace/${activeId}`} className="secondary-button">
              Open Full Results & Kit →
            </Link>
          </div>
        </div>

        {/* Hero & Metrics */}
        <div className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
          <section className="hero-card overflow-hidden rounded-3xl p-7 text-white sm:p-9">
            <div className="relative z-10 max-w-lg">
              <span className="pill">
                {activeBrand?.name?.toUpperCase()} · {activeBrand?.location?.toUpperCase()}
              </span>
              <h3 className="mt-6 text-3xl font-black leading-tight sm:text-4xl">
                Brand identity & campaign system.
              </h3>
              <p className="mt-4 max-w-md text-xs leading-relaxed text-[#d6eade]">
                {kit?.tone ? `Tone of Voice: ${kit.tone}. ` : ""}
                Custom color palette, font recommendations, 7-day content schedule and sales copy are saved.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/workspace/${activeId}`}
                  className="accent-button"
                >
                  View Full Brand Kit
                </Link>
                <Link
                  href={`/workspace/${activeId}?tab=feedback`}
                  className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-bold backdrop-blur hover:bg-white/20 transition"
                >
                  Log Performance Feedback
                </Link>
              </div>
            </div>
            <div className="hero-orb one" />
            <div className="hero-orb two" />
            <div className="hero-grid" />
          </section>

          <section className="flex flex-col justify-between rounded-3xl border border-[#e1eae0] bg-white p-6 shadow-sm">
            <div>
              <p className="eyebrow">SNAPSHOT</p>
              <h3 className="mt-1 text-xl font-black text-[#12382b]">Saved Outputs</h3>
            </div>
            
            <div className="my-6 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-[#f7faf5] p-3 border border-[#e5eee3]">
                <b className="block text-2xl font-black text-[#12382b]">{latestCalendar?.calendar?.length ?? 0}</b>
                <span className="text-[11px] font-bold text-[#628374]">Posts Ready</span>
              </div>
              <div className="rounded-2xl bg-[#f7faf5] p-3 border border-[#e5eee3]">
                <b className="block text-2xl font-black text-[#12382b]">{savedOutputs}</b>
                <span className="text-[11px] font-bold text-[#628374]">Generations</span>
              </div>
              <div className="rounded-2xl bg-[#f7faf5] p-3 border border-[#e5eee3]">
                <b className="block text-2xl font-black text-[#12382b]">{brands.length}</b>
                <span className="text-[11px] font-bold text-[#628374]">Brand{brands.length > 1 ? "s" : ""}</span>
              </div>
            </div>

            <Link
              href={`/workspace/${activeId}?tab=publish`}
              className="rounded-2xl border border-[#d2e2cf] bg-[#fbfdfa] p-4 text-xs font-bold text-[#1f4e3c] hover:bg-[#edf6eb] transition text-center"
            >
              🚀 Publish directly to Instagram & Facebook →
            </Link>
          </section>
        </div>

        {/* Brand DNA & 7-Day Plan */}
        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_1.8fr]">
          <section className="rounded-3xl border border-[#e1eae0] bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="eyebrow">BRAND DNA</p>
                <h3 className="mt-1 text-xl font-black text-[#12382b]">The {activeBrand?.name} Identity</h3>
              </div>
              <Link href={`/workspace/${activeId}`} className="text-xs font-extrabold text-[#3b8764] hover:underline">
                View All →
              </Link>
            </div>

            {kit ? (
              <div className="mt-6 space-y-5">
                <div>
                  <p className="label">VOICE & TONE</p>
                  <p className="mt-1 text-xs font-bold text-[#12382b]">{kit.tone}</p>
                </div>
                <div>
                  <p className="label">MESSAGING PILLARS</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(kit.pillars ?? []).slice(0, 4).map((x) => (
                      <span className="tag text-[11px]" key={x}>{x}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="label">COLOR HARMONY</p>
                  <div className="mt-2 flex gap-2">
                    {(kit.colors ?? []).slice(0, 5).map((c) => (
                      <span
                        key={c}
                        className="h-7 w-7 rounded-full border border-black/10 shadow-sm"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-6 text-xs text-[#6e8a7d]">Generate content for this brand to build its Brand DNA.</p>
            )}
          </section>

          <section className="rounded-3xl border border-[#e1eae0] bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <p className="eyebrow">THIS WEEK&apos;S CONTENT</p>
                <h3 className="mt-1 text-xl font-black text-[#12382b]">7-Day Content Engine</h3>
              </div>
              <Link href={`/workspace/${activeId}?tab=calendar`} className="secondary-button text-xs">
                View Full Calendar →
              </Link>
            </div>

            {latestCalendar?.calendar?.length ? (
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {latestCalendar.calendar.slice(0, 4).map((post, i) => (
                  <div key={i} className={`post-card ${i === 0 ? "post-featured" : ""}`}>
                    <div className="flex items-center justify-between w-full">
                      <span className="tag text-[10px] font-black">{post.day}</span>
                      <small>{post.platform}</small>
                    </div>
                    <b className="mt-2 text-xs leading-snug">
                      {post.caption.slice(0, 50)}{post.caption.length > 50 ? "…" : ""}
                    </b>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-xs text-[#6e8a7d]">No content generated for this brand yet.</p>
            )}
          </section>
        </div>
      </div>
    </Shell>
  );
}
