"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { PawPrint, Send, Sparkles } from "lucide-react";

type Msg = { role: "user" | "bot"; text: string };

function replyFor(input: string) {
  const text = input.toLowerCase();
  if (text.includes("vomit") || text.includes("vomiting")) {
    return "If vomiting is frequent, has blood, or your pet is lethargic, see a vet. For mild cases: offer small sips of water, avoid rich food for 12 hours, then bland meals. Monitor hydration.";
  }
  if (text.includes("not eating") || text.includes("no appetite")) {
    return "Loss of appetite can be stress, stomach upset, dental pain, fever, or more. Try warming food slightly and offer small bland meals. If no eating for 24 hours (or for kittens/puppies: sooner), consult a vet.";
  }
  if (text.includes("diet") || text.includes("food") || text.includes("weight")) {
    return "General diet tips: consistent meal times, clean water always, treats under 10% of calories. If weight is increasing, reduce portions slightly and increase low-impact activity. For medical diets, consult your vet.";
  }
  if (text.includes("vaccin") || text.includes("vaccine") || text.includes("schedule")) {
    return "Vaccination schedules vary by region/species. Keep booster dates in reminders, avoid missing rabies/core vaccines, and ask your vet about lifestyle-based vaccines. If you share pet age, I can suggest a generic checklist.";
  }
  if (text.includes("itch") || text.includes("rash") || text.includes("skin")) {
    return "For itchy skin: check for fleas/ticks, avoid new shampoos, keep the area clean/dry, and prevent scratching. If redness spreads, there's discharge, or odor appears, a vet visit is recommended.";
  }
  if (text.includes("groom") || text.includes("bath")) {
    return "Grooming basics: brush regularly, use pet-safe shampoo, dry thoroughly, and clean ears only with vet-approved solution. If skin gets irritated after baths, reduce frequency and switch products.";
  }
  return "I can help with diet, symptoms, vaccines, grooming, and care tips. Try asking: “My dog is not eating”, “Vaccination schedule”, or “Symptoms checker”.";
}

export default function SimpleChatbotPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "bot", text: "Hi! I’m PawLife Assistant (rule-based). Ask about diet, symptoms, vaccines, grooming, or care tips." }
  ]);
  const [input, setInput] = useState("");

  const prompts = useMemo(() => ["My dog is not eating", "Vaccination schedule", "My cat is vomiting", "Diet plan tips", "Itchy skin help"], []);

  const send = (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    setMessages((prev) => [...prev, { role: "user", text: msg }, { role: "bot", text: replyFor(msg) }]);
    setInput("");
  };

  return (
    <main className="mx-auto min-h-screen max-w-5xl p-6 md:p-12">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            Simple chatbot (predefined responses)
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">Pet care chatbot</h1>
          <p className="mt-2 max-w-2xl text-slate-300">A lightweight assistant for demos: no API keys, instant answers, and friendly UX.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10" href="/dashboard">
            Dashboard
          </Link>
          <Link className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10" href="/pricing">
            Plans
          </Link>
        </div>
      </header>

      <section className="mt-8 glass-panel flex h-[640px] flex-col p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          {prompts.map((p) => (
            <button key={p} className="rounded-full border border-white/20 px-3 py-1 text-xs hover:bg-white/10" onClick={() => send(p)}>
              {p}
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-2 overflow-auto rounded-xl bg-slate-900/40 p-3">
          {messages.map((m, i) => (
            <div
              key={`${m.role}-${i}`}
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${m.role === "user" ? "ml-auto bg-cyan-500 text-slate-900" : "bg-white/10"}`}
            >
              {m.text}
            </div>
          ))}
        </div>

        <form
          className="mt-3 flex gap-2"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            send();
          }}
        >
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-white/20 bg-slate-900/60 px-3 py-2">
            <PawPrint className="h-4 w-4 text-cyan-200" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
          <button className="rounded-lg bg-cyan-400 p-2 text-slate-900" aria-label="Send">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </section>
    </main>
  );
}

