/**
 * Curated, labeled training examples for the AI classifier.
 *
 * Unlike the rule engine (hand-coded keywords + patterns), the Naive Bayes
 * classifier *learns* from these examples — so it can catch paraphrases and
 * novel phrasings the keyword dictionary doesn't list.
 *
 * Indonesian-first, balanced across the 6 classes. Each example is short
 * (community-message sized) and intentionally varied in tone/obfuscation.
 */

export type AIClass =
  | "gambling"
  | "scam"
  | "phishing"
  | "spam"
  | "toxic"
  | "safe";

export interface TrainingExample {
  text: string;
  label: AIClass;
}

export const TRAINING_DATA: TrainingExample[] = [
  // ---------------- gambling ----------------
  { text: "daftar sekarang slot gacor maxwin malam ini", label: "gambling" },
  { text: "main judi online terpercaya, bonus new member", label: "gambling" },
  { text: "link slot88 gacor hari ini, WD besar", label: "gambling" },
  { text: "togel hongkong prediksi jitu, pasang sekarang", label: "gambling" },
  { text: "casino live, roulette dan baccarat online", label: "gambling" },
  { text: "rtp slot pragmatic tertinggi, scatter hitam", label: "gambling" },
  { text: "agen bola online, taruhan liga champions", label: "gambling" },
  { text: "jackpot progresif poker online, all in", label: "gambling" },
  { text: "bandar qq terbesar, minimal deposit 10rb", label: "gambling" },
  { text: "maxwin dijamin, coba habanero sekarang", label: "gambling" },
  { text: "slot demo pg soft, langsung cuan asli", label: "gambling" },
  { text: "withdraw lancar, daftar slot gacor maxwin", label: "gambling" },

  // ---------------- scam ----------------
  { text: "selamat anda menang undian, klaim hadiah iphone", label: "scam" },
  { text: "saya admin asli, transfer biaya admin untuk verifikasi", label: "scam" },
  { text: "investasi modal kecil profit berkali lipat dijamin", label: "scam" },
  { text: "grup vip sinyal trading, bayar dulu langsung untung", label: "scam" },
  { text: "promo arisan bodong, daftar bayar 50rb", label: "scam" },
  { text: "bantu topup, nanti saya kembalikan double", label: "scam" },
  { text: "anda terpilih giveaway, chat admin untuk klaim", label: "scam" },
  { text: "ikutan arisan uang, bayar 100k balik 500k", label: "scam" },
  { text: "karyawan resmi butuh pinjaman, hubungi cs", label: "scam" },
  { text: "skema cepat kaya, garansi uang kembali", label: "scam" },
  { text: "airdrop token gratis, kirim gas fee dikit", label: "scam" },
  { text: "hadiah ekspresi, segera klaim sebelum hangus", label: "scam" },

  // ---------------- phishing ----------------
  { text: "verifikasi akun kamu di login-aman sekarang", label: "phishing" },
  { text: "cek link ini https://bit.ly/free-saldo segera", label: "phishing" },
  { text: "akun kamu diblokir, konfirmasi di sini bit ly cek", label: "phishing" },
  { text: "dapat saldo gratis, klik t.co promo", label: "phishing" },
  { text: "reset password kamu di s.id reset-aman", label: "phishing" },
  { text: "paket kamu tertahan, lengkapi data di sini", label: "phishing" },
  { text: "login e-wallet di situs resmi ini, jangan sampai expired", label: "phishing" },
  { text: "klaim voucher resmi, buka link di bawah", label: "phishing" },
  { text: "konfirmasi otp kamu, masuk ke halaman verifikasi", label: "phishing" },
  { text: "cek hadiahmu di cutt.ly/claim-now", label: "phishing" },
  { text: "notifikasi login mencurigakan, amankan akun disini", label: "phishing" },
  { text: "promo terbatas, klik www.hadiah-aman.top", label: "phishing" },

  // ---------------- spam ----------------
  { text: "BELI JUAL MURAH PROMO HARI INI HUBUNGI SEKARANG", label: "spam" },
  { text: "jasa followers ig murah, garansi, wa saya", label: "spam" },
  { text: "@a @b @c @d @e @f monggo gabung grup jualan", label: "spam" },
  { text: "http://a.com http://b.com http://c.com http://d.com cek", label: "spam" },
  { text: "promosi jasa backlink, seo, naikin ranking", label: "spam" },
  { text: "DIKSI MURAH DIKSI MURAH DIKSI MURAH DIKSI", label: "spam" },
  { text: "lowongan kerja gaji besar, daftar di link bio", label: "spam" },
  { text: "jual barang bekas, harga miring, stok banyak", label: "spam" },
  { text: "pinjaman online cair cepat tanpa jaminan", label: "spam" },
  { text: "obat kuat herbal aman, cod seluruh indonesia", label: "spam" },
  { text: "sewa bot wa, blast promosi otomatis", label: "spam" },
  { text: "terima tugas kuliah, murah cepat, dm ya", label: "spam" },

  // ---------------- toxic ----------------
  { text: "kamu goblok dan bangsat, pergi sana", label: "toxic" },
  { text: "tolol lu, ngomong apa sih bodoh", label: "toxic" },
  { text: "anjing lu, jangan sok asik", label: "toxic" },
  { text: "aku akan bunuh kamu, hati hati ya", label: "toxic" },
  { text: "racun keluarga mu, pergi dari sini", label: "toxic" },
  { text: "jembut, kontol, memek, pantek, asu", label: "toxic" },
  { text: "lu culun banget, gak berguna", label: "toxic" },
  { text: "benci sama kaum itu, musnahkan saja", label: "toxic" },
  { text: "bego amat sih orang, otak udang", label: "toxic" },
  { text: "ngentod lu, berisik banget", label: "toxic" },
  { text: "anjg, brengsek, keterlaluan lu", label: "toxic" },
  { text: "setan, dasar anak haram", label: "toxic" },

  // ---------------- safe ----------------
  { text: "halo semuanya, selamat pagi", label: "safe" },
  { text: "apa kabar hari ini, semoga sehat selalu", label: "safe" },
  { text: "terima kasih infonya, sangat membantu", label: "safe" },
  { text: "saya mau tanya soal deposito bank, aman tidak", label: "safe" },
  { text: "bagaimana cara daftar pakai aplikasi ini", label: "safe" },
  { text: "jangan percaya link judi itu, itu penipuan", label: "safe" },
  { text: "tolong jaga kata-kata, jangan toxic ya", label: "safe" },
  { text: "meetings jam berapa nanti sore", label: "safe" },
  { text: "selamat menikmati akhir pekan semua", label: "safe" },
  { text: "saya setuju dengan pendapatmu", label: "safe" },
  { text: "ada yang tahu rekomendasi buku bagus", label: "safe" },
  { text: "makasih udah bantu, sukses terus", label: "safe" },
  { text: "good morning everyone, have a nice day", label: "safe" },
  { text: "itung-itung belajar dulu sebelum mulai", label: "safe" },

  // ---------------- English ----------------
  { text: "join now, best online slots and casino bonus", label: "gambling" },
  { text: "sports betting tips, guaranteed win tonight", label: "gambling" },
  { text: "congratulations you won a prize, claim now", label: "scam" },
  { text: "I am the real admin, send the fee to verify", label: "scam" },
  { text: "verify your account at secure-login now", label: "phishing" },
  { text: "click this bit ly link for free reward", label: "phishing" },
  { text: "BUY NOW CHEAP PROMO CONTACT ME IMMEDIATELY", label: "spam" },
  { text: "cheap instagram followers, dm me fast", label: "spam" },
  { text: "you are stupid and an idiot, get lost", label: "toxic" },
  { text: "I will destroy you, watch your back", label: "toxic" },
  { text: "thanks for the update, really helpful", label: "safe" },
  { text: "how do I sign up for this app", label: "safe" },

  // ---------------- Malay ----------------
  { text: "slot gacor malaysia, daftar sekarang bonus besar", label: "gambling" },
  { text: "tahniah anda menang hadiah, klik untuk klaim", label: "scam" },
  { text: "sahkan akaun anda di link ini sekarang", label: "phishing" },
  { text: "PROMO JUAL MURAH HUBUNGI SEKARANG", label: "spam" },
  { text: "bodoh betul lah kau, pergi lah", label: "toxic" },
  { text: "terima kasih banyak, sangat membantu", label: "safe" },

  // Extra safe greetings (disambiguate "selamat"/"welcome" from scam/phishing)
  { text: "selamat datang di grup, semoga betah ya", label: "safe" },
  { text: "selamat bergabung di komunitas kami", label: "safe" },
  { text: "selamat malam semuanya, mari kenalan", label: "safe" },
  { text: "welcome to the group, make yourself at home", label: "safe" },
];
