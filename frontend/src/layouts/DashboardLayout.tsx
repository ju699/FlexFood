"use client";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <aside className="border-r p-4 bg-white">
        <div className="mb-6">
          <div className="text-xl font-semibold">FlexFood</div>
          <div className="text-xs text-gray-600">Vendeur</div>
        </div>
        <nav className="grid gap-2">
          <Link href="/dashboard" className="px-3 py-2 rounded hover:bg-black/5">Accueil</Link>
          <Link href="/dashboard/orders" className="px-3 py-2 rounded hover:bg-black/5">Commandes</Link>
        </nav>
      </aside>
      <main className="p-6">
        <div className="flex justify-end mb-4">
          <Link href="/logout"><Button variant="primary">Déconnexion</Button></Link>
        </div>
        <div className="mb-2 text-sm text-gray-600">UID: {user?.uid}</div>
        {children}
      </main>
    </div>
  );
}
