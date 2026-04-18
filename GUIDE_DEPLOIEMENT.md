# 🚀 Guide de déploiement — Nayro Email Agent

## Vue d'ensemble
Tu vas déployer l'agent sur **Vercel** (hébergement gratuit) en connectant ton projet Google Cloud existant.
Durée estimée : **30–40 minutes**

---

## ÉTAPE 1 — Créer un compte GitHub (5 min)

GitHub sert à stocker ton code et le connecter à Vercel.

1. Va sur **https://github.com/signup**
2. Crée un compte avec ton email professionnel
3. Choisis le plan **Free**
4. Vérifie ton email

---

## ÉTAPE 2 — Créer un compte Vercel (3 min)

1. Va sur **https://vercel.com/signup**
2. Clique **"Continue with GitHub"** → connecte ton compte GitHub
3. Choisis le plan **Hobby (gratuit)**

---

## ÉTAPE 3 — Configurer ton projet Google Cloud (10 min)

Tu as déjà un projet Google Cloud. Voici ce qu'il faut activer :

### A. Activer les APIs

1. Va sur **https://console.cloud.google.com**
2. Sélectionne ton projet existant
3. Dans le menu → **"APIs et services"** → **"Bibliothèque"**
4. Recherche et active ces 2 APIs :
   - ✅ **Gmail API**
   - ✅ **Google Calendar API**

### B. Configurer l'écran de consentement OAuth

1. Menu → **"APIs et services"** → **"Écran de consentement OAuth"**
2. Type d'utilisateur : **Externe**
3. Remplis :
   - Nom de l'application : `Nayro Email Agent`
   - Email d'assistance : ton email
   - Logo : optionnel
4. Clique **"Enregistrer et continuer"** (les étapes suivantes peuvent rester vides)
5. Ajoute ton email comme **"Utilisateur test"** (important !)

### C. Créer les identifiants OAuth

1. Menu → **"APIs et services"** → **"Identifiants"**
2. **"+ Créer des identifiants"** → **"ID client OAuth"**
3. Type : **Application Web**
4. Nom : `Nayro Email Agent`
5. Dans **"URI de redirection autorisés"**, ajoute :
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   *(Tu ajouteras l'URL Vercel plus tard)*
6. Clique **Créer**
7. 📋 **Copie et garde précieusement :**
   - `Client ID` → ressemble à `XXXX.apps.googleusercontent.com`
   - `Client Secret` → ressemble à `GOCSPX-XXXXX`

---

## ÉTAPE 4 — Obtenir ta clé API Anthropic (2 min)

1. Va sur **https://console.anthropic.com/keys**
2. Clique **"Create Key"**
3. Nomme-la `Nayro Email Agent`
4. 📋 **Copie la clé** (visible une seule fois) → ressemble à `sk-ant-XXXXX`

---

## ÉTAPE 5 — Préparer les fichiers sur ton PC (5 min)

1. **Dézippe** le fichier `nayro-email-agent.zip` sur ton bureau
2. **Ouvre** le dossier `nayro-email-agent`
3. **Renomme** le fichier `.env.example` en `.env.local`
4. **Ouvre `.env.local`** avec le Bloc-notes et remplis :

```
ANTHROPIC_API_KEY=sk-ant-TA_CLE_ICI
GOOGLE_CLIENT_ID=TON_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-TON_SECRET
NEXTAUTH_SECRET=une_chaine_aleatoire_longue_ex_abc123xyz789
NEXTAUTH_URL=http://localhost:3000
NOTIFICATION_EMAIL=ton-email@gmail.com
```

> Pour `NEXTAUTH_SECRET` : tape n'importe quelle suite de caractères aléatoires (ex: `nayro2024secretkey_xK9mP3qL`)

---

## ÉTAPE 6 — Installer Node.js (si pas déjà fait)

1. Va sur **https://nodejs.org**
2. Télécharge la version **LTS** (bouton vert)
3. Installe-la (tout par défaut)

---

## ÉTAPE 7 — Tester en local (5 min)

1. Ouvre le **Terminal** (Windows : touche Windows → tape "cmd" → Entrée)
2. Navigue vers le dossier :
   ```
   cd Desktop\nayro-email-agent
   ```
3. Installe les dépendances :
   ```
   npm install
   ```
4. Lance l'application :
   ```
   npm run dev
   ```
5. Ouvre **http://localhost:3000** dans ton navigateur
6. Clique "Connexion avec Google" → teste que tout fonctionne

---

## ÉTAPE 8 — Déployer sur Vercel (8 min)

### A. Uploader sur GitHub

1. Va sur **https://github.com/new**
2. Nom du dépôt : `nayro-email-agent`
3. Visibilité : **Privé** ✅
4. Clique **"Create repository"**
5. GitHub va t'afficher des commandes. Dans ton Terminal :
   ```
   git init
   git add .
   git commit -m "Initial deploy"
   git remote add origin https://github.com/TON_USERNAME/nayro-email-agent.git
   git push -u origin main
   ```

### B. Déployer sur Vercel

1. Va sur **https://vercel.com/new**
2. Clique **"Import Git Repository"**
3. Sélectionne `nayro-email-agent`
4. Dans **"Environment Variables"**, ajoute chaque variable de ton `.env.local` :
   - `ANTHROPIC_API_KEY` → ta clé Anthropic
   - `GOOGLE_CLIENT_ID` → ton client ID
   - `GOOGLE_CLIENT_SECRET` → ton client secret
   - `NEXTAUTH_SECRET` → ton secret
   - `NEXTAUTH_URL` → **laisse vide pour l'instant**
   - `NOTIFICATION_EMAIL` → ton email
5. Clique **"Deploy"** → attends 2–3 minutes
6. Vercel te donne une URL du type : `https://nayro-email-agent-xxx.vercel.app`

### C. Finaliser Google Cloud

1. Retourne sur **Google Cloud Console** → Identifiants → ton ID client OAuth
2. Dans **"URI de redirection autorisés"**, ajoute :
   ```
   https://nayro-email-agent-xxx.vercel.app/api/auth/callback/google
   ```
   *(remplace par ton URL Vercel réelle)*
3. Dans Vercel → Settings → Environment Variables, mets à jour :
   ```
   NEXTAUTH_URL = https://nayro-email-agent-xxx.vercel.app
   ```
4. Dans Vercel → **Redeploy** (bouton en haut à droite)

---

## ✅ C'est terminé !

Ton agent est accessible à l'URL Vercel, depuis n'importe quel navigateur, sur PC ou mobile.

**En cas de problème**, contacte-nous avec le message d'erreur exact affiché dans le navigateur.

---

## 📋 Résumé des comptes créés

| Service | URL | Usage |
|---------|-----|-------|
| GitHub | github.com | Stockage du code |
| Vercel | vercel.com | Hébergement (gratuit) |
| Anthropic | console.anthropic.com | Clé API Claude |
| Google Cloud | console.cloud.google.com | Gmail + Calendar |
