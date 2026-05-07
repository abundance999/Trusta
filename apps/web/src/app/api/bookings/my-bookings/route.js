import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile
    const profileResult = await sql`
      SELECT id, role FROM profiles 
      WHERE id = (SELECT id::uuid FROM auth_users WHERE id = ${session.user.id})
    `;

    if (profileResult.length === 0) {
      return Response.json({
        bookings: [],
      });
    }

    const profile = profileResult[0];
    let bookings = [];

    if (profile.role === "provider") {
      // Get bookings where user is the provider
      bookings = await sql`
        SELECT 
          b.id,
          b.status,
          b.scheduled_at,
          b.amount,
          b.created_at,
          customer.full_name as customer_name,
          ps.title as service_title
        FROM bookings b
        LEFT JOIN profiles customer ON b.customer_id = customer.id
        LEFT JOIN provider_services ps ON b.service_id = ps.id
        WHERE b.provider_id = ${profile.id}
        ORDER BY b.scheduled_at DESC
      `;
    } else {
      // Get bookings where user is the customer
      bookings = await sql`
        SELECT 
          b.id,
          b.status,
          b.scheduled_at,
          b.amount,
          b.created_at,
          provider.full_name as provider_name,
          ps.title as service_title
        FROM bookings b
        LEFT JOIN profiles provider ON b.provider_id = provider.id
        LEFT JOIN provider_services ps ON b.service_id = ps.id
        WHERE b.customer_id = ${profile.id}
        ORDER BY b.scheduled_at DESC
      `;
    }

    return Response.json({
      bookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return Response.json(
      { error: "Failed to fetch bookings", bookings: [] },
      { status: 500 },
    );
  }
}
