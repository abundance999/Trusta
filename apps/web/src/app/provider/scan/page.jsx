"use client";

import { useState, useRef, useEffect } from "react";
import {
  Shield,
  QrCode,
  CheckCircle,
  AlertCircle,
  Search,
  Camera,
} from "lucide-react";
import useUser from "@/utils/useUser";

export default function QRScanPage() {
  const { data: user } = useUser();
  const [qrInput, setQrInput] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
    const saved =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("trusta_scans") || "[]")
        : [];
    setRecentScans(saved);
  }, []);

  const handleScan = async () => {
    if (!qrInput.trim() || !bookingId.trim()) {
      setError("Please enter both the booking ID and QR code.");
      return;
    }

    setScanning(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/bookings/${bookingId.trim()}/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qr_token: qrInput.trim().toUpperCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Scan failed");
      }

      setResult(data);

      // Save to recent scans
      const scan = {
        booking_id: bookingId.trim(),
        qr_token: qrInput.trim().toUpperCase(),
        service: data.booking?.service_title || "Service",
        customer: data.booking?.customer_name || "Customer",
        time: new Date().toISOString(),
      };

      const updated = [scan, ...recentScans.slice(0, 4)];
      setRecentScans(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem("trusta_scans", JSON.stringify(updated));
      }

      setQrInput("");
      setBookingId("");
    } catch (err) {
      setError(err.message || "Failed to verify QR code");
    } finally {
      setScanning(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white font-['Inter'] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">
            Sign in to scan QR codes
          </h1>
          <a
            href="/account/signin?callbackUrl=/provider/scan"
            className="bg-blue-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors inline-block"
          >
            Sign In
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
          <nav className="flex items-center gap-4">
            <a
              href="/analytics"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Analytics
            </a>
            <a
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Dashboard
            </a>
          </nav>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 rounded-full px-3 py-1.5 text-sm font-medium mb-4">
            <QrCode className="w-4 h-4" />
            Provider Tool
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-2">
            QR Code Scanner
          </h1>
          <p className="text-base text-gray-500">
            Enter the customer's booking ID and QR code to start the job.
          </p>
        </div>

        {/* Scanner Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
          {/* Visual QR Frame */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 bg-gray-50">
              <QrCode className="w-12 h-12 text-gray-300" />
              <p className="text-xs text-gray-400 text-center px-4">
                Enter code below
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                Booking ID
              </label>
              <input
                type="text"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="e.g. 550e8400-e29b-41d4-..."
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">
                Found on the customer's booking confirmation
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                QR Code
              </label>
              <input
                ref={inputRef}
                type="text"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleScan()}
                placeholder="e.g. TRU-1234567890-ABC123"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm font-mono text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent uppercase"
              />
              <p className="text-xs text-gray-400 mt-1">
                Shown on the customer's QR code screen
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-green-900">
                    {result.message}
                  </h3>
                  <p className="text-xs text-green-700">
                    Job is now in progress
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-green-200 p-3 space-y-1">
                {result.booking?.service_title && (
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold">Service:</span>{" "}
                    {result.booking.service_title}
                  </p>
                )}
                {result.booking?.customer_name && (
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold">Customer:</span>{" "}
                    {result.booking.customer_name}
                  </p>
                )}
                <p className="text-xs text-gray-600">
                  <span className="font-semibold">Amount:</span> ₦
                  {Number(result.booking?.amount || 0).toLocaleString()} (in
                  escrow)
                </p>
              </div>
              <div className="mt-3 flex gap-2">
                <a
                  href={`/booking/${result.booking?.id}`}
                  className="flex-1 bg-green-600 text-white text-xs font-medium py-2 rounded-lg hover:bg-green-700 transition-colors text-center block"
                >
                  View Booking
                </a>
                <button
                  onClick={() => {
                    setResult(null);
                    setError(null);
                    if (inputRef.current) inputRef.current.focus();
                  }}
                  className="flex-1 bg-white border border-green-200 text-green-700 text-xs font-medium py-2 rounded-lg hover:bg-green-50 transition-colors"
                >
                  Scan Another
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleScan}
            disabled={scanning || !qrInput.trim() || !bookingId.trim()}
            className="w-full mt-6 bg-blue-600 text-white text-base font-medium py-3.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            {scanning ? "Verifying..." : "Verify & Start Job"}
          </button>
        </div>

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Recent Scans
            </h3>
            <div className="space-y-3">
              {recentScans.map((scan, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {scan.service}
                    </p>
                    <p className="text-xs text-gray-500">
                      {scan.customer} ·{" "}
                      {new Date(scan.time).toLocaleTimeString("en-NG", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <a
                    href={`/booking/${scan.booking_id}`}
                    className="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            How to scan
          </h3>
          <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
            <li>Ask the customer to open their booking confirmation</li>
            <li>Copy the Booking ID from their screen</li>
            <li>Copy the QR code token (starts with TRU-)</li>
            <li>Paste both above and click "Verify & Start Job"</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
