"use client";

import { useState, useEffect, useRef } from "react";
import {
  Shield,
  Calendar,
  MapPin,
  QrCode,
  CheckCircle,
  Clock,
  Upload,
  Star,
  MessageSquare,
  AlertCircle,
  Image,
  CreditCard,
} from "lucide-react";
import useUser from "@/utils/useUser";

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none"
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              star <= (hovered || value)
                ? "text-amber-400 fill-amber-400"
                : "text-gray-200"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function BookingDetailsPage({ params }) {
  const { id } = params;
  const { data: user } = useUser();
  const [booking, setBooking] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Proof upload state
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [proofSuccess, setProofSuccess] = useState(false);
  const [proofError, setProofError] = useState(null);
  const fileInputRef = useRef(null);

  // Review state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  // Complete job state
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState(null);

  useEffect(() => {
    fetchAll();
  }, [id]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bookingRes, profileRes] = await Promise.all([
        fetch(`/api/bookings/${id}`),
        fetch("/api/profile"),
      ]);
      if (bookingRes.ok) {
        const data = await bookingRes.json();
        setBooking(data.booking);
      }
      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfile(data.profile);
      }
    } catch (err) {
      console.error("Error fetching booking:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProofFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setProofPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleProofUpload = async () => {
    if (!proofPreview) return;
    setUploadingProof(true);
    setProofError(null);
    try {
      const res = await fetch(`/api/bookings/${id}/proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proof_url: proofPreview }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setProofSuccess(true);
      fetchAll();
    } catch (err) {
      setProofError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploadingProof(false);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    setCompleteError(null);
    try {
      const res = await fetch(`/api/bookings/${id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchAll();
    } catch (err) {
      setCompleteError(err.message || "Failed to complete job");
    } finally {
      setCompleting(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setReviewError("Please select a rating.");
      return;
    }
    setSubmittingReview(true);
    setReviewError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: id, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReviewSuccess(true);
    } catch (err) {
      setReviewError(err.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-['Inter'] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Loading booking...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-white font-['Inter'] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Booking not found
          </h1>
          <a
            href="/dashboard"
            className="bg-blue-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors inline-block mt-4"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  const statusConfig = {
    pending: {
      label: "Pending",
      dotColor: "bg-orange-500",
      textColor: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
    confirmed: {
      label: "Confirmed",
      dotColor: "bg-blue-600",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    in_progress: {
      label: "In Progress",
      dotColor: "bg-blue-600",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    completed: {
      label: "Completed",
      dotColor: "bg-green-600",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    cancelled: {
      label: "Cancelled",
      dotColor: "bg-gray-400",
      textColor: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
    },
  };

  const status = statusConfig[booking.status] || statusConfig.pending;
  const isProvider = profile?.role === "provider";
  const isCustomer = !isProvider;
  const isInProgress = booking.status === "in_progress";
  const isConfirmed = booking.status === "confirmed";
  const isCompleted = booking.status === "completed";
  const isPending = booking.status === "pending";

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
          <div className="flex items-center gap-4">
            <a
              href={`/messages/${id}`}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Messages
            </a>
            <a
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Dashboard
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-6">
        {/* Payment CTA for pending bookings */}
        {isPending && isCustomer && booking.payment_status !== "paid" && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-900 mb-1">
                Payment Required
              </h3>
              <p className="text-sm text-amber-800 mb-3">
                Complete your payment to confirm this booking and get your QR
                code.
              </p>
              <a
                href={`/payment/${id}`}
                className="bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors inline-block"
              >
                Pay ₦{Number(booking.amount).toLocaleString()}
              </a>
            </div>
          </div>
        )}

        {/* Status Banner */}
        {isCompleted && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-green-900">
                Job Completed
              </h3>
              <p className="text-sm text-green-800">
                Payment has been released to the provider.
              </p>
            </div>
          </div>
        )}

        {isInProgress && isProvider && !booking.proof_of_work_url && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-900">
                Job In Progress
              </h3>
              <p className="text-sm text-blue-800">
                Upload proof of work when you're done to trigger customer
                confirmation.
              </p>
            </div>
          </div>
        )}

        {isInProgress && isCustomer && booking.proof_of_work_url && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-blue-900">
                  Proof Uploaded
                </h3>
                <p className="text-sm text-blue-800">
                  The provider has uploaded proof of work. Review it below and
                  confirm completion.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Booking Details Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
              Booking Details
            </h1>
            <div
              className={`${status.bgColor} ${status.borderColor} border rounded-full px-3 py-1 inline-flex items-center gap-1.5`}
            >
              <span
                className={`w-1.5 h-1.5 ${status.dotColor} rounded-full`}
              ></span>
              <span className={`text-xs font-medium ${status.textColor}`}>
                {status.label}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Provider
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-600">
                    {booking.provider_name?.charAt(0) || "P"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {booking.provider_name}
                  </p>
                  {booking.provider_location && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {booking.provider_location}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Service
              </h3>
              <p className="text-sm font-medium text-gray-900">
                {booking.service_title}
              </p>
              {booking.service_description && (
                <p className="text-sm text-gray-500 mt-1">
                  {booking.service_description}
                </p>
              )}
            </div>

            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Scheduled
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-900">
                <Calendar className="w-4 h-4 text-gray-400" />
                {new Date(booking.scheduled_at).toLocaleString("en-NG", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Amount
              </h3>
              <div className="flex items-center justify-between">
                <p className="text-xl font-semibold text-gray-900">
                  ₦{Number(booking.amount).toLocaleString()}
                </p>
                <div
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    booking.payment_status === "paid"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-gray-50 text-gray-600 border border-gray-200"
                  }`}
                >
                  {booking.payment_status === "paid" ? "In Escrow" : "Unpaid"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code — show for confirmed or in_progress to customer */}
        {(isConfirmed || isInProgress) && isCustomer && (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <QrCode className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Your QR Code
                </h3>
                <p className="text-xs text-gray-500">
                  Show this to the provider when they arrive
                </p>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(booking.qr_token)}&size=160x160&bgcolor=f9fafb&color=1d4ed8&margin=8`}
                alt="QR Code"
                className="mx-auto mb-4 rounded-lg"
                width={160}
                height={160}
              />
              <p className="text-sm font-mono font-semibold text-gray-800 bg-white border border-gray-200 rounded-lg px-4 py-2.5 inline-block">
                {booking.qr_token}
              </p>
              <p className="text-xs text-gray-400 mt-3">Booking ID: {id}</p>
            </div>
          </div>
        )}

        {/* Provider: Scan QR link */}
        {isProvider && isConfirmed && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <QrCode className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Ready to Start?
                </p>
                <p className="text-xs text-gray-500">
                  Scan the customer's QR code to begin the job
                </p>
              </div>
            </div>
            <a
              href="/provider/scan"
              className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Scan QR Code
            </a>
          </div>
        )}

        {/* Provider: Proof of Work Upload */}
        {isProvider && isInProgress && (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Upload className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Upload Proof of Work
                </h3>
                <p className="text-xs text-gray-500">
                  Photo or screenshot of the completed job
                </p>
              </div>
            </div>

            {booking.proof_of_work_url ? (
              <div className="text-center">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-800 font-medium">
                    Proof uploaded successfully. Awaiting customer confirmation.
                  </p>
                </div>
                <img
                  src={booking.proof_of_work_url}
                  alt="Proof of work"
                  className="max-h-48 mx-auto rounded-xl border border-gray-200 object-cover"
                />
              </div>
            ) : proofSuccess ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-800 font-medium">
                  Proof uploaded! Customer has been notified.
                </p>
              </div>
            ) : (
              <div>
                <div
                  className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-gray-300 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {proofPreview ? (
                    <img
                      src={proofPreview}
                      alt="Preview"
                      className="max-h-40 mx-auto rounded-lg object-cover"
                    />
                  ) : (
                    <div>
                      <Image className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-1">
                        Click to upload a photo
                      </p>
                      <p className="text-xs text-gray-400">
                        JPG, PNG up to 4MB
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {proofError && (
                  <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700">{proofError}</p>
                  </div>
                )}

                {proofFile && (
                  <button
                    onClick={handleProofUpload}
                    disabled={uploadingProof}
                    className="w-full mt-4 bg-purple-600 text-white text-sm font-medium py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {uploadingProof ? "Uploading..." : "Submit Proof of Work"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Customer: View Proof & Confirm Completion */}
        {isCustomer && isInProgress && booking.proof_of_work_url && (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Review Proof of Work
                </h3>
                <p className="text-xs text-gray-500">
                  Confirm completion to release payment to the provider
                </p>
              </div>
            </div>

            <img
              src={booking.proof_of_work_url}
              alt="Proof of work"
              className="w-full max-h-60 object-cover rounded-xl border border-gray-200 mb-5"
            />

            {completeError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{completeError}</p>
              </div>
            )}

            <button
              onClick={handleComplete}
              disabled={completing}
              className="w-full bg-green-600 text-white text-base font-medium py-3.5 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              {completing
                ? "Processing..."
                : "Confirm Job Complete & Release Payment"}
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">
              This will release ₦{Number(booking.amount).toLocaleString()} to
              the provider
            </p>
          </div>
        )}

        {/* Customer: Review Section (after completion) */}
        {isCustomer && isCompleted && (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Leave a Review
                </h3>
                <p className="text-xs text-gray-500">
                  Help others by rating your experience
                </p>
              </div>
            </div>

            {reviewSuccess ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-900">
                    Review Submitted!
                  </p>
                  <p className="text-xs text-green-700 mt-0.5">
                    Thank you for your feedback.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleReview} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    Rating
                  </label>
                  <StarRating value={rating} onChange={setRating} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                    Comment{" "}
                    <span className="font-normal text-gray-400">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    placeholder="How was your experience? What did they do well?"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>

                {reviewError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700">{reviewError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submittingReview || rating === 0}
                  className="w-full bg-amber-500 text-white text-sm font-medium py-3 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Proof of Work Display (completed) */}
        {isCompleted && booking.proof_of_work_url && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Image className="w-4 h-4 text-gray-400" />
              Proof of Work
            </h3>
            <img
              src={booking.proof_of_work_url}
              alt="Proof of completed work"
              className="w-full max-h-60 object-cover rounded-xl border border-gray-200"
            />
          </div>
        )}

        {/* Message Link */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Need to communicate?
              </p>
              <p className="text-xs text-gray-500">
                Message the {isProvider ? "customer" : "provider"} directly
              </p>
            </div>
          </div>
          <a
            href={`/messages/${id}`}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Open Chat
          </a>
        </div>

        {/* Back Actions */}
        <div className="flex items-center gap-4">
          <a
            href="/dashboard"
            className="flex-1 bg-blue-600 text-white text-base font-medium px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            Dashboard
          </a>
          <a
            href="/browse"
            className="flex-1 bg-white border border-gray-200 text-gray-900 text-base font-medium px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            Browse Services
          </a>
        </div>
      </div>
    </div>
  );
}
