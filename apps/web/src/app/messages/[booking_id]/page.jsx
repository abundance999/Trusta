"use client";

import { useState, useEffect, useRef } from "react";
import {
  Shield,
  Send,
  ArrowLeft,
  CheckCircle,
  Clock,
  QrCode,
} from "lucide-react";
import useUser from "@/utils/useUser";

export default function MessageThreadPage({ params }) {
  const { booking_id } = params;
  const { data: user } = useUser();
  const [messages, setMessages] = useState([]);
  const [booking, setBooking] = useState(null);
  const [profileId, setProfileId] = useState(null);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    fetchAll();
    pollRef.current = setInterval(fetchMessages, 5000);
    return () => clearInterval(pollRef.current);
  }, [booking_id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchMessages(), fetchBooking()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages/${booking_id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/bookings/${booking_id}`);
      if (res.ok) {
        const data = await res.json();
        setBooking(data.booking);
      }
      // Also get threads to get profile_id
      const threadsRes = await fetch("/api/messages");
      if (threadsRes.ok) {
        const td = await threadsRes.json();
        if (td.profile_id) setProfileId(td.profile_id);
      }
    } catch (err) {
      console.error("Error fetching booking:", err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    setError(null);

    const optimisticMsg = {
      id: `temp-${Date.now()}`,
      content: content.trim(),
      sender_name: user?.name || "You",
      sender_profile_id: profileId || "me",
      created_at: new Date().toISOString(),
      is_read: false,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    const saved = content.trim();
    setContent("");

    try {
      const res = await fetch(`/api/messages/${booking_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: saved }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      await fetchMessages();
    } catch (err) {
      console.error("Send error:", err);
      setError("Message failed to send. Please try again.");
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
    } finally {
      setSending(false);
    }
  };

  const isMyMessage = (msg) => {
    if (profileId && msg.sender_profile_id === profileId) return true;
    if (!profileId && msg.sender_name === user?.name) return true;
    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-['Inter'] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statusColors = {
    pending: "text-orange-600 bg-orange-50 border-orange-200",
    confirmed: "text-blue-600 bg-blue-50 border-blue-200",
    in_progress: "text-blue-600 bg-blue-50 border-blue-200",
    completed: "text-green-600 bg-green-50 border-green-200",
    cancelled: "text-gray-500 bg-gray-50 border-gray-200",
  };

  const statusLabels = {
    pending: "Pending",
    confirmed: "Confirmed",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter'] flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white flex-shrink-0">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="/messages"
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </a>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-blue-700">
                  {booking?.provider_name?.charAt(0) || "?"}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 leading-tight">
                  {booking?.provider_name ||
                    booking?.service_title ||
                    "Booking Conversation"}
                </p>
                {booking?.status && (
                  <div
                    className={`inline-flex items-center gap-1 border rounded-full px-2 py-0.5 text-xs font-medium mt-0.5 ${statusColors[booking.status] || statusColors.pending}`}
                  >
                    <span className="w-1 h-1 rounded-full bg-current"></span>
                    {statusLabels[booking.status]}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {booking && (
              <a
                href={`/booking/${booking_id}`}
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
              >
                <QrCode className="w-4 h-4" />
                View Booking
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Booking Context Bar */}
      {booking && (
        <div className="bg-white border-b border-gray-100 flex-shrink-0">
          <div className="max-w-3xl mx-auto px-6 py-3 flex items-center gap-4 text-xs text-gray-500">
            <span className="font-medium text-gray-900">
              {booking.service_title}
            </span>
            <span>·</span>
            <span>₦{Number(booking.amount).toLocaleString()}</span>
            <span>·</span>
            <span>
              {booking.scheduled_at &&
                new Date(booking.scheduled_at).toLocaleDateString("en-NG", {
                  month: "short",
                  day: "numeric",
                })}
            </span>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Send className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">
                No messages yet. Start the conversation!
              </p>
            </div>
          )}

          {messages.map((msg) => {
            const mine = isMyMessage(msg);
            return (
              <div
                key={msg.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-sm ${mine ? "items-end" : "items-start"} flex flex-col gap-1`}
                >
                  {!mine && (
                    <p className="text-xs text-gray-400 px-1">
                      {msg.sender_name}
                    </p>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      mine
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-white border border-gray-200 text-gray-900 rounded-bl-md"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <p className="text-xs text-gray-400 px-1 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(msg.created_at).toLocaleTimeString("en-NG", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {mine && msg.is_read && (
                      <CheckCircle className="w-2.5 h-2.5 text-blue-400" />
                    )}
                  </p>
                </div>
              </div>
            );
          })}

          {error && (
            <div className="flex justify-center">
              <div className="bg-red-50 border border-red-200 rounded-full px-4 py-2 text-xs text-red-700">
                {error}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <form onSubmit={sendMessage} className="flex items-center gap-3">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type a message..."
              disabled={sending}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={sending || !content.trim()}
              className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
