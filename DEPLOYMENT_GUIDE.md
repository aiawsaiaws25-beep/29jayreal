# Project Deployment Guide: GitHub & Vercel

Use this quick-reference guide for this project or any future web applications.

---

## 1. Always Set Up `.gitignore` First

Before running `git add`, create a `.gitignore` to avoid leaking secrets or committing heavy folders:

```gitignore
node_modules/
dist/
dist-ssr/
build/
.env
.env.*
!.env.example
.DS_Store
Thumbs.db
```

---

## 2. Push to GitHub (First Time Setup)

```bash
# 1. Initialize Git and set main branch
git init
git branch -M main

# 2. Set author identity (if not configured globally)
git config user.name "YourGitHubUsername"
git config user.email "your-email@users.noreply.github.com"

# 3. Stage and commit
git add .
git commit -m "Initial commit"

# 4. Link to empty GitHub repository and push
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

---

## 3. Vercel Configuration (`vercel.json`)

To prevent 404 errors on browser refresh for single page applications (Vite, React, Vue), keep this `vercel.json` in your project root:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "cleanUrls": true,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 4. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and click **"Add New..."** → **"Project"**.
2. Select your GitHub repository and click **"Import"**.
3. Choose framework **Vite** (Build: `npm run build`, Output: `dist`).
4. If your project uses environment secrets (e.g. `DATABASE_URL`), paste them under **Environment Variables**.
5. Click **Deploy**.

---

## 5. Ongoing Updates (Future Changes)

Whenever you make updates to the code, simply run:

```bash
git add .
git commit -m "Describe your update"
git push origin main
```

Vercel will detect the push to `main` and deploy the changes automatically within seconds!
