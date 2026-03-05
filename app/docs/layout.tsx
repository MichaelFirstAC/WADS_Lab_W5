import { redirect } from "next/navigation";

const DOCS_ENABLED = process.env.NEXT_PUBLIC_API_DOCS_ENABLED === "true";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!DOCS_ENABLED && process.env.NODE_ENV === "production") {
    redirect("/");
  }
  return <>{children}</>;
}