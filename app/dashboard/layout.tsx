import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/src/server/auth";
import DashboardShell from "./DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  const role = session.user.role || "participant";

  // Only admin can access dashboard
  if (role !== "admin") {
    redirect("/");
  }

  const userName = session.user.name || session.user.email?.split("@")[0] || "User";

  return (
    <DashboardShell role={role} userName={userName} userEmail={session.user.email}>
      {children}
    </DashboardShell>
  );
}
