# 🐾 Cozy Booklet Webpage

A cute, interactive 3D digital booklet webpage featuring animated kittens & puppies, pastel page aesthetics, smooth page-folding animations, and interactive heart bursts.

---

## 🚀 Quick Local Preview

To preview the webpage on your machine:
```bash
python3 -m http.server 8000
```
Then open your browser to: [http://localhost:8000](http://localhost:8000)

---

## 🎨 How to Customize the Text & Story

All the text and messages are located inside `index.html`:
- **Cover Title**: Look for `<h1 class="cover-title">` and edit the booklet name.
- **Story Notes 01 to 05**: Each leaf has a `<p class="page-message">` where you can replace the placeholder text with your own personal memories or letters.
- **Photos**: If you want to include personal photos, place your image in `assets/illustrations/` (e.g. `assets/illustrations/photo1.jpg`) and update the corresponding `<img>` tag in `index.html`.

---

## 🌐 How to Publish to GitHub Pages (With Your Personal Git)

When you're ready to host this online for free:

### Step 1: Create a Repository on GitHub
1. Sign into your **personal GitHub account** on [github.com](https://github.com).
2. Click **New Repository** (e.g., name it `cozy-booklet` or `for-you`).
3. Choose **Public** (required for free GitHub Pages) and do **not** initialize with README or license.

### Step 2: Initialize Git & Commit Locally
Run these commands inside your project folder (`/Users/ayushrawat/Documents/Website`):
```bash
git init -b main
git config user.name "Your Personal GitHub Name"
git config user.email "your-email@example.com"
git add .
git commit -m "Initial commit: Cute cozy booklet"
```

### Step 3: Link & Push
```bash
git remote add origin https://github.com/<your-personal-username>/<repo-name>.git
git push -u origin main
```

### Step 4: Turn on GitHub Pages
1. Go to your repository on GitHub.
2. Click **Settings** > **Pages** (in the left sidebar).
3. Under **Branch**, select `main` and folder `/ (root)`.
4. Click **Save**.

Your webpage will be live in ~60 seconds at:
`https://<your-personal-username>.github.io/<repo-name>/`
