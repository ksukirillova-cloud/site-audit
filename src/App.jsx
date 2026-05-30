import { useState } from "react";

const PAGESPEED_API_KEY = "AIzaSyB8O9to0nJJJMznVgTXqvsohJH16wXY6Z8";
const TELEGRAM_URL = "https://t.me/ksukirillova";

// ─── UTILS ───────────────────────────────────────────────────────────────────

function scoreColor(score) {
  if (score >= 80) return "#C8FF3D";
  if (score >= 50) return "#FF8C3D";
  return "#FF3D3D";
}

function scoreLabel(score) {
  if (score >= 80) return "Хорошо";
  if (score >= 50) return "Есть проблемы";
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

function IssueTag({ text, type = "error" }) {
  const colors = { error: "#FF3D3D", warning: "#FF8C3D", ok: "#C8FF3D" };
  const fg = colors[type];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: fg + "18", color: fg, border: `1px solid ${fg}33`,
      borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 700,
      marginRight: 6, marginBottom: 6,
    }}>
      {type === "error" ? "✗" : type === "warning" ? "⚠" : "✓"} {text}
    </span>
  );
}

function LockOverlay({ onUnlock }) {
  return (
    <div style={{
      position: "absolute", inset: 0,
      backdropFilter: "blur(6px)",
      background: "rgba(17,17,17,0.7)",
      borderRadius: 16,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 12, zIndex: 10,
    }}>
      <span style={{ fontSize: 28 }}>🔒</span>
      <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", textAlign: "center", maxWidth: 200 }}>
        Полный отчёт доступен после разбора
      </p>
      <a href={TELEGRAM_URL} style={{
        background: "#C8FF3D", color: "#111",
        borderRadius: 10, padding: "8px 18px",
        fontSize: 13, fontWeight: 800, textDecoration: "none",
      }}>
        Получить разбор →
      </a>
    </div>
  );
}

// ─── SEO PARSER ──────────────────────────────────────────────────────────────

async function fetchPageSpeed(url, strategy = "mobile") {
  const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&key=${PAGESPEED_API_KEY}`;
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error("PageSpeed API error");
  return res.json();
}

function parseSEO(mobileData, desktopData) {
  const lhr = mobileData.lighthouseResult;
  const cats = lhr.categories;
  const audits = lhr.audits;

  const perf = Math.round((cats.performance?.score || 0) * 100);
  const seo = Math.round((cats.seo?.score || 0) * 100);
  const acc = Math.round((cats.accessibility?.score || 0) * 100);
  const bp = Math.round((cats["best-practices"]?.score || 0) * 100);
  const desktopPerf = Math.round((desktopData.lighthouseResult.categories.performance?.score || 0) * 100);

  const fcp = audits["first-contentful-paint"]?.displayValue || "—";
  const lcp = audits["largest-contentful-paint"]?.displayValue || "—";
  const tbt = audits["total-blocking-time"]?.displayValue || "—";
  const cls = audits["cumulative-layout-shift"]?.displayValue || "—";
  const si  = audits["speed-index"]?.displayValue || "—";

  const checks = {
    metaDesc:   audits["meta-description"]?.score === 1,
    docTitle:   audits["document-title"]?.score === 1,
    canonical:  audits["canonical"]?.score === 1,
    robots:     audits["robots-txt"]?.score === 1,
    imgAlt:     audits["image-alt"]?.score === 1,
    linkText:   audits["link-text"]?.score === 1,
    viewport:   audits["viewport"]?.score === 1,
    tapTargets: audits["tap-targets"]?.score === 1,
    fontSize:   audits["font-size"]?.score === 1,
    https:      audits["is-on-https"]?.score === 1,
    httpRedir:  audits["redirects-http"]?.score === 1,
  };

  // Все пункты SEO
  const allSeoItems = [
    { key: "metaDesc",  label: "Мета-описание страницы",        ok: checks.metaDesc,   type: checks.metaDesc ? "ok" : "error" },
    { key: "docTitle",  label: "Title страницы",                ok: checks.docTitle,   type: checks.docTitle ? "ok" : "error" },
    { key: "canonical", label: "Canonical URL",                 ok: checks.canonical,  type: checks.canonical ? "ok" : "warning" },
    { key: "robots",    label: "Robots.txt",                    ok: checks.robots,     type: checks.robots ? "ok" : "warning" },
    { key: "imgAlt",    label: "Alt-теги у изображений",        ok: checks.imgAlt,     type: checks.imgAlt ? "ok" : "warning" },
    { key: "linkText",  label: "Осмысленные тексты ссылок",     ok: checks.linkText,   type: checks.linkText ? "ok" : "warning" },
    { key: "https",     label: "HTTPS",                         ok: checks.https,      type: checks.https ? "ok" : "error" },
    { key: "httpRedir", label: "Редирект HTTP → HTTPS",         ok: checks.httpRedir,  type: checks.httpRedir ? "ok" : "warning" },
    { key: "viewport",  label: "Viewport для мобильных",        ok: checks.viewport,   type: checks.viewport ? "ok" : "error" },
    { key: "tapTargets",label: "Размер кнопок на мобильном",    ok: checks.tapTargets, type: checks.tapTargets ? "ok" : "warning" },
  ];

  const overall = Math.round((perf + seo + acc + bp) / 4);

  return {
    overall, perf, seo, acc, bp, desktopPerf,
    fcp, lcp, tbt, cls, si,
    allSeoItems,
    url: lhr.finalUrl,
  };
}

// ─── MARKETING SECTION ───────────────────────────────────────────────────────

function MarketingSection({ data, locked }) {
  const sections = data?.sections ? Object.values(data.sections) : [];
  const visibleCount = 2; // бесплатно показываем 2 из 6

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 16, flexWrap: "wrap", gap: 8,
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#888" }}>
          🎯 Маркетинговый анализ
        </h2>
        {data?.overall_marketing_score !== undefined && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: "#888" }}>Общая оценка маркетинга:</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: scoreColor(data.overall_marketing_score) }}>
              {data.overall_marketing_score}
            </span>
          </div>
        )}
      </div>

      {/* Quick wins */}
      {data?.quick_wins?.length > 0 && (
        <div style={{
          background: "#0f1a0f", border: "1px solid #1f3f1f",
          borderRadius: 16, padding: "16px 20px", marginBottom: 16,
        }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: "#C8FF3D", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            ⚡ Быстрые улучшения
          </p>
          {data.quick_wins.map((win, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <span style={{ color: "#C8FF3D", fontWeight: 800, fontSize: 12 }}>→</span>
              <span style={{ fontSize: 13, color: "#ccffcc", lineHeight: 1.5 }}>{win}</span>
            </div>
          ))}
        </div>
      )}

      {/* Sections grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
        {sections.map((section, i) => {
          const isLocked = i >= visibleCount;
          return (
            <div key={section.title} style={{ position: "relative" }}>
              <div style={{
                background: "#161616", border: "1px solid #2a2a2a",
                borderRadius: 16, padding: "20px",
                filter: isLocked ? "blur(2px)" : "none",
                pointerEvents: isLocked ? "none" : "auto",
                userSelect: isLocked ? "none" : "auto",
              }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 800, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {section.title}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 18, fontWeight: 900, color: scoreColor(section.score) }}>{section.score}</span>
                    <span style={{ fontSize: 10, color: scoreColor(section.score), fontWeight: 700 }}>/100</span>
                  </div>
                </div>

                {/* Score bar */}
                <div style={{ background: "#2a2a2a", borderRadius: 4, height: 4, marginBottom: 14 }}>
                  <div style={{ width: `${section.score}%`, background: scoreColor(section.score), borderRadius: 4, height: 4, transition: "width 1s ease" }} />
                </div>

                {/* Verdict */}
                <p style={{ fontSize: 13, color: "#ccc", lineHeight: 1.5, marginBottom: 14 }}>{section.verdict}</p>

                {/* Issues */}
                {section.issues?.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    {section.issues.map((issue, j) => (
                      <IssueTag key={j} text={issue} type="error" />
                    ))}
                  </div>
                )}

                {/* Positives */}
                {section.positives?.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    {section.positives.map((p, j) => (
                      <IssueTag key={j} text={p} type="ok" />
                    ))}
                  </div>
                )}

                {/* Recommendation */}
                {section.recommendation && (
                  <div style={{
                    background: "#1e1e1e", borderRadius: 10, padding: "10px 12px", marginTop: 10,
                  }}>
                    <p style={{ fontSize: 11, color: "#888", fontWeight: 700, marginBottom: 4 }}>РЕКОМЕНДАЦИЯ</p>
                    <p style={{ fontSize: 12, color: "#aaa", lineHeight: 1.5 }}>{section.recommendation}</p>
                  </div>
                )}
              </div>
              {isLocked && <LockOverlay />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SEO SECTION ─────────────────────────────────────────────────────────────

function SEOSection({ data }) {
  const visibleCount = 3;
  return (
    <div style={{
      background: "#161616", border: "1px solid #2a2a2a",
      borderRadius: 20, padding: "24px 28px", marginBottom: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
        <h2 style={{ fontSize: 14, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#888" }}>
          🔍 SEO-чеклист
        </h2>
        <span style={{ fontSize: 13, color: "#888" }}>
          <span style={{ color: scoreColor(data.seo), fontWeight: 800 }}>{data.seo}</span>/100
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
        {data.allSeoItems.map((item, i) => {
          const isLocked = i >= visibleCount;
          return (
            <div key={item.key} style={{ position: "relative" }}>
              <div style={{
                background: "#1e1e1e", borderRadius: 10, padding: "12px 14px",
                display: "flex", alignItems: "center", gap: 10,
                filter: isLocked ? "blur(3px)" : "none",
                pointerEvents: isLocked ? "none" : "auto",
              }}>
                <span style={{
                  width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                  background: item.ok ? "#C8FF3D22" : "#FF3D3D22",
                  color: item.ok ? "#C8FF3D" : "#FF3D3D",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800,
                }}>{item.ok ? "✓" : "✗"}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: item.ok ? "#ccc" : "#fff" }}>{item.label}</span>
              </div>
              {isLocked && (
                <div style={{
                  position: "absolute", inset: 0,
                  backdropFilter: "blur(4px)",
                  background: "rgba(17,17,17,0.6)",
                  borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  zIndex: 10,
                }}>
                  <span style={{ fontSize: 16 }}>🔒</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: 16, padding: "12px 16px",
        background: "#1a1500", border: "1px solid #3a3000",
        borderRadius: 12,
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10,
      }}>
        <p style={{ fontSize: 13, color: "#ffeeaa" }}>
          🔒 Показано {visibleCount} из {data.allSeoItems.length} пунктов. Полный SEO-отчёт — в маркетинг-разборе.
        </p>
        <a href={TELEGRAM_URL} style={{
          background: "#C8FF3D", color: "#111",
          borderRadius: 8, padding: "6px 14px",
          fontSize: 12, fontWeight: 800, textDecoration: "none", whiteSpace: "nowrap",
        }}>
          Получить полный →
        </a>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function SiteAudit() {
  const [url, setUrl]               = useState("");
  const [loading, setLoading]       = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [seoData, setSeoData]       = useState(null);
  const [marketingData, setMarketingData] = useState(null);
  const [marketingLoading, setMarketingLoading] = useState(false);
  const [error, setError]           = useState(null);

  const loadingSteps = [
    "Загружаю страницу...",
    "Анализирую скорость...",
    "Проверяю SEO-теги...",
    "Тестирую мобильную версию...",
    "Запускаю AI-анализ маркетинга...",
    "Готовлю отчёт...",
  ];

  async function handleAudit() {
    if (!url.trim()) return;
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith("http")) cleanUrl = "https://" + cleanUrl;

    setLoading(true);
    setError(null);
    setSeoData(null);
    setMarketingData(null);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep(s => Math.min(s + 1, loadingSteps.length - 1));
    }, 2500);

    try {
      // 1. PageSpeed (параллельно мобайл + десктоп)
      const [mobile, desktop] = await Promise.all([
        fetchPageSpeed(cleanUrl, "mobile"),
        fetchPageSpeed(cleanUrl, "desktop"),
      ]);
      const seo = parseSEO(mobile, desktop);
      setSeoData(seo);

      // 2. Fetch HTML для AI-анализа
      setMarketingLoading(true);
      let html = "";
      try {
        const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(cleanUrl)}`;
        const htmlRes = await fetch(proxy);
        const htmlData = await htmlRes.json();
        html = htmlData.contents || "";
      } catch {
        html = "";
      }

      // 3. AI-анализ маркетинга
      const aiRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, url: cleanUrl }),
      });

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        setMarketingData(aiData);
      }

    } catch (e) {
      setError("Не удалось проанализировать сайт. Проверьте URL и попробуйте снова.");
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
      setMarketingLoading(false);
    }
  }

  const hasResults = seoData || marketingData;

  return (
    <div style={{
      minHeight: "100vh", background: "#111111",
      color: "#ffffff",
      fontFamily: "'Inter Tight', system-ui, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::placeholder { color: #555; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
      `}</style>

      {/* Header */}
      <header style={{
        borderBottom: "1px solid #1e1e1e", padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, background: "#111", zIndex: 100,
      }}>
        <a href="https://kirillova.online" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <span style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "#fff", color: "#111",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 14,
          }}>К</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>kirillova.online</span>
        </a>
        <a href={TELEGRAM_URL} style={{
          background: "#1B63FF", color: "#fff",
          borderRadius: 20, padding: "8px 18px",
          fontSize: 13, fontWeight: 700, textDecoration: "none",
        }}>Написать</a>
      </header>

      {/* Hero */}
      <section style={{ padding: "60px 24px 40px", maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "#1a1a1a", border: "1px solid #2a2a2a",
          borderRadius: 20, padding: "6px 14px", marginBottom: 24,
          fontSize: 12, fontWeight: 700, color: "#888",
          letterSpacing: "0.1em", textTransform: "uppercase",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C8FF3D" }} />
          Бесплатный AI-аудит сайта
        </div>

        <h1 style={{
          fontSize: "clamp(30px, 6vw, 52px)", fontWeight: 900,
          lineHeight: 1.02, letterSpacing: "-0.04em", marginBottom: 16,
        }}>
          Прожарим ваш сайт<br />
          <span style={{ color: "#C8FF3D" }}>за 30 секунд</span>
        </h1>

        <p style={{ fontSize: 16, color: "#888", lineHeight: 1.6, marginBottom: 36, maxWidth: 480, margin: "0 auto 36px" }}>
          SEO, скорость, мобильная версия и маркетинговый анализ —
          узнайте где вы теряете клиентов
        </p>

        {/* Input */}
        <div style={{
          display: "flex", gap: 8, maxWidth: 580, margin: "0 auto",
          background: "#1a1a1a", border: "1px solid #2a2a2a",
          borderRadius: 16, padding: 8,
        }}>
          <input
            type="text" value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !loading && handleAudit()}
            placeholder="ваш-сайт.ru или https://..."
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              color: "#fff", fontSize: 15, fontWeight: 500,
              padding: "10px 14px", fontFamily: "inherit",
            }}
          />
          <button onClick={handleAudit} disabled={loading || !url.trim()} style={{
            background: loading ? "#2a2a2a" : "#C8FF3D",
            color: "#111", border: "none", borderRadius: 10,
            padding: "10px 24px", fontSize: 14, fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer",
            whiteSpace: "nowrap", fontFamily: "inherit", transition: "all 0.2s",
          }}>
            {loading ? "Анализирую..." : "Проверить →"}
          </button>
        </div>

        {error && <p style={{ marginTop: 16, color: "#FF3D3D", fontSize: 13 }}>{error}</p>}
      </section>

      {/* Loading */}
      {loading && (
        <section style={{ padding: "20px 24px 40px", maxWidth: 500, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            width: 44, height: 44, border: "3px solid #222",
            borderTop: "3px solid #C8FF3D", borderRadius: "50%",
            margin: "0 auto 20px", animation: "spin 0.8s linear infinite",
          }} />
          <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{loadingSteps[loadingStep]}</p>
          <p style={{ fontSize: 13, color: "#666" }}>Обычно занимает 15–30 секунд</p>
          <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 6 }}>
            {loadingSteps.map((_, i) => (
              <div key={i} style={{
                width: i <= loadingStep ? 20 : 6, height: 6, borderRadius: 3,
                background: i <= loadingStep ? "#C8FF3D" : "#2a2a2a",
                transition: "all 0.3s",
              }} />
            ))}
          </div>
        </section>
      )}

      {/* Results */}
      {hasResults && (
        <section style={{ padding: "0 24px 60px", maxWidth: 960, margin: "0 auto" }} className="fade-up">

          <p style={{ fontSize: 13, color: "#555", marginBottom: 24, textAlign: "center" }}>
            Результаты для: <span style={{ color: "#fff", fontWeight: 700 }}>{seoData?.url || url}</span>
          </p>

          {/* Overall scores */}
          {seoData && (
            <div style={{
              background: "#161616", border: "1px solid #2a2a2a",
              borderRadius: 20, padding: "28px", marginBottom: 16,
              display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap",
            }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <CircleScore score={seoData.overall} size={90} />
                <span style={{ fontSize: 11, color: "#666", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Технический</span>
              </div>
              {marketingData?.overall_marketing_score !== undefined && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <CircleScore score={marketingData.overall_marketing_score} size={90} />
                  <span style={{ fontSize: 11, color: "#666", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Маркетинг</span>
                </div>
              )}
              <div style={{ flex: 1, minWidth: 200 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.03em" }}>
                  {seoData.overall >= 80 ? "Сайт в хорошей форме" :
                    seoData.overall >= 50 ? "Есть над чем поработать" :
                      "Сайт теряет клиентов"}
                </h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {[
                    { label: "Скорость моб", score: seoData.perf },
                    { label: "Скорость десктоп", score: seoData.desktopPerf },
                    { label: "SEO", score: seoData.seo },
                    { label: "Доступность", score: seoData.acc },
                  ].map(({ label, score }) => (
                    <div key={label} style={{
                      background: "#1e1e1e", borderRadius: 8, padding: "6px 12px",
                      display: "flex", alignItems: "center", gap: 6,
                    }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: scoreColor(score) }}>{score}</span>
                      <span style={{ fontSize: 11, color: "#666" }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Core Web Vitals */}
          {seoData && (
            <div style={{
              background: "#161616", border: "1px solid #2a2a2a",
              borderRadius: 20, padding: "24px 28px", marginBottom: 16,
            }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.1em", color: "#666" }}>
                ⚡ Core Web Vitals
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
                {[
                  { label: "FCP", value: seoData.fcp, desc: "Первый контент" },
                  { label: "LCP", value: seoData.lcp, desc: "Главный контент" },
                  { label: "Speed Index", value: seoData.si, desc: "Индекс скорости" },
                  { label: "TBT", value: seoData.tbt, desc: "Блокировка" },
                  { label: "CLS", value: seoData.cls, desc: "Сдвиг макета" },
                ].map(({ label, value, desc }) => (
                  <div key={label} style={{ background: "#1e1e1e", borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 2 }}>{value}</div>
                    <div style={{ fontSize: 10, color: "#666", fontWeight: 600 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEO checklist */}
          {seoData && <SEOSection data={seoData} />}

          {/* Marketing */}
          {marketingLoading && !marketingData && (
            <div style={{
              background: "#161616", border: "1px solid #2a2a2a",
              borderRadius: 20, padding: "32px", textAlign: "center", marginBottom: 16,
            }}>
              <div style={{
                width: 36, height: 36, border: "3px solid #222",
                borderTop: "3px solid #1B63FF", borderRadius: "50%",
                margin: "0 auto 16px", animation: "spin 0.8s linear infinite",
              }} />
              <p style={{ fontSize: 14, fontWeight: 700 }}>AI анализирует маркетинг...</p>
              <p style={{ fontSize: 12, color: "#666", marginTop: 6 }}>Оффер, УТП, путь клиента, доверие</p>
            </div>
          )}

          {marketingData && <MarketingSection data={marketingData} />}

          {/* Top problems */}
          {marketingData?.top_problems?.length > 0 && (
            <div style={{
              background: "#1a0f0f", border: "1px solid #3a1f1f",
              borderRadius: 20, padding: "24px 28px", marginBottom: 16,
            }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, marginBottom: 16, color: "#FF3D3D", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                🔥 Главные проблемы
              </h3>
              {marketingData.top_problems.map((problem, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                  <span style={{
                    minWidth: 22, height: 22, borderRadius: "50%",
                    background: "#FF3D3D22", color: "#FF3D3D",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 800, flexShrink: 0,
                  }}>{i + 1}</span>
                  <p style={{ fontSize: 14, lineHeight: 1.5, color: "#ffcccc" }}>{problem}</p>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div style={{
            background: "#1B63FF", borderRadius: 20, padding: "32px 28px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 20,
          }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.03em" }}>
                Хотите полный разбор с рекомендациями?
              </h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.5, maxWidth: 400 }}>
                Разберу оффер, упаковку и путь клиента вручную — и покажу конкретно что мешает заявкам.
              </p>
            </div>
            <a href={TELEGRAM_URL} style={{
              background: "#C8FF3D", color: "#111",
              borderRadius: 12, padding: "14px 24px",
              fontSize: 15, fontWeight: 800, textDecoration: "none", whiteSpace: "nowrap",
            }}>
              Маркетинг-разбор за 3 500 ₽ →
            </a>
          </div>

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button onClick={() => { setSeoData(null); setMarketingData(null); setUrl(""); }} style={{
              background: "none", border: "1px solid #2a2a2a",
              color: "#666", borderRadius: 10,
              padding: "8px 20px", fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}>
              Проверить другой сайт
            </button>
          </div>
        </section>
      )}

      <footer style={{
        borderTop: "1px solid #1a1a1a", padding: "20px 24px",
        textAlign: "center", fontSize: 12, color: "#333",
      }}>
        kirillova.online · Ксения Кириллова — маркетолог, 15 лет в профессии
      </footer>
    </div>
  );
}
