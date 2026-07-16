# New Generation — plateforme e-commerce

Monorepo de la boutique en ligne New Generation (prêt-à-porter urbain : t-shirts, maillots, pantalons, bonnets, pulls). Trois espaces : visiteur/client (sans compte), propriétaire de boutique (authentifié), administrateur technique (authentifié, accès supérieur).

## Structure

```
new-generation/
├── frontend/   → React (Vite), voir frontend/README.md
├── backend/    → FastAPI + SQLAlchemy + Alembic, voir backend/README.md
└── docker-compose.yml → backend + MySQL pour le développement local
```

## Stack

- **Frontend** : React (Vite), React Router, Context API, Axios, CSS natif (variables + CSS Modules), aucun framework UI ni librairie d'icônes.
- **Backend** : Python / FastAPI, SQLAlchemy + Alembic, Pydantic, JWT (access + refresh), Uvicorn.
- **Base de données** : MySQL / MariaDB.

## Démarrage rapide

Deux options équivalentes pour la base de données locale :

1. **XAMPP (MariaDB)** déjà installé sur ce poste (`C:\xampp\mysql`) : démarrer MySQL depuis le panneau XAMPP, créer une base `new_generation`, puis suivre `backend/README.md`.
2. **Docker** : `docker compose up -d` lance MySQL + le backend (voir `docker-compose.yml`).

Le frontend démarre toujours en local avec `npm run dev` (voir `frontend/README.md`) — il peut fonctionner **sans backend démarré** grâce au mode mock (`VITE_USE_MOCKS=true` dans `frontend/.env`).

## Décisions d'architecture notables

Ces choix ne sont pas anodins et sont documentés en détail dans les README de chaque sous-projet :

- **Authentification** : access token JWT courte durée renvoyé en JSON (gardé en mémoire côté React, jamais en `localStorage`) ; refresh token en cookie `HttpOnly` + `Secure` + `SameSite=Lax`, jamais accessible en JavaScript.
- **Commandes** : décrément de stock atomique (verrou de ligne SQL) pour éviter la survente en cas de commandes simultanées ; numéro de commande public au format `NG-<année>-<compteur>`.
- **Paiement** : aucune intégration de passerelle de paiement en ligne pour l'instant (prévue comme évolution future). Le client choisit un mode de paiement (Wave, Orange Money, ou paiement en boutique) au moment de la commande ; la réconciliation est manuelle par le propriétaire. C'est une extension **documentée** du schéma fourni (`orders.payment_method`), voir `backend/README.md`.
- **Comptes propriétaire** : créés exclusivement par l'administrateur depuis son interface, jamais en dur dans une seed. Un mot de passe temporaire est généré côté serveur et affiché **une seule fois** dans l'interface admin (jamais journalisé) ; l'admin le transmet ensuite au propriétaire par un canal hors bande.
- **Premier compte administrateur** : créé uniquement via un script d'initialisation contrôlé (`python -m app.db.init_db`, saisie interactive du mot de passe), jamais avec un mot de passe par défaut.

## Informations de la boutique intégrées dans le site

- Téléphones : 76 410 10 69 / 71 038 13 70
- Boutiques : Sandaga (rue El Malick) et Sandaga (rue Valmy), Dakar
- Instagram : https://www.instagram.com/newgeneration_dkr
- TikTok : https://vt.tiktok.com/ZSXLYcJDs/
- Paiement Wave (bénéficiaire « Kheweul Gui ») : https://pay.wave.com/m/M_3ozQz0pOoE_4/c/sn/

## Assets de marque

Le logo et les logos des moyens de paiement fournis par le client sont dans `frontend/src/assets/images/` (`logo-marque.jpeg`, `payment-wave.jpeg`, `payment-orange-money.jpeg`). Les visuels produits réels et les textes de marque définitifs seront fournis séparément ; des placeholders neutres sont utilisés en attendant, clairement identifiés comme temporaires.
