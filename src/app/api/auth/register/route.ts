import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getUserByEmail, createUser } from "@/lib/db/users";
import { migrate } from "@/lib/db/schema";

const schema = z.object({
  name: z.string().min(1).max(80).optional(),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export async function POST(req: Request) {
  migrate();
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { name, email, password } = parsed.data;

  if (getUserByEmail(email)) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    );
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const user = createUser({ name, email, passwordHash });
  return NextResponse.json({ ok: true, userId: user.id });
}
