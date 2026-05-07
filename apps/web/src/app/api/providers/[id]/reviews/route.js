import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const result = await sql`
      SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        p.full_name as customer_name
      FROM reviews r
      LEFT JOIN profiles p ON r.customer_id = p.id
      WHERE r.provider_id = ${id}
      ORDER BY r.created_at DESC
      LIMIT 20
    `;

    return Response.json({
      reviews: result,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return Response.json(
      { error: "Failed to fetch reviews", reviews: [] },
      { status: 500 },
    );
  }
}
