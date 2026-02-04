"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutPage() {
  const { logOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onLogout = async () => {
    setLoading(true);
    await logOut();
    router.replace("/login");
  };

  return (
    <div className="max-w-md mx-auto mt-16 card text-center">
      <h1 className="text-2xl font-semibold mb-4">Déconnexion</h1>
      <button className="btn btn-primary" onClick={onLogout} disabled={loading}>
        {loading ? "Déconnexion..." : "Se déconnecter"}
      </button>
    </div>
  );
}
