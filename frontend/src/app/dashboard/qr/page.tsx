"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { getRestaurantByOwner } from "@/services/restaurants";
import { Restaurant } from "@/utils/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { QRCodeSVG } from "qrcode.react";

export default function QrPage() {
  const { user, loading } = useProtectedRoute();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!user) return;
      const r = await getRestaurantByOwner(user.uid);
      setRestaurant(r);
    };
    if (!loading) fetchRestaurant();
  }, [user, loading]);

  if (loading) return <div className="p-8">Chargement...</div>;
  if (!restaurant) return <DashboardLayout><div className="p-8">Veuillez d'abord créer votre restaurant.</div></DashboardLayout>;

  // Assuming the app is hosted at window.location.origin
  // We need to be careful with SSR, so we use window.location only after mount, 
  // or construct it if we know the domain. For now, let's use a placeholder or relative if possible, 
  // but QR code needs absolute URL.
  
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const publicUrl = `${origin}/r/${restaurant.slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `qrcode-${restaurant.slug}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-semibold">QR Code & Lien</h1>

        <Card className="text-center py-10">
          <h2 className="text-xl font-semibold mb-6">Votre Menu Digital</h2>
          
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white border rounded-lg shadow-sm">
                <QRCodeSVG 
                    id="qr-code-svg"
                    value={publicUrl} 
                    size={256} 
                    level={"H"}
                    includeMargin={true}
                />
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
            <div className="w-full flex gap-2">
                <input 
                    readOnly 
                    value={publicUrl} 
                    className="flex-1 border rounded px-3 py-2 bg-gray-50 text-gray-600 outline-none"
                />
                <Button variant="primary" onClick={handleCopy}>
                    {copied ? "Copié !" : "Copier"}
                </Button>
            </div>
            
            <Button onClick={handleDownload} className="text-blue-600 hover:underline">
                Télécharger le QR Code (PNG)
            </Button>
            
            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-800">
                Ouvrir le menu dans un nouvel onglet
            </a>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
