import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const result = await sql`
      SELECT 
        id,
        full_name,
        location,
        bio,
        avatar_url,
        is_verified,
        rating,
        review_count,
        created_at
      FROM profiles
      WHERE id = ${id} AND role = 'provider'
    `;

    if (result.length === 0) {
      return Response.json({ error: "Provider not found" }, { status: 404 });
    }

    return Response.json({
      provider: result[0],
    });
  } catch (error) {
    console.error("Error fetching provider:", error);
    return Response.json(
      { error: "Failed to fetch provider" },
      { status: 500 },
    );
  }
}
