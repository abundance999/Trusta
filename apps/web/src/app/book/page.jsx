"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, Calendar, DollarSign, Clock, AlertCircle } from "lucide-react";
import useUser from "@/utils/useUser";

export default function BookingPage() {
  const { data: user, loading: userLoading } = useUser();
  const [provider, setProvider] = useState(null);
  const [service, setService] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const providerId = params.get("provider");
    const serviceId = params.get("service");

    if (!providerId) {
      window.location.href = "/browse";
      return;
    }

    fetchBookingData(providerId, serviceId);
  }, []);

  const fetchBookingData = async (providerId, serviceId) => {
    setLoading(true);
    try {
      const [providerRes, servicesRes] = await Promise.all([
        fetch(`/api/providers/${providerId}`),
        fetch(`/api/providers/${providerId}/services`),
      ]);

      if (providerRes.ok) {
        const providerData = await providerRes.json();
        setProvider(providerData.provider);
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setServices(servicesData.services || []);

        if (serviceId) {
          const foundService = servicesData.services.find(
            (s) => s.id === parseInt(serviceId),
          );
          if (foundService) {
            setService(foundService);
            setSelectedService(serviceId);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching booking data:", error);
      setError("Failed to load booking information");
    } finally {
      setLoading(false);
    }
  };

  const handleServiceChange = (e) => {
    const serviceId = e.target.value;
    setSelectedService(serviceId);
    const foundService = services.find((s) => s.id === parseInt(serviceId));
    setService(foundService || null);
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");

      if (!user) {
        window.location.href = `/account/signin?callbackUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`;
        return;
      }

      if (!selectedService || !scheduledDate || !scheduledTime) {
        setError("Please fill in all required fields");
        return;
      }

      setSubmitting(true);

      try {
        const scheduledAt = new Date(
          `${scheduledDate}T${scheduledTime}`,
        ).toISOString();

        const response = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider_id: provider.id,
            service_id: parseInt(selectedService),
            scheduled_at: scheduledAt,
            amount: service.base_price,
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Booking failed: [${response.status}] ${response.statusText}`,
          );
        }

        const data = await response.json();
        // Redirect to payment page to complete the booking
        window.location.href = `/payment/${data.booking.id}`;
      } catch (err) {
        console.error(err);
        setError("Failed to create booking. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [user, selectedService, scheduledDate, scheduledTime, provider, service],
  );

  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-white font-['Inter'] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">
            Loading booking information...
          </p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-white font-['Inter'] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Provider not found
          </h1>
          <a
            href="/browse"
            className="bg-blue-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors inline-block mt-4"
          >
            Browse Providers
          </a>
        </div>
      </div>
    );
  }

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter']">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <a href="/" className="flex items-center gap-2 w-fit">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900 tracking-tight">
              Trusta
            </span>
          </a>
        </div>
      </header>

      {/* Page Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-2">
            Book a Service
          </h1>
          <p className="text-base text-gray-500">
            Schedule your service with {provider.full_name}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Provider Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                {provider.avatar_url ? (
                  <img
                    src={provider.avatar_url}
                    alt={provider.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-semibold text-gray-600">
                    {provider.full_name?.charAt(0) || "P"}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {provider.full_name}
                </h3>
                <p className="text-sm text-gray-500">{provider.location}</p>
              </div>
            </div>
          </div>

          {/* Service Selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label className="block text-sm font-semibold text-gray-900 mb-4">
              Select Service
            </label>
            {services.length === 0 ? (
              <p className="text-sm text-gray-500">No services available</p>
            ) : (
              <select
                value={selectedService}
                onChange={handleServiceChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="">Choose a service...</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} - ₦{Number(s.base_price).toLocaleString()}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label className="block text-sm font-semibold text-gray-900 mb-4">
              Schedule
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={minDate}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">
                  Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          {service && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Price Summary
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Service fee</span>
                  <span className="font-medium text-gray-900">
                    ₦{Number(service.base_price).toLocaleString()}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-gray-900">
                      Total
                    </span>
                    <span className="text-base font-semibold text-gray-900">
                      ₦{Number(service.base_price).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={
                submitting ||
                !selectedService ||
                !scheduledDate ||
                !scheduledTime
              }
              className="flex-1 bg-blue-600 text-white text-base font-medium px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Processing..." : "Confirm Booking"}
            </button>
            <a
              href={`/provider/${provider.id}`}
              className="bg-white border border-gray-200 text-gray-900 text-base font-medium px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
