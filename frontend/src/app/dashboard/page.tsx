"use client";
export const dynamic = "force-dynamic";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { createRestaurant, getRestaurantByOwner } from "@/services/restaurants";
import { Restaurant } from "@/utils/types";
import { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading } = useProtectedRoute();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const run = async () => {
      if (!user) return;
      const r = await getRestaurantByOwner(user.uid);
      setRestaurant(r);
    };
    if (!loading) run();
  }, [user, loading]);

  const onCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await createRestaurant({ name, city, phone });
    setRestaurant(r);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }
  
  if (!user) return null;

  return (
    <DashboardLayout>
      <style jsx>{`
        .gradient-border {
          position: relative;
          background: rgba(15, 15, 15, 0.6);
          backdrop-filter: blur(12px);
        }

        .gradient-border::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(255, 154, 0, 0.1));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(255, 107, 107, 0.15);
        }

        .glow-card {
          box-shadow: 0 0 40px rgba(255, 107, 107, 0.1);
        }
      `}</style>

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Tableau de bord
          </h1>
          <p className="text-gray-400">
            Gérez votre restaurant et suivez vos performances
          </p>
        </div>

        {!restaurant ? (
          /* Onboarding - Création du restaurant */
          <div className="max-w-2xl mx-auto">
            {/* Welcome Card */}
            <div className="gradient-border rounded-2xl p-8 mb-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Bienvenue sur FlexFood ! 🎉
                  </h2>
                  <p className="text-gray-400">
                    Vous êtes à quelques clics de digitaliser votre restaurant. Créez votre établissement pour accéder à toutes les fonctionnalités.
                  </p>
                </div>
              </div>

              {/* Features List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                {[
                  { icon: "📱", text: "Menu digital responsive" },
                  { icon: "🔔", text: "Notifications en temps réel" },
                  { icon: "📊", text: "Statistiques détaillées" },
                  { icon: "⚡", text: "Configuration en 2 minutes" }
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                    <span className="text-lg">{feature.icon}</span>
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* Create Restaurant Form */}
              <form onSubmit={onCreateRestaurant} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom du restaurant *
                  </label>
                  <Input 
                    placeholder="Ex: Le Gourmet, Chez Maria..." 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required
                    className="w-full bg-black/50 border-gray-800 text-white placeholder-gray-500 focus:border-red-500 focus:ring-red-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Ville
                    </label>
                    <Input 
                      placeholder="Ex: Dakar, Abidjan..." 
                      value={city} 
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-black/50 border-gray-800 text-white placeholder-gray-500 focus:border-red-500 focus:ring-red-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Téléphone
                    </label>
                    <Input 
                      placeholder="+225 XX XX XX XX" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-black/50 border-gray-800 text-white placeholder-gray-500 focus:border-red-500 focus:ring-red-500/20"
                    />
                  </div>
                </div>

                <Button 
                  variant="primary"
                  className="w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-red-500/30"
                >
                  Créer mon restaurant
                </Button>
              </form>
            </div>

            {/* Info Banner */}
            <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-300">
                <p className="font-medium mb-1">Astuce</p>
                <p className="text-blue-400">Une fois votre restaurant créé, vous pourrez ajouter votre menu, personnaliser votre page et télécharger votre QR code.</p>
              </div>
            </div>
          </div>
        ) : (
          /* Dashboard principal */
          <div className="space-y-6">
            {/* Restaurant Info Card */}
            <div className="gradient-border rounded-2xl p-6 glow-card">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-2xl font-bold text-white">{restaurant.name}</h2>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                        Actif
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Votre restaurant est en ligne et prêt à recevoir des commandes
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link href={`/r/${restaurant.slug}`} target="_blank">
                    <Button 
                      variant="primary"
                      className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-semibold shadow-lg shadow-red-500/30"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Voir ma page
                    </Button>
                  </Link>
                  <Link href="/dashboard/qr">
                    <Button className="bg-black/50 border border-gray-800 text-white hover:bg-gray-900 hover:border-red-500/50">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      QR Code
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Actions rapides</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    href: "/dashboard/stats",
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    ),
                    title: "Statistiques",
                    description: "Consultez les performances de votre menu et vos ventes",
                    color: "from-blue-500/10 to-blue-600/10",
                    borderColor: "border-blue-500/20",
                    iconBg: "from-blue-500/10 to-blue-600/10",
                    iconColor: "text-blue-400"
                  },
                  {
                    href: "/dashboard/menu",
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    ),
                    title: "Gérer le Menu",
                    description: "Ajoutez, modifiez ou supprimez des plats de votre carte",
                    color: "from-red-500/10 to-orange-600/10",
                    borderColor: "border-red-500/20",
                    iconBg: "from-red-500/10 to-orange-600/10",
                    iconColor: "text-red-400"
                  },
                  {
                    href: "/dashboard/profile",
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    ),
                    title: "Profil",
                    description: "Mettez à jour vos informations et horaires d'ouverture",
                    color: "from-purple-500/10 to-purple-600/10",
                    borderColor: "border-purple-500/20",
                    iconBg: "from-purple-500/10 to-purple-600/10",
                    iconColor: "text-purple-400"
                  }
                ].map((action, i) => (
                  <Link key={i} href={action.href} className="block">
                    <div className={`card-hover gradient-border rounded-2xl p-6 h-full cursor-pointer group bg-gradient-to-br ${action.color}`}>
                      <div className={`w-12 h-12 bg-gradient-to-br ${action.iconBg} rounded-xl flex items-center justify-center mb-4 ${action.iconColor} group-hover:scale-110 transition-transform`}>
                        {action.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-red-400 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        {action.description}
                      </p>
                      <div className="mt-4 flex items-center text-sm font-medium text-gray-500 group-hover:text-red-400 transition-colors">
                        Accéder
                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Help Banner */}
            <div className="gradient-border rounded-2xl p-6 bg-gradient-to-r from-gray-900/50 to-black/50">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-1">Besoin d'aide ?</h4>
                  <p className="text-gray-400 text-sm mb-3">
                    Consultez notre documentation ou contactez le support pour toute question.
                  </p>
                  <div className="flex gap-3">
                    <Link href="/docs" className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors">
                      Documentation →
                    </Link>
                    <Link href="/support" className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors">
                      Contacter le support →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
