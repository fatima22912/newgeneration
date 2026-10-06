# New Generation â€” Backend

API REST FastAPI pour la plateforme New Generation (visiteur, propriÃ©taire, administrateur). Voir le README racine pour la vue d'ensemble du monorepo.

## Lancement en local

### 1. Base de donnÃ©es

Deux options :

- **XAMPP (MariaDB)** : dÃ©marrer MySQL depuis le panneau de contrÃ´le XAMPP, puis crÃ©er la base :
  ```
  C:\xampp\mysql\bin\mysql.exe -u root -e "CREATE DATABASE new_generation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  ```
- **Docker** : `docker compose up -d db` depuis la racine du monorepo.

### 2. Environnement Python

```bash
cd backend
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
copy .env.example .env
# Ã©diter .env : DATABASE_URL, JWT_SECRET_KEY notamment
```

### 3. Migrations

```bash
.venv\Scripts\python -m alembic upgrade head
```

### 4. Premier compte administrateur

Aucun compte n'est crÃ©Ã© par une seed. Le tout premier administrateur est crÃ©Ã© via un script interactif (jamais de mot de passe par dÃ©faut) :

```bash
.venv\Scripts\python -m app.db.init_db
```

Le script refuse de s'exÃ©cuter si un administrateur existe dÃ©jÃ . Les comptes propriÃ©taire, eux, ne peuvent **jamais** Ãªtre crÃ©Ã©s par un script : uniquement par un administrateur depuis `POST /api/v1/accounts/owners` une fois connectÃ©.

### 5. Lancer le serveur

```bash
.venv\Scripts\uvicorn app.main:app --reload
```

Documentation interactive : http://127.0.0.1:8000/docs

### 6. Tests

```bash
.venv\Scripts\pytest -q
```

Les tests tournent contre une base SQLite en mÃ©moire (isolÃ©e de la base de dÃ©veloppement) et dÃ©sactivent le rate limiting via `RATE_LIMITING_ENABLED=false` pour ne pas polluer les rÃ©sultats entre tests indÃ©pendants.

## Choix d'architecture

### Authentification (JWT)

- **Access token** : JWT courte durÃ©e (15 min par dÃ©faut), renvoyÃ© dans le corps JSON de la rÃ©ponse de connexion. Le frontend le garde en mÃ©moire (jamais en `localStorage`), pour limiter l'exposition en cas de faille XSS.
- **Refresh token** : JWT plus longue durÃ©e (7 jours), posÃ© dans un cookie `HttpOnly` + `SameSite=Lax` (+ `Secure` en production via `REFRESH_COOKIE_SECURE=true`), donc jamais accessible en JavaScript. `POST /api/v1/auth/refresh` le lit depuis le cookie et fait tourner (rotation) un nouveau refresh token Ã  chaque appel.
- Deux routes de connexion distinctes (`/auth/owner/login`, `/auth/admin/login`) : chacune vÃ©rifie explicitement le rÃ´le attendu, empÃªchant un propriÃ©taire de se connecter sur l'espace admin et inversement.
- Verrouillage de compte : `failed_login_attempts` / `locked_until` sur `users`, seuils configurables (`MAX_FAILED_LOGIN_ATTEMPTS`, `ACCOUNT_LOCK_MINUTES`).
- `require_role()` (`app/core/dependencies.py`) est appliquÃ© sur **chaque** route sensible cÃ´tÃ© backend â€” jamais de contrÃ´le d'accÃ¨s reposant uniquement sur le frontend.

### Commandes

- NumÃ©ro de commande public au format `NG-<annÃ©e>-<compteur 6 chiffres>` (`app/utils/order_number_generator.py`).
- DÃ©crÃ©ment de stock atomique : `POST /orders` verrouille chaque ligne de `product_variants` concernÃ©e (`SELECT ... FOR UPDATE`) dans une transaction, pour empÃªcher la survente en cas de commandes simultanÃ©es. En cas de stock insuffisant, la transaction entiÃ¨re est annulÃ©e (409 `insufficient_stock`).
- Suppression d'un produit : suppression physique s'il n'a jamais Ã©tÃ© commandÃ©, sinon dÃ©sactivation logique (`is_active = false`) pour prÃ©server l'historique des ventes.

### DÃ©viation documentÃ©e du schÃ©ma (section 4 du cahier des charges)

- **`orders.payment_method`** (ENUM `wave` / `orange_money` / `cash_on_delivery`) : champ ajoutÃ© car la boutique utilise dÃ©jÃ  de vrais moyens de paiement (Wave, Orange Money) en plus du paiement en boutique. Aucune passerelle de paiement en ligne n'est intÃ©grÃ©e pour l'instant (prÃ©vu comme Ã©volution future) : ce champ capture uniquement l'intention du client au moment de la commande, rÃ©conciliÃ©e manuellement par le propriÃ©taire.
- **`PATCH /accounts/owners/{id}/enable`** : la section 8 ne liste que `/disable`, mais la section 5.3 demande explicitement une gestion "dÃ©sactivation/**rÃ©activation**". La route symÃ©trique a donc Ã©tÃ© ajoutÃ©e.
- **`GET /products/{id}`** accepte un ID numÃ©rique **ou** un slug produit. Le catalogue public utilise des URLs lisibles (`/produits/mon-produit`) via le champ `products.slug` dÃ©jÃ  prÃ©vu par le schÃ©ma â€” la route reste compatible avec un ID numÃ©rique pour les usages internes (Ã©dition, suppression).

### Comptes propriÃ©taire

CrÃ©Ã©s exclusivement par un administrateur (`POST /api/v1/accounts/owners`). Un mot de passe temporaire Ã  forte entropie est gÃ©nÃ©rÃ© cÃ´tÃ© serveur et renvoyÃ© **une seule fois** dans la rÃ©ponse JSON (`temporary_password`) â€” jamais journalisÃ©, jamais renvoyÃ© Ã  nouveau ensuite. L'admin le transmet au propriÃ©taire par un canal hors bande (tÃ©lÃ©phone, en personne).

### Validation des uploads

Les images produit sont validÃ©es Ã  deux niveaux : taille maximale (`MAX_UPLOAD_SIZE_MB`) et **type MIME rÃ©el**, lu depuis les octets du fichier (magic bytes, librairie `filetype`) â€” jamais depuis l'extension ou le `Content-Type` dÃ©clarÃ© par le client.

### Rate limiting

`slowapi`, backend mÃ©moire, appliquÃ© sur les routes d'authentification et de contact (`/auth/*/login`, `/contact`). Point d'extension documentÃ© : brancher un backend partagÃ© (Redis) via `storage_uri` si le volume de trafic l'exige en production.

### Format de rÃ©ponse

Toutes les routes suivent le contrat de la section 8 : `{ "data": ..., "meta": {...} }` pour les listes paginÃ©es, `{ "error": { "code": "...", "message": "..." } }` pour les erreurs (gÃ©rÃ© de faÃ§on centralisÃ©e par `app/middlewares/error_handler.py`, aucune trace technique brute n'est jamais exposÃ©e au client).

## Déploiement Render et migration depuis Aiven

Le Blueprint à la racine crée un MySQL 8 privé avec disque persistant et relie le backend à cette base. Le frontend reste sur Vercel. Les services Render doivent être dans la même région pour communiquer sur le réseau privé.

Après le premier déploiement du Blueprint :

1. Dans Aiven, ouvrez **Overview → Connection information** et récupérez le Service URI exact. Gardez Aiven actif. Si l’hôte DNS ne se résout toujours pas, vérifiez que le service est actif et que l’adresse copiée correspond au point de connexion public.
2. Dans les paramètres du service backend Render, ajoutez `SOURCE_DATABASE_URL` avec ce Service URI comme variable secrète. Ne le mettez ni dans Git ni dans le chat.
3. Mettez temporairement la boutique en pause pendant le transfert pour éviter des commandes sur la nouvelle base.
4. Ouvrez le Shell du backend Render et exécutez `python -m app.db.migrate_data`. La commande copie les tables de l’application vers la nouvelle base, préserve les identifiants et refuse toute cible qui contient déjà des données.
5. Vérifiez les produits, comptes, commandes et stocks sur le site, puis supprimez `SOURCE_DATABASE_URL` des variables Render. Ne supprimez Aiven qu’après validation complète.

Les photos téléchargées sont des fichiers dans `backend/uploads`, pas des données SQL. Le disque Render conserve les prochains téléversements ; les anciens fichiers doivent être copiés séparément ou les photos rechargées depuis l’espace propriétaire.

Dans Vercel, `VITE_API_BASE_URL` doit pointer vers l’URL publique du backend Render suivie de `/api/v1`. Dans Render, `CORS_ORIGINS` doit contenir l’origine exacte du site Vercel (sans chemin), par exemple `https://nom-du-site.vercel.app`.