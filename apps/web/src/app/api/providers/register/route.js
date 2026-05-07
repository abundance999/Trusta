import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      full_name,
      location,
      bio,
      service_title,
      service_description,
      base_price,
      category,
    } = body;

    if (
      !full_name ||
      !location ||
      !bio ||
      !service_title ||
      !service_description ||
      !base_price ||
      !category
    ) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if user already has a provider profile
    const existingProfile = await sql`
      SELECT id FROM profiles 
      WHERE id = (SELECT id::uuid FROM auth_users WHERE id = ${session.user.id})
      AND role = 'provider'
    `;

    if (existingProfile.length > 0) {
      return Response.json(
        { error: "Provider profile already exists" },
        { status: 400 },
      );
    }

    // Get or create category
    const categoryResult = await sql`
      INSERT INTO categories (name, slug)
      VALUES (${category.charAt(0).toUpperCase() + category.slice(1)}, ${category})
      ON CONFLICT (slug) DO UPDATE SET slug = ${category}
      RETURNING id
    `;
    const categoryId = categoryResult[0].id;

    // Create or update provider profile
    const profileResult = await sql`
      INSERT INTO profiles (id, role, full_name, location, bio)
      VALUES (
        (SELECT id::uuid FROM auth_users WHERE id = ${session.user.id}),
        'provider',
        ${full_name},
        ${location},
        ${bio}
      )
      ON CONFLICT (id) DO UPDATE SET
        role = 'provider',
        full_name = ${full_name},
        location = ${location},
        bio = ${bio}
      RETURNING id
    `;

    const providerId = profileResult[0].id;

    // Create service
    await sql`
      INSERT INTO provider_services (provider_id, category_id, title, description, base_price)
      VALUES (${providerId}, ${categoryId}, ${service_title}, ${service_description}, ${base_price})
    `;

    return Response.json({
      success: true,
      provider_id: providerId,
    });
  } catch (error) {
    console.error("Error registering provider:", error);
    return Response.json(
      { error: "Failed to register provider" },
      { status: 500 },
    );
  }
}
