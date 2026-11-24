# Devis : n8n et Gotenberg

L'app Next.js gère les données. n8n génère le PDF (Gotenberg), envoie les mails et relance.

## 1. Configurer l'app

Depuis la racine du projet, compléter `.env` avec le bloc « Devis » de `.env.example`.
Générer trois secrets différents avec `openssl rand -hex 32` : `QUOTE_PRINT_SECRET`, `N8N_WEBHOOK_SECRET`, `N8N_API_KEY`.

```bash
npx prisma migrate deploy && npx prisma generate
npm run dev
```

Puis remplir `/admin/devis/reglages` : l'envoi est bloqué tant que l'émetteur est incomplet.

## 2. Lancer les services

```bash
cd n8n
cp .env.example .env      # renseigner N8N_ENCRYPTION_KEY
docker compose --profile dev up -d
```

| Service | Adresse locale |
|---|---|
| n8n | http://localhost:5678 |
| Gotenberg | http://localhost:3002 |
| Mailpit (mails de test) | http://localhost:8025 |

**Le port 5678 est déjà pris ?** Changer `N8N_PORT` (et `WEBHOOK_URL`) dans `n8n/.env`, ainsi que le port des deux `N8N_WEBHOOK_*_URL` de l'app. Éviter 5679, utilisé par n8n en interne.

**n8n tourne déjà hors de Docker ?** Lancer seulement `docker compose --profile dev up -d gotenberg mailpit`, puis dans le nœud `Config` : `appUrl` = `http://localhost:3000` et `gotenbergUrl` = `http://localhost:3002`. Garder `APP_INTERNAL_URL=http://host.docker.internal:3000`, car Gotenberg reste dans Docker. SMTP de test : `localhost:1025`.

## 3. Créer les credentials n8n

| Nom | Type | Contenu |
|---|---|---|
| `Portfolio API` | Header Auth | Name `Authorization`, Value `Bearer <N8N_API_KEY>` |
| `Portfolio HMAC` | Crypto | Hmac Secret = `N8N_WEBHOOK_SECRET` |
| `Portfolio SMTP` | SMTP | En local : hôte `mailpit`, port `1025`, sans utilisateur, SSL désactivé, STARTTLS désactivé |

## 4. Importer les workflows

1. Importer `workflow-send-quote.json` et `workflow-quote-accepted.json` (*Import from File*).
2. Sélectionner le credential dans chaque nœud signalé.
3. Dans le nœud `Config` de chaque workflow, régler `appUrl`, `fromEmail` et `ownerEmail` (plus `gotenbergUrl` pour l'envoi).
4. Publier les deux workflows. Les URL `/webhook/` ne répondent qu'une fois publiées.

## 5. Tester de bout en bout

1. Créer un client, une prestation, puis un devis.
2. « Envoyer au client » : le devis passe à « envoi en cours », puis « envoyé » (recharger la page).
3. Ouvrir le mail dans Mailpit : PDF joint et lien public.
4. Accepter depuis le lien : le devis passe à « accepté » et une notification arrive.
5. Pour tester les relances, passer provisoirement les deux nœuds `Attendre` à quelques secondes.

## En cas de problème

- **« envoi en cours » qui dure** : consulter les exécutions n8n. Après 10 minutes, l'admin propose de relancer ou d'annuler. Vérifier d'abord que le mail n'est pas parti.
- **PDF refusé ou page 404** : `APP_INTERNAL_URL` doit être joignable depuis Gotenberg. Sous Linux, l'app doit écouter sur `0.0.0.0`.
- **401 du webhook** : secrets différents, ou horloges décalées de plus de 5 minutes.

## VPS

- Servir l'app et n8n en HTTPS derrière un reverse proxy ; utiliser les variables « VPS » de `n8n/.env.example`. Ne pas exposer Gotenberg.
- `APP_PUBLIC_URL` et `APP_INTERNAL_URL` : l'URL HTTPS du site ; `appUrl` du nœud `Config` aussi.
- **Le proxy doit écraser l'en-tête d'IP**, sinon l'IP du signataire est falsifiable, et le port de l'app ne doit pas être accessible directement. Nginx : `proxy_set_header X-Real-IP $remote_addr;`
- Sauvegarder Postgres (il contient les PDF), le volume `n8n_data` et `N8N_ENCRYPTION_KEY`.
- Les PDF des devis refusés, expirés ou remplacés sont supprimés un an après l'envoi, à la réception d'un nouveau PDF. Ceux des devis acceptés sont conservés.
