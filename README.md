
# 03 — Compose + Swagger UI

Objectif: Ajouter Swagger UI comme sidecar pour documenter l'API.

Points clés:
- Le fichier OpenAPI est monté dans le conteneur Swagger et servi à `/openapi/openapi.yaml`.
- Swagger UI est accessible sur http://localhost:8080
- Le bouton “Try it out” peut être bloqué par CORS (on règle cela à l'étape 04).

Commandes:
- `docker compose up -d`
- Ouvrir http://localhost:8080
- API: `curl http://localhost:5000/health`

[![CI](https://github.com/ThomasSouly1409/dernier-metro/actions/workflows/ci.yml/badge.svg)](https://github.com/ThomasSouly1409/dernier-metro/actions/workflows/ci.yml)

## 🚀 Déploiement Staging

### Lancement
```bash
docker compose -f docker-compose.staging.yml up -d


## 🧱 CI/CD — Intégration Continue

Le projet utilise **GitHub Actions** pour automatiser :

- ✅ Build et tests unitaires sur chaque commit `master`
- 🐘 Démarrage automatique d’un conteneur PostgreSQL pour les tests
- 🐳 Build et push automatique de l’image Docker sur GitHub Container Registry (GHCR)
- 🧩 Scan de sécurité via `npm audit` et `trivy`

### 🔗 Image Docker publique

L’image est disponible ici : ghcr.io/thomassouly1409/dernier-metro-api:latest


### 🧪 Tests de santé

```bash
curl http://localhost:5000/health
# {"status":"ok","service":"dernier-metro-api"}


☁️ Déploiement Staging
Lancement
docker compose -f docker-compose.staging.yml up -d

Vérification
curl http://localhost:5000/health
# Attendu : {"status":"ok"}

curl "http://localhost:5000/last-metro?station=Bastille"