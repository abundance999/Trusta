import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get provider profile
    const profileResult = await sql`
      SELECT p.id, p.role, p.rating, p.review_count
      FROM profiles p
      WHERE p.id = (
        SELECT id::uuid FROM auth_users WHERE id = ${session.user.id} LIMIT 1
      ) AND p.role = 'provider'
    `;

    if (profileResult.length === 0) {
      return Response.json(
        { error: "Provider profile not found" },
        { status: 404 },
      );
    }

    const provider = profileResult[0];

    // Bookings summary
    const bookingStats = await sql`
      SELECT
        COUNT(*) FILTER (WHERE status != 'cancelled') as total_bookings,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_bookings,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_bookings,
        COUNT(*) FILTER (WHERE status = 'in_progress') as active_bookings,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_bookings,
        SUM(amount) FILTER (WHERE status = 'completed' AND payment_status = 'paid') as total_earnings,
        SUM(amount) FILTER (WHERE status IN ('confirmed', 'in_progress') AND payment_status = 'paid') as pending_payout
      FROM bookings
      WHERE provider_id = ${provider.id}
    `;

    // Monthly earnings (last 6 months)
    const monthlyEarnings = await sql`
      SELECT
        TO_CHAR(DATE_TRUNC('month', scheduled_at), 'Mon YY') as month,
        SUM(amount) as earnings,
        COUNT(*) as bookings
      FROM bookings
      WHERE provider_id = ${provider.id}
        AND status = 'completed'
        AND scheduled_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', scheduled_at)
      ORDER BY DATE_TRUNC('month', scheduled_at) ASC
    `;

    // Recent bookings
    const recentBookings = await sql`
      SELECT
        b.id,
        b.status,
        b.scheduled_at,
        b.amount,
        b.payment_status,
        c.full_name as customer_name,
        ps.title as service_title
      FROM bookings b
      LEFT JOIN profiles c ON b.customer_id = c.id
      LEFT JOIN provider_services ps ON b.service_id = ps.id
      WHERE b.provider_id = ${provider.id}
      ORDER BY b.created_at DESC
      LIMIT 10
    `;

    // Top services
    const topServices = await sql`
      SELECT
        ps.title,
        COUNT(b.id) as booking_count,
        SUM(b.amount) FILTER (WHERE b.status = 'completed') as total_revenue
      FROM bookings b
      LEFT JOIN provider_services ps ON b.service_id = ps.id
      WHERE b.provider_id = ${provider.id}
      GROUP BY ps.title
      ORDER BY booking_count DESC
      LIMIT 5
    `;

    // Recent reviews
    const recentReviews = await sql`
      SELECT
        r.rating,
        r.comment,
        r.created_at,
        c.full_name as customer_name
      FROM reviews r
      LEFT JOIN profiles c ON r.customer_id = c.id
      WHERE r.provider_id = ${provider.id}
      ORDER BY r.created_at DESC
      LIMIT 5
    `;

    const stats = bookingStats[0] || {};
    const completionRate =
      stats.total_bookings > 0
        ? Math.round((stats.completed_bookings / stats.total_bookings) * 100)
        : 0;

    return Response.json({
      overview: {
        total_bookings: parseInt(stats.total_bookings || 0),
        completed_bookings: parseInt(stats.completed_bookings || 0),
        pending_bookings: parseInt(stats.pending_bookings || 0),
        active_bookings: parseInt(stats.active_bookings || 0),
        cancelled_bookings: parseInt(stats.cancelled_bookings || 0),
        total_earnings: parseFloat(stats.total_earnings || 0),
        pending_payout: parseFloat(stats.pending_payout || 0),
        completion_rate: completionRate,
        rating: parseFloat(provider.rating || 0),
        review_count: parseInt(provider.review_count || 0),
      },
      monthly_earnings: monthlyEarnings,
      recent_bookings: recentBookings,
      top_services: topServices,
      recent_reviews: recentReviews,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return Response.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
