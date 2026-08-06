/**
 * Next.js instrumentation — runs once on server startup.
 * Ensures the database schema exists + demo data is seeded (idempotent).
 */
export async function register() {
  // node:sqlite is Node-only; guard against edge runtime.
  // @ts-ignore — process only exists on node runtime
  if (process.env.NEXT_RUNTIME === "nodejs" || !process.env.NEXT_RUNTIME) {
    const { ensureReady } = await import("./lib/db/seed");
    try {
      ensureReady();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[instrumentation] ensureReady failed:", e);
    }
  }
}
