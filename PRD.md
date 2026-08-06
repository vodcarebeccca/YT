# PRD.md
# AI Community Security Bot Platform

## 1. Product Overview

### Product Name
(Temporary Name)
**GuardAI - AI Community Security Platform**

### Product Vision
Membangun platform moderasi komunitas berbasis AI yang mampu melindungi komunitas online dari:
- Judi online (judol)
- Scam
- Phishing
- Spam
- Toxic behavior
- Hate speech
- Link berbahaya
- Bot abuse

Platform bekerja sebagai moderator otomatis 24/7 yang dapat terintegrasi dengan komunitas seperti Telegram dan Discord.

---

# 2. Problem Statement

Komunitas online saat ini menghadapi masalah:

1. Spam judi online
- Link slot
- Promosi deposit
- Bonus palsu
- Akun bot

2. Scam dan phishing
- Link login palsu
- Penipuan hadiah
- Fake giveaway

3. Toxic community
- Insult
- Bullying
- Harassment
- Provokasi

4. Beban moderator manusia
- Tidak bisa online 24 jam
- Sulit menangani ribuan pesan

---

# 3. Target User

## Primary User

### Community Owner
Contoh:
- Discord gaming server
- Telegram group
- Komunitas crypto
- Komunitas edukasi
- Forum online

Kebutuhan:
- Komunitas aman
- Mengurangi spam
- Moderasi otomatis

---

# 4. Core Features

# A. Authentication System

## User Registration

Support:
- Email
- Google Login
- Discord OAuth
- Telegram Login

Fitur:
- Email verification
- Forgot password
- Reset password
- Session management

---

# B. Dashboard

Modern dashboard:

Menu:

- Overview
- Communities
- Moderation Logs
- Threat Detection
- Analytics
- Settings
- Billing

Dashboard statistics:

- Total messages scanned
- Threat blocked
- Users banned
- Spam prevented
- Community health score

---

# C. Community Management

User dapat:

Add Community:
- Telegram Bot
- Discord Bot

Community settings:

- Enable/disable protection
- Detection sensitivity
- Auto action level

Protection mode:

1. Safe Mode
- hanya warning

2. Balanced Mode
- delete + warning

3. Aggressive Mode
- delete + mute + ban


---

# D. AI Threat Detection System

## Detection Categories


## 1. Online Gambling Detection

Detect:

Keywords:
- judi
- slot
- gacor
- maxwin
- jackpot
- deposit
- bonus
- withdraw
- scatter

Patterns:

Example:

Normal:
```
daftar sekarang bonus besar
```

Obfuscated:
```
j u d i
j.u.d.i
jυdι
jυdі
judi123
j-u-d-i
judi🔥🔥
```

---

# Unicode / Character Bypass Detection

System harus melakukan text normalization.


## Normalize Pipeline:

Input:

```
jυdі οnlіne
```

↓

Convert:

- Unicode normalization NFKC
- Remove invisible characters
- Remove zero width characters
- Convert homoglyph characters


Examples:

Replace:

Cyrillic:
```
а -> a
е -> e
о -> o
і -> i
```

Greek:
```
ο -> o
υ -> u
```

Fullwidth:
```
ｊｕｄｉ
```

becomes:

```
judi
```


---

# 2. Scam Detection

Detect:

- fake giveaway
- fake admin
- investment scam
- impersonation

Example:

"Admin asli kasih hadiah klik link"

Detection:
HIGH RISK


---

# 3. Phishing Detection

Check:

- suspicious URL
- shortened URL
- fake login page
- suspicious domain


Features:

- URL reputation check
- Domain age check
- Keyword analysis


---

# 4. Spam Detection

Detect:

- repeated messages
- flooding
- mass tagging
- copy paste spam
- excessive links


---

# 5. Toxic Language Detection Indonesia

Categories:

## Insult

Examples:
- bodoh
- tolol
- idiot
- goblok


## Harassment

Examples:
- ancaman
- hinaan personal


## Hate Speech

Detection:
- targeted attacks
- discrimination


## Sexual harassment

Detection:
- unwanted sexual comments


System harus memahami konteks:

Example:

Allowed:
"Jangan jadi toxic"

Not toxic.

---

# E. Moderation Actions


Automatic actions:

## Delete Message

When:
Risk score > threshold


## Warning

Send:

"Pesan kamu terdeteksi melanggar aturan komunitas."


## Mute User

Duration:
- 5 menit
- 1 jam
- 24 jam


## Ban User

For:
- repeated abuse
- malicious spam bot


## Report

Send report ke admin.


---

# F. AI Context Understanding

System tidak hanya keyword.

Harus memahami:

Example:

Message:
"Jangan percaya link judi itu"

Action:
SAFE


Message:
"Klik link judi ini dapat bonus"

Action:
BLOCK


---

# G. Moderation Logs

Save:

- Message
- User
- Detection category
- Risk score
- Action taken
- Timestamp


Admin dapat:

- Search
- Filter
- Export


---

# H. Analytics

Dashboard:

Charts:

- Threat detected daily
- Most common attack
- Top spam users
- Community safety score


---

# I. Landing Page


Design:

Modern:
- Clean
- Minimal
- Premium SaaS style


Theme:

Cyber security + AI


## Hero Section

Headline:

"Protect Your Community With AI-Powered Moderation"


Subtitle:

"Automatically detect spam, scams, gambling, toxic behavior and threats before they damage your community."


CTA:

Primary:
"Start Protecting Community"

Secondary:
"View Demo"


---

# Hero Animation

Required:

Create modern animation:

Elements:

- AI shield
- Floating security particles
- Message bubbles being scanned
- Threat messages blocked
- Green security confirmation


Animation style:

- Smooth
- Premium SaaS
- Lightweight


Use:

- Framer Motion
- Three.js (optional)


---

# Landing Page Sections


## Features

Cards:

- AI Threat Detection
- Anti Gambling Protection
- Anti Scam
- Toxic Filter
- Smart Moderation


## How It Works

Step:

1. Connect community
2. AI scans messages
3. Threat removed automatically


## Dashboard Preview

Show screenshots/mockup.


## Pricing


Free:

- 1 community
- Basic detection


Pro:

- Unlimited communities
- Advanced AI
- Analytics


Business:

- Large communities


## FAQ


---

# UI/UX Requirements

Style:

Modern SaaS.

Reference:

- Linear
- Vercel
- Stripe


Requirements:

- Responsive
- Dark mode
- Mobile friendly
- Smooth animation
- Fast loading


Colors:

Primary:
Dark blue / black

Accent:
AI cyan


---

# Technical Requirements


Frontend:

Recommended:

- Next.js
- TypeScript
- Tailwind CSS
- Framer Motion


Backend:

- Node.js
- PostgreSQL
- Redis


Authentication:

- NextAuth


AI Layer:

Support:

- Local models
- API models


Architecture:

Detection pipeline:

Message
↓
Normalizer
↓
Pattern Detector
↓
AI Classifier
↓
Risk Score
↓
Moderation Action


---

# Security Requirements

Must include:

- Rate limiting
- API protection
- User permission system
- Audit logs
- Data encryption


---

# Future Features

## AI Moderator Personality

Custom rules:

Example:

"Be strict against gambling."

## Multi-language Support

Languages:
- Indonesia
- English
- Malay


## Marketplace

Allow community owners to share moderation rules.


---

# Success Metrics

After launch:

Month 1:
- 100 communities

Month 6:
- 1000 communities

Target:

Low false positive rate:
<5%

Detection accuracy:
>90%


---

# Development Priority

Phase 1:
- Authentication
- Dashboard
- Telegram integration
- Basic detection
- Moderation logs


Phase 2:
- Discord integration
- AI classifier
- Analytics


Phase 3:
- Premium system
- Advanced AI
- Marketplace rules


END OF PRD