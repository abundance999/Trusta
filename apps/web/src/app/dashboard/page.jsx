"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Calendar,
  Star,
  MapPin,
  DollarSign,
  Clock,
  BarChart2,
  MessageSquare,
  QrCode,
  TrendingUp,
} from "lucide-react";
import useUser from "@/utils/useUser";

export default function DashboardPage() {
  const { data: user, loading: userLoading } = useUser();
  const [bookings, setBookings] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userLoading && user) {
      fetchDashboardData();
    }
  }, [user, userLoading]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, profileRes] = await Promise.all([
        fetch("/api/bookings/my-bookings"),
        fetch("/api/profile"),
      ]);

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData.bookings || []);
      }

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData.profile);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-white font-['Inter'] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    window.location.href = "/account/signin?callbackUrl=/dashboard";
    return null;
  }

  const statusConfig = {
    pending: { label: "Pending", color: "orange" },
    confirmed: { label: "Confirmed", color: "blue" },
    in_progress: { label: "In Progress", color: "blue" },
    completed: { label: "Completed", color: "green" },
    cancelled: { label: "Cancelled", color: "gray" },
  };

  const isProvider = profile?.role === "provider";

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
              href="/browse"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Browse Services
            </a>
            <a
              href="/messages"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Messages
            </a>
            <a href="/dashboard" className="text-sm font-medium text-gray-900">
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

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-2">
            Welcome back, {user.name}
          </h1>
          <p className="text-base text-gray-500">
            {isProvider
              ? "Manage your bookings and services"
              : "View your bookings and service history"}
          </p>
        </div>

        {/* Provider Quick Actions */}
        {isProvider && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <a
              href="/analytics"
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors flex items-center gap-4"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Analytics</p>
                <p className="text-xs text-gray-500">Earnings & performance</p>
              </div>
            </a>
            <a
              href="/provider/scan"
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors flex items-center gap-4"
            >
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <QrCode className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Scan QR Code
                </p>
                <p className="text-xs text-gray-500">Start a customer's job</p>
              </div>
            </a>
            <a
              href="/messages"
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors flex items-center gap-4"
            >
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Messages</p>
                <p className="text-xs text-gray-500">Customer conversations</p>
              </div>
            </a>
          </div>
        )}

        {/* Customer Quick Actions */}
        {!isProvider && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <a
              href="/messages"
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors flex items-center gap-4"
            >
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Messages</p>
                <p className="text-xs text-gray-500">Talk to your providers</p>
              </div>
            </a>
            <a
              href="/browse"
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors flex items-center gap-4"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Book a Service
                </p>
                <p className="text-xs text-gray-500">Find verified providers</p>
              </div>
            </a>
          </div>
        )}

        {/* Become Provider Prompt */}
        {!profile && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-blue-900 mb-2">
                  Want to offer your services?
                </h2>
                <p className="text-sm text-blue-800 mb-4">
                  Join our verified marketplace and start receiving bookings
                  from customers
                </p>
                <a
                  href="/become-provider"
                  className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  Become a Provider
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Bookings */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {isProvider ? "Your Bookings" : "My Bookings"}
            </h2>
            <a
              href="/browse"
              className="bg-blue-50 text-blue-600 rounded-full px-3 py-1.5 text-sm font-medium inline-flex items-center hover:bg-blue-100 transition-colors"
            >
              Book New Service
            </a>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                No bookings yet
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {isProvider
                  ? "Your bookings will appear here once customers start booking your services"
                  : "Start by browsing verified providers and booking a service"}
              </p>
              {!isProvider && (
                <a
                  href="/browse"
                  className="bg-blue-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  Browse Services
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const status =
                  statusConfig[booking.status] || statusConfig.pending;
                return (
                  <a
                    key={booking.id}
                    href={`/booking/${booking.id}`}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors block"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-semibold text-gray-900">
                            {booking.service_title}
                          </h3>
                          <div
                            className={`bg-${status.color}-50 border border-${status.color}-200 rounded-full px-2 py-0.5 inline-flex items-center gap-1`}
                          >
                            <span
                              className={`w-1.5 h-1.5 bg-${status.color}-600 rounded-full`}
                            ></span>
                            <span
                              className={`text-xs font-medium text-${status.color}-600`}
                            >
                              {status.label}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          {isProvider
                            ? `Customer: ${booking.customer_name}`
                            : `Provider: ${booking.provider_name}`}
                        </p>
                      </div>
                      <span className="text-base font-semibold text-gray-900">
                        ₦{Number(booking.amount).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(booking.scheduled_at).toLocaleDateString(
                          "en-NG",
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(booking.scheduled_at).toLocaleTimeString(
                          "en-NG",
                          { hour: "2-digit", minute: "2-digit" },
                        )}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
