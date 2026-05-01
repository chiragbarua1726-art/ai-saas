import { QueryProvider } from "@/lib/providers/query-provider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <QueryProvider>{children}</QueryProvider>;
}
