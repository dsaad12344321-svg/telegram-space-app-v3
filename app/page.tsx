"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    Telegram: any;
    show_10544894: () => Promise<void>;
  }
}

export default function Home() {
  const [telegramId, setTelegramId] = useState<number | null>(null);
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    tg.ready();
    tg.expand();

    const user = tg.initDataUnsafe?.user;
    if (user?.id) {
      setTelegramId(user.id);
      fetchCoins(user.id);
    }
  }, []);

  const fetchCoins = async (id: number) => {
    const res = await fetch("/api/coins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telegramId: id }),
    });

    const data = await res.json();
    setCoins(data.coins);
  };

  const showRewardAd = async () => {
    if (!telegramId) return;

    try {
      setLoading(true);
      await window.show_10544894();

      const res = await fetch("/api/coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramId,
          action: "reward",
        }),
      });

      const data = await res.json();
      setCoins(data.coins);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-space flex items-center justify-center">
      <div className="glass-card">
        <div className="logo">
          <img src="/eth.png" />
        </div>

        <div className="coins">💰 {coins} Coins</div>

        <button
          className="reward-btn"
          onClick={showRewardAd}
          disabled={loading}
        >
          {loading ? "Loading..." : "Get Reward"}
        </button>

        {telegramId && <p className="user-id">ID: {telegramId}</p>}
      </div>
    </main>
  );
}
