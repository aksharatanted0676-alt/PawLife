"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Heart, Image as ImageIcon, MessageSquare, Sparkles } from "lucide-react";

type Post = { id: string; author: string; text: string; likes: number; comments: number; tag: string };

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([
    { id: "p1", author: "Anaya", text: "Milo finally finished his meds without drama. Small wins!", likes: 12, comments: 3, tag: "care" },
    { id: "p2", author: "Rohit", text: "Weekend grooming tips? My dog hates the dryer.", likes: 8, comments: 5, tag: "grooming" },
    { id: "p3", author: "Sana", text: "Share your favorite healthy treats for cats!", likes: 15, comments: 4, tag: "diet" }
  ]);
  const [composer, setComposer] = useState("");

  const tags = useMemo(() => ["care", "diet", "grooming", "vaccines"], []);

  return (
    <main className="mx-auto min-h-screen max-w-5xl p-6 md:p-12">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            Community (demo)
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">Pet community feed</h1>
          <p className="mt-2 max-w-2xl text-slate-300">Mock social feed UI: posts/photos/reactions. Great for product demos.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10" href="/explore">
            Explore
          </Link>
          <Link className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10" href="/dashboard">
            Dashboard
          </Link>
        </div>
      </header>

      <section className="mt-8 glass-panel p-5">
        <p className="text-sm font-semibold">Create a post</p>
        <textarea
          className="mt-3 min-h-[90px] w-full rounded-xl border border-white/20 bg-slate-900/50 p-3 text-sm"
          placeholder="Share an update…"
          value={composer}
          onChange={(e) => setComposer(e.target.value)}
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <button key={t} className="rounded-full border border-white/20 px-3 py-1 text-xs hover:bg-white/10" type="button">
                #{t}
              </button>
            ))}
          </div>
          <button
            className="rounded-lg bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-900"
            type="button"
            onClick={() => {
              const text = composer.trim();
              if (!text) return;
              setPosts((prev) => [{ id: `p${Date.now()}`, author: "You", text, likes: 0, comments: 0, tag: "care" }, ...prev]);
              setComposer("");
            }}
          >
            Post
          </button>
        </div>
      </section>

      <section className="mt-6 space-y-3">
        {posts.map((p) => (
          <div key={p.id} className="glass-panel p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{p.author}</p>
                <p className="mt-1 text-xs text-slate-400">#{p.tag}</p>
              </div>
              <button className="rounded-lg border border-white/20 p-2 text-xs hover:bg-white/10" type="button">
                <ImageIcon className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-200">{p.text}</p>
            <div className="mt-4 flex items-center gap-3 text-xs text-slate-300">
              <button
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 hover:bg-white/10"
                onClick={() => setPosts((prev) => prev.map((x) => (x.id === p.id ? { ...x, likes: x.likes + 1 } : x)))}
              >
                <Heart className="h-4 w-4 text-rose-200" /> {p.likes}
              </button>
              <span className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2">
                <MessageSquare className="h-4 w-4 text-cyan-200" /> {p.comments}
              </span>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

