import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * POST /api/formation/complete
 * Body: { courseSlug: string, lessonId?: string }
 *
 * Marks a course (or specific lesson) as completed for the current user.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const { courseSlug, lessonId } = body as {
    courseSlug?: string;
    lessonId?: string;
  };

  if (!courseSlug) {
    return NextResponse.json(
      { error: "courseSlug est requis" },
      { status: 400 }
    );
  }

  // Get user's org
  const { data: member } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  if (!member) {
    return NextResponse.json({ error: "Aucune organisation" }, { status: 403 });
  }

  // Use a sentinel value instead of NULL to avoid Postgres NULL-uniqueness issue
  // (NULL != NULL in unique constraints, which would create duplicate rows)
  const safeLessonId = lessonId ?? "__course__";

  const { error } = await supabase.from("course_completions").upsert(
    {
      user_id: user.id,
      org_id: member.org_id,
      course_slug: courseSlug,
      lesson_id: safeLessonId,
    },
    { onConflict: "user_id,course_slug,lesson_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
