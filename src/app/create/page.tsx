"use client";
import Link from "next/link";
import { ChangeEvent, DragEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { BrandKit, CalendarPost } from "@/lib/types";

const steps = ["Upload Media", "Brand Context", "Review Strategy", "Generated System"];

const BUSINESS_TYPE_PRESETS = [
  "Gym & Fitness Studio",
  "Specialty Coffee Shop",
  "Digital Agency / Tech",
  "Fashion & Retail Boutique",
  "Dental / Medical Clinic",
  "Artisan Bakery",
  "Real Estate Brokerage",
  "Beauty & Spa Salon",
];

const STYLE_PRESETS = [
  "Modern & Minimalist",
  "Bold, High-Energy & Punchy",
  "Luxury, Elegant & Premium",
  "Warm, Community-Driven & Friendly",
  "Eco-Friendly & Organic",
  "Professional & Authoritative",
];

export default function CreateBrandPage() {
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [error, setError] = useState("");
  const [brandId, setBrandId] = useState<string | null>(null);
  const [result, setResult] = useState<{ brandKit?: BrandKit; calendar?: CalendarPost[] } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [form, setForm] = useState({
    name: "",
    location: "",
    businessType: "",
    audience: "",
    style: "",
    language: "English",
    website: "",
  });

  const edit = (key: keyof typeof form, value: string) => setForm({ ...form, [key]: value });

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const valid = Array.from(incoming)
      .filter((f) => f.size <= 6291456 && ["image/jpeg", "image/png", "image/webp"].includes(f.type))
      .slice(0, 5);
    setFiles(valid);
  };

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files);

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const canContinueDetails = form.name.trim() && form.location.trim() && form.businessType.trim();

  async function generate() {
    setLoading(true);
    setError("");
    setGenerationStep("Authenticating & saving business profile...");
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { location.href = "/auth"; return; }

    const { data: brand, error: saveError } = await supabase
      .from("brands")
      .insert({
        user_id: user.id,
        name: form.name,
        location: form.location,
        business_type: form.businessType,
        target_audience: form.audience,
        language: form.language,
        questionnaire: { style: form.style, website: form.website },
      })
      .select("id")
      .single();

    if (saveError || !brand) {
      setError(saveError?.message ?? "Could not save brand.");
      setLoading(false);
      return;
    }
    setBrandId(brand.id);

    if (files.length > 0) {
      setGenerationStep(`Uploading ${files.length} brand images securely...`);
      for (const file of files) {
        const path = `${user.id}/${brand.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
        const upload = await supabase.storage.from("brand-assets").upload(path, file, { contentType: file.type });
        if (!upload.error) await supabase.from("assets").insert({ brand_id: brand.id, storage_path: path });
      }
    }

    setGenerationStep("Consulting Gemini AI to build Brand DNA, 7-Day Plan & Sales Copy...");
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId: brand.id }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) { setError(data.error ?? "Generation failed."); return; }
    setResult(data);
    setStep(3);
  }

  return (
    <main className="min-h-screen bg-[#f8faf7] px-5 py-8 text-[#12382b] sm:px-9">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#357556] hover:underline">
          ← Back to workspace
        </Link>
        
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">AI BRAND CREATOR</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
              Turn your business into a complete brand system.
            </h1>
          </div>
          <span className="rounded-full bg-[#edf6eb] px-4 py-1.5 text-xs font-black text-[#265e46] border border-[#d2e8cc]">
            Step {step + 1} of 4
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 grid grid-cols-4 gap-3">
          {steps.map((x, i) => (
            <div key={x}>
              <div className={`h-2 rounded-full transition-all duration-300 ${i <= step ? "bg-[#5bb858]" : "bg-[#dbe6da]"}`} />
              <p className={`mt-2 text-[11px] font-bold ${i <= step ? "text-[#1b4e3a]" : "text-[#799488]"}`}>
                {x}
              </p>
            </div>
          ))}
        </div>

        <section className="mt-8 rounded-3xl border border-[#e1eae0] bg-white p-6 shadow-sm sm:p-9">
          {/* STEP 1: UPLOAD */}
          {step === 0 && (
            <div>
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#e8f5e5] text-xs">📷</span>
                <p className="eyebrow">STEP 1 · UPLOAD BRAND ASSETS (OPTIONAL)</p>
              </div>
              <h2 className="mt-2 text-2xl font-black">Add up to 5 business or product photos</h2>
              <p className="mt-2 text-xs leading-relaxed text-[#567568]">
                Gym photos, storefronts, products, or your existing logo. Gemini uses these visuals to recommend consistent color palettes and visual styles.
              </p>

              <label
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                className={`upload-zone mt-6 transition ${isDragging ? "border-[#4aa746] bg-[#f0f9ed]" : ""}`}
              >
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={onFileInputChange} />
                <span className="text-3xl">📁</span>
                <b className="text-sm font-bold text-[#143c2f]">Click to browse or drag & drop images here</b>
                <span className="text-xs text-[#6e8a7d]">JPG, PNG, WebP up to 6 MB each (max 5 photos)</span>
              </label>

              {files.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#527365]">
                    Selected Photos ({files.length}/5)
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {files.map((f, i) => (
                      <div key={f.name + i} className="flex items-center justify-between rounded-2xl border border-[#e2ece0] bg-[#f8fbf7] p-3 text-xs">
                        <span className="truncate font-semibold text-[#184534] max-w-[180px]">{f.name}</span>
                        <button
                          onClick={() => removeFile(i)}
                          className="rounded-lg bg-[#fee2e2] px-2 py-1 text-[11px] font-bold text-[#991b1b] hover:bg-[#fecaca]"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: DETAILS */}
          {step === 1 && (
            <div>
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#e8f5e5] text-xs">📝</span>
                <p className="eyebrow">STEP 2 · BUSINESS CONTEXT</p>
              </div>
              <h2 className="mt-2 text-2xl font-black">Tell AI about your business</h2>
              <p className="mt-2 text-xs leading-relaxed text-[#567568]">
                These details give the AI the context it needs to craft realistic, location-aware marketing copy and Brand DNA.
              </p>

              <div className="form-grid mt-6">
                <label>
                  Business Name *
                  <input
                    value={form.name}
                    onChange={(e) => edit("name", e.target.value)}
                    placeholder="e.g. FitnessEdge Gym"
                  />
                </label>
                <label>
                  Location / City *
                  <input
                    value={form.location}
                    onChange={(e) => edit("location", e.target.value)}
                    placeholder="e.g. Chandigarh, Punjab"
                  />
                </label>
                <label>
                  Business Type *
                  <input
                    value={form.businessType}
                    onChange={(e) => edit("businessType", e.target.value)}
                    placeholder="e.g. Gym & Fitness Center"
                  />
                </label>
                <label>
                  Target Audience
                  <input
                    value={form.audience}
                    onChange={(e) => edit("audience", e.target.value)}
                    placeholder="e.g. Working professionals and fitness enthusiasts"
                  />
                </label>
                <label>
                  Brand Tone / Style
                  <input
                    value={form.style}
                    onChange={(e) => edit("style", e.target.value)}
                    placeholder="e.g. Energetic, premium and motivational"
                  />
                </label>
                <label>
                  Output Language
                  <input
                    value={form.language}
                    onChange={(e) => edit("language", e.target.value)}
                    placeholder="e.g. English"
                  />
                </label>
                <label className="sm:col-span-2">
                  Website / Instagram handle (optional)
                  <input
                    value={form.website}
                    onChange={(e) => edit("website", e.target.value)}
                    placeholder="e.g. @fitnessedgegym or https://fitnessedge.com"
                  />
                </label>
              </div>

              {/* Quick Presets */}
              <div className="mt-6 border-t border-[#eaf2e8] pt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#527365]">Popular Business Types</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {BUSINESS_TYPE_PRESETS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => edit("businessType", p)}
                      className="rounded-full border border-[#d8e6d5] bg-[#f8fcf7] px-3 py-1 text-xs font-semibold text-[#295c46] hover:bg-[#eaf5e7]"
                    >
                      + {p}
                    </button>
                  ))}
                </div>

                <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#527365]">Style Presets</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {STYLE_PRESETS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => edit("style", s)}
                      className="rounded-full border border-[#d8e6d5] bg-[#f8fcf7] px-3 py-1 text-xs font-semibold text-[#295c46] hover:bg-[#eaf5e7]"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW */}
          {step === 2 && (
            <div>
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#e8f5e5] text-xs">🚀</span>
                <p className="eyebrow">STEP 3 · REVIEW & GENERATE</p>
              </div>
              <h2 className="mt-2 text-2xl font-black">Ready to build {form.name || "your brand"}</h2>
              
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#e2ece0] bg-[#fafdf9] p-4">
                  <p className="eyebrow">BUSINESS SUMMARY</p>
                  <p className="mt-2 text-sm font-bold text-[#143c2f]">{form.name}</p>
                  <p className="text-xs text-[#527365] mt-1">{form.businessType} in {form.location}</p>
                  <p className="text-xs text-[#527365] mt-1">Audience: {form.audience || "General public"}</p>
                </div>
                <div className="rounded-2xl border border-[#e2ece0] bg-[#fafdf9] p-4">
                  <p className="eyebrow">WHAT GEMINI WILL GENERATE</p>
                  <ul className="mt-2 space-y-1 text-xs font-semibold text-[#255642]">
                    <li>✦ Complete Brand DNA (Tone, Colors, Fonts, Logo)</li>
                    <li>✦ 7-Day Multi-Platform Social Calendar</li>
                    <li>✦ High-Converting Ads, Headlines & Video Scripts</li>
                  </ul>
                </div>
              </div>

              {loading && (
                <div className="mt-6 rounded-2xl bg-[#effbec] p-5 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#3b8764] border-t-transparent" />
                  <p className="mt-3 text-sm font-extrabold text-[#1a4b37]">{generationStep}</p>
                  <p className="mt-1 text-xs text-[#597d6e]">This takes about 10–15 seconds to create your complete branding system.</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: RESULTS */}
          {step === 3 && (
            <div>
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#d6ff55] text-xs">✓</span>
                <p className="eyebrow">SYSTEM GENERATED</p>
              </div>
              <h2 className="mt-2 text-2xl font-black">Your brand system is live!</h2>
              
              {result && (
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl bg-[#f4fbf1] p-5 border border-[#d6ebd3]">
                    <p className="font-extrabold text-base text-[#143c2f]">
                      Voice: <span className="text-[#3b8764]">{result.brandKit?.tone}</span>
                    </p>
                    <p className="mt-2 text-xs font-bold text-[#567568]">
                      Palette: {result.brandKit?.colors?.join(" · ")}
                    </p>
                    <p className="mt-4 text-xs font-extrabold uppercase text-[#2b684f]">
                      ✦ {result.calendar?.length ?? 0} Multi-Channel Posts Created
                    </p>
                  </div>
                </div>
              )}

              {brandId && (
                <div className="mt-6">
                  <Link href={`/workspace/${brandId}`} className="primary-button inline-flex">
                    Open Full Brand Workspace →
                  </Link>
                </div>
              )}
            </div>
          )}
        </section>

        {error && <p className="mt-4 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-700">{error}</p>}

        {/* Wizard Controls */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={!step || loading || step === 3}
            className="secondary-button disabled:opacity-40"
          >
            ← Back
          </button>
          
          {step < 3 && (
            <button
              onClick={() => (step === 2 ? generate() : setStep(step + 1))}
              disabled={loading || (step === 1 && !canContinueDetails)}
              className="primary-button disabled:opacity-40"
            >
              {loading
                ? "Generating System…"
                : step === 2
                ? "Generate Complete Brand System ✦"
                : "Continue →"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
