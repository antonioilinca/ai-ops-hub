# OpsAI — Contexte projet Claude

## Identifiants de test

### Compte personnel (Owner, Plan Team)
- **Email** : antonio@opsai.app
- **Mot de passe** : OpsAI2026!
- **Rôle** : owner de l'org "OpsAI HQ"
- **Plan** : Team (actif)
- **Accès** : /dashboard, /workflows, /integrations, /formation, /settings/billing

### Compte Admin (Super Admin)
- **Email** : admin@opsai.app
- **Mot de passe** : SuperAdmin#OpsAI2026!
- **Rôle** : super_admin (app_metadata)
- **Accès** : /admin (panel complet gestion users/orgs/plans)

## URLs

- **Production** : https://ai-ops-hub-eight.vercel.app
- **Login** : https://ai-ops-hub-eight.vercel.app/login
- **Dashboard** : https://ai-ops-hub-eight.vercel.app/dashboard
- **Admin** : https://ai-ops-hub-eight.vercel.app/admin

## IDs Supabase
- **Org ID** : 2b7db6cc-514c-488c-89b7-aa36b9048b4f
- **User antonio ID** : 2273c38a-227c-4c9b-830d-dc3f7c13459f
- **User admin ID** : 70d4523d-a11a-4f7b-b4eb-e0f60e496202

## Tarification
- Free : 0€ — 2 workflows, 1 membre
- Starter : 29€/mois — 5 workflows, 3 membres
- Team : 79€/mois — 20 workflows, 15 membres
- Enterprise : sur devis

## Stack
- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Supabase (Auth + DB + Row Level Security)
- Stripe (paiements)
- Upstash Redis (rate limiting)
- Vercel (hébergement)

## Notes
- Les emails de confirmation nécessitent un SMTP custom dans Supabase
  → Dashboard Supabase > Auth > SMTP Settings > configurer Resend ou SendGrid
- Google OAuth désactivé (non configuré)
- middleware.ts gère les redirections auth
