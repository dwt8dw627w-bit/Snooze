export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const { messages = [], name = 'Снуз', persona = '' } = await req.json();

  const system =
    `Ты ${name}, дружелюбный и умный ИИ-помощник приложения Snooze.ai. ` +
    `Отвечай на языке пользователя, по умолчанию на русском. Будь полезным, живым и конкретным. ` +
    `Код оформляй в блоках с тройными обратными кавычками. ` +
    (persona ? `Дополнительные пожелания пользователя к стилю: ${persona}` : '');

  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + process.env.GROQ_API_KEY,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      stream: true,
      temperature: 0.7,
      messages: [{ role: 'system', content: system }, ...messages.slice(-20)],
    }),
  });

  if (!r.ok) return new Response(await r.text(), { status: r.status });
  return new Response(r.body, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  });
}
