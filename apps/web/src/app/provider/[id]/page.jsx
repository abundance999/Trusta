"use client";

import { useState, useEffect } from "react";
import { Shield, Star, MapPin, Calendar, DollarSign } from "lucide-react";

export default function ProviderProfilePage({ params }) {
  const { id } = params;
  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviderData();
  }, [id]);

  const fetchProviderData = async () => {
    setLoading(true);
    try {
      const [providerRes, servicesRes, reviewsRes] = await Promise.all([
        fetch(`/api/providers/${id}`),
        fetch(`/api/providers/${id}/services`),
        fetch(`/api/providers/${id}/reviews`),
      ]);

      if (providerRes.ok) {
        const providerData = await providerRes.json();
        setProvider(providerData.provider);
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setServices(servicesData.services || []);
      }

      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData.reviews || []);
      }
    } catch (error) {
      console.error("Error fetching provider data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-['Inter'] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Loading provider...</p>
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
          <p className="text-sm text-gray-500 mb-6">
            The provider you're looking for doesn't exist
          </p>
          <a
            href="/browse"
            className="bg-blue-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors inline-block"
          >
            Browse Providers
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-['Inter']">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900 tracking-tight">
                Trusta
              </span>
            </a>
          </div>
          <nav className="flex items-center gap-6">
            <a
              href="/browse"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Browse Services
            </a>
            <a
              href="/account/signin"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign In
            </a>
          </nav>
        </div>
      </header>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Provider Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                  {provider.avatar_url ? (
                    <img
                      src={provider.avatar_url}
                      alt={provider.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-semibold text-gray-600">
                      {provider.full_name?.charAt(0) || "P"}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                      {provider.full_name}
                    </h1>
                    {provider.is_verified && (
                      <div className="bg-blue-50 rounded-full px-3 py-1 inline-flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-xs font-medium text-blue-600">
                          Verified
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-orange-600 fill-orange-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {provider.rating
                          ? Number(provider.rating).toFixed(1)
                          : "0.0"}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({provider.review_count || 0} reviews)
                      </span>
                    </div>
                    {provider.location && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" />
                        {provider.location}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {provider.bio || "No bio provided"}
                  </p>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Services Offered
              </h2>
              {services.length === 0 ? (
                <p className="text-sm text-gray-500">No services listed</p>
              ) : (
                <div className="space-y-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-base font-semibold text-gray-900">
                            {service.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {service.description}
                          </p>
                        </div>
                        {service.base_price && (
                          <span className="text-base font-semibold text-gray-900 whitespace-nowrap ml-4">
                            ₦{Number(service.base_price).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="mt-4">
                        <a
                          href={`/book?provider=${provider.id}&service=${service.id}`}
                          className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                        >
                          Book Now
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Reviews
              </h2>
              {reviews.length === 0 ? (
                <p className="text-sm text-gray-500">No reviews yet</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-gray-200 pb-6 last:border-0 last:pb-0"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {review.customer_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(review.created_at).toLocaleDateString(
                              "en-NG",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "text-orange-600 fill-orange-600"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <a
                  href={`/book?provider=${provider.id}`}
                  className="w-full bg-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  <Calendar className="w-4 h-4" />
                  Book Service
                </a>
                <a
                  href="/browse"
                  className="w-full bg-white border border-gray-200 text-gray-900 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  Browse More Providers
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
