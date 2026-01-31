import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { telegramId, action } = await req.json();

  if (!telegramId) {
    return NextResponse.json({ error: "Missing telegramId" }, { status: 400 });
  }

  // 1️⃣ Get user
  let { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("telegram_id", telegramId)
    .single();

  // 2️⃣ Create user if not exists
  if (!user) {
    const { data: newUser } = await supabase
      .from("users")
      .insert({
        telegram_id: telegramId,
        coins: 0,
      })
      .select()
      .single();

    user = newUser;
  }

  // 3️⃣ Reward
  if (action === "reward") {
    const { data: updatedUser } = await supabase
      .from("users")
      .update({ coins: user.coins + 10 })
      .eq("telegram_id", telegramId)
      .select()
      .single();

    return NextResponse.json(updatedUser);
  }

  return NextResponse.json(user);
}
