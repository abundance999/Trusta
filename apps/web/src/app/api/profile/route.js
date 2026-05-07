import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await sql`
      SELECT 
        id,
        full_name,
        role,
        location,
        bio,
        avatar_url,
        is_verified,
        rating,
        review_count
      FROM profiles
      WHERE id = (SELECT id::uuid FROM auth_users WHERE id = ${session.user.id})
    `;

    if (result.length === 0) {
      return Response.json({
        profile: null,
      });
    }

    return Response.json({
      profile: result[0],
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return Response.json(
      { error: "Failed to fetch profile", profile: null },
      { status: 500 },
    );
  }
}
