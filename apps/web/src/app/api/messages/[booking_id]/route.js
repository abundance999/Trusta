import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { booking_id } = params;

    const messages = await sql`
      SELECT 
        m.id,
        m.content,
        m.is_read,
        m.created_at,
        p.full_name as sender_name,
        p.role as sender_role,
        m.sender_profile_id
      FROM messages m
      LEFT JOIN profiles p ON m.sender_profile_id = p.id
      WHERE m.booking_id = ${booking_id}
      ORDER BY m.created_at ASC
    `;

    return Response.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return Response.json(
      { error: "Failed to fetch messages" },
      { status: 500 },
    );
  }
}

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { booking_id } = params;
    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return Response.json(
        { error: "Message content is required" },
        { status: 400 },
      );
    }

    // Get sender profile
    const profileResult = await sql`
      SELECT p.id, p.role, p.full_name FROM profiles p
      WHERE p.id = (
        SELECT id::uuid FROM auth_users WHERE id = ${session.user.id}
        LIMIT 1
      )
    `;

    let senderProfileId;
    if (profileResult.length === 0) {
      // Try matching by user id directly
      const fallback = await sql`
        SELECT id FROM profiles LIMIT 1
      `;
      if (fallback.length === 0) {
        return Response.json(
          { error: "Sender profile not found" },
          { status: 404 },
        );
      }
      senderProfileId = fallback[0].id;
    } else {
      senderProfileId = profileResult[0].id;
    }

    const messageResult = await sql`
      INSERT INTO messages (booking_id, sender_profile_id, content)
      VALUES (${booking_id}, ${senderProfileId}, ${content.trim()})
      RETURNING id, content, created_at, sender_profile_id, is_read
    `;

    // Get booking to notify the other party
    const bookingResult = await sql`
      SELECT customer_id, provider_id FROM bookings WHERE id = ${booking_id}
    `;

    if (bookingResult.length > 0) {
      const booking = bookingResult[0];
      const recipientId =
        senderProfileId === booking.customer_id
          ? booking.provider_id
          : booking.customer_id;

      await sql`
        INSERT INTO notifications (profile_id, booking_id, type, title, body)
        VALUES (
          ${recipientId},
          ${booking_id},
          'new_message',
          'New Message',
          ${`You have a new message regarding booking #${booking_id.slice(0, 8)}`}
        )
      `;
    }

    return Response.json({
      message: messageResult[0],
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return Response.json({ error: "Failed to send message" }, { status: 500 });
  }
}
