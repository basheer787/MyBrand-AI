"use client";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setMessage("");
    setIsError(false);

    const supabase = createClient();
    const { error } = isSignUp
      ? await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${location.origin}/` },
        })
      : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setIsError(true);
      if (error.message.toLowerCase().includes("email not confirmed")) {
        setMessage("Email not confirmed yet. Check your inbox for the Supabase confirmation email, or go to Supabase Dashboard ➔ Authentication ➔ Users and click 'Confirm user'.");
      } else if (error.message.toLowerCase().includes("rate limit")) {
        setMessage("Supabase email rate limit reached. In your Supabase Dashboard ➔ Authentication ➔ Providers ➔ Email, disable 'Confirm email' for instant signup/login without email limits.");
      } else {
        setMessage(error.message);
      }
    } else if (isSignUp) {
      setMessage("✓ Account created! If email confirmation is enabled, check your inbox. If disabled, you can sign in directly.");
      setIsSignUp(false);
    } else {
      location.href = "/";
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f8faf7] p-5">
      <section className="w-full max-w-md rounded-3xl border border-[#e1eae0] bg-white p-8 shadow-sm sm:p-10">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#357556] hover:underline">
          ← Back to preview
        </Link>
        
        <div className="mt-6 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#d6ff55] font-black text-[#133529] text-base">
            M
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-[#12382b]">
              MyBrand <span className="text-[#597d6e]">AI</span>
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#799488]">Private workspace</p>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex rounded-2xl bg-[#f2f7f0] p-1 border border-[#dfe8dc]">
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setMessage(""); }}
              className={`flex-1 rounded-xl py-2 text-xs font-extrabold transition ${
                !isSignUp ? "bg-white text-[#12382b] shadow-sm" : "text-[#5e7e70] hover:text-[#12382b]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setMessage(""); }}
              className={`flex-1 rounded-xl py-2 text-xs font-extrabold transition ${
                isSignUp ? "bg-white text-[#12382b] shadow-sm" : "text-[#5e7e70] hover:text-[#12382b]"
              }`}
            >
              Create Account
            </button>
          </div>

          <h2 className="mt-6 text-xl font-black text-[#12382b]">
            {isSignUp ? "Create your branding account" : "Welcome back to your workspace"}
          </h2>
          <p className="mt-1 text-xs text-[#628073]">
            {isSignUp
              ? "Start generating brand systems, social content calendars and sales copy."
              : "Sign in to access your saved Brand Kits and content calendars."}
          </p>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#527365]">
              Email Address
            </label>
            <input
              className="mt-1.5 w-full rounded-xl border border-[#d4e2d2] p-3 text-sm font-medium text-[#12382b] outline-none transition focus:border-[#3b8764] focus:ring-2 focus:ring-[#3b8764]/10"
              placeholder="you@yourbusiness.com"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#527365]">
              Password
            </label>
            <input
              className="mt-1.5 w-full rounded-xl border border-[#d4e2d2] p-3 text-sm font-medium text-[#12382b] outline-none transition focus:border-[#3b8764] focus:ring-2 focus:ring-[#3b8764]/10"
              placeholder="••••••••••••"
              type="password"
              required
              autoComplete={isSignUp ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {message && (
            <p className={`rounded-xl p-3 text-xs font-bold ${
              isError ? "bg-red-50 text-red-700 border border-red-200" : "bg-[#f0f9ed] text-[#245842] border border-[#d1e8cb]"
            }`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="primary-button mt-4 w-full disabled:opacity-50"
          >
            {loading ? "Please wait…" : isSignUp ? "Create Free Account ✦" : "Sign In to Workspace →"}
          </button>
        </form>
      </section>
    </main>
  );
}
