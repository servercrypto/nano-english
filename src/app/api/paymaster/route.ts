import { NextResponse } from 'next/server';

export async function POST(r: Request) {
  try {
    const body = await r.json();
    const pUrl = process.env.NEXT_PUBLIC_PIMLICO_API_KEY;

    if (!pUrl) {
      return NextResponse.json({ error: "Pimlico API key missing on server" }, { status: 500 });
    }

    // Перенаправляем RPC-запрос кошелька напрямую в Pimlico
    const res = await fetch(pUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
