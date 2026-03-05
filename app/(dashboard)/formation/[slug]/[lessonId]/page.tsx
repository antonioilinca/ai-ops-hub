import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCourseBySlug, PLAN_ORDER } from "@/lib/formation-data";
import { getLessonContent } from "@/lib/formation-content";
import MarkCompleteButton from "../MarkCompleteButton";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const course = getCourseBySlug(slug);
  if (!course) notFound();

  const lesson = course.lessons.find((l) => l.id === lessonId);
  if (!lesson) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id, organizations(plan)")
    .eq("user_id", user.id)
    .single();
  if (!member) redirect("/onboarding");

  const org = member.organizations as unknown as { plan: string } | null;
  const userPlanLevel = PLAN_ORDER[org?.plan ?? "free"] ?? 0;
  const coursePlanLevel = PLAN_ORDER[course.plan] ?? 0;
  if (coursePlanLevel > userPlanLevel) redirect(`/formation/${slug}`);

  const { data: completions } = await supabase
    .from("course_completions")
    .select("lesson_id")
    .eq("user_id", user.id)
    .eq("course_slug", slug)
    .eq("lesson_id", lessonId);

  const isCompleted = (completions?.length ?? 0) > 0;

  const lessonIdx = course.lessons.findIndex((l) => l.id === lessonId);
  const prevLesson = lessonIdx > 0 ? course.lessons[lessonIdx - 1] : null;
  const nextLesson =
    lessonIdx < course.lessons.length - 1 ? course.lessons[lessonIdx + 1] : null;

  const content = getLessonContent(lessonId);

  const TYPE_ICON: Record<string, string> = {
    video: "🎬",
    lecture: "📖",
    exercise: "✏️",
  };
  const TYPE_LABEL: Record<string, string> = {
    video: "Vidéo",
    lecture: "Lecture",
    exercise: "Exercice",
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/formation" className="hover:text-foreground">
          Formation
        </Link>
        <span>›</span>
        <Link
          href={`/formation/${slug}`}
          className="hover:text-foreground"
        >
          {course.title}
        </Link>
        <span>›</span>
        <span className="text-foreground truncate max-w-[200px]">
          {lesson.title}
        </span>
      </div>

      {/* Header */}
      <div className={`${course.bgColor} border rounded-2xl p-6`}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{course.icon}</span>
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">
              Leçon {lessonIdx + 1}/{course.lessonsCount} ·{" "}
              {TYPE_ICON[lesson.type]} {TYPE_LABEL[lesson.type]} ·{" "}
              {lesson.duration}
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              {lesson.title}
            </h1>
          </div>
        </div>
        {/* Progress */}
        <div className="w-full bg-white/50 rounded-full h-2 mt-2">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all"
            style={{
              width: `${((lessonIdx + 1) / course.lessonsCount) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-card border border-border rounded-2xl p-8">
        <div
          className="prose prose-gray max-w-none prose-headings:font-bold prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3 prose-p:leading-relaxed prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-gray-900 prose-blockquote:border-indigo-300 prose-blockquote:bg-indigo-50 prose-blockquote:rounded-lg prose-blockquote:px-4 prose-blockquote:py-3 prose-blockquote:not-italic prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {/* Mark complete + Nav */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <MarkCompleteButton
            courseSlug={slug}
            lessonId={lessonId}
            isCompleted={isCompleted}
          />
          <div className="flex gap-3">
            {prevLesson && (
              <Link
                href={`/formation/${slug}/${prevLesson.id}`}
                className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                ← Précédent
              </Link>
            )}
            {nextLesson && (
              <Link
                href={`/formation/${slug}/${nextLesson.id}`}
                className="text-sm px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                Suivant →
              </Link>
            )}
            {!nextLesson && (
              <Link
                href={`/formation/${slug}`}
                className="text-sm px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                Terminer le cours ✓
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
