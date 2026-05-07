import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { booking_id, rating, comment } = body;

    if (!booking_id || !rating) {
      return Response.json(
        { error: "booking_id and rating are required" },
        { status: 400 },
      );
    }

    if (rating < 1 || rating > 5) {
      return Response.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 },
      );
    }

    // Verify booking is completed
    const bookingResult = await sql`
      SELECT b.*, p.id as customer_profile_id
      FROM bookings b
      LEFT JOIN profiles p ON b.customer_id = p.id
      WHERE b.id = ${booking_id} AND b.status = 'completed'
    `;

    if (bookingResult.length === 0) {
      return Response.json(
        { error: "Booking not found or not completed" },
        { status: 404 },
      );
    }

    const booking = bookingResult[0];

    // Check if review already exists
    const existingReview = await sql`
      SELECT id FROM reviews WHERE booking_id = ${booking_id}
    `;

    if (existingReview.length > 0) {
      return Response.json(
        { error: "Review already submitted for this booking" },
        { status: 409 },
      );
    }

    // Get customer profile
    const customerResult = await sql`
      SELECT id FROM profiles WHERE id::text IN (
        SELECT id::text FROM auth_users WHERE id = ${session.user.id}
      )
    `;

    const customerId =
      customerResult.length > 0 ? customerResult[0].id : booking.customer_id;

    // Insert review
    await sql`
      INSERT INTO reviews (booking_id, customer_id, provider_id, rating, comment)
      VALUES (${booking_id}, ${customerId}, ${booking.provider_id}, ${rating}, ${comment || null})
    `;

    // Update provider's average rating
    const ratingStats = await sql`
      SELECT 
        COUNT(*) as review_count,
        AVG(rating)::numeric(3,2) as avg_rating
      FROM reviews
      WHERE provider_id = ${booking.provider_id}
    `;

    if (ratingStats.length > 0) {
      await sql`
        UPDATE profiles
        SET rating = ${ratingStats[0].avg_rating},
            review_count = ${ratingStats[0].review_count}
        WHERE id = ${booking.provider_id}
      `;
    }

    return Response.json({
      message: "Review submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    return Response.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
