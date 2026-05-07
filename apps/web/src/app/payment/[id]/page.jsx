"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  CheckCircle,
  Copy,
  AlertCircle,
  ArrowLeft,
  Clock,
} from "lucide-react";
import useUser from "@/utils/useUser";

const PAYMENT_METHODS = [
  {
    id: "opay",
    name: "OPay",
    logo: "🟢",
    description: "Pay via OPay wallet or USSD",
    color: "green",
  },
  {
    id: "palmpay",
    name: "PalmPay",
    logo: "🔵",
    description: "Pay via PalmPay app or transfer",
    color: "blue",
  },
  {
    id: "kuda",
    name: "Kuda Bank",
    logo: "🟣",
    description: "Transfer from Kuda account",
    color: "purple",
  },
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    logo: "🏦",
    description: "Transfer from any Nigerian bank",
    color: "gray",
  },
];

export default function PaymentPage({ params }) {
  const { id } = params;
  const { data: user } = useUser();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [initiating, setInitiating] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);
  const [step, setStep] = useState("select"); // select | details | confirm

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/bookings/${id}`);
      if (res.ok) {
        const data = await res.json();
        setBooking(data.booking);
        if (data.booking.payment_status === "paid") {
          setVerified(true);
          setStep("confirm");
        }
      }
    } catch (err) {
      console.error("Error fetching booking:", err);
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = async () => {
    if (!selectedMethod) return;
    setInitiating(true);
    setError(null);
    try {
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: id,
          payment_method: selectedMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPaymentDetails(data);
      setStep("details");
    } catch (err) {
      setError(err.message || "Failed to initiate payment");
    } finally {
      setInitiating(false);
    }
  };

  const verifyPayment = async () => {
    setVerifying(true);
    setError(null);
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: id,
          reference: paymentDetails.reference,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setVerified(true);
      setStep("confirm");
    } catch (err) {
      setError(
        err.message ||
          "Could not verify. Please allow a few minutes after payment.",
      );
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-['Inter'] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Loading payment...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-white font-['Inter'] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">
            Booking not found
          </h1>
          <a
            href="/dashboard"
            className="bg-blue-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors inline-block"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

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
          <a
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </a>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Booking Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Booking Summary
          </h2>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                {booking.service_title}
              </h3>
              <p className="text-sm text-gray-500">
                Provider: {booking.provider_name}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(booking.scheduled_at).toLocaleString("en-NG", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold text-gray-900">
                ₦{Number(booking.amount).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">Held in escrow</p>
            </div>
          </div>
        </div>

        {/* Step: Select Payment Method */}
        {step === "select" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Choose Payment Method
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              Your payment is held securely in escrow until the job is complete.
            </p>

            <div className="space-y-3 mb-6">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    selectedMethod === method.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-2xl">{method.logo}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {method.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {method.description}
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedMethod === method.id
                        ? "border-blue-600"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedMethod === method.id && (
                      <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              onClick={initiatePayment}
              disabled={!selectedMethod || initiating}
              className="w-full bg-blue-600 text-white text-base font-medium py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              {initiating
                ? "Processing..."
                : `Pay ₦${Number(booking.amount).toLocaleString()}`}
            </button>
          </div>
        )}

        {/* Step: Payment Details */}
        {step === "details" && paymentDetails && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Complete Your Payment
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              Transfer the exact amount to the account below, then click "I've
              Paid".
            </p>

            <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 mb-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Bank</span>
                <span className="text-sm font-semibold text-gray-900">
                  {paymentDetails.account.bank}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Account Number</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900 font-mono">
                    {paymentDetails.account.account_number}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        paymentDetails.account.account_number,
                        "account",
                      )
                    }
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    {copied === "account" ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Account Name</span>
                <span className="text-sm font-semibold text-gray-900">
                  {paymentDetails.account.account_name}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">Amount</span>
                <span className="text-lg font-semibold text-gray-900">
                  ₦{Number(paymentDetails.amount).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Narration</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-medium text-gray-900">
                    {paymentDetails.narration}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(paymentDetails.narration, "narration")
                    }
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    {copied === "narration" ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2 mb-6">
              <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800">
                Transfer must be completed within 30 minutes. Always include the
                narration code.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep("select")}
                className="flex-1 bg-white border border-gray-200 text-gray-700 text-sm font-medium py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Change Method
              </button>
              <button
                onClick={verifyPayment}
                disabled={verifying}
                className="flex-2 flex-grow bg-blue-600 text-white text-sm font-medium py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifying ? "Verifying..." : "I've Paid"}
              </button>
            </div>
          </div>
        )}

        {/* Step: Confirmed */}
        {step === "confirm" && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Payment Confirmed!
            </h2>
            <p className="text-sm text-gray-500 mb-8">
              Your payment is safely in escrow. It will be released to the
              provider after you confirm job completion.
            </p>
            <div className="flex gap-3">
              <a
                href={`/booking/${id}`}
                className="flex-1 bg-blue-600 text-white text-sm font-medium py-3 rounded-lg hover:bg-blue-700 transition-colors text-center block"
              >
                View Booking & QR Code
              </a>
              <a
                href="/dashboard"
                className="flex-1 bg-white border border-gray-200 text-gray-700 text-sm font-medium py-3 rounded-lg hover:bg-gray-50 transition-colors text-center block"
              >
                Dashboard
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
