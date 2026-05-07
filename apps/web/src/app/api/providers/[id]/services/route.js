import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const result = await sql`
      SELECT 
        ps.id,
        ps.title,
        ps.description,
        ps.base_price,
        c.name as category_name,
        c.slug as category_slug
      FROM provider_services ps
      LEFT JOIN categories c ON ps.category_id = c.id
      WHERE ps.provider_id = ${id}
      ORDER BY ps.created_at DESC
    `;

    return Response.json({
      services: result,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return Response.json(
      { error: "Failed to fetch services", services: [] },
      { status: 500 },
    );
  }
}
