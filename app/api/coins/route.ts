import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

export async function POST(req: Request) {
  const { telegramId, action } = await req.json();

  if (!telegramId) {
    return NextResponse.json({ error: "Missing telegramId" }, { status: 400 });
  }

  // 1️⃣ Check if user exists
  let { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("telegram_id", telegramId)
    .single();

  // 2️⃣ If not exists → create user
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

  // 3️⃣ Reward user
  if (action === "reward") {
    const { data: updatedUser } = await supabase
      .from("users")
      .update({ coins: user.coins + 10 })
      .eq("telegram_id", telegramId)
      .select()
      .single();

    return NextResponse.json(updatedUser);
  }

  // 4️⃣ Just return user data
  return NextResponse.json(user);
}
