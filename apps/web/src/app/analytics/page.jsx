"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  TrendingUp,
  DollarSign,
  Calendar,
  Star,
  CheckCircle,
  Clock,
  XCircle,
  BarChart2,
  ArrowLeft,
} from "lucide-react";
import useUser from "@/utils/useUser";

function StatCard({ icon: Icon, label, value, sub, color = "blue" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-semibold text-gray-900 mb-0.5">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function MiniBar({ value, max, color = "blue" }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const colors = {
    blue: "bg-blue-600",
    green: "bg-green-500",
    purple: "bg-purple-500",
  };
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5">
      <div
        className={`h-1.5 rounded-full ${colors[color]}`}
        style={{ width: `${pct}%` }}
      ></div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: user, loading: userLoading } = useUser();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userLoading && user) {
      fetchAnalytics();
    }
  }, [user, userLoading]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to load analytics");
      }
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error("Analytics error:", err);
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
          <p className="text-sm text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (typeof window !== "undefined")
      window.location.href = "/account/signin?callbackUrl=/analytics";
    return null;
  }

  if (error) {
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
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <BarChart2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Analytics Unavailable
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {error === "Provider profile not found"
              ? "Analytics are only available for provider accounts."
              : error}
          </p>
          <a
            href="/become-provider"
            className="bg-blue-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors inline-block mr-3"
          >
            Become a Provider
          </a>
          <a
            href="/dashboard"
            className="bg-white border border-gray-200 text-gray-700 text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors inline-block"
          >
            Dashboard
          </a>
        </div>
      </div>
    );
  }

  const {
    overview,
    monthly_earnings,
    recent_bookings,
    top_services,
    recent_reviews,
  } = analytics || {};
  const maxEarnings =
    monthly_earnings?.length > 0
      ? Math.max(...monthly_earnings.map((m) => m.earnings || 0))
      : 1;
  const maxBookings =
    top_services?.length > 0
      ? Math.max(...top_services.map((s) => s.booking_count || 0))
      : 1;

  const statusConfig = {
    pending: {
      label: "Pending",
      icon: Clock,
      color: "text-orange-600 bg-orange-50",
    },
    confirmed: {
      label: "Confirmed",
      icon: CheckCircle,
      color: "text-blue-600 bg-blue-50",
    },
    in_progress: {
      label: "In Progress",
      icon: TrendingUp,
      color: "text-blue-600 bg-blue-50",
    },
    completed: {
      label: "Completed",
      icon: CheckCircle,
      color: "text-green-600 bg-green-50",
    },
    cancelled: {
      label: "Cancelled",
      icon: XCircle,
      color: "text-gray-500 bg-gray-50",
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter']">
      {/* Header */}
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
              href="/provider/scan"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Scan QR
            </a>
            <a
              href="/messages"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Messages
            </a>
            <a
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </a>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-2">
            Provider Analytics
          </h1>
          <p className="text-base text-gray-500">
            Your performance overview and earnings summary
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={DollarSign}
            label="Total Earnings"
            value={`₦${(overview?.total_earnings || 0).toLocaleString()}`}
            sub="From completed jobs"
            color="green"
          />
          <StatCard
            icon={Calendar}
            label="Total Bookings"
            value={overview?.total_bookings || 0}
            sub={`${overview?.completed_bookings || 0} completed`}
            color="blue"
          />
          <StatCard
            icon={TrendingUp}
            label="Completion Rate"
            value={`${overview?.completion_rate || 0}%`}
            sub="Jobs completed vs total"
            color="purple"
          />
          <StatCard
            icon={Star}
            label="Average Rating"
            value={overview?.rating ? Number(overview.rating).toFixed(1) : "–"}
            sub={`${overview?.review_count || 0} reviews`}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Monthly Earnings Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-6">
              Monthly Earnings
            </h2>
            {monthly_earnings && monthly_earnings.length > 0 ? (
              <div className="space-y-4">
                {monthly_earnings.map((month, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-gray-600">
                        {month.month}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">
                          {month.bookings} job{month.bookings !== 1 ? "s" : ""}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          ₦{Number(month.earnings || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <MiniBar
                      value={month.earnings || 0}
                      max={maxEarnings}
                      color="blue"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart2 className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">
                  No earnings data yet. Complete jobs to see your trends.
                </p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Booking Breakdown
              </h3>
              <div className="space-y-3">
                {[
                  {
                    label: "Completed",
                    value: overview?.completed_bookings || 0,
                    color: "text-green-600",
                  },
                  {
                    label: "Active",
                    value: overview?.active_bookings || 0,
                    color: "text-blue-600",
                  },
                  {
                    label: "Pending",
                    value: overview?.pending_bookings || 0,
                    color: "text-orange-600",
                  },
                  {
                    label: "Cancelled",
                    value: overview?.cancelled_bookings || 0,
                    color: "text-gray-500",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-500">{item.label}</span>
                    <span className={`text-sm font-semibold ${item.color}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Pending Payout
              </h3>
              <p className="text-2xl font-semibold text-gray-900">
                ₦{(overview?.pending_payout || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                In escrow, pending job completion
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top Services */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Top Services
            </h2>
            {top_services && top_services.length > 0 ? (
              <div className="space-y-4">
                {top_services.map((service, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-gray-900 truncate flex-1 mr-4">
                        {service.title || "Unnamed Service"}
                      </span>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs text-gray-400">
                          {service.booking_count} bookings
                        </span>
                        <span className="text-xs font-semibold text-gray-900">
                          ₦{Number(service.total_revenue || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <MiniBar
                      value={service.booking_count || 0}
                      max={maxBookings}
                      color="purple"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-gray-400">No service data yet.</p>
              </div>
            )}
          </div>

          {/* Recent Reviews */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Recent Reviews
            </h2>
            {recent_reviews && recent_reviews.length > 0 ? (
              <div className="space-y-4">
                {recent_reviews.map((review, idx) => (
                  <div
                    key={idx}
                    className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {review.customer_name}
                      </span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${s <= review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(review.created_at).toLocaleDateString("en-NG", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Star className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">
                  No reviews yet. Complete jobs to earn reviews.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Recent Bookings
          </h2>
          {recent_bookings && recent_bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">
                      Service
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">
                      Customer
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">
                      Date
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">
                      Status
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-500 pb-3">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recent_bookings.map((booking) => {
                    const status =
                      statusConfig[booking.status] || statusConfig.pending;
                    const StatusIcon = status.icon;
                    return (
                      <tr
                        key={booking.id}
                        className="border-b border-gray-50 last:border-b-0"
                      >
                        <td className="py-3 pr-4">
                          <a
                            href={`/booking/${booking.id}`}
                            className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            {booking.service_title}
                          </a>
                        </td>
                        <td className="py-3 pr-4 text-gray-600">
                          {booking.customer_name}
                        </td>
                        <td className="py-3 pr-4 text-gray-500">
                          {new Date(booking.scheduled_at).toLocaleDateString(
                            "en-NG",
                            { month: "short", day: "numeric" },
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <div
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </div>
                        </td>
                        <td className="py-3 text-right font-semibold text-gray-900">
                          ₦{Number(booking.amount).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No bookings yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
