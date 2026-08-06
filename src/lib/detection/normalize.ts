/**
 * Text Normalizer — the first stage of the detection pipeline.
 *
 * Attackers obfuscate banned words to bypass keyword filters:
 *   jυdі οnlіne   (Cyrillic/Greek lookalikes)
 *   j u d i       (single-char spacing)
 *   j.u.d.i       (separators)
 *   ｊｕｄｉ        (fullwidth)
 *   judi🔥🔥      (decorative emoji)
 *
 * The normalizer collapses these back into a canonical ASCII form so downstream
 * pattern matching is reliable, WITHOUT destroying real word boundaries.
 *
 * Key heuristic for the matching form:
 *   - consecutive SINGLE-character tokens are merged  (j-u-d-i → judi)
 *   - multi-character tokens stay separated            (gacor maxwin → gacor maxwin)
 */

const HOMOGLYPHS: Record<string, string> = {
  // Cyrillic → Latin
  а: "a", е: "e", о: "o", р: "p", с: "c", у: "y", х: "x",
  А: "a", В: "b", Е: "e", К: "k", М: "m", Н: "h", О: "o",
  Р: "p", С: "c", Т: "t", У: "y", Х: "x", і: "i", І: "i",
  ј: "j", Ј: "j", ѕ: "s", Ѕ: "s", ё: "e", ԁ: "d", ɡ: "g",
  // Greek → Latin
  ο: "o", Ο: "o", α: "a", Α: "a", ε: "e", Ε: "e", υ: "u",
  Υ: "u", ι: "i", Ι: "i", κ: "k", ν: "v", ρ: "p", τ: "t",
  ω: "w", γ: "y",
  // Fullwidth digits (NFKC handles most letters; safety net)
  "０": "0", "１": "1", "２": "2", "３": "3", "４": "4",
  "５": "5", "６": "6", "７": "7", "８": "8", "９": "9",
  // Symbol lookalikes
  "ⓘ": "i", "ⓐ": "a", "①": "1", "②": "2", "③": "3",
};

// Zero-width + invisible + bidi control characters to strip entirely.
const INVISIBLE = /[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF\u00AD\u180E]/g;

export interface NormalizeResult {
  /**
   * Aggressive canonical form for keyword matching:
   * ASCII letters/digits + spaces, single-char runs merged, repeats collapsed.
   */
  normalized: string;
  /**
   * Structured form for regex/URL detection: NFKC + invisible stripped +
   * lowercased + homoglyphed + whitespace collapsed. Preserves punctuation
   * and URLs so structural patterns (@mentions, links) still match.
   */
  cleaned: string;
  /** Lowercased original (for emoji/scoring reference). */
  lower: string;
}

/** Map homoglyphs char-by-char on a lowercased string. */
function mapHomoglyphs(s: string): string {
  let out = "";
  for (const ch of s) out += HOMOGLYPHS[ch] ?? ch;
  return out;
}

/**
 * Merge runs of consecutive single-char alphanumeric tokens into words.
 *   ["j","u","d","i","online"] → ["judi","online"]
 *   ["gacor","maxwin"]          → ["gacor","maxwin"]
 */
function mergeSingleCharTokens(tokens: string[]): string[] {
  const out: string[] = [];
  let buf = "";
  const flush = () => {
    if (buf) {
      out.push(buf);
      buf = "";
    }
  };
  for (const tk of tokens) {
    if (tk.length === 1 && /[a-z0-9]/.test(tk)) {
      buf += tk;
    } else {
      flush();
      out.push(tk);
    }
  }
  flush();
  return out;
}

export function normalizeText(raw: string): NormalizeResult {
  if (!raw) return { normalized: "", cleaned: "", lower: "" };

  // 1. NFKC — converts fullwidth → ascii, compatibility forms, etc.
  let s = raw.normalize("NFKC");

  // 2. Remove invisible / zero-width / bidi controls.
  s = s.replace(INVISIBLE, "");

  // 3. Lowercase.
  const lower = s.toLowerCase();

  // 4. Map homoglyphs.
  const homoglyphed = mapHomoglyphs(lower);

  // ---- cleaned: preserve structure for regex/URL detection ----
  const cleaned = homoglyphed.replace(/\s+/g, " ").trim();

  // ---- normalized: aggressive collapse for keyword matching ----
  // Replace every non-[a-z0-9] char with a space (drops punctuation, emoji,
  // symbols, separators uniformly), then rebuild token structure.
  const alphaOnly = homoglyphed.replace(/[^a-z0-9]+/g, " ").trim();
  let tokens = alphaOnly.split(/\s+/).filter(Boolean);
  tokens = mergeSingleCharTokens(tokens);

  // Collapse 2+ identical consecutive letters within a token to a single char.
  //   "gacoooor" → "gacor", "sllloot" → "slot"
  tokens = tokens.map((t) => t.replace(/([a-z0-9])\1{1,}/g, "$1"));

  const normalized = tokens.join(" ").trim();

  return { normalized, cleaned, lower };
}
