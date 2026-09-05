"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Feedback, PLATFORMS } from "@/lib/types";

export function FeedbackForm({
  brandId,
  onSaved,
}: {
  brandId: string;
  onSaved: (row: Feedback) => void;
}) {
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [campaignName, setCampaignName] = useState("");
  const [impressions, setImpressions] = useState("");
  const [clicks, setClicks] = useState("");
  const [conversions, setConversions] = useState("");
  const [engagementRate, setEngagementRate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit() {
    setSaving(true);
    setError("");
    setSuccess(false);
    const supabase = createClient();
    const { data, error: saveError } = await supabase
      .from("performance_feedback")
      .insert({
        brand_id: brandId,
        platform,
        campaign_name: campaignName || null,
        impressions: impressions ? Number(impressions) : null,
        clicks: clicks ? Number(clicks) : null,
        conversions: conversions ? Number(conversions) : null,
        engagement_rate: engagementRate ? Number(engagementRate) : null,
        notes: notes || null,
      })
      .select("*")
      .single();

    setSaving(false);
    if (saveError || !data) {
      setError(saveError?.message ?? "Could not save feedback.");
      return;
    }

    onSaved(data as Feedback);
    setSuccess(true);
    setCampaignName("");
    setImpressions("");
    setClicks("");
    setConversions("");
    setEngagementRate("");
    setNotes("");
    setTimeout(() => setSuccess(false), 4000);
  }

  return (
    <div className="rounded-3xl border border-[#e1eae0] bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#e8f5e5] text-xs">📈</span>
        <p className="eyebrow">LOG CAMPAIGN PERFORMANCE FEEDBACK</p>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-[#567568]">
        Record real engagement metrics from your published campaigns. MyBrand AI uses this data to train and fine-tune your next AI generation.
      </p>

      <div className="form-grid mt-6">
        <label>
          Platform
          <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>
        <label>
          Campaign or Post Title
          <input
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="e.g. Beginner-friendly workout reel"
          />
        </label>
        <label>
          Impressions / Views
          <input
            type="number"
            min="0"
            value={impressions}
            onChange={(e) => setImpressions(e.target.value)}
            placeholder="e.g. 12000"
          />
        </label>
        <label>
          Clicks / Link Visits
          <input
            type="number"
            min="0"
            value={clicks}
            onChange={(e) => setClicks(e.target.value)}
            placeholder="e.g. 450"
          />
        </label>
        <label>
          Conversions / Bookings
          <input
            type="number"
            min="0"
            value={conversions}
            onChange={(e) => setConversions(e.target.value)}
            placeholder="e.g. 24"
          />
        </label>
        <label>
          Engagement Rate (%)
          <input
            type="number"
            min="0"
            step="0.1"
            value={engagementRate}
            onChange={(e) => setEngagementRate(e.target.value)}
            placeholder="e.g. 4.8"
          />
        </label>
      </div>

      <label className="mt-4 block">
        Key Learnings & Notes
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Short-form reels with educational voiceovers converted 3x higher than static motivational quotes."
          rows={3}
        />
      </label>

      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">{error}</p>}
      {success && (
        <p className="mt-4 rounded-xl bg-[#effbec] p-3 text-xs font-bold text-[#235841]">
          ✓ Feedback saved! Click &quot;↻ Regenerate with feedback&quot; above anytime to refine your brand kit and copy.
        </p>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={submit}
          disabled={saving}
          className="primary-button disabled:opacity-50"
        >
          {saving ? "Saving Feedback…" : "Save Performance Feedback ✦"}
        </button>
      </div>
    </div>
  );
}
export default FeedbackForm;
