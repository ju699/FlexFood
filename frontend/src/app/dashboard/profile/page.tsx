"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { getRestaurantByOwner, updateRestaurant } from "@/services/restaurants";
import { uploadImageResumable, uploadImage } from "@/services/storage";
import { compressImage } from "@/utils/image";
import { Restaurant, OpeningHours } from "@/utils/types";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const DAYS = [
  { key: "monday", label: "Lundi" },
  { key: "tuesday", label: "Mardi" },
  { key: "wednesday", label: "Mercredi" },
  { key: "thursday", label: "Jeudi" },
  { key: "friday", label: "Vendredi" },
  { key: "saturday", label: "Samedi" },
  { key: "sunday", label: "Dimanche" },
] as const;

export default function ProfilePage() {
  const { user, loading } = useProtectedRoute();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [city, setCity] = useState("");
  const [openingHours, setOpeningHours] = useState<OpeningHours>({});

  // Files
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!user) return;
      const r = await getRestaurantByOwner(user.uid);
      if (r) {
        setRestaurant(r);
        setName(r.name);
        setPhone(r.phone || "");
        setWhatsapp(r.whatsapp || "");
        setCity(r.city || "");
        setOpeningHours(r.openingHours || {});
      }
    };
    if (!loading) fetchRestaurant();
  }, [user, loading]);

  const handleDayChange = (
    day: keyof OpeningHours,
    field: "open" | "close" | "closed",
    value: string | boolean
  ) => {
    setOpeningHours((prev) => {
      const currentDay = prev[day] || { open: "09:00", close: "18:00", closed: false };
      return {
        ...prev,
        [day]: { ...currentDay, [field]: value },
      };
    });
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant || !user) return;
    setSaving(true);
    try {
      let logoUrl = restaurant.logo;
      let coverUrl = restaurant.coverImage;

      if (logoFile) {
        const compressedLogo = await compressImage(logoFile, { maxWidth: 512, maxHeight: 512, mimeType: "image/png", quality: 0.8 });
        try {
          logoUrl = await uploadImageResumable(compressedLogo, `restaurants/${restaurant.id}/logo_${Date.now()}_${compressedLogo.name}`);
        } catch (e: any) {
          logoUrl = await uploadImage(compressedLogo, `restaurants/${restaurant.id}/logo_${Date.now()}_${compressedLogo.name}`);
        }
      }
      if (coverFile) {
        const compressedCover = await compressImage(coverFile, { maxWidth: 1600, maxHeight: 1200, mimeType: "image/jpeg", quality: 0.8 });
        try {
          coverUrl = await uploadImageResumable(compressedCover, `restaurants/${restaurant.id}/cover_${Date.now()}_${compressedCover.name}`);
        } catch (e: any) {
          coverUrl = await uploadImage(compressedCover, `restaurants/${restaurant.id}/cover_${Date.now()}_${compressedCover.name}`);
        }
      }

      const updates: Partial<Restaurant> = {
        name,
        phone,
        whatsapp,
        city,
        openingHours,
        logo: logoUrl ?? null,
        coverImage: coverUrl ?? null,
      };

      await updateRestaurant(restaurant.id, updates);
      setRestaurant({ ...restaurant, ...updates });
      
      // Success notification
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500/10 border border-green-500/20 text-green-400 px-6 py-4 rounded-xl shadow-lg z-50 flex items-center gap-3';
      successDiv.innerHTML = `
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <span>Profil mis à jour avec succès !</span>
      `;
      document.body.appendChild(successDiv);
      setTimeout(() => successDiv.remove(), 3000);
    } catch (error: any) {
      const code = error?.code || "";
      if (code === "storage/retry-limit-exceeded") {
        alert("Le téléversement a expiré. Réessayez avec une image plus légère ou une connexion stable.");
      } else {
        alert("Erreur lors de la mise à jour.");
      }
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400">Chargement...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user || !restaurant) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-orange-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-gray-400 mb-4">Veuillez d'abord créer votre restaurant dans l'accueil.</p>
            <a href="/dashboard" className="text-red-400 hover:text-red-300 font-medium">
              Retour à l'accueil →
            </a>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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

        .input-field {
          background: rgba(30, 30, 30, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: white;
          transition: all 0.3s;
        }

        .input-field:focus {
          background: rgba(30, 30, 30, 0.8);
          border-color: rgba(255, 107, 107, 0.5);
          outline: none;
          box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
        }

        .input-field::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .file-upload-wrapper {
          position: relative;
          overflow: hidden;
          display: inline-block;
          cursor: pointer;
        }

        .file-upload-wrapper input[type=file] {
          position: absolute;
          left: -9999px;
        }

        .file-upload-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(30, 30, 30, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.3s;
          color: #9ca3af;
          font-size: 0.875rem;
        }

        .file-upload-label:hover {
          background: rgba(255, 107, 107, 0.1);
          border-color: rgba(255, 107, 107, 0.3);
          color: #ff6b6b;
        }

        .checkbox-custom {
          appearance: none;
          width: 1.25rem;
          height: 1.25rem;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 0.375rem;
          background: rgba(30, 30, 30, 0.5);
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
        }

        .checkbox-custom:checked {
          background: linear-gradient(135deg, #ff6b6b, #ff9a00);
          border-color: transparent;
        }

        .checkbox-custom:checked::after {
          content: '✓';
          position: absolute;
          color: white;
          font-size: 0.875rem;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      `}</style>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Profil du restaurant</h1>
            <p className="text-gray-400">Gérez les informations de votre établissement</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-blue-400">Les modifications sont visibles en temps réel</span>
          </div>
        </div>

        <form onSubmit={onSave} className="space-y-6">
          {/* Informations générales */}
          <div className="gradient-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-orange-600/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Informations générales</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Nom du restaurant *
                </label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required
                  className="input-field w-full px-4 py-3 rounded-xl"
                  placeholder="Ex: Le Gourmet"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Ville / Adresse
                </label>
                <Input 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)}
                  className="input-field w-full px-4 py-3 rounded-xl"
                  placeholder="Ex: Dakar, Plateau"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Téléphone
                </label>
                <Input 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field w-full px-4 py-3 rounded-xl"
                  placeholder="+225 XX XX XX XX"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Numéro WhatsApp
                </label>
                <Input 
                  value={whatsapp} 
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="input-field w-full px-4 py-3 rounded-xl"
                  placeholder="33612345678"
                />
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Format international sans le + (ex: 336...)
                </p>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="gradient-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Images</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  Logo du restaurant
                </label>
                {restaurant.logo && (
                  <div className="mb-4 relative group">
                    <img 
                      src={restaurant.logo} 
                      alt="Logo" 
                      className="w-32 h-32 object-cover rounded-2xl border-2 border-gray-800" 
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                      <span className="text-white text-sm">Changer</span>
                    </div>
                  </div>
                )}
                <div className="file-upload-wrapper">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="file-upload-label">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {logoFile ? logoFile.name : 'Choisir un fichier'}
                  </label>
                </div>
              </div>

              {/* Cover */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Image de couverture
                </label>
                {restaurant.coverImage && (
                  <div className="mb-4 relative group">
                    <img 
                      src={restaurant.coverImage} 
                      alt="Cover" 
                      className="w-full h-40 object-cover rounded-2xl border-2 border-gray-800" 
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                      <span className="text-white text-sm">Changer</span>
                    </div>
                  </div>
                )}
                <div className="file-upload-wrapper">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                    id="cover-upload"
                  />
                  <label htmlFor="cover-upload" className="file-upload-label">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {coverFile ? coverFile.name : 'Choisir un fichier'}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Horaires */}
          <div className="gradient-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Horaires d'ouverture</h2>
            </div>

            <div className="space-y-4">
              {DAYS.map((day) => {
                const dayConfig = openingHours[day.key as keyof OpeningHours] || { open: "09:00", close: "18:00", closed: false };
                return (
                  <div 
                    key={day.key} 
                    className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-black/30 rounded-xl border border-gray-800"
                  >
                    <div className="w-32 font-medium text-white">{day.label}</div>
                    
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dayConfig.closed}
                        onChange={(e) => handleDayChange(day.key as keyof OpeningHours, "closed", e.target.checked)}
                        className="checkbox-custom"
                      />
                      <span className="text-gray-400">Fermé</span>
                    </label>

                    {!dayConfig.closed && (
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="time"
                          value={dayConfig.open}
                          onChange={(e) => handleDayChange(day.key as keyof OpeningHours, "open", e.target.value)}
                          className="input-field px-3 py-2 rounded-lg text-sm"
                        />
                        <span className="text-gray-500">à</span>
                        <input
                          type="time"
                          value={dayConfig.close}
                          onChange={(e) => handleDayChange(day.key as keyof OpeningHours, "close", e.target.value)}
                          className="input-field px-3 py-2 rounded-lg text-sm"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-6">
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Les champs marqués d'un * sont obligatoires
            </p>
            <Button 
              variant="primary"
              disabled={saving}
              className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enregistrement...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Enregistrer les modifications
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
