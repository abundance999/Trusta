import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const result = await sql`
      SELECT 
        b.id,
        b.status,
        b.scheduled_at,
        b.amount,
        b.qr_token,
        b.proof_of_work_url,
        b.created_at,
        provider.full_name as provider_name,
        provider.location as provider_location,
        ps.title as service_title,
        ps.description as service_description
      FROM bookings b
      LEFT JOIN profiles provider ON b.provider_id = provider.id
      LEFT JOIN provider_services ps ON b.service_id = ps.id
      WHERE b.id = ${id}
    `;

    if (result.length === 0) {
      return Response.json({ error: "Booking not found" }, { status: 404 });
    }

    return Response.json({
      booking: result[0],
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    return Response.json({ error: "Failed to fetch booking" }, { status: 500 });
  }
}
