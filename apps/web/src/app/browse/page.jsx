"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Star, Shield, Filter } from "lucide-react";

export default function BrowsePage() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");

  const categories = [
    { value: "", label: "All Categories" },
    { value: "plumbing", label: "Plumbing" },
    { value: "cleaning", label: "Cleaning" },
    { value: "photography", label: "Photography" },
    { value: "electrical", label: "Electrical" },
    { value: "carpentry", label: "Carpentry" },
    { value: "catering", label: "Catering" },
  ];

  useEffect(() => {
    fetchProviders();
  }, [search, category, location]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (location) params.set("location", location);

      const response = await fetch(`/api/providers?${params}`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch providers: [${response.status}] ${response.statusText}`,
        );
      }
      const data = await response.json();
      setProviders(data.providers || []);
    } catch (error) {
      console.error(error);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

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
            <a href="/browse" className="text-sm font-medium text-gray-900">
              Browse Services
            </a>
            <a
              href="/become-provider"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Become a Provider
            </a>
            <a
              href="/account/signin"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign In
            </a>
            <a
              href="/account/signup"
              className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Get Started
            </a>
          </nav>
        </div>
      </header>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-2">
            Find Verified Providers
          </h1>
          <p className="text-base text-gray-500">
            Browse trusted service providers across Port Harcourt
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or service..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter location..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-gray-500">Loading providers...</p>
            </div>
          </div>
        ) : providers.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No providers found
            </h3>
            <p className="text-sm text-gray-500">
              Try adjusting your filters or search terms
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <a
                key={provider.id}
                href={`/provider/${provider.id}`}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
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
                      <p className="text-xs text-gray-500">
                        {provider.service_title}
                      </p>
                    </div>
                  </div>
                  {provider.is_verified && (
                    <div className="bg-blue-50 rounded-full p-1.5">
                      <Shield className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {provider.bio || "No description available"}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-orange-600 fill-orange-600" />
                    <span className="text-sm font-medium text-gray-900">
                      {provider.rating
                        ? Number(provider.rating).toFixed(1)
                        : "0.0"}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({provider.review_count || 0})
                    </span>
                  </div>
                  {provider.location && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="w-3.5 h-3.5" />
                      {provider.location}
                    </div>
                  )}
                </div>

                {provider.base_price && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Starting from
                      </span>
                      <span className="text-base font-semibold text-gray-900">
                        ₦{Number(provider.base_price).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
