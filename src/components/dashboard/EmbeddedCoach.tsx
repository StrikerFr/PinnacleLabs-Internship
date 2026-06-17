import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import type { Profile, Roadmap } from "../../types";
import { coachChat } from "@/lib/ai.functions";
import { listConversations, getMessages } from "@/lib/data.functions";
import { Send, Sparkles, X, Maximize2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

type Msg = { id?: string; role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Review my roadmap",
  "Plan my day",
  "Analyse my skill gaps",
  "Mock interview me",
];

const MODES = [
  { id: "career", label: "Career" },
  { id: "productivity", label: "Productivity" },
  { id: "learning", label: "Learning" },
  { id: "interview", label: "Interview" },
] as const;

type ModeId = (typeof MODES)[number]["id"];

const MODE_PROMPT: Record<ModeId, string> = {
  career: "Act as my career strategist. ",
  productivity: "Act as my productivity coach. ",
  learning: "Act as my learning coach. ",
  interview: "Act as my interview coach. ",
};

export function EmbeddedCoach({
  profile,
  primary,
}: {
  profile: Profile | null;
  primary: Roadmap | null;
}) {
  const fnSend = useServerFn(coachChat);
  const fnList = useServerFn(listConversations);
  const fnMsgs = useServerFn(getMessages);

  const [activeId, setActiveId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [mode, setMode] = useState<ModeId>("career");
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // load most recent conversation once
  useEffect(() => {
    (async () => {
      try {
        const list = await fnList();
        if (list?.[0]) {
          setActiveId(list[0].id);
          const msgs = await fnMsgs({ data: { conversationId: list[0].id } });
          setMessages(msgs as Msg[]);
        }
      } catch {
        /* silent */
      }
    })();
  }, [fnList, fnMsgs]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function send(textOverride?: string) {
    const raw = (textOverride ?? input).trim();
    if (!raw || sending) return;
    const content = MODE_PROMPT[mode] + raw;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: raw, id: "tmp-u" + Date.now() }]);
    setSending(true);
    try {
      const res = await fnSend({ data: { conversationId: activeId, message: content } });
      if (!activeId) setActiveId(res.conversationId);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: res.reply, id: "tmp-a" + Date.now() },
      ]);
    } catch (e: unknown) {
      toast.error((e as Error)?.message || "Coach failed to respond");
      setMessages((m) => m.slice(0, -1));
    } finally {
      setSending(false);
    }
  }

  const recent = expanded ? messages : messages.slice(-4);

  return (
    <>
      <div className="ios-card p-0 overflow-hidden flex flex-col h-full">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4 border-b border-[color:color-mix(in_oklab,var(--coffee)_8%,transparent)]">
          <div className="flex items-center gap-3">
            <CoachOrb />
            <div>
              <p className="tp-eyebrow">YOUR AI MENTOR</p>
              <h3 className="font-serif text-[22px] text-ink leading-tight mt-0.5">
                {firstName(profile)}, what's the plan?
              </h3>
            </div>
          </div>
          <button
            onClick={() => setExpanded(true)}
            className="w-8 h-8 rounded-full grid place-items-center text-coffee/70 hover:text-ink hover:bg-[color:color-mix(in_oklab,var(--ink)_6%,transparent)] transition"
            title="Open full session"
          >
            <Maximize2 className="w-4 h-4" strokeWidth={1.8} />
          </button>
        </div>

        {/* Mode pills */}
        <div className="px-6 pt-4 flex flex-wrap gap-1.5">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`text-[11px] uppercase tracking-[0.15em] font-bold px-2.5 py-1.5 rounded-full transition ${
                mode === m.id
                  ? "bg-ink text-white"
                  : "bg-[color:color-mix(in_oklab,var(--coffee)_6%,transparent)] text-coffee hover:text-ink"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-auto px-6 py-5 space-y-4 min-h-[260px] max-h-[420px]"
        >
          {messages.length === 0 && (
            <div className="space-y-3">
              <p className="text-[14px] text-coffee leading-relaxed">
                Pick a starter or ask anything about your goal
                {primary?.goal ? (
                  <>
                    : <span className="text-ink font-semibold">{primary.goal}</span>
                  </>
                ) : (
                  "."
                )}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-left text-[13.5px] text-ink px-3.5 py-2.5 rounded-xl bg-[color:color-mix(in_oklab,var(--coffee)_5%,transparent)] hover:bg-[color:color-mix(in_oklab,var(--coffee)_9%,transparent)] transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {recent.map((m, i) => (
            <MessageBubble key={m.id ?? i} msg={m} />
          ))}

          {sending && (
            <div className="flex items-center gap-2 text-[13px] text-coffee/70">
              <span className="tp-coach-dot animate-pulse" />
              <span className="tp-coach-dot animate-pulse" style={{ animationDelay: "120ms" }} />
              <span className="tp-coach-dot animate-pulse" style={{ animationDelay: "240ms" }} />
              <span className="ml-1">Thinking…</span>
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="px-4 pb-4 pt-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2 bg-[color:color-mix(in_oklab,var(--coffee)_5%,transparent)] rounded-2xl pl-4 pr-1.5 py-1.5"
          >
            <Sparkles className="w-4 h-4 text-violet shrink-0" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your AI mentor anything…"
              maxLength={4000}
              className="flex-1 bg-transparent outline-none text-ink placeholder:text-coffee/50 text-[14.5px] py-2"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="bg-ink text-white rounded-xl w-10 h-10 grid place-items-center disabled:opacity-40 hover:scale-[1.04] transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Expanded overlay */}
      {expanded && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in">
          <div className="bg-ivory rounded-3xl w-full max-w-[920px] h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-[color:color-mix(in_oklab,var(--coffee)_10%,transparent)]">
            <div className="px-6 py-5 flex items-center justify-between border-b border-[color:color-mix(in_oklab,var(--coffee)_8%,transparent)]">
              <div className="flex items-center gap-3">
                <CoachOrb />
                <div>
                  <p className="tp-eyebrow">
                    AI MENTOR · {MODES.find((m) => m.id === mode)?.label}
                  </p>
                  <h3 className="font-serif text-2xl text-ink leading-tight">Full session</h3>
                </div>
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="w-9 h-9 rounded-full grid place-items-center hover:bg-[color:color-mix(in_oklab,var(--ink)_6%,transparent)] text-coffee"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto px-6 py-6 space-y-4">
              {messages.length === 0 && (
                <p className="text-coffee text-center py-12">
                  Start with a suggestion or just type below.
                </p>
              )}
              {messages.map((m, i) => (
                <MessageBubble key={m.id ?? i} msg={m} />
              ))}
              {sending && (
                <div className="flex items-center gap-2 text-[13px] text-coffee/70">
                  <span className="tp-coach-dot animate-pulse" />
                  <span
                    className="tp-coach-dot animate-pulse"
                    style={{ animationDelay: "120ms" }}
                  />
                  <span
                    className="tp-coach-dot animate-pulse"
                    style={{ animationDelay: "240ms" }}
                  />
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[color:color-mix(in_oklab,var(--coffee)_8%,transparent)]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
                className="flex items-center gap-2 bg-[color:color-mix(in_oklab,var(--coffee)_5%,transparent)] rounded-2xl pl-4 pr-1.5 py-1.5"
              >
                <Sparkles className="w-4 h-4 text-violet shrink-0" />
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything…"
                  className="flex-1 bg-transparent outline-none text-ink placeholder:text-coffee/50 text-[15px] py-2.5"
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="bg-ink text-white rounded-xl w-10 h-10 grid place-items-center disabled:opacity-40 hover:scale-[1.04] transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MessageBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed ${
          isUser
            ? "bg-ink text-white"
            : "bg-[color:color-mix(in_oklab,var(--coffee)_6%,transparent)] text-ink"
        }`}
      >
        {isUser ? (
          msg.content
        ) : (
          <div className="prose prose-sm max-w-none prose-headings:font-serif prose-headings:text-ink prose-strong:text-ink prose-p:text-ink prose-li:text-ink">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

function CoachOrb() {
  return (
    <span className="relative w-10 h-10 rounded-full grid place-items-center overflow-hidden tp-coach-orb shrink-0">
      <span className="tp-coach-orb-inner" />
      <Sparkles className="w-4 h-4 text-white relative z-10" strokeWidth={2.2} />
    </span>
  );
}

function firstName(p: Profile | null): string {
  const n = p?.full_name?.split(" ")[0];
  return n || "Friend";
}
