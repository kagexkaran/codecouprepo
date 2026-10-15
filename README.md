<p align="center">
  <img src="https://jprlwyfffibucbebkebp.supabase.co/storage/v1/object/public/codecoup/icnons/LOGO.png" alt="CardCouple Logo" width="120" height="120" style="border-radius: 12px;" />
</p>

<h1 align="center">CARDCOUPLE</h1>

<p align="center">
  <strong>A little card for every kind of love.</strong><br />
  A retro 8-bit pixel-art trading card game and interactive sync app designed specifically for couples.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-6.0-646cff?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Supabase-Auth_%26_Storage-3ecf8e?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
</p>

---

## 🌟 Highlights & Features

- 🃏 **Couple Card Decks**: Collect and play playful romantic cards tailored for couples:
  - **Game Card** – Game night and playtime pass
  - **Sleep Card** – Nap pass or bedtime story demand
  - **Time Card** – Quality undivided time & date night
  - **Peace Card** – Silence settles all arguments for the day
  - **18+ Card** – Spicy romantic dares and surprises
  - **Surprise Card** – Handmade or thoughtful surprise gift
  - **Anything Card** – Custom wish redemption
  - **Cash Card** – Treat or mini shopping pass
- 🔗 **Real-Time Partner Pairing**: Connect seamlessly using a unique 6-character partner code or in-app request flow.
- 💌 **Card Gifting & Task Fulfillment**: Send action cards directly to your partner with customizable prompt options. Partners can view active cards and complete them in real time.
- 🪙 **Daily Streaks & Shop Economy**: Earn daily coins, maintain your connection streak, and purchase booster packs or special cards from the rotating retro shop.
- 🔊 **Arcade Audio FX**: Embedded nostalgic 8-bit sound effects synthesized with Web Audio API (with toggleable mute controls).
- ☁️ **Cloud Sync & Guest Mode**: Play instantly as a guest with local storage or authenticate with Supabase for persistent cross-device syncing.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React Icons
- **Backend & API**: Express, Vite middleware mode, TSX
- **Database & Storage**: Supabase (Auth, User Metadata, and Storage bucket for card assets) + Local JSON fallback store
- **Audio Engine**: Native HTML5 Web Audio API synthesizer

---

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` or `pnpm` or `yarn`

### 2. Clone the Repository

```bash
git clone https://github.com/your-username/cardcouple.git
cd cardcouple
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Copy the example environment configuration:

```bash
cp .env.example .env
```

Open `.env` and fill in your Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# App URL
APP_URL=http://localhost:3000
```

> **Note:** If you run the app without Supabase credentials, it will run in offline/guest mode with full local persistence.

### 5. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Build for Production

To create a production-ready bundle and build the Express server:

```bash
npm run build
```

To run the production server:

```bash
npm start
```

---

## 📁 Project Structure

```text
├── data/                  # Local pairing runtime data (git-ignored)
├── public/                # Static assets & icons
├── server/                # Express backend & pairing API
│   ├── pairingApi.ts      # REST API endpoints for couple sync
│   └── pairingStore.ts    # Server-side persistence handler
├── src/
│   ├── components/        # Modular UI components
│   │   ├── AuthScreen.tsx # Supabase Login / Register modal
│   │   ├── CardView.tsx   # Detailed card display & actions modal
│   │   ├── Collection.tsx # User's unlocked card inventory
│   │   ├── Couple.tsx     # Partner deck, active tasks & gift inbox
│   │   ├── Dashboard.tsx  # Main stats, streak counter & quick actions
│   │   ├── Navigation.tsx # Retro tab bar
│   │   ├── Onboarding.tsx # First-time profile & gender selection
│   │   ├── PairingSection # Linking & invitation interface
│   │   ├── Settings.tsx   # Audio toggle, profile editor, data reset
│   │   └── Shop.tsx       # Coin marketplace & card booster shop
│   ├── lib/               # Utilities
│   │   ├── audio.ts       # 8-bit sound effects synthesizer
│   │   ├── supabase.ts    # Supabase client & storage helpers
│   │   └── usePairingSync # Real-time polling & state sync hook
│   ├── App.tsx            # Main application layout & state machine
│   ├── data.ts            # Card definitions, rarities & avatars
│   └── types.ts           # TypeScript interfaces & types
├── index.html             # HTML entry point with metadata & favicon
├── package.json           # Scripts & project dependencies
├── server.ts              # Fullstack Express + Vite server entrypoint
├── tsconfig.json          # TypeScript compiler configuration
└── vite.config.ts         # Vite bundler & Tailwind CSS configuration
```

---

## 🔒 Security & Privacy

- **No Secrets in Code**: All API keys and project endpoints are loaded strictly through environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`).
- **Protected User Data**: Pairing data and active user session states are isolated; runtime database files (`data/*.json`) and environment secrets (`.env`) are strictly ignored via `.gitignore`.
- **Public CDN Assets**: Card and profile avatar illustrations are served securely via public CDN URLs with `referrerPolicy="no-referrer"` protection.

---

## 📄 License

This project is licensed under the MIT License - feel free to use and customize it for personal or couple use!
