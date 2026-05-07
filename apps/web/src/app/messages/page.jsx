"use client";

import { useState, useEffect } from "react";
import { Shield, MessageSquare, ChevronRight, Clock } from "lucide-react";
import useUser from "@/utils/useUser";

const statusColors = {
  pending: "text-orange-600 bg-orange-50",
  confirmed: "text-blue-600 bg-blue-50",
  in_progress: "text-blue-600 bg-blue-50",
  completed: "text-green-600 bg-green-50",
  cancelled: "text-gray-500 bg-gray-100",
};

const statusLabels = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function MessagesPage() {
  const { data: user, loading: userLoading } = useUser();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userLoading && user) {
      fetchThreads();
    }
  }, [user, userLoading]);

  const fetchThreads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/messages");
      if (!res.ok) throw new Error("Failed to load messages");
      const data = await res.json();
      setThreads(data.threads || []);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-white font-['Inter'] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (typeof window !== "undefined")
      window.location.href = "/account/signin?callbackUrl=/messages";
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter']">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900 tracking-tight">
              Trusta
            </span>
          </a>
          <nav className="flex items-center gap-6">
            <a
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Dashboard
            </a>
            <a
              href="/account/logout"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign Out
            </a>
          </nav>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-2">
            Messages
          </h1>
          <p className="text-base text-gray-500">
            Conversations with your customers and providers
          </p>
        </div>

        {threads.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              No conversations yet
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Conversations are created automatically with each booking.
            </p>
            <a
              href="/browse"
              className="bg-blue-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Browse Services
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {threads.map((thread, idx) => (
              <a
                key={thread.booking_id}
                href={`/messages/${thread.booking_id}`}
                className={`flex items-start gap-4 p-5 hover:bg-gray-50 transition-colors ${
                  idx < threads.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                {/* Avatar */}
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-blue-700">
                    {(thread.other_party_name || "?").charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {thread.other_party_name || "Unknown"}
                      </p>
                      <div
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[thread.status] || statusColors.pending}`}
                      >
                        {statusLabels[thread.status] || "Pending"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {thread.unread_count > 0 && (
                        <span className="w-5 h-5 bg-blue-600 rounded-full text-white text-xs flex items-center justify-center font-medium">
                          {thread.unread_count}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">
                    {thread.service_title}
                  </p>
                  {thread.last_message ? (
                    <p className="text-sm text-gray-600 truncate">
                      {thread.last_message}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      No messages yet — say hello!
                    </p>
                  )}
                  {thread.last_message_at && (
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(thread.last_message_at).toLocaleDateString(
                        "en-NG",
                        {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
