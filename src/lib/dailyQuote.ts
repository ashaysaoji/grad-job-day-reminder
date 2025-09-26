// src/lib/dailyQuote.ts
export async function fetchDailyQuote() {
    try {
      const res = await fetch("https://zenquotes.io/api/today", {
        cache: "no-store", // ensure fresh daily
      });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return { text: data[0].q, author: data[0].a };
      }
      return { text: "Stay consistent. Your future self will thank you.", author: "Unknown" };
    } catch (e) {
      console.error("Quote API failed", e);
      return { text: "Stay consistent. Your future self will thank you.", author: "Unknown" };
    }
  }
  