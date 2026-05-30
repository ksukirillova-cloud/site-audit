export const config = { runtime: 'edge' };

const SYSTEM_PROMPT = `Ты опытный маркетолог-аналитик с 15 годами практики. Тебе дают HTML-код страницы сайта.

Твоя задача — проанализировать страницу по маркетинговым критериям и выдать оценку в JSON.

КРИТЕРИИ АНАЛИЗА:

1. ОФФЕР (offer)
- Понятно ли с первого экрана что продаёт сайт (есть ли чёткий h1)
- Есть ли конкретная выгода или только абстрактное "качество и опыт"
- Отвечает ли заголовок на вопрос "это для меня?"
- Есть ли подзаголовок который уточняет оффер

2. УТП — уникальное торговое предложение (utp)
- Есть ли отличие от конкурентов
- Конкретные цифры, факты, доказательства
- Почему именно этот, а не другой

3. ПУТЬ КЛИЕНТА / CTA (cta)
- Есть ли кнопка или призыв к действию на первом экране
- Понятно ли что произойдёт после клика
- Сколько CTA на странице (0 = плохо, 1-3 = норм, 4+ = много)
- Есть ли форма заявки или контакты

4. ДОВЕРИЕ (trust)
- Есть ли отзывы или упоминания клиентов
- Есть ли кейсы или примеры работ
- Есть ли цифры (лет опыта, количество клиентов, результаты)
- Есть ли фото команды или автора

5. СТРУКТУРА И КОНТЕНТ (structure)
- Логична ли структура страницы (проблема → решение → доверие → действие)
- Есть ли блок "для кого"
- Есть ли цены или хотя бы диапазон
- Читаемость текста (не стена текста, есть ли списки, заголовки)

6. МОБИЛЬНЫЙ UX (mobile_ux)
- Есть ли viewport meta тег
- Нет ли горизонтального скролла (признаки в HTML)
- Размер шрифтов (min 16px для основного текста)
- Кнопки достаточного размера

ФОРМАТ ОТВЕТА — строго JSON, никакого текста вне JSON:

{
  "overall_marketing_score": 0-100,
  "sections": {
    "offer": {
      "score": 0-100,
      "title": "Оффер",
      "verdict": "одно предложение — главный вывод",
      "issues": ["проблема 1", "проблема 2"],
      "positives": ["что хорошо"],
      "recommendation": "конкретный совет что сделать"
    },
    "utp": {
      "score": 0-100,
      "title": "УТП",
      "verdict": "...",
      "issues": [...],
      "positives": [...],
      "recommendation": "..."
    },
    "cta": {
      "score": 0-100,
      "title": "Путь клиента / CTA",
      "verdict": "...",
      "issues": [...],
      "positives": [...],
      "recommendation": "..."
    },
    "trust": {
      "score": 0-100,
      "title": "Доверие",
      "verdict": "...",
      "issues": [...],
      "positives": [...],
      "recommendation": "..."
    },
    "structure": {
      "score": 0-100,
      "title": "Структура и контент",
      "verdict": "...",
      "issues": [...],
      "positives": [...],
      "recommendation": "..."
    },
    "mobile_ux": {
      "score": 0-100,
      "title": "Мобильный UX",
      "verdict": "...",
      "issues": [...],
      "positives": [...],
      "recommendation": "..."
    }
  },
  "top_problems": ["главная проблема 1", "главная проблема 2", "главная проблема 3"],
  "quick_wins": ["быстрое улучшение 1", "быстрое улучшение 2"]
}

Будь конкретным. Не пиши общих фраз. Называй реальные проблемы которые видишь в HTML.`;

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { html, url } = await req.json();

    if (!html) {
      return new Response(JSON.stringify({ error: 'No HTML provided' }), { status: 400 });
    }

    // Обрезаем HTML до 12000 символов чтобы не превышать контекст
    const truncatedHtml = html.slice(0, 12000);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 2000,
        temperature: 0.3,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Проанализируй сайт ${url}\n\nHTML страницы:\n${truncatedHtml}`
          }
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: 'OpenAI error: ' + err }), { status: 500 });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
