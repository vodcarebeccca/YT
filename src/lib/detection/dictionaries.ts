/**
 * Detection dictionaries.
 *
 * Curated for Indonesian + English community moderation.
 * Each term is matched against the *normalized* text so obfuscation is
 * already collapsed (e.g. "g4c0r" → "gacor" handled by normalizer + leet map).
 *
 * Weights are tuned so a single strong term is meaningful but a clean message
 * with one incidental weak term doesn't get nuked (controls false positives).
 */

export interface Term {
  /** Lowercase ASCII term to match (against normalized text). */
  t: string;
  /** Weight 0..1 — how damning a match is. */
  w: number;
}

// ---------------- Gambling (judol) ----------------
export const GAMBLING_TERMS: Term[] = [
  // Strong / unambiguous (single match is highly indicative)
  { t: "judi", w: 0.9 },
  { t: "judol", w: 0.95 },
  { t: "slot", w: 0.55 },
  { t: "gacor", w: 0.9 },
  { t: "maxwin", w: 0.9 },
  { t: "jackpot", w: 0.7 },
  { t: "scatter", w: 0.6 },
  { t: "taruhan", w: 0.7 },
  { t: "togel", w: 0.9 },
  { t: "casino", w: 0.8 },
  { t: "poker", w: 0.5 },
  { t: "bola online", w: 0.7 },
  { t: "bandar", w: 0.45 },
  { t: "bookie", w: 0.7 },
  { t: "betting", w: 0.6 },
  { t: "slot88", w: 0.85 },
  { t: "pragmatic", w: 0.4 },
  { t: "pgsoft", w: 0.5 },
  { t: "habanero", w: 0.4 },
  // Medium (need co-occurrence to be conclusive)
  { t: "deposit", w: 0.35 },
  { t: "withdraw", w: 0.35 },
  { t: "wd", w: 0.25 },
  { t: "bonus", w: 0.25 },
  { t: "daftar", w: 0.2 },
  { t: "rtp", w: 0.4 },
  { t: "linktree", w: 0.3 },
];

// ---------------- Scam ----------------
export const SCAM_PATTERNS: { re: RegExp; w: number; label: string }[] = [
  // Fake giveaway / prize
  { re: /(selamat|congratulation|menang|menangkan|get\s+(free|reward|hadiah|prize|bonus))[\s\S]{0,40}(hadiah|prize|reward|bonus|giveaway|iphone|saldo|duit|uang|crypto|token|airdrop)/i, w: 0.8, label: "fake giveaway" },
  // Urgency + claim link
  { re: /(klaim|claim|ambil|cepat|sekarang|buruan|limited|terbatas)[\s\S]{0,40}(link|klik|click|dm|chat|wa|wa\.me|hubungi)/i, w: 0.7, label: "urgency + claim" },
  // Investment / multiply money
  { re: /(investasi|invest|modal|duit\b|uang\b)[\s\S]{0,40}(berkali|kali lipat|double|kalikan|profit|keuntungan|kembalian|jaminan)/i, w: 0.75, label: "investment scam" },
  // Fake admin / impersonation
  { re: /(admin|staff|cs|costumer\s*service|moderator)[\s\S]{0,40}(asli|resmi|official|pusat|verified|verifikasi)/i, w: 0.8, label: "fake admin" },
  { re: /(saya\s+(admin|staff|cs|moderator))|(admin\s+(asli|resmi))/i, w: 0.85, label: "impersonation" },
];

// ---------------- Phishing (URLs / domains) ----------------
// Shorteners + suspicious TLDs + fake-login cues.
export const URL_SHORTENERS = [
  "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd",
  "buff.ly", "rebrand.ly", "cutt.ly", "shorturl.at", "s.id", "tiny.cc",
];

export const SUSPICIOUS_TLDS = [
  ".xyz", ".top", ".click", ".link", ".tk", ".ml", ".ga", ".cf",
  ".gq", ".work", ".review", ".country", ".stream", ".live", ".buzz",
];

export const PHISHING_PATTERNS: { re: RegExp; w: number; label: string }[] = [
  // Fake login page cues near a link
  { re: /(login|masuk|sign\s*in|verifikasi|verify|konfirmasi)[\s\S]{0,50}(https?:\/\/|\.com|\.net|\.id)/i, w: 0.7, label: "login page lure" },
  // Free credit / reward behind a link
  { re: /(gratis|free|saldo|pulsa|voucher)[\s\S]{0,40}(https?:\/\/|\.com|\.net|\.id|bit\.ly|s\.id)/i, w: 0.65, label: "free reward lure" },
];

// ---------------- Spam ----------------
export const SPAM_PATTERNS: { re: RegExp; w: number; label: string }[] = [
  // Excessive mentions @user @user @user
  { re: /(@\w+[\s,]*){4,}/, w: 0.6, label: "mass mention" },
  // Excessive links in one message
  { re: /(https?:\/\/[^\s]+[\s,]*){3,}/, w: 0.6, label: "excessive links" },
  // ALL CAPS shouting (>= 15 chars, >70% uppercase)
  { re: /[A-Z]{15,}/, w: 0.35, label: "caps spam" },
];

// ---------------- Toxic (Indonesian) ----------------
export const TOXIC_INSULT: Term[] = [
  { t: "bodoh", w: 0.6 }, { t: "tolol", w: 0.7 }, { t: "idiot", w: 0.6 },
  { t: "goblok", w: 0.8 }, { t: "goblog", w: 0.8 }, { t: "dungu", w: 0.6 },
  { t: "bangsat", w: 0.85 }, { t: "kontol", w: 0.9 }, { t: "memek", w: 0.9 },
  { t: "anjing", w: 0.7 }, { t: "anjg", w: 0.6 }, { t: "anj", w: 0.4 },
  { t: "bego", w: 0.6 }, { t: "blok", w: 0.4 }, { t: "gila", w: 0.3 },
  { t: "sialan", w: 0.5 }, { t: "brengsek", w: 0.7 }, { t: "setan", w: 0.4 },
  { t: "bajingan", w: 0.75 }, { t: "jembut", w: 0.85 }, { t: "pantek", w: 0.85 },
  { t: "pepek", w: 0.9 }, { t: "ngentot", w: 0.95 }, { t: "ngentod", w: 0.95 },
  { t: "fuck", w: 0.7 }, { t: "shit", w: 0.5 }, { t: "bitch", w: 0.7 },
];

export const TOXIC_HARASSMENT: { re: RegExp; w: number; label: string }[] = [
  { re: /(bunuh|hancurkan|bakar|pukul|hajarnya|dor\b|tikam)/i, w: 0.7, label: "threat" },
  { re: /(kamu\s+(jelek|buruk|gak\s+berguna|tidak\s+berguna|pemalas))|(engkau\s+celaka)/i, w: 0.6, label: "harassment" },
];

export const TOXIC_HATE: { re: RegExp; w: number; label: string }[] = [
  { re: /(benci\s+(kaum|orang|ras|agama|kelompok))|(musnahkan\s+(kaum|mereka))|(ras\s+(rendah|hina))/i, w: 0.8, label: "hate speech" },
];

// Words that, when present, flip a potential-flag into a neutral/educational context.
// "Jangan pakai kata judi" / "waspadai link judi" should NOT be flagged as promotion.
export const NEGATION_CUES = [
  "jangan", "jgn", "awas", "awasnya", "hati-hati", "hati2", "waspada",
  "waspadai", "hindari", "bukan", "tidak", "janganpercaya", "jangan percaya",
  "pelaporan", "lapor", "penipuan", "scam", "penipu", "jangan klik",
  "hati hati", "percaya", "jangan percaya",
];
