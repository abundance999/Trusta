import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { provider_id, service_id, scheduled_at, amount } = body;

    if (!provider_id || !service_id || !scheduled_at || !amount) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get customer profile ID
    const customerResult = await sql`
      SELECT id FROM profiles WHERE id IN (
        SELECT id::uuid FROM auth_users WHERE id = ${session.user.id}
      ) AND role = 'customer'
    `;

    let customerId;
    if (customerResult.length === 0) {
      // Create customer profile if it doesn't exist
      const newCustomerResult = await sql`
        INSERT INTO profiles (id, role, full_name)
        VALUES (
          (SELECT id::uuid FROM auth_users WHERE id = ${session.user.id}),
          'customer',
          ${session.user.name || "Customer"}
        )
        RETURNING id
      `;
      customerId = newCustomerResult[0].id;
    } else {
      customerId = customerResult[0].id;
    }

    // Generate QR token
    const qrToken = `TRU-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Create booking
    const bookingResult = await sql`
      INSERT INTO bookings (
        customer_id,
        provider_id,
        service_id,
        scheduled_at,
        amount,
        qr_token,
        status
      )
      VALUES (
        ${customerId},
        ${provider_id},
        ${service_id},
        ${scheduled_at},
        ${amount},
        ${qrToken},
        'pending'
      )
      RETURNING id, customer_id, provider_id, service_id, scheduled_at, amount, qr_token, status, created_at
    `;

    return Response.json({
      booking: bookingResult[0],
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return Response.json(
      { error: "Failed to create booking" },
      { status: 500 },
    );
  }
}
