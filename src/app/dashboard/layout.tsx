import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ensureReady } from "@/lib/db/seed";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  ensureReady();
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userName={session.user.name} userEmail={session.user.email} />
      <div className="flex min-w-0 flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}
