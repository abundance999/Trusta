import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const location = searchParams.get("location") || "";

    let query = `
      SELECT 
        p.id,
        p.full_name,
        p.location,
        p.bio,
        p.avatar_url,
        p.is_verified,
        p.rating,
        p.review_count,
        ps.title as service_title,
        ps.base_price,
        c.name as category_name
      FROM profiles p
      LEFT JOIN provider_services ps ON p.id = ps.provider_id
      LEFT JOIN categories c ON ps.category_id = c.id
      WHERE p.role = $1
    `;

    const params = ["provider"];
    let paramCount = 1;

    if (search) {
      paramCount++;
      query += ` AND (
        LOWER(p.full_name) LIKE LOWER($${paramCount}) OR 
        LOWER(ps.title) LIKE LOWER($${paramCount}) OR 
        LOWER(ps.description) LIKE LOWER($${paramCount})
      )`;
      params.push(`%${search}%`);
    }

    if (category) {
      paramCount++;
      query += ` AND LOWER(c.slug) = LOWER($${paramCount})`;
      params.push(category);
    }

    if (location) {
      paramCount++;
      query += ` AND LOWER(p.location) LIKE LOWER($${paramCount})`;
      params.push(`%${location}%`);
    }

    query += ` ORDER BY p.is_verified DESC, p.rating DESC NULLS LAST LIMIT 50`;

    const result = await sql(query, params);

    return Response.json({
      providers: result,
      count: result.length,
    });
  } catch (error) {
    console.error("Error fetching providers:", error);
    return Response.json(
      { error: "Failed to fetch providers", providers: [] },
      { status: 500 },
    );
  }
}
