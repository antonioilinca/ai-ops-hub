import { redirect } from "next/navigation";

// Le dashboard a été déplacé vers /dashboard
export default function OldDashboardRoot() {
  redirect("/dashboard");
}
