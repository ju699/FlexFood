"use client";
import { useState, useEffect } from 'react';

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .gradient-border {
          position: relative;
          background: linear-gradient(to right, #000, #0a0a0a);
        }

        .gradient-border::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(255,107,107,0.2), rgba(255,154,0,0.1));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }

        .glow-effect {
          box-shadow: 0 0 40px rgba(255, 107, 107, 0.2);
        }

        .text-gradient {
          background: linear-gradient(135deg, #fff 0%, #ff6b6b 50%, #ff9a00 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .card-hover {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(255, 107, 107, 0.25);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        .animate-shimmer {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 107, 107, 0.05) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          background-size: 1000px 100%;
          animation: shimmer 3s infinite;
        }

        .glass {
          background: rgba(15, 15, 15, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 107, 107, 0.1);
        }

        .noise {
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
      `}</style>

      {/* Noise Texture */}
      <div className="noise"></div>

      {/* Gradient Orbs - Rouge/Orange */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(255, 107, 107, 0.4) 0%, transparent 70%)',
            left: `${mousePosition.x - 192}px`,
            top: `${mousePosition.y - 192}px`,
            transition: 'left 0.3s ease-out, top 0.3s ease-out'
          }}
        />
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-red-600 opacity-10 blur-3xl" style={{ animation: 'float 8s ease-in-out infinite' }} />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-orange-600 opacity-10 blur-3xl" style={{ animation: 'float 10s ease-in-out infinite', animationDelay: '2s' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 relative rounded-lg overflow-hidden">
                <img src="/flexfood-8.png" alt="FlexFood Logo" className="w-full h-full object-cover" />
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
                <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Fonctionnalités</a>
                <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Tarifs</a>
                <a href="#docs" className="text-sm text-gray-400 hover:text-white transition-colors">Documentation</a>
                <a href="/login" className="text-sm text-white hover:text-red-400 transition-colors">Se connecter</a>
                <a href="/signup" className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-lg text-sm font-semibold hover:from-red-600 hover:to-orange-700 transition-all">S'inscrire</a>
              </div>
              <div className="flex md:hidden items-center gap-2">
                <a href="/login" className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-lg text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3v-1m4 0v-1a1 1 0 011-1h4a1 1 0 011 1v1" />
                  </svg>
                </a>
                <a href="/signup" className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-red-500 to-orange-600 rounded-lg text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </a>
              </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-32 pb-20">
        <div className="max-w-6xl mx-auto w-full relative z-10">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-300">Approuvé par 500+ restaurants</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-6xl md:text-8xl font-bold leading-tight tracking-tight">
              <span className="text-gradient">Menus digitaux</span>
              <br />
              <span className="text-white">qui convertissent</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Transformez votre restaurant avec des menus digitaux et une prise de commande fluide. 
              Sans téléchargement d'application. Scannez et commandez.
            </p>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-6 pt-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Sans carte bancaire
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Configuration en 5 min
              </div>
            </div>
          </div>

          {/* Hero Visual - Phone Mockup */}
          <div className="mt-20 relative">
            <div className="relative max-w-sm mx-auto">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 via-orange-600/15 to-transparent blur-3xl" />
              
              {/* Phone frame */}
              <div className="relative bg-gradient-to-b from-gray-900 to-black rounded-[3rem] p-3 border border-gray-800 shadow-2xl">
                <div className="bg-black rounded-[2.5rem] overflow-hidden">
                  {/* Status bar */}
                  <div className="px-6 py-2 flex items-center justify-between text-xs text-white">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-3 border border-white rounded-sm" />
                      <div className="w-1 h-3 bg-white rounded-sm" />
                    </div>
                  </div>

                  {/* App content */}
                  <div className="bg-gradient-to-b from-gray-900 to-black">
                    <div className="px-6 py-4 bg-gradient-to-r from-red-900/20 to-orange-800/20 border-b border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl" />
                        <div>
                          <div className="font-semibold text-white text-sm">Le Gourmet</div>
                          <div className="text-xs text-gray-400">Ouvert • 15 min</div>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 py-4 space-y-3">
                      {[
                        { name: 'Burger Premium', desc: 'Avec frites', price: '2500 FCFA' },
                        { name: 'Pizza Margherita', desc: 'Taille moyenne', price: '3500 FCFA' },
                        { name: 'Coca-Cola', desc: '33cl', price: '500 FCFA' }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-xl border border-gray-800">
                          <div className="w-14 h-14 bg-gradient-to-br from-red-500/20 to-orange-600/20 rounded-lg" />
                          <div className="flex-1">
                            <div className="text-xs font-medium text-white">{item.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                          </div>
                          <div className="text-xs font-semibold text-red-400">{item.price}</div>
                        </div>
                      ))}
                    </div>

                    <div className="px-4 pb-4">
                      <button className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-xl text-sm font-semibold">
                        Voir le panier • 3 articles
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 border-y border-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">500+</div>
              <div className="text-sm text-gray-500">Restaurants actifs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">50K+</div>
              <div className="text-sm text-gray-500">Commandes/mois</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">98%</div>
              <div className="text-sm text-gray-500">Satisfaction client</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">15</div>
              <div className="text-sm text-gray-500">Pays</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Une solution complète pour digitaliser votre restaurant et booster vos ventes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                title: 'Menus digitaux',
                description: 'Créez de beaux menus en quelques minutes. Mettez à jour prix et articles en temps réel.'
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                ),
                title: 'QR code commande',
                description: 'Les clients scannent et commandent instantanément. Aucune application requise.'
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                ),
                title: 'Notifications temps réel',
                description: 'Recevez des alertes instantanées via WhatsApp, email ou SMS pour chaque commande.'
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: 'Tableau de bord analytics',
                description: 'Suivez les ventes, articles populaires et métriques de performance en temps réel.'
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                ),
                title: 'Optimisé mobile',
                description: 'Expérience parfaite sur tous les appareils. Performance ultra-rapide.'
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: 'Configuration instantanée',
                description: 'En ligne en 5 minutes. Aucune compétence technique requise. Support 24/7.'
              }
            ].map((feature, i) => (
              <div 
                key={i}
                className="card-hover gradient-border rounded-2xl p-6 group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-red-500/10 to-orange-600/10 rounded-xl flex items-center justify-center text-red-400 mb-4 group-hover:from-red-500/20 group-hover:to-orange-600/20 transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Comment ça marche
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Démarrez en trois étapes simples
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: 'Créez votre profil',
                description: 'Inscrivez-vous en 2 minutes. Ajoutez le nom de votre restaurant, logo et couleurs.'
              },
              {
                step: '02',
                title: 'Ajoutez votre menu',
                description: 'Uploadez des photos, fixez les prix et organisez par catégories. Simple et rapide.'
              },
              {
                step: '03',
                title: 'Recevez vos commandes',
                description: 'Téléchargez votre QR code. Les clients scannent et commandent. Vous êtes payé.'
              }
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-8xl font-bold text-gray-900 mb-6">{item.step}</div>
                <h3 className="text-2xl font-semibold text-white mb-4">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.description}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 -right-6 w-12 h-0.5 bg-gradient-to-r from-red-500/50 via-orange-500/50 to-transparent" />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <a 
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-orange-700 transition-all shadow-xl shadow-red-500/30"
            >
              Commencer maintenant
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-32 px-6 border-y border-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Ils nous font confiance
            </h2>
            <p className="text-xl text-gray-400">
              Rejoignez des centaines de restaurants à succès
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "FlexFood a transformé notre restaurant. Plus de files d'attente, plus de commandes perdues. Les ventes ont augmenté de 40% en 2 mois.",
                author: "Aminata D.",
                role: "Propriétaire, Le Délice"
              },
              {
                quote: "Interface simple, clients satisfaits. Ils adorent commander via QR code. Je recommande FlexFood à tous.",
                author: "Kofi M.",
                role: "Gérant, City Diner"
              },
              {
                quote: "Support excellent et plateforme très intuitive. Configuration en moins de 10 minutes. Parfait pour les petits restaurants.",
                author: "Sarah T.",
                role: "Propriétaire, Café Moderne"
              }
            ].map((testimonial, i) => (
              <div key={i} className="gradient-border rounded-2xl p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
                <div>
                  <div className="font-semibold text-white">{testimonial.author}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-8">
            Prêt à digitaliser ?
          </h2>
          <p className="text-xl text-gray-400 mb-12">
            Rejoignez des centaines de restaurants qui ont déjà franchi le pas
          </p>
          <p className="mt-6 text-sm text-gray-500">
            Sans carte bancaire • Configuration en 5 min • Annulation à tout moment
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-900 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 relative rounded-lg overflow-hidden">
                  <img src="/flexfood-8.png" alt="FlexFood Logo" className="w-full h-full object-cover" />
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Menus digitaux et commandes pour restaurants modernes
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Produit</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-sm text-gray-500 hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#pricing" className="text-sm text-gray-500 hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Démo</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Entreprise</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">À propos</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Statut</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2026 FlexFood. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Confidentialité</a>
              <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Conditions</a>
              <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
