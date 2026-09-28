# ☕ Cafe Aura — Enterprise Admin Panel

Production-ready Admin Portal for **Cafe Aura** built with **Next.js (App Router), TypeScript, Tailwind CSS, Firebase Authentication, Firestore Database, Firebase Storage, and Granular RBAC**.

---

## 🌟 Key Features

- 🔐 **Authentication & Security**: Email/Password + Google OAuth 2.0 through Firebase Auth, password recovery, session persistence, protected route guards, and zero exposed private keys.
- 🛡️ **Granular RBAC (7 Roles)**: Super Admin, Admin, Manager, Menu Manager, Staff Manager, Staff, Viewer.
- 📊 **Executive Dashboard**: Real-time KPI summary cards, quick action shortcuts, recent menu additions, and activity feeds.
- 🍽️ **Menu Management**: Full CRUD, category filtering, search, dietary/allergen tags, price & promotional discount calculator, preparation time, and image upload.
- 📂 **Categories**: Sorting, active toggle, and smart deletion guards (prevents deleting categories with active dishes).
- 👥 **Staff Directory**: Employee IDs, department, shifts, status (Active / On Leave / Inactive), emergency contacts, and role assignments.
- 👤 **User & Access Control**: Manage administrative accounts, OAuth providers, and prevent privilege self-escalation.
- 📜 **Audit Logs**: Immutable log tracking administrator actions, resource IDs, and timestamps.
- ⚙️ **Cafe Settings**: Business details, 7-day opening hours schedule, and website promotional banners.
- 🧪 **Interactive Demo Mode**: Works out of the box with rich seeded mock data, with seamless live transition once Firebase keys are provided in `.env.local`.

---

## 🚀 Getting Started

### 1. Installation
```bash
cd admin
npm install
```

### 2. Environment Setup (Optional for Live Firebase)
Create `.env.local` based on `.env.example`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=cafe-aura.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=cafe-aura
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=cafe-aura.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```
*(If no `.env.local` is provided, the panel automatically boots in high-fidelity Interactive Demo Mode with role switching).*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the Admin Panel.

---

## 🔒 Firebase Security Rules
Deploy `firestore.rules` and `storage.rules` to your Firebase project:
```bash
firebase deploy --only firestore:rules,storage:rules
```

---

## 🏗️ Production Build & Deployment (Vercel)
```bash
npm run build
```
Deploy directly to Vercel with your Firebase environment variables configured.
