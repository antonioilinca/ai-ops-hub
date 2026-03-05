import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Vérifie le rôle super_admin dans app_metadata
  const isSuperAdmin = user.app_metadata?.role === "super_admin";
  if (!isSuperAdmin) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-red-600 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-black">A</span>
            </div>
            <span className="font-bold text-gray-900">OpsAI Admin</span>
            <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">SUPER ADMIN</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a href="/admin" className="text-gray-600 hover:text-gray-900">Utilisateurs</a>
            <a href="/admin/orgs" className="text-gray-600 hover:text-gray-900">Organisations</a>
            <a href="/dashboard" className="text-indigo-600 hover:text-indigo-700 font-medium">→ App</a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
