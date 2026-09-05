"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Shell from "@/components/Shell";
import type { Brand, Generation } from "@/lib/types";

export default function WorkspacePage() {
  const [email, setEmail] = useState<string | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [status, setStatus] = useState("Loading workspace…");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { location.href = "/auth"; return; }
      setEmail(user.email ?? null);
      const { data: b, error } = await supabase
        .from("brands")
        .select("id,name,location,business_type,target_audience,language,questionnaire,brand_dna,created_at")
        .order("created_at", { ascending: false });
      if (error) { setStatus(error.message); return; }
      setBrands(b ?? []);
      if (b?.length) {
        const { data: g } = await supabase
          .from("generations")
          .select("id,brand_id,type,content,created_at")
          .in("brand_id", b.map((x) => x.id))
          .order("created_at", { ascending: false });
        setGenerations(g ?? []);
      }
      setStatus("");
    }
    load();
  }, []);

  return (
    <Shell userEmail={email}>
      <div className="mx-auto max-w-6xl px-5 py-8 pl-16 sm:px-9 lg:pl-9">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">PORTFOLIO</p>
            <h1 className="mt-1 text-3xl font-black text-[#12382b]">My Saved Brands</h1>
            <p className="mt-1 text-xs text-[#527365]">
              Brand DNA, color systems, and 7-day marketing schedules for your businesses.
            </p>
          </div>
          <Link className="primary-button text-xs py-2.5 px-4" href="/create">
            ✦ Create New Brand
          </Link>
        </div>

        {status && (
          <div className="mt-8 rounded-3xl border border-[#e1eae0] bg-white p-8 text-center shadow-sm">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-3 border-[#3b8764] border-t-transparent" />
            <p className="mt-3 text-xs font-bold text-[#567568]">{status}</p>
          </div>
        )}

        {!status && !brands.length && (
          <section className="mt-8 rounded-3xl border border-dashed border-[#a8cda4] bg-white p-10 text-center shadow-sm">
            <span className="text-4xl">📂</span>
            <h2 className="mt-3 text-xl font-black text-[#12382b]">No brands saved yet</h2>
            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-[#567568]">
              Create your first brand to generate visual identities, color palettes, and 7-day social media calendars.
            </p>
            <Link className="primary-button mt-6 inline-flex" href="/create">
              ✦ Create First Brand
            </Link>
          </section>
        )}

        <div className="mt-8 space-y-6">
          {brands.map((brand) => {
            const output = generations.filter((g) => g.brand_id === brand.id);
            return (
              <section className="rounded-3xl border border-[#e1eae0] bg-white p-6 shadow-sm sm:p-8" key={brand.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="tag text-[10px] font-black">{brand.business_type || "Business"}</span>
                    <h2 className="mt-2 text-2xl font-black text-[#12382b]">{brand.name}</h2>
                    <p className="text-xs text-[#5a7b6e]">
                      {brand.location} {brand.target_audience ? `· Target: ${brand.target_audience}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-xl bg-[#f2f7f0] border border-[#d6ebd1] px-3 py-1.5 text-xs font-extrabold text-[#235841]">
                      {output.length} Saved Generations
                    </span>
                    <Link href={`/workspace/${brand.id}`} className="primary-button text-xs py-2 px-3.5">
                      Open Brand Hub →
                    </Link>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-[#e3ede1] bg-[#f8fbf6] p-5">
                    <p className="eyebrow">SAVED BRAND DNA</p>
                    <p className="mt-2 text-sm font-bold text-[#143c2f]">
                      {brand.brand_dna?.tone ? `Voice: ${brand.brand_dna.tone}` : "Awaiting initial generation"}
                    </p>
                    
                    {brand.brand_dna?.colors && (
                      <div className="mt-3 flex gap-2">
                        {brand.brand_dna.colors.slice(0, 5).map((c) => (
                          <span
                            key={c}
                            className="h-6 w-6 rounded-full border border-black/10 shadow-sm"
                            style={{ backgroundColor: c }}
                            title={c}
                          />
                        ))}
                      </div>
                    )}
                    
                    {!!brand.brand_dna?.pillars?.length && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {brand.brand_dna.pillars.slice(0, 3).map((x) => (
                          <span className="tag text-[10px]" key={x}>{x}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col justify-between rounded-2xl border border-[#e3ede1] bg-[#f8fbf6] p-5">
                    <div>
                      <p className="eyebrow">CAMPAIGN STATUS</p>
                      {output.length ? (
                        <div className="mt-2 space-y-1.5">
                          {output.slice(0, 2).map((g) => (
                            <p className="text-xs text-[#20493a] font-semibold" key={g.id}>
                              ✦ {g.type === "brand_kit" ? "Brand Kit & DNA" : "7-Day Content Plan & Sales Copy"} ·{" "}
                              <span className="text-[#648476] font-normal">
                                {new Date(g.created_at).toLocaleDateString()}
                              </span>
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-[#6e8a7d]">No campaigns generated yet.</p>
                      )}
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-[#e2ede0]">
                      <Link
                        href={`/workspace/${brand.id}?tab=publish`}
                        className="text-xs font-bold text-[#357556] hover:underline"
                      >
                        Publishing & Social Hub →
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}
