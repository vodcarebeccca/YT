import { NextResponse } from "next/server";

/**
 * Telegram webhook receiver (production mode).
 * Set TELEGRAM_BOT_TOKEN + TELEGRAM_BOT_WEBHOOK_URL, then register the webhook:
 *   curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=<WEBHOOK_URL>"
 */
export async function POST(req: Request) {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return NextResponse.json({ error: "Bot not configured" }, { status: 503 });
  }
  const update = await req.json().catch(() => null);
  if (!update) return NextResponse.json({ ok: false }, { status: 400 });

  // Lazily build the bot handle and process the update.
  const { bot } = await import("@/bot/telegram");
  try {
    await bot.handleUpdate(update);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[telegram webhook] error:", err);
  }
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({
    service: "GuardAI Telegram webhook",
    status: process.env.TELEGRAM_BOT_TOKEN ? "configured" : "not configured",
  });
}
