import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const bookingResult = await sql`
      SELECT b.*, provider.full_name as provider_name
      FROM bookings b
      LEFT JOIN profiles provider ON b.provider_id = provider.id
      WHERE b.id = ${id}
    `;

    if (bookingResult.length === 0) {
      return Response.json({ error: "Booking not found" }, { status: 404 });
    }

    const booking = bookingResult[0];

    if (booking.status !== "in_progress") {
      return Response.json(
        { error: "Only in-progress jobs can be completed" },
        { status: 400 },
      );
    }

    // Complete the booking and release payment
    await sql`
      UPDATE bookings
      SET status = 'completed',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;

    // Notify provider payment released
    await sql`
      INSERT INTO notifications (profile_id, booking_id, type, title, body)
      VALUES (
        ${booking.provider_id},
        ${id},
        'payment_released',
        'Payment Released!',
        ${`Great work! The customer has confirmed your job is complete. ₦${Number(booking.amount).toLocaleString()} has been released to your account.`}
      )
    `;

    return Response.json({
      message: "Job completed. Payment released to provider.",
      booking: { ...booking, status: "completed" },
    });
  } catch (error) {
    console.error("Error completing booking:", error);
    return Response.json(
      { error: "Failed to complete booking" },
      { status: 500 },
    );
  }
}
