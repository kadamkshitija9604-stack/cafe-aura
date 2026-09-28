# ☕ Cafe Aura — Full-Stack Platform & Admin Dashboard

A modern, high-performance web experience for **Cafe Aura**, featuring an immersive customer-facing lounge frontend paired with an enterprise-ready management dashboard.

---

## 🌟 Architecture & Tech Stack

| Module | Purpose | Stack |
| :--- | :--- | :--- |
| **Client Frontend** | Interactive customer website, dynamic menu, reservations, and storytelling | React 19, Vite, GSAP Animations, Vanilla CSS |
| **Admin Dashboard** | Staff management, orders, reservations, menu editor, and audit logs | Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons, React Hook Form, Zod |
| **Backend / Database** | Data persistence, role-based auth, real-time sync | PostgreSQL / Neon DB, Firebase Auth & Storage |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.x or v20.x+
- **npm** (or `pnpm` / `yarn`)

### 2. Installation

Clone the repository and install dependencies for both the root project and the admin dashboard:

```bash
# Clone the repository
git clone https://github.com/kadamkshitija9604-stack/cafe-aura.git
cd cafe-aura

# Install root dependencies
npm install

# Install admin dashboard dependencies
cd admin
npm install
cd ..
```

### 3. Environment Configuration

Copy example environment configurations:

```bash
# Root client config
cp .env.example .env

# Admin dashboard config
cp admin/.env.example admin/.env.local
```

Fill in your Firebase credentials and PostgreSQL database connection strings in `admin/.env.local`.

### 4. Running the Development Servers

```bash
# Run customer frontend (port 5173 by default)
npm run dev

# Run admin dashboard (port 3000)
npm run dev:admin

# Or run both simultaneously
npm run dev:all
```

---

## 🌿 GitHub Flow & Branching Strategy

To maintain code quality and continuous delivery, follow this structured Git workflow:

```text
main (Production)
  ▲
  │ (Pull Request via CI checks & Code Review)
staging / develop
  ▲
  │ (Feature branches)
feature/menu-customization
fix/reservation-date-picker
```

### Flow Guidelines:
1. **Branch Naming**:
   - `feature/<feature-name>`: For new features (e.g. `feature/order-tracking`)
   - `fix/<bug-name>`: For bug fixes (e.g. `fix/auth-redirect`)
   - `chore/<task>`: For maintenance / dependency updates
2. **Pull Requests (PR)**:
   - Create PRs targeting `main` (or `develop`).
   - GitHub Actions automatically runs automated linting, type checks, and build validation.
3. **Review & Merge**:
   - Verify CI pass status before merging.
   - Use **Squash and Merge** or **Rebase and Merge** for clean commit history.

---

## 🚢 Deployment Guide

### Option 1: Vercel (Recommended for Next.js Admin & Vite Frontend)

#### Deploying Admin Dashboard (`/admin`):
1. Import repository on [Vercel](https://vercel.com).
2. Set **Root Directory** to `admin`.
3. Framework Preset: **Next.js**.
4. Configure environment variables (`DATABASE_URL`, `NEXT_PUBLIC_FIREBASE_*`).
5. Deploy!

#### Deploying Customer Frontend (Root):
1. Import repository as a separate Vercel Project.
2. Root Directory: `./` (Root).
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Deploy!

---

### Option 2: Docker / Container Deployment
Build standalone production bundles using:
```bash
# Build customer client
npm run build

# Build admin dashboard
npm run build:admin
```

---

## 🔒 Security Best Practices
- Keep `.env` and `.env.local` files uncommitted.
- Ensure Firestore & Database security rules are deployed using `firebase deploy --only firestore:rules,storage`.
- Rotate API tokens regularly.
