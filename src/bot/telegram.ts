/**
 * GuardAI Telegram bot.
 *
 * Wires incoming messages to the moderation core, then executes the resulting
 * action against the Telegram API:
 *   - delete  → deleteMessage
 *   - mute    → restrictChatMember (can_send_messages = false) for a duration
 *   - ban     → banChatMember
 *   - warning → send the warning text (Safe mode never deletes)
 *
 * Run locally with long polling:  TELEGRAM_BOT_TOKEN=... npm run bot
 * In production, set TELEGRAM_BOT_WEBHOOK_URL and use the /api/telegram/webhook route.
 */
import "node:process";
import { Telegraf, type Context } from "telegraf";
import { moderate, type CommunityConfig } from "@/lib/moderation";
import {
  getCommunityByPlatformRef,
  createCommunity,
} from "@/lib/db/communities";
import { getUserByEmail } from "@/lib/db/users";
import { migrate } from "@/lib/db/schema";
import { DEMO_CREDENTIALS } from "@/lib/constants";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
  // eslint-disable-next-line no-console
  console.warn(
    "[guardai-bot] TELEGRAM_BOT_TOKEN is not set. The bot will auto-register any group it joins to the demo admin for testing."
  );
}

export const bot = new Telegraf(TOKEN || "dummy:token");

// Mute durations per escalation
const MUTE_DURATION_MS = 60 * 60 * 1000; // 1 hour default

function resolveCommunity(ctx: Context): CommunityConfig | null {
  const chat = (ctx.chat as any);
  if (!chat?.id) return null;
  const platformRef = String(chat.id);

  let community = getCommunityByPlatformRef("telegram", platformRef);

  if (!community) {
    // Auto-provision: bind new groups to the demo admin (Phase 1 convenience).
    const owner = getUserByEmail(DEMO_CREDENTIALS.email);
    if (owner) {
      community = createCommunity({
        name: chat.title || `Telegram ${platformRef}`,
        platform: "telegram",
        platformRef,
        ownerId: owner.id,
        protectionMode: "balanced",
        sensitivity: 60,
      });
    } else {
      return null;
    }
  }

  return {
    id: community.id,
    protectionMode: community.protectionMode,
    sensitivity: community.sensitivity,
    enabled: community.enabled,
  };
}

async function handleInbound(ctx: Context) {
  const msg = (ctx.message as any);
  const text = msg?.text || msg?.caption || "";
  if (!text) return;

  const config = resolveCommunity(ctx);
  if (!config) return;

  const from = msg.from;
  const decision = moderate(
    {
      communityId: config.id,
      messageId: String(msg.message_id),
      senderId: String(from?.id ?? "unknown"),
      senderName: from?.username ? `@${from.username}` : from?.first_name,
      text,
    },
    config
  );

  if (decision.action === "none") return;

  const chatId = ctx.chat?.id;
  const userId = from?.id;
  if (!chatId || !userId) return;

  try {
    if (decision.action === "delete" || decision.action === "mute" || decision.action === "ban") {
      await ctx.deleteMessage(msg.message_id).catch(() => {});
    }

    if (decision.action === "mute" && userId) {
      const until = Math.floor((Date.now() + MUTE_DURATION_MS) / 1000);
      await ctx.telegram
        .restrictChatMember(chatId, userId, {
          can_send_messages: false,
          can_send_media_messages: false,
          can_send_other_messages: false,
          can_add_web_page_previews: false,
          until_date: until,
        } as any)
        .catch(() => {});
    }

    if (decision.action === "ban" && userId) {
      await ctx.telegram.banChatMember(chatId, userId).catch(() => {});
    }

    // Send a public warning (for warning/mute/ban; balanced delete also warns)
    if (
      decision.warning &&
      (decision.action === "warning" ||
        decision.action === "mute" ||
        decision.action === "ban" ||
        decision.action === "delete")
    ) {
      await ctx
        .sendMessage(decision.warning, {
          reply_to_message_id: msg.message_id,
          parse_mode: "HTML",
        } as any)
        .catch(() => {
          ctx.sendMessage(decision.warning).catch(() => {});
        });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[guardai-bot] action failed:", err);
  }
}

bot.on("text", handleInbound);
bot.on("photo", handleInbound);
bot.on("video", handleInbound);

bot.command("ping", (ctx) => ctx.reply("🛡️ GuardAI is online and protecting this community."));
bot.command("help", (ctx) =>
  ctx.reply(
    "🛡️ <b>GuardAI</b>\n\nI automatically detect & remove:\n• Judi online\n• Scam & phishing\n• Spam\n• Toxic behavior\n\nConfigure me in the dashboard.",
    { parse_mode: "HTML" }
  )
);

// Run as a script with long polling
if (require.main === module) {
  migrate();
  (async () => {
    if (!TOKEN) {
      // eslint-disable-next-line no-console
      console.error("[guardai-bot] No TELEGRAM_BOT_TOKEN. Exiting.");
      process.exit(1);
    }
    // eslint-disable-next-line no-console
    console.log("[guardai-bot] starting long polling…");
    await bot.launch();
    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));
  })();
}

export default bot;
