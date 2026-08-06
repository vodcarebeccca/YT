# GuardAI — AI Community Security Platform

Automatically detect **judi online (judol), scam, phishing, spam, toxic behavior & hate speech** before they damage your community. GuardAI scans every message in real time and acts instantly — a moderator that never sleeps.

> 📌 Built to the `PRD.md` specification. **Phase 1 + Phase 2 complete.**

---

## ✅ Phase 1 — what's included

| Module | Status |
|--------|--------|
| **Detection Engine** (the core IP) | ✅ Normalizer (NFKC, zero-width, homoglyph Cyrillic/Greek/Fullwidth→Latin, repeat-collapse), pattern detectors for 5 categories, risk scoring, negation/context handling, action policy — **36 unit tests** |
| **Authentication** | ✅ NextAuth (credentials + JWT), protected routes, demo account |
| **Dashboard** | ✅ Overview (stats + charts), Communities, Moderation Logs (search/filter/paginate/CSV export), Threat Detection playground, Settings |
| **Telegram integration** | ✅ Telegraf bot wired to the engine, 3 protection modes, delete/mute/ban/warn + webhook receiver |
| **Moderation logs** | ✅ Persisted per message + action, with search/filter/export |
| **Landing page** | ✅ Modern SaaS dark/cyber theme, animated AI shield, features, how-it-works, pricing, FAQ |

## ✅ Phase 2 — what's added

| Module | Status |
|--------|--------|
| **AI Classifier** | ✅ Dependency-free Multinomial Naive Bayes — *learns* from 96 labeled Indonesian examples (generalizes beyond keywords), fused into the engine as an optional signal. Optional OpenAI/LLM adapter (native fetch, key-gated). 8 tests |
| **Discord integration** | ✅ `discord.js` bot wired to the same moderation core (delete/timeout/ban/warn), auto-binds guilds |
| **Analytics** | ✅ Dedicated page: 30-day trend, category donut, action distribution, hourly heatmap, top offenders, KPI row |
| **Detection playground v2** | ✅ Rule engine vs AI classifier side-by-side, per-category probability bars, rule-vs-AI risk comparison, AI toggle |

> Phase 3 (premium/billing, advanced AI, marketplace rules) is scoped in `PRD.md`.

---

## 🧠 Detection pipeline

```
Message → Normalizer → Pattern Detectors (gambling/scam/phishing/spam/toxic)
        → Context adjust (negation) → Risk Score (0–100) → Moderation Action
```

**Beats obfuscation:** `jυdі οnlіne` (Cyrillic), `j-u-d-i`, `ｊｕｄｉ` (fullwidth), `gacoooor`, zero-width chars and emoji are all collapsed to canonical ASCII before matching.

**Low false positives:** understands intent — `Jangan percaya link judi itu` → **SAFE**, `Klik link judi ini dapat bonus` → **BLOCK**.

**Three protection modes:** Safe (warn only) · Balanced (delete + warn) · Aggressive (delete + mute + ban).

See `src/lib/detection/` and run `npm test`.

---

## 🛠 Tech stack

- **Frontend:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Recharts
- **Backend:** Node.js · built-in `node:sqlite` (zero-dependency DB; swap layer for PostgreSQL in prod)
- **Auth:** NextAuth (JWT + credentials; OAuth-ready)
- **Bot:** Telegraf (Telegram)
- **Tests:** Vitest

> ⚠️ The sandbox blocks `binaries.prisma.sh` and `fonts.googleapis.com`, so the project uses Node's built-in SQLite (`node:sqlite`) instead of Prisma, and a system font stack instead of Google Fonts. The DB access layer is isolated in `src/lib/db/` so it can be swapped to PostgreSQL/Drizzle without touching the rest of the app.

---

## ⚡ Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

The app auto-seeds a demo community with sample messages on first run.

**Demo login:** `admin@guardai.dev` · `guardai123`

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm test` | Run detection unit tests |
| `npm run db:seed` | (Re)seed demo data |
| `npm run bot` | Run the Telegram bot (long polling) |
| `npm run bot:discord` | Run the Discord bot |

---

## 🤖 Telegram bot

1. Create a bot via [@BotFather](https://t.me/BotFather) → get the token.
2. `TELEGRAM_BOT_TOKEN=... npm run bot` (long polling) **or** set `TELEGRAM_BOT_WEBHOOK_URL` and use `POST /api/telegram/webhook`.
3. Add the bot to your group as admin. New groups auto-bind to your account; configure the protection mode & sensitivity in **Dashboard → Settings**.

When `TELEGRAM_BOT_TOKEN` is unset, the bot module still loads — the web dashboard and detection playground work fully without it.

---

## 📁 Project structure

```
src/
├── app/
│   ├── (landing page, login, register)
│   ├── dashboard/            # overview, communities, logs, detection, settings
│   └── api/                  # auth, detect, communities, logs/export, telegram/webhook
├── components/
│   ├── ui/                   # button, card, badge
│   ├── landing/              # navbar, hero, shield-animation, sections
│   └── dashboard/            # sidebar, stat-card, charts, forms, views
├── lib/
│   ├── detection/            # ⭐ normalize, dictionaries, detector (+ tests)
│   ├── db/                   # sqlite client, schema, repositories
│   ├── auth.ts               # NextAuth config
│   ├── moderation.ts         # engine → DB → action policy bridge
│   └── utils.ts
├── bot/telegram.ts           # Telegraf bot
└── instrumentation.ts        # startup migrate + seed
```

---

## 🔐 Environment

Copy `.env.example` → `.env` and fill in OAuth/bot tokens as needed. Phase 1 runs fully with just `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`.

---

© GuardAI — Phase 1 build.
