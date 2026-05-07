import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import { upload } from "@/app/api/utils/upload";

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { proof_url, notes } = body;

    if (!proof_url) {
      return Response.json({ error: "proof_url is required" }, { status: 400 });
    }

    // Verify booking exists and user is the provider
    const bookingResult = await sql`
      SELECT b.*, p.id as provider_profile_id
      FROM bookings b
      LEFT JOIN profiles p ON b.provider_id = p.id
      LEFT JOIN auth_users au ON p.id::text = au.id::text
      WHERE b.id = ${id}
    `;

    if (bookingResult.length === 0) {
      return Response.json({ error: "Booking not found" }, { status: 404 });
    }

    const booking = bookingResult[0];

    if (booking.status !== "in_progress") {
      return Response.json(
        { error: "Job must be in progress to upload proof" },
        { status: 400 },
      );
    }

    // Upload the proof file
    let finalUrl = proof_url;
    if (proof_url.startsWith("data:")) {
      const uploadResult = await upload({ base64: proof_url });
      if (uploadResult.error) {
        return Response.json(
          { error: "Failed to upload proof image" },
          { status: 500 },
        );
      }
      finalUrl = uploadResult.url;
    }

    // Update booking with proof
    await sql`
      UPDATE bookings
      SET proof_of_work_url = ${finalUrl},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;

    // Notify customer
    await sql`
      INSERT INTO notifications (profile_id, booking_id, type, title, body)
      VALUES (
        ${booking.customer_id},
        ${id},
        'proof_uploaded',
        'Proof of Work Uploaded',
        'Your provider has uploaded proof of completed work. Please review and confirm.'
      )
    `;

    return Response.json({
      message: "Proof uploaded successfully",
      proof_url: finalUrl,
    });
  } catch (error) {
    console.error("Error uploading proof:", error);
    return Response.json({ error: "Failed to upload proof" }, { status: 500 });
  }
}
