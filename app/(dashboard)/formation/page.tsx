import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { COURSES } from "@/lib/formation-data";
import Link from "next/link";

const LEVEL_COLOR: Record<string, string> = {
  "Débutant":      "bg-green-100 text-green-700",
  "Intermédiaire": "bg-yellow-100 text-yellow-700",
  "Avancé":        "bg-red-100 text-red-700",
};

const PLAN_ORDER: Record<string, number> = { free: 0, starter: 1, team: 2, enterprise: 3 };

export default async function FormationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id, role, organizations(plan)")
    .eq("user_id", user.id)
    .single();
  if (!member) redirect("/onboarding");

  const org = member.organizations as unknown as { plan: string } | null;
  const userPlanLevel = PLAN_ORDER[org?.plan ?? "free"] ?? 0;

  const categories = [...new Set(COURSES.map((c) => c.category))];

  // Fetch completed courses from DB (lesson_id is null = whole course completed)
  const { data: completions } = await supabase
    .from("course_completions")
    .select("course_slug")
    .eq("user_id", user.id)
    .is("lesson_id", null);

  const completedSlugs: string[] = completions?.map((c) => c.course_slug) ?? [];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-black mb-2">🎓 OpsAI Academy</h1>
            <p className="text-indigo-100 text-lg max-w-xl">
              Apprenez à intégrer l'IA dans votre business. Des formations concrètes, orientées résultats — pas du théorique.
            </p>
            <div className="flex gap-6 mt-5 text-sm">
              <div><span className="font-bold text-white text-xl">{COURSES.length}</span><br /><span className="text-indigo-200">formations</span></div>
              <div><span className="font-bold text-white text-xl">{COURSES.reduce((s, c) => s + c.lessonsCount, 0)}</span><br /><span className="text-indigo-200">leçons</span></div>
              <div><span className="font-bold text-white text-xl">100%</span><br /><span className="text-indigo-200">pratique</span></div>
            </div>
          </div>
          <div className="text-6xl hidden sm:block">📚</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-5">
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Votre progression</span>
            <span className="text-muted-foreground">{completedSlugs.length} / {COURSES.filter(c => PLAN_ORDER[c.plan] <= userPlanLevel).length} cours accessibles</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all"
              style={{ width: `${completedSlugs.length === 0 ? 0 : (completedSlugs.length / COURSES.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="text-2xl font-black text-indigo-600 shrink-0">
          {Math.round((completedSlugs.length / Math.max(COURSES.filter(c => PLAN_ORDER[c.plan] <= userPlanLevel).length, 1)) * 100)}%
        </div>
      </div>

      {/* Courses by category */}
      {categories.map((cat) => {
        const catCourses = COURSES.filter((c) => c.category === cat);
        return (
          <div key={cat}>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">{cat}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {catCourses.map((course) => {
                const isLocked = PLAN_ORDER[course.plan] > userPlanLevel;
                const isDone   = completedSlugs.includes(course.slug);

                return (
                  <Link
                    key={course.slug}
                    href={isLocked ? "/settings/billing" : `/formation/${course.slug}`}
                    className={`relative group border rounded-2xl p-6 transition-all ${course.bgColor} ${
                      isLocked ? "opacity-70 cursor-pointer" : "hover:shadow-md hover:-translate-y-0.5"
                    }`}
                  >
                    {/* Locked overlay */}
                    {isLocked && (
                      <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-600 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                        🔒 {course.plan === "starter" ? "Starter" : "Team"}
                      </div>
                    )}
                    {isDone && (
                      <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-2.5 py-1 rounded-full font-semibold">
                        ✓ Terminé
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      <span className="text-4xl">{course.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${LEVEL_COLOR[course.level]}`}>
                            {course.level}
                          </span>
                          <span className="text-xs text-muted-foreground">{course.duration} · {course.lessonsCount} leçons</span>
                        </div>
                        <h3 className="font-bold text-gray-900 leading-snug">{course.title}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.subtitle}</p>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {course.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs bg-white/60 px-2 py-0.5 rounded-full text-gray-600">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {!isLocked && (
                      <div className="mt-4 text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">
                        {isDone ? "Revoir le cours →" : "Commencer →"}
                      </div>
                    )}
                    {isLocked && (
                      <div className="mt-4 text-xs font-semibold text-gray-500">
                        Passer au plan {course.plan === "starter" ? "Starter (29€/mois)" : "Team (79€/mois)"} →
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
