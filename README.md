# FlexFood — Base SaaS

## Choix de stack
- Frontend: Next.js App Router (TypeScript, Tailwind inclus)
- Backend: Firebase (Auth, Firestore, Storage, Cloud Functions)
- Déploiement: Firebase Hosting (frameworks backend pour Next.js SSR)

Justification Next.js App Router: SEO et perf, structuration par routes/server/client, modularité. La logique métier est isolée dans `src/services/*` et non dans les composants UI.

## Structure
- Frontend: [frontend](file:///c:/Users/ad/Documents/bureaux/Projet%20FlexFood/frontend)
- Backend Firebase: [firebase](file:///c:/Users/ad/Documents/bureaux/Projet%20FlexFood/firebase)
  - Règles Firestore: [firestore.rules](file:///c:/Users/ad/Documents/bureaux/Projet%20FlexFood/firebase/firestore.rules)
  - Règles Storage: [storage.rules](file:///c:/Users/ad/Documents/bureaux/Projet%20FlexFood/firebase/storage.rules)
  - Functions: [functions/src/index.ts](file:///c:/Users/ad/Documents/bureaux/Projet%20FlexFood/firebase/functions/src/index.ts)
  - Config: [firebase.json](file:///c:/Users/ad/Documents/bureaux/Projet%20FlexFood/firebase/firebase.json)

## Pré-requis Firebase
1. Créer un projet Firebase
2. Activer: Authentication (Email/Password), Firestore, Storage
3. Récupérer les variables client et les placer dans `frontend/.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

## Règles de sécurité
- Firestore: voir [firestore.rules](file:///c:/Users/ad/Documents/bureaux/Projet%20FlexFood/firebase/firestore.rules). Lecture publique des restaurants et des produits disponibles; écriture limitée au propriétaire (`uid`).
- Storage: voir [storage.rules](file:///c:/Users/ad/Documents/bureaux/Projet%20FlexFood/firebase/storage.rules). Lecture publique; écriture limitée au propriétaire dans `restaurants/{restaurantId}/**`.

## Développement
```
cd frontend
npm install
npm run dev
```
Lint/Build:
```
npm run lint
npm run build
```

## Déploiement Firebase
Installer CLI:
```
npm i -g firebase-tools
firebase login
```
Associer un projet:
```
firebase use --add
```
Déployer (depuis le dossier `firebase`):
```
cd firebase
firebase deploy --config firebase.json
```
- Hosting: déploie Next.js via frameworksBackend (SSR sur Cloud Functions + CDN Hosting)
- Firestore/Storage: applique les règles
- Functions: déploie le code de `firebase/functions` si présent

## Flux Auth
- Inscription/Connexion/Déconnexion via Firebase Auth
- Protection des routes côté client via `useProtectedRoute`

## Données et pages clés
- Dashboard vendeur: [dashboard/page.tsx](file:///c:/Users/ad/Documents/bureaux/Projet%20FlexFood/frontend/src/app/dashboard/page.tsx)
- Menu public: [r/[slug]/page.tsx](file:///c:/Users/ad/Documents/bureaux/Projet%20FlexFood/frontend/src/app/r/%5Bslug%5D/page.tsx)
- Services Firebase: [services](file:///c:/Users/ad/Documents/bureaux/Projet%20FlexFood/frontend/src/services)

## Évolutivité
- Séparation stricte UI/Services
- Types centralisés: [types.ts](file:///c:/Users/ad/Documents/bureaux/Projet%20FlexFood/frontend/src/utils/types.ts)
- Prêt pour rôles et paiement ultérieurs
