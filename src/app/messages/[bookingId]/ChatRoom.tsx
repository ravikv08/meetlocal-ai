"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowLeft, Send, Plus, MapPin } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { ReportUserButton } from "@/components/ReportUserButton";
import { PmfSurveyCard } from "@/components/PmfSurveyCard";
import { getSupabaseBrowser, channelForBooking } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";
import type { BookingStatus } from "@prisma/client";

interface ChatMessage {
  id: string;
  body: string;
  senderId: string;
  senderName: string;
  senderImage?: string | null;
  createdAt: string;
}

interface Counterpart {
  id: string;
  name: string;
  image?: string | null;
}

interface ChatRoomProps {
  bookingId: string;
  bookingStatus: BookingStatus;
  hours: number;
  totalAmount: number;
  scheduledFor: string | null;
  meetingSpotName: string | null;
  currentUserId: string;
  currentUserName: string;
  currentUserImage: string | null;
  counterpart: Counterpart;
  role: "traveler" | "local";
  initialMessages: ChatMessage[];
  /** Server-rendered action bar (Accept / Decline / Mark complete / Review). */
  actionBar?: React.ReactNode;
}

const QUICK_PROMPTS = [
  "What should I wear?",
  "Any dietary notes?",
  "Can we start 30 min earlier?",
];

// Faithful port of the prototype's ChatScreen wired to Supabase Realtime.
// Persistence happens via /api/messages; broadcast over channel:booking:{id}.
export function ChatRoom(props: ChatRoomProps) {
  const {
    bookingId,
    bookingStatus,
    hours,
    totalAmount,
    scheduledFor,
    meetingSpotName,
    currentUserId,
    counterpart,
    role,
    initialMessages,
    actionBar,
  } = props;

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  // Subscribe to realtime broadcasts
  useEffect(() => {
    const supabase = getSupabaseBrowser();
    const channel = supabase
      .channel(channelForBooking(bookingId))
      .on("broadcast", { event: "message" }, ({ payload }) => {
        const m = payload as ChatMessage;
        // Avoid duplicating self-sent (we already optimistically added)
        setMessages((prev) =>
          prev.some((p) => p.id === m.id) ? prev : [...prev, m],
        );
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId]);

  const send = () => {
    const body = draft.trim();
    if (!body || isPending) return;
    setDraft("");
    startTransition(async () => {
      const res = await fetch(`/api/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ bookingId, body }),
      });
      if (!res.ok) {
        // re-add draft so user can retry
        setDraft(body);
        return;
      }
      const created: ChatMessage = await res.json();
      setMessages((prev) =>
        prev.some((p) => p.id === created.id) ? prev : [...prev, created],
      );
    });
  };

  const counterpartFirst = counterpart.name.split(" ")[0];
  const slotLabel = scheduledFor
    ? new Date(scheduledFor).toLocaleString("en-US", {
        weekday: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    : "TBD";

  const statusLabel: Record<BookingStatus, string> = {
    requested: "Awaiting accept",
    confirmed: "Confirmed",
    in_progress: "In progress",
    completed: "Completed",
    cancelled: "Cancelled",
    disputed: "Disputed",
  };

  return (
    <div className="flex h-screen flex-col bg-bg text-text">
      {/* Header */}
      <div className="flex items-center gap-3.5 border-b border-line bg-bg px-6 py-4">
        <Link
          href={role === "traveler" ? `/booking/${bookingId}/confirmed` : "/admin"}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line-2 bg-surface"
        >
          <ArrowLeft size={15} />
        </Link>
        <Avatar name={counterpart.name} size={40} imageUrl={counterpart.image} ring />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm font-semibold">
            {counterpart.name}
            <span className="h-1.5 w-1.5 rounded-full bg-good" />
          </div>
          <div className="font-mono text-xs text-text-dim">
            {role === "traveler" ? "Your local" : "Your traveler"}
          </div>
        </div>
        {/* Safety report button — opens an inline modal that emails safety inbox */}
        <ReportUserButton
          reportedUserId={counterpart.id}
          reportedUserName={counterpart.name}
          bookingId={bookingId}
        />
      </div>

      {/* Booking summary card */}
      <div className="border-b border-line px-6 pb-4 pt-4">
        <div className="flex items-center gap-3.5 rounded-2xl border border-line-2 bg-surface p-3.5">
          <div className="grad-sunset flex h-11 w-11 items-center justify-center rounded-xl text-white">
            <MapPin size={18} />
          </div>
          <div className="flex-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              {statusLabel[bookingStatus]} · {meetingSpotName ?? "Spot TBD"}
            </div>
            <div className="mt-0.5 text-sm font-semibold">
              {slotLabel} · {hours}h · {formatPrice(totalAmount)}
            </div>
          </div>
        </div>
      </div>

      {/* Action bar (Accept / Decline / Mark complete / Review) */}
      {actionBar}

      {/* Sean Ellis PMF survey — shown to traveler once after a completed
          booking. Self-dismisses + the server action is idempotent (one
          per user) so re-renders won't spam the user. */}
      {role === "traveler" && bookingStatus === "completed" && (
        <PmfSurveyCard bookingId={bookingId} />
      )}

      {/* Messages */}
      <div ref={scrollRef} className="scroll-hide flex-1 space-y-1.5 overflow-y-auto px-6 py-5">
        <div className="my-3 text-center font-mono text-[10px] uppercase tracking-wider text-text-muted">
          ─ Booking opened ─
        </div>
        {messages.length === 0 && (
          <div className="my-12 text-center text-sm text-text-dim">
            Say hi to {counterpartFirst} — break the ice.
          </div>
        )}
        {messages.map((m, i) => {
          const me = m.senderId === currentUserId;
          const first = i === 0 || messages[i - 1].senderId !== m.senderId;
          return (
            <div
              key={m.id}
              className={
                "animate-ml-fadeup flex items-end gap-2.5" +
                (me ? " flex-row-reverse" : "")
              }
            >
              {!me &&
                (first ? (
                  <Avatar name={m.senderName} size={28} imageUrl={m.senderImage} />
                ) : (
                  <div className="w-7 shrink-0" />
                ))}
              <div
                className={
                  "max-w-[70%] rounded-2xl px-3.5 py-2.5 text-sm leading-snug " +
                  (me
                    ? "grad-sunset text-white shadow-[0_8px_24px_rgba(255,106,61,0.20)]"
                    : "bg-surface")
                }
                style={
                  first
                    ? me
                      ? { borderTopRightRadius: 4 }
                      : { borderTopLeftRadius: 4 }
                    : undefined
                }
              >
                {m.body}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick prompts */}
      {messages.length < 3 && (
        <div className="scroll-hide flex gap-2 overflow-x-auto px-6 pb-3">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => setDraft(p)}
              className="whitespace-nowrap rounded-full border border-line bg-surface px-3.5 py-2 text-xs text-text-dim transition hover:text-text"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Composer */}
      <div className="border-t border-line px-6 py-4">
        <div className="flex items-center gap-2.5 rounded-full border border-line-2 bg-surface py-1.5 pl-5 pr-1.5">
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-text-dim transition hover:text-text">
            <Plus size={15} />
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Message…"
            className="flex-1 bg-transparent text-sm outline-none"
          />
          <button
            onClick={send}
            disabled={!draft.trim() || isPending}
            className={
              "flex h-9 w-9 items-center justify-center rounded-full text-white transition " +
              (draft.trim() ? "grad-sunset" : "bg-surface-2 text-text-muted")
            }
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
