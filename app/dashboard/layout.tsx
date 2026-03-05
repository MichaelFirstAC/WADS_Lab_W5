import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import LogoutButton from "@/components/logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const displayName = session.name?.trim() || session.email;
  const initial = (session.name?.trim()?.[0] ?? session.email?.[0] ?? "?").toUpperCase();

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-10 border-b bg-card shadow-sm">
        <div className="container mx-auto flex items-center justify-between gap-4 py-4 px-4">
          <nav className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/todos"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              My Todo List
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {session.image ? (
                <img
                  src={session.image}
                  alt={displayName}
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-border"
                  width={36}
                  height={36}
                />
              ) : (
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground ring-2 ring-border"
                  aria-hidden
                >
                  {initial}
                </div>
              )}
              <span className="hidden text-sm text-muted-foreground sm:inline">{displayName}</span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="container mx-auto py-6 px-4 sm:py-8">{children}</main>
    </div>
  );
}