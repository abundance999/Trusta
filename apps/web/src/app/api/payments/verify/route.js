import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { booking_id, reference } = body;

    if (!booking_id || !reference) {
      return Response.json(
        { error: "booking_id and reference are required" },
        { status: 400 },
      );
    }

    const bookingResult = await sql`
      SELECT * FROM bookings WHERE id = ${booking_id} AND payment_reference = ${reference}
    `;

    if (bookingResult.length === 0) {
      return Response.json(
        { error: "Booking or reference not found" },
        { status: 404 },
      );
    }

    const booking = bookingResult[0];

    if (booking.payment_status === "paid") {
      return Response.json({ status: "already_paid", booking });
    }

    // Mark payment as paid and confirm booking
    await sql`
      UPDATE bookings
      SET payment_status = 'paid',
          status = 'confirmed',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${booking_id}
    `;

    // Create notification for provider
    await sql`
      INSERT INTO notifications (profile_id, booking_id, type, title, body)
      VALUES (
        ${booking.provider_id},
        ${booking_id},
        'booking_paid',
        'New Booking Confirmed',
        'A customer has paid and confirmed their booking. Check your dashboard.'
      )
    `;

    return Response.json({
      status: "paid",
      message: "Payment confirmed. Booking is now active.",
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return Response.json(
      { error: "Failed to verify payment" },
      { status: 500 },
    );
  }
}
