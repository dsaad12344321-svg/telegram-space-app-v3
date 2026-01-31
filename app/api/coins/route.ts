import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const { telegramId, action } = await req.json();

    if (!telegramId) {
      return NextResponse.json(
        { error: "Missing telegramId" },
        { status: 400 }
      );
    }

    // 1️⃣ Get user
    let { data: user } = await supabaseServer
      .from("users")
      .select("*")
      .eq("telegram_id", telegramId)
      .single();

    // 2️⃣ Create user if not exists
    if (!user) {
      const { data: newUser } = await supabaseServer
        .from("users")
        .insert({
          telegram_id: telegramId,
          coins: 0,
        })
        .select()
        .single();

      user = newUser;
    }

    // 3️⃣ Reward logic
    if (action === "reward") {
      const { data: updatedUser } = await supabaseServer
        .from("users")
        .update({ coins: user.coins + 10 })
        .eq("telegram_id", telegramId)
        .select()
        .single();

      return NextResponse.json(updatedUser);
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("API ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
