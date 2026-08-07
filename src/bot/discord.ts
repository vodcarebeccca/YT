/**
 * GuardAI Discord bot.
 *
 * Same moderation core as Telegram: every message is run through `moderate()`
 * and the resulting action is executed against the Discord API:
 *   - delete  → message.delete()
 *   - mute    → member.timeout() (Discord timeout)
 *   - ban     → member.ban()
 *   - warning → reply with the warning text
 *
 * Run locally:  DISCORD_BOT_TOKEN=... npm run bot:discord
 * New guilds auto-bind to the demo admin for testing.
 */
import "node:process";
import {
  Client,
  Events,
  GatewayIntentBits,
  Partials,
  type Message,
} from "discord.js";
import { moderate, type CommunityConfig } from "@/lib/moderation";
import {
  getCommunityByPlatformRef,
  createCommunity,
} from "@/lib/db/communities";
import { getUserByEmail } from "@/lib/db/users";
import { migrate } from "@/lib/db/schema";
import { DEMO_CREDENTIALS } from "@/lib/constants";

const TOKEN = process.env.DISCORD_BOT_TOKEN;
if (!TOKEN) {
  // eslint-disable-next-line no-console
  console.warn(
    "[guardai-discord] DISCORD_BOT_TOKEN is not set. Bot will not connect until provided."
  );
}

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

const MUTE_DURATION_MS = 60 * 60 * 1000; // 1 hour

function resolveCommunity(msg: Message): CommunityConfig | null {
  const guild = msg.guild;
  if (!guild) return null; // DMs not moderated
  const platformRef = guild.id;

  let community = getCommunityByPlatformRef("discord", platformRef);
  if (!community) {
    const owner = getUserByEmail(DEMO_CREDENTIALS.email);
    if (owner) {
      community = createCommunity({
        name: guild.name || `Discord ${platformRef}`,
        platform: "discord",
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

async function handleInbound(msg: Message) {
  // Ignore bots (incl. self) to prevent loops.
  if (msg.author.bot) return;
  const text = msg.content || "";
  if (!text) return;

  const config = resolveCommunity(msg);
  if (!config) return;

  const decision = moderate(
    {
      communityId: config.id,
      messageId: msg.id,
      senderId: msg.author.id,
      senderName: msg.author.tag,
      text,
    },
    config
  );

  if (decision.action === "none") return;

  try {
    const member = msg.member;
    if (["delete", "mute", "ban"].includes(decision.action)) {
      await msg.delete().catch(() => {});
    }

    if (decision.action === "mute" && member) {
      await member
        .timeout(MUTE_DURATION_MS, "GuardAI: " + decision.topCategory)
        .catch(() => {});
    }

    if (decision.action === "ban" && member) {
      await member
        .ban({ reason: "GuardAI: " + decision.topCategory, deleteMessageSeconds: 60 * 5 })
        .catch(() => {});
    }

    if (
      decision.warning &&
      ["warning", "delete", "mute", "ban"].includes(decision.action)
    ) {
      await (msg.channel as any).send(decision.warning).catch(() => {});
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[guardai-discord] action failed:", err);
  }
}

client.once(Events.ClientReady, (c) => {
  // eslint-disable-next-line no-console
  console.log(`[guardai-discord] ready — logged in as ${c.user.tag}`);
});

client.on(Events.MessageCreate, handleInbound);

// Run as a script
if (require.main === module) {
  migrate();
  (async () => {
    if (!TOKEN) {
      // eslint-disable-next-line no-console
      console.error("[guardai-discord] No DISCORD_BOT_TOKEN. Exiting.");
      process.exit(1);
    }
    await client.login(TOKEN);
    process.once("SIGINT", () => client.destroy());
    process.once("SIGTERM", () => client.destroy());
  })();
}

export default client;
