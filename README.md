# HelpDesk Pro

Application interne de gestion de tickets de support, utilisée comme fil rouge du module
**DevOps – Intégration et Déploiement Continus** (Bachelor 3).

## Architecture

| Service  | Rôle                                                        | Techno              |
|----------|-------------------------------------------------------------|---------------------|
| `api`    | API REST : création et consultation des tickets              | Node.js 22, Express |
| `db`     | Persistance des tickets                                      | PostgreSQL 16       |
| `worker` | Traitement en arrière-plan : passe les tickets « nouveau » à « traité » | Node.js 22 |

```
helpdesk-pro/
├── api/            API Express (+ tests Jest, ESLint)
├── worker/         Worker de traitement
├── docs/           Documentation (politique de sécurité, dossier d'industrialisation)
├── .env.example    Variables d'environnement attendues (copier en .env)
└── .gitignore
```

Les fichiers `Dockerfile`, `compose.yaml`, `.github/workflows/ci.yml`, `compose.prod.yaml`
et `infra/main.tf` **sont à écrire pendant les TP** (chapitres 3, 4 et 5).

## Démarrer en local (sans Docker)

Prérequis : Node.js 22 et une base PostgreSQL accessible (ou laisser `DATABASE_URL` vide :
l'API démarre alors en mode « mémoire », sans persistance, suffisant pour les tests).

```bash
cp .env.example .env
cd api
npm ci
npm test          # tests unitaires (Jest + Supertest)
npm run lint      # qualité de code (ESLint)
npm start         # http://localhost:3000/health
```

## Routes de l'API

| Méthode | Route            | Description                                   |
|---------|------------------|-----------------------------------------------|
| GET     | `/health`        | État de l'API et de la base (`{ status: "ok" }`) |
| GET     | `/version`       | Version de l'application (à ajouter en TP1)   |
| GET     | `/tickets`       | Liste des tickets                             |
| POST    | `/tickets`       | Crée un ticket `{ "titre": "...", "priorite": "haute" }` |
| GET     | `/tickets/:id`   | Détail d'un ticket                            |

## Variables d'environnement

Voir `.env.example`. Aucune valeur réelle ne doit être versionnée.
