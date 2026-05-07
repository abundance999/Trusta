import { Search, CheckCircle, QrCode, Shield, Star } from "lucide-react";

export default function LandingPage() {
  const categories = [
    { name: "Plumbing", icon: "🔧", count: 24 },
    { name: "Cleaning", icon: "🧹", count: 31 },
    { name: "Photography", icon: "📸", count: 18 },
    { name: "Electrical", icon: "⚡", count: 15 },
    { name: "Carpentry", icon: "🪚", count: 12 },
    { name: "Catering", icon: "🍽️", count: 22 },
  ];

  const steps = [
    {
      number: "01",
      title: "Search & Book",
      description:
        "Find verified providers by service or location. Book a time slot that works for you.",
    },
    {
      number: "02",
      title: "Pay Securely",
      description:
        "Payment is held in escrow. Your money stays safe until the job is confirmed complete.",
    },
    {
      number: "03",
      title: "QR Validation",
      description:
        "Provider scans your QR code to start the job. No code, no start.",
    },
    {
      number: "04",
      title: "Confirm & Release",
      description:
        "Review proof of work. Confirm completion. Payment is released instantly.",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-['Inter']">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900 tracking-tight">
              Trusta
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <a
              href="/browse"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
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

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 rounded-full px-3 py-1.5 text-sm font-medium mb-6">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
            Nigeria-first
          </div>
          <h1 className="text-5xl font-semibold text-gray-900 tracking-tight leading-tight mb-6">
            Verified Service Marketplace
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Hire, pay, and verify local workers in one seamless flow. No
            guesswork. No stories. Just verified work, backed by proof.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="/browse"
              className="bg-blue-600 text-white text-base font-medium px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Find a Provider
            </a>
            <a
              href="/become-provider"
              className="bg-white border border-gray-200 text-gray-900 text-base font-medium px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              List Your Services
            </a>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 tracking-tight mb-3">
              Browse by Category
            </h2>
            <p className="text-base text-gray-500">
              Find verified providers across Port Harcourt
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <a
                key={category.name}
                href={`/browse?category=${category.name.toLowerCase()}`}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 transition-colors group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{category.icon}</span>
                  <span className="bg-white border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-700">
                    {category.count} providers
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500">View all providers →</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 tracking-tight mb-3">
              How Trusta Works
            </h2>
            <p className="text-base text-gray-500">
              From booking to payment, we handle the full loop
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div
                key={step.number}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="text-4xl font-semibold text-gray-200 mb-4">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-xl border border-gray-200 p-12">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 rounded-full px-3 py-1.5 text-sm font-medium mb-6">
                <Shield className="w-4 h-4" />
                Trust Layer
              </div>
              <h2 className="text-3xl font-semibold text-gray-900 tracking-tight mb-4">
                Built on Accountability
              </h2>
              <p className="text-base text-gray-600 mb-8 leading-relaxed">
                Every provider is verified. Every payment is secured. Every job
                is validated with proof of work. We don't just connect people—we
                enforce accountability.
              </p>
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <div className="text-3xl font-semibold text-gray-900 mb-1">
                    100%
                  </div>
                  <div className="text-sm text-gray-500">
                    Verified Providers
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-semibold text-gray-900 mb-1">
                    85%
                  </div>
                  <div className="text-sm text-gray-500">Completion Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-semibold text-gray-900 mb-1">
                    4.2+
                  </div>
                  <div className="text-sm text-gray-500">Average Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-blue-600 rounded-xl p-12 text-center">
            <h2 className="text-3xl font-semibold text-white tracking-tight mb-4">
              Ready to get started?
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              Join thousands of customers and providers building trust in
              Nigeria's service economy.
            </p>
            <div className="flex items-center justify-center gap-4">
              <a
                href="/browse"
                className="bg-white text-blue-600 text-base font-medium px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600"
              >
                Find a Provider
              </a>
              <a
                href="/become-provider"
                className="bg-blue-700 text-white text-base font-medium px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors border border-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600"
              >
                Become a Provider
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  Trusta
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Verified service marketplace for Nigeria
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">
                For Customers
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/browse"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Browse Services
                  </a>
                </li>
                <li>
                  <a
                    href="/how-it-works"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="/trust-safety"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Trust & Safety
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">
                For Providers
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/become-provider"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Become a Provider
                  </a>
                </li>
                <li>
                  <a
                    href="/pricing"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="/verification"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Verification
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">
                Company
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/about"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="/terms"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8">
            <p className="text-sm text-gray-500 text-center">
              © 2026 Trusta. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
