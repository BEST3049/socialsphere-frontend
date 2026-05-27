# SocialSphere — Frontend

The web app for [SocialSphere](https://github.com/) — a quieter social layer with an editorial dark aesthetic.

Pairs with the API at [socialsphere-backend](https://github.com/).

## Stack

- **Framework** — React 18 + Vite
- **Styling** — TailwindCSS, custom design tokens
- **Routing** — React Router v6
- **State** — Zustand (with `persist`)
- **HTTP** — Axios
- **Motion** — Framer Motion
- **Type** — Inter Tight (UI) + Instrument Serif (editorial display)

## Design

- Deep graphite palette, hairline borders, subtle SVG noise overlay
- Editorial typography pairing (sans + serif italic for display)
- Single warm ember accent used sparingly
- Asymmetric, immersive layouts (not centered dashboard)
- Motion-driven micro-interactions (page transitions, optimistic UI, shared-element transitions)

## Features

- Email + password auth (JWT, persisted)
- Editorial feed with friends-only posts, optimistic likes, inline comments
- Floating cinematic composer with image/video upload and friend tagging
- Profile pages with cover, asymmetric stats, tabs (Posts / Media)
- Friends: search, requests, friend list
- Private 1-to-1 messaging with optimistic send, friend picker for new threads, URL-driven threads

## Getting started

### 1. Clone

```bash
git clone https://github.com/<your-username>/socialsphere-frontend.git
cd socialsphere-frontend
npm install
```

### 2. Configure env

```bash
cp .env.example .env
```

Default `.env`:

```env
VITE_API_URL=/api
```

Keeping `/api` makes the dev server proxy backend calls (works on localhost + LAN out of the box). In production, set it to your deployed backend, e.g. `https://api.example.com/api`.

### 3. Run

```bash
npm run dev
```

App runs at **http://localhost:5173** and is also exposed on your LAN (great for testing on mobile).

## Backend

You'll also need the backend running — see [socialsphere-backend](https://github.com/).

By default, Vite proxies `/api/*` to `http://localhost:5000` (see `vite.config.js`).

## Pages

| Path | Page |
| --- | --- |
| `/login` | Sign in |
| `/register` | Create account |
| `/` | Feed (asymmetric editorial layout) |
| `/profile/:username` | Profile with cover, stats, Posts / Media tabs |
| `/friends` | Search, pending invites, your circle |
| `/messages` | Inbox + thread |
| `/messages/:userId` | Open a specific thread |

## Scripts

```bash
npm run dev      # dev server
npm run build    # production build
npm run preview  # preview built app
```

## Deployment

Designed for **Vercel** (frontend) + **Render** (backend) + **Neon** (Postgres).

- Build command: `npm run build`
- Output directory: `dist`
- Set `VITE_API_URL` to your backend URL + `/api`

## License

MIT
