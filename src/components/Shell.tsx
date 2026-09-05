"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/", label: "Overview", icon: "📊" },
  { href: "/workspace", label: "My Workspace", icon: "📁" },
  { href: "/create", label: "New Campaign", icon: "✦" },
];

export default function Shell({
  children,
  userEmail,
}: {
  children: ReactNode;
  userEmail?: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth");
  }

  const initial = userEmail ? userEmail[0]!.toUpperCase() : "?";

  const nav = (
    <>
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#d6ff55] font-black text-[#12382b] text-base shadow-sm">
          M
        </div>
        <div>
          <p className="text-base font-black tracking-tight text-[#12382b]">
            MyBrand <span className="text-[#597d6e]">AI</span>
          </p>
          <p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#799488]">
            Brand & Growth Studio
          </p>
        </div>
      </div>

      <nav className="space-y-1.5">
        {NAV.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`nav-item ${isActive ? "nav-active" : ""}`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-[#d6e8d1] bg-[#edf6eb] p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">✨</span>
          <p className="text-xs font-black text-[#1b4e39]">Create with AI</p>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-[#4f6e61]">
          Generate a 7-day multi-channel calendar and Brand DNA for any business.
        </p>
        <Link
          href="/create"
          onClick={() => setOpen(false)}
          className="mt-3 inline-flex items-center gap-1 text-xs font-black text-[#265e46] hover:underline"
        >
          ✦ Start new campaign →
        </Link>
      </div>

      {userEmail ? (
        <div className="mt-4 flex items-center justify-between gap-2 rounded-2xl border border-[#e1eae0] bg-white p-2.5 shadow-sm">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#d6ff55] text-xs font-black text-[#12382b]">
              {initial}
            </span>
            <span className="truncate text-xs font-bold text-[#143c2f]">{userEmail}</span>
          </div>
          <button
            onClick={signOut}
            className="rounded-lg px-2 py-1 text-[11px] font-bold text-[#799488] hover:bg-[#fee2e2] hover:text-[#991b1b] transition"
          >
            Sign out
          </button>
        </div>
      ) : (
        <Link
          href="/auth"
          className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-[#d2e2cf] bg-white p-2.5 text-xs font-bold text-[#1e4d3b] shadow-sm hover:bg-[#f6faf4]"
        >
          Sign in to your account →
        </Link>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-[#f8faf7] text-[#12382b]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-[#e1eae0] bg-[#fbfdfa] px-5 py-7 lg:flex">
        {nav}
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-[#fbfdfa] px-5 py-7 shadow-2xl">
            {nav}
          </aside>
        </div>
      )}

      <button
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        className="fixed left-4 top-4 z-30 grid h-10 w-10 place-items-center rounded-2xl border border-[#dfe8dc] bg-white shadow-sm lg:hidden hover:bg-[#f7faf5]"
      >
        <span className="text-base">☰</span>
      </button>

      <section className="lg:ml-64">{children}</section>
    </div>
  );
}
