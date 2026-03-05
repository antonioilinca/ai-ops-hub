import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getCourseBySlug, PLAN_ORDER } from "@/lib/formation-data";
import Link from "next/link";
import MarkCompleteButton from "./MarkCompleteButton";

const TYPE_ICON: Record<string, string> = {
  video:    "🎬",
  lecture:  "📖",
  exercise: "✏️",
};
const TYPE_LABEL: Record<string, string> = {
  video:    "Vidéo",
  lecture:  "Lecture",
  exercise: "Exercice",
};
const LEVEL_COLOR: Record<string, string> = {
  "Débutant":      "bg-green-100 text-green-700",
  "Intermédiaire": "bg-yellow-100 text-yellow-700",
  "Avancé":        "bg-red-100 text-red-700",
};

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id, organizations(plan)")
    .eq("user_id", user.id)
    .single();
  if (!member) redirect("/onboarding");

  const org = member.organizations as unknown as { plan: string } | null;
  const userPlanLevel  = PLAN_ORDER[org?.plan ?? "free"] ?? 0;
  const coursePlanLevel = PLAN_ORDER[course.plan] ?? 0;
  const isLocked = coursePlanLevel > userPlanLevel;

  // Fetch lesson completions for this course
  const { data: completions } = await supabase
    .from("course_completions")
    .select("lesson_id, course_slug")
    .eq("user_id", user.id)
    .eq("course_slug", slug);

  const completedLessonIds = new Set(
    completions?.filter((c) => c.lesson_id).map((c) => c.lesson_id) ?? []
  );
  const isCourseCompleted = completions?.some((c) => !c.lesson_id) ?? false;

  return (
    <div className="max-w-3xl space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/formation" className="hover:text-foreground">Formation</Link>
        <span>›</span>
        <span className="text-foreground">{course.title}</span>
      </div>

      {/* Hero du cours */}
      <div className={`${course.bgColor} border rounded-2xl p-8`}>
        <div className="flex items-start gap-4">
          <span className="text-5xl">{course.icon}</span>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${LEVEL_COLOR[course.level]}`}>{course.level}</span>
              <span className="text-xs text-muted-foreground">{course.duration} · {course.lessonsCount} leçons</span>
              <span className="text-xs bg-white/60 px-2.5 py-1 rounded-full text-gray-600">{course.category}</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-1">{course.title}</h1>
            <p className="text-gray-600">{course.subtitle}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {course.tags.map((tag) => (
                <span key={tag} className="text-xs bg-white/70 px-2 py-0.5 rounded-full text-gray-500">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Locked state */}
      {isLocked && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <div className="text-5xl mb-3">🔒</div>
          <h2 className="font-bold text-xl mb-2">Ce cours nécessite le plan {course.plan === "starter" ? "Starter" : "Team"}</h2>
          <p className="text-gray-500 mb-5">
            {course.plan === "starter"
              ? "Passez au plan Starter (29€/mois) pour accéder à ce cours et tous les workflows avancés."
              : "Passez au plan Team (79€/mois) pour débloquer toutes les formations et fonctionnalités avancées."
            }
          </p>
          <Link
            href="/settings/billing"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Voir les plans →
          </Link>
        </div>
      )}

      {/* Description */}
      {!isLocked && (
        <>
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-bold text-lg mb-3">À propos de ce cours</h2>
            <p className="text-gray-600 leading-relaxed">{course.description}</p>
          </div>

          {/* Ce que vous allez apprendre */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-bold text-lg mb-4">Ce que vous allez apprendre</h2>
            <ul className="space-y-2.5">
              {course.outcomes.map((outcome, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-indigo-500 font-bold mt-0.5 shrink-0">✓</span>
                  <span className="text-sm text-gray-700">{outcome}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Programme */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-lg">Programme</h2>
              <span className="text-sm text-muted-foreground">{course.lessonsCount} leçons · {course.duration}</span>
            </div>
            <div className="divide-y divide-border">
              {course.lessons.map((lesson, idx) => (
                <Link key={lesson.id} href={`/formation/${slug}/${lesson.id}`} className="px-6 py-4 flex items-center gap-4 hover:bg-muted/30 transition-colors group cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm group-hover:text-indigo-600 transition-colors">{lesson.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                      <span>{TYPE_ICON[lesson.type]} {TYPE_LABEL[lesson.type]}</span>
                      <span>·</span>
                      <span>{lesson.duration}</span>
                    </div>
                  </div>
                  <MarkCompleteButton
                    courseSlug={slug}
                    lessonId={lesson.id}
                    isCompleted={completedLessonIds.has(lesson.id)}
                  />
                  <span className="text-muted-foreground group-hover:text-indigo-500 transition-colors">→</span>
                </Link>
              ))}
            </div>
            <div className="px-6 py-5 border-t border-border bg-indigo-50 flex items-center justify-center">
              <MarkCompleteButton
                courseSlug={slug}
                isCompleted={isCourseCompleted}
                label="Cours terminé ✓"
              />
              {!isCourseCompleted && (
                <span className="text-xs text-muted-foreground ml-3">
                  {completedLessonIds.size}/{course.lessonsCount} leçons terminées
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
