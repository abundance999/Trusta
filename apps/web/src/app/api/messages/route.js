import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's profile
    const profileResult = await sql`
      SELECT id, role FROM profiles
      WHERE id = (
        SELECT id::uuid FROM auth_users WHERE id = ${session.user.id} LIMIT 1
      )
    `;

    if (profileResult.length === 0) {
      return Response.json({ threads: [] });
    }

    const profile = profileResult[0];

    // Get all booking threads this user is part of
    const threads = await sql`
      SELECT
        b.id as booking_id,
        b.status,
        b.scheduled_at,
        b.amount,
        CASE WHEN b.customer_id = ${profile.id} THEN provider.full_name
             ELSE customer.full_name END as other_party_name,
        CASE WHEN b.customer_id = ${profile.id} THEN provider.role
             ELSE customer.role END as other_party_role,
        ps.title as service_title,
        (SELECT content FROM messages WHERE booking_id = b.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE booking_id = b.id ORDER BY created_at DESC LIMIT 1) as last_message_at,
        (SELECT COUNT(*) FROM messages WHERE booking_id = b.id AND is_read = false AND sender_profile_id != ${profile.id}) as unread_count
      FROM bookings b
      LEFT JOIN profiles provider ON b.provider_id = provider.id
      LEFT JOIN profiles customer ON b.customer_id = customer.id
      LEFT JOIN provider_services ps ON b.service_id = ps.id
      WHERE b.customer_id = ${profile.id} OR b.provider_id = ${profile.id}
      HAVING (SELECT COUNT(*) FROM messages WHERE booking_id = b.id) > 0
        OR b.status IN ('confirmed', 'in_progress', 'completed')
      GROUP BY b.id, b.status, b.scheduled_at, b.amount, provider.full_name, customer.full_name, provider.role, customer.role, ps.title
      ORDER BY last_message_at DESC NULLS LAST, b.created_at DESC
    `;

    return Response.json({ threads, profile_id: profile.id });
  } catch (error) {
    console.error("Error fetching message threads:", error);
    return Response.json(
      { error: "Failed to fetch messages" },
      { status: 500 },
    );
  }
}
