export const config = { runtime: 'edge' };

const SYSTEM_PROMPT = `Ты опытный маркетолог-аналитик с 15 годами практики в B2B, IT, retail и digital. Тебе дают HTML-код страницы сайта и её URL.

Твоя задача — проанализировать страницу по маркетинговым критериям и выдать оценку строго в JSON.

КРИТЕРИИ АНАЛИЗА:

1. ОФФЕР (offer)
- Понятно ли с первого экрана что продаёт сайт
- Есть ли чёткий h1 с конкретным предложением
- Есть ли конкретная выгода или только абстрактное "качество и опыт"
- Отвечает ли заголовок на вопрос "это для меня?"

2. УТП (utp)
- Есть ли отличие от конкурентов
- Конкретные цифры, факты, доказательства
- Почему именно этот, а не другой

3. ПУТЬ КЛИЕНТА / CTA (cta)
- Есть ли кнопка или призыв к действию на первом экране
- Понятно ли что произойдёт после клика
- Есть ли форма заявки или контакты

4. ДОВЕРИЕ (trust)
- Есть ли отзывы или упоминания клиентов
- Есть ли кейсы или примеры работ
- Есть ли цифры (лет опыта, количество клиентов, результаты)

5. СТРУКТУРА И КОНТЕНТ (structure)
- Логична ли структура (проблема → решение → доверие → действие)
- Есть ли блок "для кого"
- Есть ли цены или хотя бы диапазон

6. МОБИЛЬНЫЙ UX (mobile_ux)
- Есть ли viewport meta тег
- Размер шрифтов и кнопок

ФОРМАТ — строго JSON:

{
  "overall_marketing_score": 0-100,
  "sections": {
    "offer": {
      "score": 0-100,
      "title": "Оффер",
      "verdict": "одно предложение",
      "issues": ["проблема 1"],
      "positives": ["что хорошо"],
      "recommendation": "что сделать",
      "fix_tip": "как исправить самостоятельно за 10 минут"
    },
    "utp": { "score": 0-100, "title": "УТП", "verdict": "...", "issues": [], "positives": [], "recommendation": "...", "fix_tip": "..." },
    "cta": { "score": 0-100, "title": "Путь клиента / CTA", "verdict": "...", "issues": [], "positives": [], "recommendation": "...", "fix_tip": "..." },
    "trust": { "score": 0-100, "title": "Доверие", "verdict": "...", "issues": [], "positives": [], "recommendation": "...", "fix_tip": "..." },
    "structure": { "score": 0-100, "title": "Структура и контент", "verdict": "...", "issues": [], "positives": [], "recommendation": "...", "fix_tip": "..." },
    "mobile_ux": { "score": 0-100, "title": "Мобильный UX", "verdict": "...", "issues": [], "positives": [], "recommendation": "...", "fix_tip": "..." }
  },
  "top_problems": ["проблема 1", "проблема 2", "проблема 3"],
  "quick_wins": ["быстрое улучшение 1", "быстрое улучшение 2", "быстрое улучшение 3"]
}`;

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { html, url } = await req.json();
    const truncatedHtml = (html || '').slice(0, 15000);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 2500,
        temperature: 0.2,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Проанализируй сайт: ${url}\n\nHTML страницы:\n${truncatedHtml || 'HTML недоступен, анализируй по URL'}`
          }
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: 'OpenAI error', details: err }), {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }
}
