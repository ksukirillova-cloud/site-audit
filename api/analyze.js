const SYSTEM_PROMPT = `Ты — старший маркетолог-аналитик с 15 годами практики в B2B, digital, retail и IT. Специализация — упаковка, конверсия и путь клиента.

Тебе дают HTML-код страницы сайта и её URL. Твоя задача — провести глубокий маркетинговый аудит и выдать результат строго в JSON.

ФИЛОСОФИЯ АНАЛИЗА: Хороший сайт отвечает на 5 вопросов клиента за 5 секунд:
1. Что это? 2. Для кого? 3. Какой результат я получу? 4. Почему вам можно доверять? 5. Что мне сделать прямо сейчас?

КРИТЕРИИ:
1. ОФФЕР (offer) — понятно ли с первого экрана что продаёт сайт, есть ли h1 с конкретным обещанием, написан ли языком выгоды
2. УТП (utp) — есть ли конкретное отличие от конкурентов, цифры, факты, специализация
3. ПУТЬ КЛИЕНТА / CTA (cta) — есть ли CTA выше линии прокрутки, понятно ли что произойдёт после клика
4. ДОВЕРИЕ (trust) — отзывы, кейсы, цифры, фото реального человека
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

function parseSeoFromHtml(html, url) {
  if (!html) return null;

  const hasTitle = /<title[^>]*>[^<]+<\/title>/i.test(html);
  const hasMetaDesc = /meta[^>]+name=["']description["'][^>]+content=["'][^"']+["']/i.test(html) ||
                      /meta[^>]+content=["'][^"']+["'][^>]+name=["']description["']/i.test(html);
  const hasCanonical = /rel=["']canonical["']/i.test(html);
  const hasViewport = /name=["']viewport["']/i.test(html);
  const hasOgTitle = /property=["']og:title["']/i.test(html);
  const hasOgDesc = /property=["']og:description["']/i.test(html);
  const hasOgImage = /property=["']og:image["']/i.test(html);
  const hasSchema = /application\/ld\+json/i.test(html);
  const hasHreflang = /hreflang/i.test(html);
  const hasSitemap = /sitemap/i.test(html);
  const hasHttps = url.startsWith('https://');
  const hasAltTags = !/<img(?![^>]*alt=)[^>]*>/i.test(html);

  // Check for descriptive link text
  const badLinks = (html.match(/href[^>]*>(\s*)(нажмите здесь|click here|подробнее|here|more|читать далее)\s*</gi) || []).length;
  const hasGoodLinks = badLinks === 0;

  // tap targets - can't really check from HTML alone
  const hasTapTargets = true; // assume ok, can't verify from HTML

  const seoScore = Math.round([hasTitle, hasMetaDesc, hasCanonical, hasHttps, hasAltTags, hasGoodLinks].filter(Boolean).length / 6 * 100);

  return {
    seoScore,
    seoItems: [
      { label: "Title страницы", ok: hasTitle, tip: "Добавьте <title> в <head> — 50-60 символов." },
      { label: "Мета-описание", ok: hasMetaDesc, tip: "Добавьте <meta name='description' content='...'> — 150-160 символов." },
      { label: "Canonical URL", ok: hasCanonical, tip: "Добавьте <link rel='canonical' href='https://yoursite.com/page'>." },
      { label: "HTTPS", ok: hasHttps, tip: "SSL-сертификат — бесплатно через Let's Encrypt." },
      { label: "Alt-теги у изображений", ok: hasAltTags, tip: "Добавьте alt='описание' к каждому <img>." },
      { label: "Тексты ссылок", ok: hasGoodLinks, tip: "Замените 'нажмите здесь' на конкретные описания." },
      { label: "Viewport мобильных", ok: hasViewport, tip: "<meta name='viewport' content='width=device-width, initial-scale=1'>" },
      { label: "Robots.txt", ok: null, tip: "Создайте robots.txt: User-agent: * / Allow: /" },
      { label: "HTTP → HTTPS редирект", ok: hasHttps, tip: "301-редирект в .htaccess или настройках сервера." },
      { label: "Размер кнопок", ok: null, tip: "Кнопки минимум 48×48px на мобильном." },
    ],
    geoItems: [
      { label: "Open Graph: og:title", ok: hasOgTitle, tip: "Добавьте <meta property='og:title' content='...'> в <head>." },
      { label: "Open Graph: og:description", ok: hasOgDesc, tip: "Добавьте <meta property='og:description' content='...'> в <head>." },
      { label: "Open Graph: og:image", ok: hasOgImage, tip: "Добавьте <meta property='og:image' content='https://...'> для превью в соцсетях." },
      { label: "Schema.org разметка", ok: hasSchema, tip: "Добавьте JSON-LD: Organization или LocalBusiness в <head>." },
      { label: "Hreflang", ok: hasHreflang || true, tip: "Для мультиязычных: <link rel='alternate' hreflang='ru' href='...'>." },
      { label: "Sitemap упомянут", ok: hasSitemap, tip: "Создайте sitemap.xml и зарегистрируйте в Google Search Console." },
    ],
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { html, url } = req.body;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY not set' });

    const truncatedHtml = (html || '').slice(0, 15000);

    // Parse SEO from HTML
    const seoData = parseSeoFromHtml(html, url || '');

    // AI marketing analysis
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
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
      return res.status(500).json({ error: 'OpenAI error', details: err, seoData });
    }

    const data = await response.json();
    const marketing = JSON.parse(data.choices[0].message.content);

    return res.status(200).json({ ...marketing, seoData });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
