# Firebase Setup Guide

This SOP Builder uses Firebase Authentication for secure email/password login.
Follow these steps to connect your own Firebase project.

---

## Step 1 — Create a Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project**
3. Name it (e.g., `sop-builder`)
4. Disable Google Analytics (not needed) → **Create project**

---

## Step 2 — Enable Email/Password Authentication

1. In your Firebase project, click **Authentication** in the left sidebar
2. Click **Get started**
3. Under **Sign-in method**, click **Email/Password**
4. Toggle **Enable** to ON
5. Click **Save**

---

## Step 3 — Register Your Web App

1. In the Firebase console, click the **gear icon** → **Project settings**
2. Under **Your apps**, click **</>** (web icon)
3. Name it (e.g., `SOP Builder Web`)
4. Click **Register app**
5. Copy the `firebaseConfig` object shown — you'll need it in the next step

It looks like this:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## Step 4 — Add Your Config to the App

Open **both** of these files and replace the placeholder `firebaseConfig` block:

- `sop-app/index.html` (line ~175)
- `sop-app/app.html` (line ~280)

Replace this:
```javascript
const firebaseConfig = {
    apiKey:            "YOUR_API_KEY",
    authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
    projectId:         "YOUR_PROJECT_ID",
    storageBucket:     "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId:             "YOUR_APP_ID"
};
```

With your actual values from Step 3.

---

## Step 5 — Add Your Domain to Authorized Domains

1. In Firebase Console → **Authentication** → **Settings** tab
2. Under **Authorized domains**, click **Add domain**
3. Add your domain (e.g., `yourdomain.com`)
4. Also add `localhost` if testing locally

---

## Step 6 — Deploy

Upload the `sop-app/` folder to your domain host (Netlify, Vercel, GitHub Pages, etc.).

The app will be live at: `https://yourdomain.com/`

---

## How It Works

| File | Purpose |
|------|---------|
| `index.html` | Login, Register, Forgot Password |
| `app.html` | Protected SOP Builder (redirects to login if not signed in) |

- Users register with email + password
- Firebase sends a verification flow automatically
- Each user's SOPs are stored in **their own browser's localStorage**, scoped to their user ID
- Signing out clears the session; signing in on a new device starts fresh

---

## Optional — Enable Password Reset Email Template

In Firebase Console → **Authentication** → **Templates**

You can customize the password reset email with your branding (logo, colors, name).

---

## Optional — Restrict Sign-ups

If you want to limit who can create accounts:

1. Firebase Console → **Authentication** → **Settings**
2. Disable **User account creation** after you've created accounts for your users
3. Users can still log in, but no new registrations will be allowed

---

## Free Tier Limits (Firebase Spark Plan)

| Feature | Free Limit |
|---------|-----------|
| Authentication | Unlimited users |
| Email/password auth | Free |
| Storage (SOPs in localStorage) | Browser-local, no Firebase cost |

The free tier is more than sufficient for this use case.
