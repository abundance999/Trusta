import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

const PAYMENT_ACCOUNTS = {
  opay: {
    name: "OPay",
    account_number: "8012345678",
    account_name: "Trusta Escrow Ltd",
    bank: "OPay Digital Services",
  },
  palmpay: {
    name: "PalmPay",
    account_number: "9034567890",
    account_name: "Trusta Escrow Ltd",
    bank: "PalmPay",
  },
  kuda: {
    name: "Kuda Bank",
    account_number: "2012345678",
    account_name: "Trusta Escrow Ltd",
    bank: "Kuda Microfinance Bank",
  },
  bank_transfer: {
    name: "Bank Transfer",
    account_number: "0123456789",
    account_name: "Trusta Escrow Ltd",
    bank: "GTBank",
    sort_code: "058152052",
  },
};

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { booking_id, payment_method } = body;

    if (!booking_id || !payment_method) {
      return Response.json(
        { error: "booking_id and payment_method are required" },
        { status: 400 },
      );
    }

    if (!PAYMENT_ACCOUNTS[payment_method]) {
      return Response.json(
        { error: "Invalid payment method" },
        { status: 400 },
      );
    }

    // Verify booking ownership
    const bookingResult = await sql`
      SELECT b.*, p.full_name as customer_name
      FROM bookings b
      LEFT JOIN profiles p ON b.customer_id = p.id
      WHERE b.id = ${booking_id}
    `;

    if (bookingResult.length === 0) {
      return Response.json({ error: "Booking not found" }, { status: 404 });
    }

    const booking = bookingResult[0];

    // Generate payment reference
    const reference = `TRU-PAY-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase()}`;

    // Update booking with payment method and reference
    await sql`
      UPDATE bookings
      SET payment_method = ${payment_method},
          payment_reference = ${reference},
          payment_status = 'pending'
      WHERE id = ${booking_id}
    `;

    const account = PAYMENT_ACCOUNTS[payment_method];

    return Response.json({
      reference,
      amount: booking.amount,
      payment_method,
      account,
      narration: `Trusta booking ${booking.qr_token}`,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error("Error initiating payment:", error);
    return Response.json(
      { error: "Failed to initiate payment" },
      { status: 500 },
    );
  }
}
