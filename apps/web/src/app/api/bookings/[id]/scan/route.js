import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { qr_token } = body;

    if (!qr_token) {
      return Response.json({ error: "QR token is required" }, { status: 400 });
    }

    // Find the booking and verify the QR token
    const bookingResult = await sql`
      SELECT 
        b.*,
        provider.full_name as provider_name,
        customer.full_name as customer_name,
        ps.title as service_title
      FROM bookings b
      LEFT JOIN profiles provider ON b.provider_id = provider.id
      LEFT JOIN profiles customer ON b.customer_id = customer.id
      LEFT JOIN provider_services ps ON b.service_id = ps.id
      WHERE b.id = ${id} AND b.qr_token = ${qr_token}
    `;

    if (bookingResult.length === 0) {
      return Response.json(
        { error: "Invalid QR code or booking not found" },
        { status: 404 },
      );
    }

    const booking = bookingResult[0];

    if (booking.status === "in_progress") {
      return Response.json({
        message: "Job already in progress",
        booking,
      });
    }

    if (booking.status !== "confirmed") {
      return Response.json(
        {
          error: `Cannot start job. Booking status is '${booking.status}'. Payment must be confirmed first.`,
        },
        { status: 400 },
      );
    }

    // Verify the scanning user is the provider
    const providerProfile = await sql`
      SELECT p.id FROM profiles p
      INNER JOIN auth_users au ON p.id::text = au.id::text
      WHERE au.id = ${session.user.id} AND p.role = 'provider'
    `;

    if (providerProfile.length === 0) {
      return Response.json(
        { error: "Only verified providers can scan QR codes" },
        { status: 403 },
      );
    }

    // Update booking status to in_progress
    await sql`
      UPDATE bookings
      SET status = 'in_progress',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;

    // Notify customer
    await sql`
      INSERT INTO notifications (profile_id, booking_id, type, title, body)
      VALUES (
        ${booking.customer_id},
        ${id},
        'job_started',
        'Your Job Has Started',
        ${`${booking.provider_name} has scanned your QR code and started the job.`}
      )
    `;

    return Response.json({
      message: "QR code verified. Job started!",
      booking: { ...booking, status: "in_progress" },
    });
  } catch (error) {
    console.error("Error scanning QR:", error);
    return Response.json({ error: "Failed to scan QR code" }, { status: 500 });
  }
}
