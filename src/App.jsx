import { useState } from "react";

const PAGESPEED_API_KEY = "AIzaSyB8O9to0nJJJMznVgTXqvsohJH16wXY6Z8";
const TELEGRAM_URL = "https://t.me/ksukirillova";

function scoreColor(s) {
  if (s >= 80) return "#C8FF3D";
  if (s >= 50) return "#FF8C3D";
  return "#FF3D3D";
}
function scoreLabel(s) {
  if (s >= 80) return "Хорошо";
  if (s >= 50) return "Есть проблемы";
  return "Критично";
}

function CircleScore({ score, size = 80 }) {
  const r = size / 2 - 6;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = scoreColor(score);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#2a2a2a" strokeWidth={5} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s ease" }} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize={size * 0.22} fontWeight="800"
        style={{ transform: "rotate(90deg)", transformOrigin: "center", fontFamily: "inherit" }}>
        {score}
      </text>
    </svg>
  );
}

function Tag({ text, type = "error" }) {
  const c = { error: "#FF3D3D", warning: "#FF8C3D", ok: "#C8FF3D" }[type];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: c + "18", color: c, border: `1px solid ${c}33`,
      borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 700,
      marginRight: 6, marginBottom: 6,
    }}>
      {type === "ok" ? "✓" : type === "warning" ? "⚠" : "✗"} {text}
    </span>
  );
}

function SectionCard({ icon, title, score, verdict, issues = [], positives = [], recommendation, fix_tip, accent }) {
  const [showTip, setShowTip] = useState(false);
  const color = scoreColor(score);

  return (
    <div style={{
      background: accent ? "#0d1a2e" : "#161616",
      border: `1px solid ${accent ? "#1B63FF44" : "#2a2a2a"}`,
      borderRadius: 20, padding: "24px",
      marginBottom: 12,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>{icon}</span>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em" }}>{title}</h3>
            <p style={{ fontSize: 13, color: "#888", marginTop: 2, lineHeight: 1.4 }}>{verdict}</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <CircleScore score={score} size={56} />
        </div>
      </div>

      {/* Score bar */}
      <div style={{ background: "#2a2a2a", borderRadius: 4, height: 4, marginBottom: 16 }}>
        <div style={{ width: `${score}%`, background: color, borderRadius: 4, height: 4, transition: "width 1s ease" }} />
      </div>

      {/* Tags */}
      <div style={{ marginBottom: issues.length || positives.length ? 14 : 0 }}>
        {issues.map((t, i) => <Tag key={i} text={t} type="error" />)}
        {positives.map((t, i) => <Tag key={i} text={t} type="ok" />)}
      </div>

      {/* Recommendation */}
      {recommendation && (
        <div style={{ background: "#1e1e1e", borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
          <p style={{ fontSize: 11, color: "#666", fontWeight: 700, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Рекомендация</p>
          <p style={{ fontSize: 13, color: "#ccc", lineHeight: 1.5 }}>{recommendation}</p>
        </div>
      )}

      {/* Fix tip toggle */}
      {fix_tip && (
        <div style={{ marginBottom: 14 }}>
          <button onClick={() => setShowTip(!showTip)} style={{
            background: "none", border: "1px solid #333",
            color: "#888", borderRadius: 8, padding: "6px 14px",
            fontSize: 12, fontWeight: 700, cursor: "pointer",
            fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6,
          }}>
            {showTip ? "▲" : "▼"} Как исправить самостоятельно
          </button>
          {showTip && (
            <div style={{
              marginTop: 8, background: "#0f1a0f", border: "1px solid #1f3f1f",
              borderRadius: 10, padding: "12px 14px",
            }}>
              <p style={{ fontSize: 13, color: "#aaffaa", lineHeight: 1.5 }}>{fix_tip}</p>
            </div>
          )}
        </div>
      )}

      {/* CTA */}
      <a href={TELEGRAM_URL} style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: score < 50 ? "#1B63FF" : "#1e1e1e",
        color: score < 50 ? "#fff" : "#888",
        border: score < 50 ? "none" : "1px solid #333",
        borderRadius: 10, padding: "8px 16px",
        fontSize: 12, fontWeight: 700, textDecoration: "none",
        transition: "all 0.2s",
      }}>
        {score < 50 ? "🔧 Обсудить как исправить →" : "💬 Обсудить с маркетологом"}
      </a>
    </div>
  );
}

function CheckItem({ label, ok, tip }) {
  const [showTip, setShowTip] = useState(false);
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "#1e1e1e", borderRadius: 10, padding: "10px 14px",
        gap: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
            background: ok ? "#C8FF3D22" : "#FF3D3D22",
            color: ok ? "#C8FF3D" : "#FF3D3D",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 800,
          }}>{ok ? "✓" : "✗"}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: ok ? "#aaa" : "#fff" }}>{label}</span>
        </div>
        {!ok && tip && (
          <button onClick={() => setShowTip(!showTip)} style={{
            background: "none", border: "1px solid #333",
            color: "#666", borderRadius: 6, padding: "4px 10px",
            fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            whiteSpace: "nowrap",
          }}>
            {showTip ? "Скрыть" : "Как исправить"}
          </button>
        )}
        {ok && (
          <a href={TELEGRAM_URL} style={{
            background: "none", border: "1px solid #2a2a2a",
            color: "#555", borderRadius: 6, padding: "4px 10px",
            fontSize: 11, fontWeight: 700, textDecoration: "none",
            whiteSpace: "nowrap",
          }}>Обсудить</a>
        )}
      </div>
      {showTip && (
        <div style={{
          background: "#0f1a0f", border: "1px solid #1f3f1f",
          borderRadius: "0 0 10px 10px", padding: "10px 14px",
          marginTop: -4,
        }}>
          <p style={{ fontSize: 12, color: "#aaffaa", lineHeight: 1.5 }}>{tip}</p>
        </div>
      )}
    </div>
  );
}

async function fetchPageSpeed(url, strategy = "mobile") {
  const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&key=${PAGESPEED_API_KEY}`;
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error("PageSpeed API error");
  return res.json();
}

function parseTechnical(mobileData, desktopData) {
  const lhr = mobileData.lighthouseResult;
  const cats = lhr.categories;
  const audits = lhr.audits;

  const perf    = Math.round((cats.performance?.score || 0) * 100);
  const seo     = Math.round((cats.seo?.score || 0) * 100);
  const acc     = Math.round((cats.accessibility?.score || 0) * 100);
  const bp      = Math.round((cats["best-practices"]?.score || 0) * 100);
  const deskPerf = Math.round((desktopData.lighthouseResult.categories.performance?.score || 0) * 100);

  const a = audits;

  const seoItems = [
    { label: "Title страницы",              ok: a["document-title"]?.score === 1,     tip: "Добавьте тег <title> в <head> — он должен описывать страницу за 50-60 символов." },
    { label: "Мета-описание",               ok: a["meta-description"]?.score === 1,   tip: "Добавьте <meta name='description' content='...'> в <head> — 150-160 символов о содержании страницы." },
    { label: "Canonical URL",               ok: a["canonical"]?.score === 1,          tip: "Добавьте <link rel='canonical' href='https://yoursite.com/page'> чтобы избежать дублей." },
    { label: "Robots.txt",                  ok: a["robots-txt"]?.score === 1,         tip: "Создайте файл robots.txt в корне сайта. Минимум: User-agent: * / Allow: /" },
    { label: "Alt-теги у изображений",      ok: a["image-alt"]?.score === 1,          tip: "Добавьте атрибут alt='описание' к каждому тегу <img>. Описывайте что на картинке." },
    { label: "Осмысленные тексты ссылок",   ok: a["link-text"]?.score === 1,          tip: "Замените 'нажмите здесь' и 'подробнее' на конкретные описания: 'Читать статью о SEO'." },
    { label: "HTTPS",                       ok: a["is-on-https"]?.score === 1,        tip: "Получите SSL-сертификат — большинство хостингов дают его бесплатно через Let's Encrypt." },
    { label: "HTTP → HTTPS редирект",       ok: a["redirects-http"]?.score === 1,     tip: "Настройте 301-редирект с http:// на https:// в файле .htaccess или настройках сервера." },
    { label: "Viewport для мобильных",      ok: a["viewport"]?.score === 1,           tip: "Добавьте в <head>: <meta name='viewport' content='width=device-width, initial-scale=1'>" },
    { label: "Размер кнопок на мобильном",  ok: a["tap-targets"]?.score === 1,        tip: "Кнопки должны быть минимум 48x48px с отступами между ними. Проверьте в DevTools → Mobile." },
  ];

  const geoItems = [
    { label: "Open Graph теги (og:title, og:description)", ok: !!lhr.audits["structured-data"] || false, tip: "Добавьте og:title, og:description, og:image в <head> для красивого превью в соцсетях." },
    { label: "Schema.org разметка",         ok: false, tip: "Добавьте JSON-LD разметку: Organization, LocalBusiness или Person в зависимости от типа сайта." },
    { label: "Hreflang для мультиязычных",  ok: a["hreflang"]?.score === 1,           tip: "Если сайт на одном языке — не нужно. Для мультиязычных: <link rel='alternate' hreflang='ru' href='...'>" },
    { label: "Sitemap.xml",                 ok: false, tip: "Создайте sitemap.xml с URL всех страниц и зарегистрируйте в Google Search Console и Яндекс.Вебмастер." },
    { label: "Структурированные данные",    ok: false, tip: "Добавьте JSON-LD с данными о вашем бизнесе — это помогает AI-поисковикам (Perplexity, ChatGPT) правильно понять ваш сайт." },
  ];

  return {
    overall: Math.round((perf + seo + acc + bp) / 4),
    perf, seo, acc, bp, deskPerf,
    fcp: a["first-contentful-paint"]?.displayValue || "—",
    lcp: a["largest-contentful-paint"]?.displayValue || "—",
    tbt: a["total-blocking-time"]?.displayValue || "—",
    cls: a["cumulative-layout-shift"]?.displayValue || "—",
    si:  a["speed-index"]?.displayValue || "—",
    seoItems,
    geoItems,
    url: lhr.finalUrl,
  };
}

export default function SiteAudit() {
  const [url, setUrl]           = useState("");
  const [loading, setLoading]   = useState(false);
  const [step, setStep]         = useState(0);
  const [techData, setTechData] = useState(null);
  const [mktData, setMktData]   = useState(null);
  const [mktLoading, setMktLoading] = useState(false);
  const [error, setError]       = useState(null);

  const steps = [
    "Загружаю страницу...",
    "Анализирую скорость...",
    "Проверяю SEO...",
    "AI анализирует маркетинг...",
    "Готовлю отчёт...",
  ];

  async function handleAudit() {
    if (!url.trim()) return;
    let u = url.trim();
    if (!u.startsWith("http")) u = "https://" + u;

    setLoading(true); setError(null);
    setTechData(null); setMktData(null); setStep(0);

    const iv = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 2500);

    try {
      // PageSpeed
      const [mob, desk] = await Promise.all([
        fetchPageSpeed(u, "mobile"),
        fetchPageSpeed(u, "desktop"),
      ]);
      setTechData(parseTechnical(mob, desk));

      // Fetch HTML via proxy
      setMktLoading(true);
      let html = "";
      try {
        const r = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(u)}`);
        const d = await r.json();
        html = d.contents || "";
      } catch {}

      // AI marketing analysis
      const aiRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, url: u }),
      });
      const aiJson = await aiRes.json();
console.log('AI response:', aiRes.status, aiJson);
if (aiRes.ok) setMktData(aiJson);

    } catch (e) {
      setError("Не удалось проанализировать. Проверьте URL и попробуйте снова.");
    } finally {
      clearInterval(iv);
      setLoading(false);
      setMktLoading(false);
    }
  }

  const hasResults = techData || mktData;

  return (
    <div style={{ minHeight: "100vh", background: "#111", color: "#fff", fontFamily: "'Inter Tight', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::placeholder { color: #555; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .fu { animation: fadeUp 0.5s ease forwards; }
        a:hover { opacity: 0.85; }
      `}</style>

      {/* Header */}
      <header style={{ borderBottom: "1px solid #1e1e1e", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#111", zIndex: 100 }}>
        <a href="https://kirillova.online" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <span style={{ width: 32, height: 32, borderRadius: "50%", background: "#fff", color: "#111", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14 }}>К</span>
          <span style={{ fontSize: 14, fontWeight: 700 }}>kirillova.online</span>
        </a>
        <a href={TELEGRAM_URL} style={{ background: "#1B63FF", color: "#fff", borderRadius: 20, padding: "8px 18px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Написать</a>
      </header>

      {/* Hero */}
      <section style={{ padding: "60px 24px 40px", maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 20, padding: "6px 14px", marginBottom: 24, fontSize: 12, fontWeight: 700, color: "#888", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C8FF3D" }} />
          Бесплатный AI-аудит сайта
        </div>
        <h1 style={{ fontSize: "clamp(30px, 6vw, 52px)", fontWeight: 900, lineHeight: 1.02, letterSpacing: "-0.04em", marginBottom: 16 }}>
          Прожарим ваш сайт<br /><span style={{ color: "#C8FF3D" }}>за 30 секунд</span>
        </h1>
        <p style={{ fontSize: 16, color: "#888", lineHeight: 1.6, marginBottom: 36, maxWidth: 480, margin: "0 auto 36px" }}>
          Маркетинг, SEO, GEO и технический аудит —<br />узнайте где вы теряете клиентов
        </p>
        <div style={{ display: "flex", gap: 8, maxWidth: 580, margin: "0 auto", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 16, padding: 8 }}>
          <input type="text" value={url} onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !loading && handleAudit()}
            placeholder="yoursite.ru или https://..."
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 15, fontWeight: 500, padding: "10px 14px", fontFamily: "inherit" }} />
          <button onClick={handleAudit} disabled={loading || !url.trim()} style={{ background: loading ? "#2a2a2a" : "#C8FF3D", color: "#111", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 14, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}>
            {loading ? "Анализирую..." : "Проверить →"}
          </button>
        </div>
        {error && <p style={{ marginTop: 16, color: "#FF3D3D", fontSize: 13 }}>{error}</p>}
      </section>

      {/* Loading */}
      {loading && (
        <section style={{ padding: "20px 24px 40px", maxWidth: 500, margin: "0 auto", textAlign: "center" }}>
          <div style={{ width: 44, height: 44, border: "3px solid #222", borderTop: "3px solid #C8FF3D", borderRadius: "50%", margin: "0 auto 20px", animation: "spin 0.8s linear infinite" }} />
          <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{steps[step]}</p>
          <p style={{ fontSize: 13, color: "#666" }}>Обычно занимает 15–30 секунд</p>
          <div style={{ marginTop: 20, display: "flex", justifyContent: "center", gap: 6 }}>
            {steps.map((_, i) => (
              <div key={i} style={{ width: i <= step ? 20 : 6, height: 6, borderRadius: 3, background: i <= step ? "#C8FF3D" : "#2a2a2a", transition: "all 0.3s" }} />
            ))}
          </div>
        </section>
      )}

      {/* Results */}
      {hasResults && (
        <section style={{ padding: "0 24px 60px", maxWidth: 860, margin: "0 auto" }} className="fu">
          <p style={{ fontSize: 13, color: "#555", marginBottom: 28, textAlign: "center" }}>
            Результаты для: <span style={{ color: "#fff", fontWeight: 700 }}>{techData?.url || url}</span>
          </p>

          {/* Overall */}
          {techData && (
            <div style={{ background: "#161616", border: "1px solid #2a2a2a", borderRadius: 20, padding: "24px 28px", marginBottom: 24, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <CircleScore score={techData.overall} size={80} />
                <span style={{ fontSize: 10, color: "#666", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Технический</span>
              </div>
              {mktData?.overall_marketing_score !== undefined && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <CircleScore score={mktData.overall_marketing_score} size={80} />
                  <span style={{ fontSize: 10, color: "#666", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Маркетинг</span>
                </div>
              )}
              <div style={{ flex: 1, minWidth: 200 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10, letterSpacing: "-0.03em" }}>
                  {techData.overall >= 80 ? "Сайт в хорошей форме" : techData.overall >= 50 ? "Есть над чем поработать" : "Сайт теряет клиентов"}
                </h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {[
                    { label: "Скорость моб", s: techData.perf },
                    { label: "Скорость десктоп", s: techData.deskPerf },
                    { label: "SEO", s: techData.seo },
                    { label: "Доступность", s: techData.acc },
                  ].map(({ label, s }) => (
                    <div key={label} style={{ background: "#1e1e1e", borderRadius: 8, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: scoreColor(s) }}>{s}</span>
                      <span style={{ fontSize: 11, color: "#666" }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── 01 МАРКЕТИНГ ─── */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ background: "#1B63FF", color: "#fff", borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 800 }}>01</span>
              <h2 style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.03em" }}>Маркетинговый анализ</h2>
              {mktData?.overall_marketing_score !== undefined && (
                <span style={{ fontSize: 14, color: "#888" }}>
                  — <span style={{ color: scoreColor(mktData.overall_marketing_score), fontWeight: 800 }}>{mktData.overall_marketing_score}</span>/100
                </span>
              )}
            </div>

            {mktLoading && !mktData && (
              <div style={{ background: "#161616", border: "1px solid #2a2a2a", borderRadius: 20, padding: "32px", textAlign: "center" }}>
                <div style={{ width: 32, height: 32, border: "3px solid #222", borderTop: "3px solid #1B63FF", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
                <p style={{ fontSize: 14, fontWeight: 700 }}>AI анализирует маркетинг...</p>
              </div>
            )}

            {mktData?.sections && Object.values(mktData.sections).map((s, i) => (
              <SectionCard key={s.title}
                icon={["🎯","💡","👆","🤝","📋","📱"][i]}
                title={s.title} score={s.score} verdict={s.verdict}
                issues={s.issues} positives={s.positives}
                recommendation={s.recommendation} fix_tip={s.fix_tip}
                accent={i === 0}
              />
            ))}

            {mktData?.quick_wins?.length > 0 && (
              <div style={{ background: "#0f1a0f", border: "1px solid #1f3f1f", borderRadius: 16, padding: "16px 20px", marginTop: 4 }}>
                <p style={{ fontSize: 12, fontWeight: 800, color: "#C8FF3D", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>⚡ Быстрые улучшения</p>
                {mktData.quick_wins.map((w, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                    <span style={{ color: "#C8FF3D", fontWeight: 800 }}>→</span>
                    <span style={{ fontSize: 13, color: "#ccffcc", lineHeight: 1.5 }}>{w}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ─── 02 SEO ─── */}
          {techData && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ background: "#1B63FF", color: "#fff", borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 800 }}>02</span>
                <h2 style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.03em" }}>SEO-аудит</h2>
                <span style={{ fontSize: 14, color: "#888" }}>— <span style={{ color: scoreColor(techData.seo), fontWeight: 800 }}>{techData.seo}</span>/100</span>
              </div>
              <div style={{ background: "#161616", border: "1px solid #2a2a2a", borderRadius: 20, padding: "20px 24px" }}>
                {techData.seoItems.map((item, i) => <CheckItem key={i} {...item} />)}
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #2a2a2a" }}>
                  <a href={TELEGRAM_URL} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#1B63FF", color: "#fff", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                    🔧 Обсудить SEO с маркетологом →
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ─── 03 GEO / AI-поиск ─── */}
          {techData && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ background: "#1B63FF", color: "#fff", borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 800 }}>03</span>
                <h2 style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.03em" }}>GEO / AI-поиск</h2>
                <span style={{ fontSize: 12, color: "#666", fontStyle: "italic" }}>Видимость в Perplexity, ChatGPT, Яндекс AI</span>
              </div>
              <div style={{ background: "#161616", border: "1px solid #2a2a2a", borderRadius: 20, padding: "20px 24px" }}>
                <p style={{ fontSize: 13, color: "#888", marginBottom: 16, lineHeight: 1.5 }}>
                  GEO (Generative Engine Optimization) — оптимизация для AI-поисковиков. Чем лучше структурированы данные, тем чаще ваш сайт попадает в ответы ChatGPT и Perplexity.
                </p>
                {techData.geoItems.map((item, i) => <CheckItem key={i} {...item} />)}
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #2a2a2a" }}>
                  <a href={TELEGRAM_URL} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#1B63FF", color: "#fff", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                    🤖 Обсудить GEO-оптимизацию →
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ─── 04 ТЕХНИЧЕСКИЕ ─── */}
          {techData && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ background: "#1B63FF", color: "#fff", borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 800 }}>04</span>
                <h2 style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.03em" }}>Технические метрики</h2>
              </div>
              <div style={{ background: "#161616", border: "1px solid #2a2a2a", borderRadius: 20, padding: "20px 24px" }}>
                <p style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>Core Web Vitals — метрики скорости которые Google использует для ранжирования:</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 20 }}>
                  {[
                    { label: "FCP", value: techData.fcp, desc: "Первый контент", good: true },
                    { label: "LCP", value: techData.lcp, desc: "Главный контент", good: true },
                    { label: "Speed Index", value: techData.si, desc: "Индекс скорости", good: true },
                    { label: "TBT", value: techData.tbt, desc: "Блокировка", good: false },
                    { label: "CLS", value: techData.cls, desc: "Сдвиг макета", good: false },
                  ].map(({ label, value, desc }) => (
                    <div key={label} style={{ background: "#1e1e1e", borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 2 }}>{value}</div>
                      <div style={{ fontSize: 10, color: "#666", fontWeight: 600 }}>{desc}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 16 }}>
                  {[
                    { label: "Скорость мобильная", score: techData.perf },
                    { label: "Скорость десктоп", score: techData.deskPerf },
                    { label: "Доступность", score: techData.acc },
                    { label: "Best Practices", score: techData.bp },
                  ].map(({ label, score }) => (
                    <div key={label} style={{ background: "#1e1e1e", borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                      <CircleScore score={score} size={44} />
                      <div>
                        <div style={{ fontSize: 11, color: "#888", fontWeight: 600 }}>{label}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: scoreColor(score) }}>{scoreLabel(score)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <a href={TELEGRAM_URL} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#1B63FF", color: "#fff", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                  ⚡ Обсудить оптимизацию скорости →
                </a>
              </div>
            </div>
          )}

          {/* Top problems */}
          {mktData?.top_problems?.length > 0 && (
            <div style={{ background: "#1a0f0f", border: "1px solid #3a1f1f", borderRadius: 20, padding: "24px 28px", marginBottom: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, marginBottom: 16, color: "#FF3D3D", textTransform: "uppercase", letterSpacing: "0.08em" }}>🔥 Главные проблемы</h3>
              {mktData.top_problems.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                  <span style={{ minWidth: 22, height: 22, borderRadius: "50%", background: "#FF3D3D22", color: "#FF3D3D", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
                  <p style={{ fontSize: 14, lineHeight: 1.5, color: "#ffcccc" }}>{p}</p>
                </div>
              ))}
            </div>
          )}

          {/* Final CTA */}
          <div style={{ background: "#1B63FF", borderRadius: 20, padding: "32px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.03em" }}>Хотите чтобы это починили?</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.5, maxWidth: 400 }}>
                Разберу проблемы вручную и покажу конкретный план: что исправить, в каком порядке и как это повлияет на заявки.
              </p>
            </div>
            <a href={TELEGRAM_URL} style={{ background: "#C8FF3D", color: "#111", borderRadius: 12, padding: "14px 24px", fontSize: 15, fontWeight: 800, textDecoration: "none", whiteSpace: "nowrap" }}>
              Маркетинг-разбор за 3 500 ₽ →
            </a>
          </div>

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button onClick={() => { setTechData(null); setMktData(null); setUrl(""); }} style={{ background: "none", border: "1px solid #2a2a2a", color: "#666", borderRadius: 10, padding: "8px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Проверить другой сайт
            </button>
          </div>
        </section>
      )}

      <footer style={{ borderTop: "1px solid #1a1a1a", padding: "20px 24px", textAlign: "center", fontSize: 12, color: "#333" }}>
        kirillova.online · Ксения Кириллова — маркетолог, 15 лет в профессии
      </footer>
    </div>
  );
}
