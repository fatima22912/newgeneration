# New Generation — Backend

API REST FastAPI pour la plateforme New Generation (visiteur, propriétaire, administrateur). Voir le README racine pour la vue d'ensemble du monorepo.

## Lancement en local

### 1. Base de données

Deux options :

- **XAMPP (MariaDB)** : démarrer MySQL depuis le panneau de contrôle XAMPP, puis créer la base :
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
# éditer .env : DATABASE_URL, JWT_SECRET_KEY notamment
```

### 3. Migrations

```bash
.venv\Scripts\python -m alembic upgrade head
```

### 4. Premier compte administrateur

Aucun compte n'est créé par une seed. Le tout premier administrateur est créé via un script interactif (jamais de mot de passe par défaut) :

```bash
.venv\Scripts\python -m app.db.init_db
```

Le script refuse de s'exécuter si un administrateur existe déjà. Les comptes propriétaire, eux, ne peuvent **jamais** être créés par un script : uniquement par un administrateur depuis `POST /api/v1/accounts/owners` une fois connecté.

### 5. Lancer le serveur

```bash
.venv\Scripts\uvicorn app.main:app --reload
```

Documentation interactive : http://127.0.0.1:8000/docs

### 6. Tests

```bash
.venv\Scripts\pytest -q
```

Les tests tournent contre une base SQLite en mémoire (isolée de la base de développement) et désactivent le rate limiting via `RATE_LIMITING_ENABLED=false` pour ne pas polluer les résultats entre tests indépendants.

## Choix d'architecture

### Authentification (JWT)

- **Access token** : JWT courte durée (15 min par défaut), renvoyé dans le corps JSON de la réponse de connexion. Le frontend le garde en mémoire (jamais en `localStorage`), pour limiter l'exposition en cas de faille XSS.
- **Refresh token** : JWT plus longue durée (7 jours), posé dans un cookie `HttpOnly` + `SameSite=Lax` (+ `Secure` en production via `REFRESH_COOKIE_SECURE=true`), donc jamais accessible en JavaScript. `POST /api/v1/auth/refresh` le lit depuis le cookie et fait tourner (rotation) un nouveau refresh token à chaque appel.
- Deux routes de connexion distinctes (`/auth/owner/login`, `/auth/admin/login`) : chacune vérifie explicitement le rôle attendu, empêchant un propriétaire de se connecter sur l'espace admin et inversement.
- Verrouillage de compte : `failed_login_attempts` / `locked_until` sur `users`, seuils configurables (`MAX_FAILED_LOGIN_ATTEMPTS`, `ACCOUNT_LOCK_MINUTES`).
- `require_role()` (`app/core/dependencies.py`) est appliqué sur **chaque** route sensible côté backend — jamais de contrôle d'accès reposant uniquement sur le frontend.

### Commandes

- Numéro de commande public au format `NG-<année>-<compteur 6 chiffres>` (`app/utils/order_number_generator.py`).
- Décrément de stock atomique : `POST /orders` verrouille chaque ligne de `product_variants` concernée (`SELECT ... FOR UPDATE`) dans une transaction, pour empêcher la survente en cas de commandes simultanées. En cas de stock insuffisant, la transaction entière est annulée (409 `insufficient_stock`).
- Suppression d'un produit : suppression physique s'il n'a jamais été commandé, sinon désactivation logique (`is_active = false`) pour préserver l'historique des ventes.

### Déviation documentée du schéma (section 4 du cahier des charges)

- **`orders.payment_method`** (ENUM `wave` / `orange_money` / `cash_on_delivery`) : champ ajouté car la boutique utilise déjà de vrais moyens de paiement (Wave, Orange Money) en plus du paiement en boutique. Aucune passerelle de paiement en ligne n'est intégrée pour l'instant (prévu comme évolution future) : ce champ capture uniquement l'intention du client au moment de la commande, réconciliée manuellement par le propriétaire.
- **`PATCH /accounts/owners/{id}/enable`** : la section 8 ne liste que `/disable`, mais la section 5.3 demande explicitement une gestion "désactivation/**réactivation**". La route symétrique a donc été ajoutée.
- **`GET /products/{id}`** accepte un ID numérique **ou** un slug produit. Le catalogue public utilise des URLs lisibles (`/produits/mon-produit`) via le champ `products.slug` déjà prévu par le schéma — la route reste compatible avec un ID numérique pour les usages internes (édition, suppression).

### Comptes propriétaire

Créés exclusivement par un administrateur (`POST /api/v1/accounts/owners`). Un mot de passe temporaire à forte entropie est généré côté serveur et renvoyé **une seule fois** dans la réponse JSON (`temporary_password`) — jamais journalisé, jamais renvoyé à nouveau ensuite. L'admin le transmet au propriétaire par un canal hors bande (téléphone, en personne).

### Validation des uploads

Les images produit sont validées à deux niveaux : taille maximale (`MAX_UPLOAD_SIZE_MB`) et **type MIME réel**, lu depuis les octets du fichier (magic bytes, librairie `filetype`) — jamais depuis l'extension ou le `Content-Type` déclaré par le client.

### Rate limiting

`slowapi`, backend mémoire, appliqué sur les routes d'authentification et de contact (`/auth/*/login`, `/contact`). Point d'extension documenté : brancher un backend partagé (Redis) via `storage_uri` si le volume de trafic l'exige en production.

### Format de réponse

Toutes les routes suivent le contrat de la section 8 : `{ "data": ..., "meta": {...} }` pour les listes paginées, `{ "error": { "code": "...", "message": "..." } }` pour les erreurs (géré de façon centralisée par `app/middlewares/error_handler.py`, aucune trace technique brute n'est jamais exposée au client).


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

### Récupération exceptionnelle du compte administrateur

Si le mot de passe administrateur est perdu et que le shell Render n’est pas disponible :

1. Déployez le backend avec cette version du code. Le démarrage applique automatiquement la migration qui permet de marquer le jeton comme utilisé.
2. Dans **Render → service `new-generation-backend` → Environment**, ajoutez `ADMIN_RECOVERY_TOKEN` avec une valeur aléatoire d’au moins 32 caractères. Par exemple, dans PowerShell local : `$recoveryToken = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))`. Ne publiez pas cette valeur.
3. Laissez Render redéployer le backend. Ouvrez ensuite `https://<url-du-backend>/docs`, développez `POST /api/v1/auth/admin/recover-password`, puis **Try it out**. Saisissez l’adresse e-mail du compte admin et un nouveau mot de passe d’au moins 12 caractères. Dans le champ `X-Admin-Recovery-Token`, collez la valeur de `ADMIN_RECOVERY_TOKEN`, puis exécutez la requête.
4. Après la réponse de succès, supprimez immédiatement `ADMIN_RECOVERY_TOKEN` des variables Render et redéployez. La route redevient indisponible. Le jeton ne peut aussi réussir qu’une seule fois, même avant sa suppression.

Cette route ne renvoie jamais le mot de passe ni le jeton. Elle réinitialise aussi le verrouillage du compte et journalise l’action. Gardez le jeton secret et ne le mettez ni dans Git ni dans le chat.
