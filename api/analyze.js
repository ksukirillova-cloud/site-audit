const SYSTEM_PROMPT = `Ты опытный маркетолог-аналитик с 15 годами практики. Тебе дают HTML-код страницы сайта и её URL.

Проанализируй страницу по маркетинговым критериям. Выдай оценку строго в JSON.

КРИТЕРИИ:

1. ОФФЕР (offer) — понятно ли с первого экрана что продаёт сайт, есть ли конкретная выгода
2. УТП (utp) — есть ли отличие от конкурентов, конкретные цифры и факты
3. ПУТЬ КЛИЕНТА / CTA (cta) — есть ли кнопка на первом экране, понятно ли что произойдёт после клика
4. ДОВЕРИЕ (trust) — отзывы, кейсы, цифры, фото
5. СТРУКТУРА И КОНТЕНТ (structure) — логика страницы, цены, читаемость
6. МОБИЛЬНЫЙ UX (mobile_ux) — viewport, размер шрифтов и кнопок

ФОРМАТ — строго JSON:
{
  "overall_marketing_score": 0-100,
  "sections": {
    "offer": { "score": 0-100, "title": "Оффер", "verdict": "одно предложение", "issues": ["проблема"], "positives": ["плюс"], "recommendation": "что сделать", "fix_tip": "как исправить самому" },
    "utp": { "score": 0-100, "title": "УТП", "verdict": "...", "issues": [], "positives": [], "recommendation": "...", "fix_tip": "..." },
    "cta": { "score": 0-100, "title": "Путь клиента / CTA", "verdict": "...", "issues": [], "positives": [], "recommendation": "...", "fix_tip": "..." },
    "trust": { "score": 0-100, "title": "Доверие", "verdict": "...", "issues": [], "positives": [], "recommendation": "...", "fix_tip": "..." },
    "structure": { "score": 0-100, "title": "Структура и контент", "verdict": "...", "issues": [], "positives": [], "recommendation": "...", "fix_tip": "..." },
    "mobile_ux": { "score": 0-100, "title": "Мобильный UX", "verdict": "...", "issues": [], "positives": [], "recommendation": "...", "fix_tip": "..." }
  },
  "top_problems": ["проблема 1", "проблема 2", "проблема 3"],
  "quick_wins": ["улучшение 1", "улучшение 2", "улучшение 3"]
}`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { html, url } = req.body;
    const truncatedHtml = (html || '').slice(0, 15000);
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'OPENAI_API_KEY not set' });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 2500,
        temperature: 0.2,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Сайт: ${url}\n\nHTML:\n${truncatedHtml || 'HTML недоступен'}` }
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: 'OpenAI error', details: err });
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    return res.status(200).json(parsed);

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
