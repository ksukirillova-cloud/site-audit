import { useState, useEffect } from "react";

const PAGESPEED_API_KEY = import.meta.env.VITE_PAGESPEED_API_KEY || "";

const TELEGRAM_URL = "https://t.me/ksukirillova";
const CHANNEL_URL = "https://t.me/prosto_marketingg";
const CHECKLIST_BOT_URL = "https://t.me/prosto_marketing_ai_bot?start=checklist";
const MAIN_SITE_URL = "https://kirillova.online";
const AUDIT_SITE_URL = "https://audit.kirillova.online/";

const T = {
  bg: "#F0EDE6",
  white: "#FFFFFF",
  black: "#0F0F0F",
  blue: "#1B63FF",
  lime: "#C8FF3D",
  gray: "#6B6B6B",
  lightgray: "#E4E0D8",
  card: "#FAFAF7",
  border: "rgba(0,0,0,0.08)",
  red: "#D32F2F",
  orange: "#E65100",
  green: "#2E7D32",
};

function scoreColor(s) {
  return s >= 80 ? T.green : s >= 50 ? T.orange : T.red;
}

function scoreBg(s) {
  return s >= 80 ? "#E8F5E9" : s >= 50 ? "#FFF3E0" : "#FFEBEE";
}

function scoreLabel(s) {
  return s >= 80 ? "Хорошо" : s >= 50 ? "Проблемы" : "Критично";
}

function AnimatedNumber({ target }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let v = 0;
    const step = Math.max(target / 60, 1);

    const t = setInterval(() => {
      v = Math.min(v + step, target);
      setVal(Math.round(v));

      if (v >= target) clearInterval(t);
    }, 16);

    return () => clearInterval(t);
  }, [target]);

  return <>{val}</>;
}

function ScoreRing({ score, size = 72 }) {
  const r = size / 2 - 5;
  const circ = 2 * Math.PI * r;
  const [dash, setDash] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setDash((score / 100) * circ), 200);
    return () => clearTimeout(timeout);
  }, [score, circ]);

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)", position: "absolute" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={T.lightgray}
          strokeWidth={4}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={scoreColor(score)}
          strokeWidth={4}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: size * 0.24,
            fontWeight: 900,
            color: scoreColor(score),
            fontFamily: "'Space Grotesk', monospace",
            lineHeight: 1,
          }}
        >
          <AnimatedNumber target={score} />
        </span>
      </div>
    </div>
  );
}

function Tag({ text, type = "error" }) {
  const c = {
    error: { bg: "#FFEBEE", fg: T.red, border: "#FFCDD2" },
    ok: { bg: "#E8F5E9", fg: T.green, border: "#C8E6C9" },
    warning: { bg: "#FFF3E0", fg: T.orange, border: "#FFE0B2" },
  }[type];

  const icon = type === "ok" ? "✓" : type === "warning" ? "⚠" : "✗";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: c.bg,
        color: c.fg,
        border: `1px solid ${c.border}`,
        borderRadius: 6,
        padding: "3px 9px",
        fontSize: 11,
        fontWeight: 700,
        marginRight: 6,
        marginBottom: 6,
      }}
    >
      {icon} {text}
    </span>
  );
}

function AccordionCard({
  icon,
  title,
  score,
  verdict,
  issues = [],
  positives = [],
  recommendation,
  fix_tip,
  delay = 0,
}) {
  const [open, setOpen] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  return (
    <div
      style={{
        background: T.white,
        border: `1px solid ${hovered || open ? T.blue + "33" : T.border}`,
        borderRadius: 16,
        overflow: "hidden",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.4s ease, transform 0.4s ease, border-color 0.2s, box-shadow 0.2s",
        boxShadow: open
          ? "0 8px 32px rgba(27,99,255,0.1)"
          : hovered
          ? "0 4px 16px rgba(0,0,0,0.06)"
          : "0 1px 4px rgba(0,0,0,0.04)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          padding: "16px 18px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontFamily: "inherit",
          textAlign: "left",
        }}
      >
        <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: T.black }}>{title}</span>
            <span
              style={{
                background: scoreBg(score),
                color: scoreColor(score),
                borderRadius: 5,
                padding: "1px 6px",
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {scoreLabel(score)}
            </span>
          </div>

          <p
            style={{
              fontSize: 12,
              color: T.gray,
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {verdict}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: scoreBg(score),
              border: `2px solid ${scoreColor(score)}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 900, color: scoreColor(score) }}>
              {score}
            </span>
          </div>

          <span
            style={{
              color: T.gray,
              fontSize: 13,
              transform: open ? "rotate(180deg)" : "none",
              transition: "transform 0.3s ease",
            }}
          >
            ▾
          </span>
        </div>
      </button>

      <div
        style={{
          maxHeight: open ? "900px" : "0",
          overflow: "hidden",
          transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${T.border}` }}>
          <div
            style={{
              background: T.lightgray,
              borderRadius: 4,
              height: 4,
              margin: "14px 0 12px",
            }}
          >
            <div
              style={{
                width: `${score}%`,
                background: `linear-gradient(90deg, ${scoreColor(score)}88, ${scoreColor(score)})`,
                borderRadius: 4,
                height: 4,
                transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
              }}
            />
          </div>

          <p style={{ fontSize: 13, color: "#444", lineHeight: 1.6, marginBottom: 12 }}>
            {verdict}
          </p>

          {issues.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              {issues.map((t, i) => (
                <Tag key={i} text={t} type="error" />
              ))}
            </div>
          )}

          {positives.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              {positives.map((t, i) => (
                <Tag key={i} text={t} type="ok" />
              ))}
            </div>
          )}

          {recommendation && (
            <div
              style={{
                background: "#EEF3FF",
                border: "1px solid #C5D5FF",
                borderRadius: 10,
                padding: "12px 14px",
                marginBottom: 12,
              }}
            >
              <p
                style={{
                  fontSize: 10,
                  color: T.blue,
                  fontWeight: 800,
                  marginBottom: 4,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Рекомендация
              </p>
              <p style={{ fontSize: 13, color: "#1A3A80", lineHeight: 1.5, margin: 0 }}>
                {recommendation}
              </p>
            </div>
          )}

          {fix_tip && (
            <div style={{ marginBottom: 12 }}>
              <button
                onClick={() => setShowTip(!showTip)}
                style={{
                  background: "none",
                  border: `1px solid ${T.lightgray}`,
                  color: T.gray,
                  borderRadius: 8,
                  padding: "5px 12px",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                }}
              >
                {showTip ? "▲ Скрыть" : "▼ Как исправить самостоятельно"}
              </button>

              {showTip && (
                <div
                  style={{
                    marginTop: 8,
                    background: "#F1F8F1",
                    border: "1px solid #C8E6C9",
                    borderRadius: 10,
                    padding: "12px 14px",
                  }}
                >
                  <p style={{ fontSize: 13, color: "#1B5E20", lineHeight: 1.5, margin: 0 }}>
                    {fix_tip}
                  </p>
                </div>
              )}
            </div>
          )}

          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: score < 50 ? T.blue : "none",
              color: score < 50 ? "#fff" : T.blue,
              border: score < 50 ? "none" : `1.5px solid ${T.blue}`,
              borderRadius: 10,
              padding: "8px 14px",
              fontSize: 12,
              fontWeight: 700,
              transition: "all 0.2s",
              boxShadow: score < 50 ? "0 4px 14px rgba(27,99,255,0.25)" : "none",
            }}
          >
            {score < 50 ? "🔧 Обсудить как исправить →" : "💬 Обсудить с маркетологом"}
          </a>
        </div>
      </div>
    </div>
  );
}

function CheckItem({ label, ok, tip }) {
  const [showTip, setShowTip] = useState(false);

  return (
    <div style={{ marginBottom: 6 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: ok ? "#F1F8F1" : "#FFF5F5",
          border: `1px solid ${ok ? "#C8E6C9" : "#FFCDD2"}`,
          borderRadius: 10,
          padding: "9px 13px",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: ok ? T.green : T.red, fontWeight: 800, fontSize: 12 }}>
            {ok ? "✓" : "✗"}
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.black }}>{label}</span>
        </div>

        {!ok && tip && (
          <button
            onClick={() => setShowTip(!showTip)}
            style={{
              background: "none",
              border: `1px solid ${T.lightgray}`,
              color: T.gray,
              borderRadius: 6,
              padding: "3px 9px",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
            }}
          >
            {showTip ? "Скрыть" : "Как исправить"}
          </button>
        )}

        {ok && (
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noreferrer"
            style={{
              background: "none",
              border: `1px solid ${T.lightgray}`,
              color: T.gray,
              borderRadius: 6,
              padding: "3px 9px",
              fontSize: 11,
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            Обсудить
          </a>
        )}
      </div>

      {showTip && (
        <div
          style={{
            background: "#F1F8F1",
            border: "1px solid #C8E6C9",
            borderRadius: "0 0 10px 10px",
            padding: "10px 13px",
            marginTop: -4,
          }}
        >
          <p style={{ fontSize: 12, color: "#2E7D32", lineHeight: 1.5, margin: 0 }}>
            {tip}
          </p>
        </div>
      )}
    </div>
  );
}

function CTAPath({ href, icon, title, text, action, variant = "light" }) {
  const isBlue = variant === "blue";
  const isGreen = variant === "green";

  const baseBg = isBlue
    ? `linear-gradient(135deg, ${T.blue} 0%, #1045CC 100%)`
    : isGreen
    ? "#F0FAF0"
    : "#F8F5EF";

  const baseBorder = isBlue ? "none" : isGreen ? "1px solid #C8E6C9" : `1px solid ${T.border}`;

  const actionColor = isBlue ? T.lime : isGreen ? T.green : T.blue;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{
        background: baseBg,
        border: baseBorder,
        borderRadius: 16,
        padding: "20px",
        textDecoration: "none",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        boxShadow: isBlue ? "0 8px 24px rgba(27,99,255,0.25)" : "none",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = isGreen ? T.green : T.blue;
        if (isBlue) e.currentTarget.style.boxShadow = "0 12px 30px rgba(27,99,255,0.32)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.borderColor = isGreen ? "#C8E6C9" : T.border;
        if (isBlue) e.currentTarget.style.boxShadow = "0 8px 24px rgba(27,99,255,0.25)";
      }}
    >
      <span style={{ fontSize: 30 }}>{icon}</span>

      <p
        style={{
          fontSize: 15,
          fontWeight: 900,
          color: isBlue ? "#fff" : T.black,
          margin: 0,
        }}
      >
        {title}
      </p>

      <p
        style={{
          fontSize: 12,
          color: isBlue ? "rgba(255,255,255,0.76)" : T.gray,
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        {text}
      </p>

      <span
        style={{
          fontSize: isBlue ? 13 : 12,
          fontWeight: 900,
          color: actionColor,
          marginTop: 4,
        }}
      >
        {action}
      </span>
    </a>
  );
}

async function fetchPageSpeed(url, strategy = "mobile") {
  if (!PAGESPEED_API_KEY) {
    throw new Error("No PageSpeed API key");
  }

  const base = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
  const cats = ["performance", "seo", "accessibility", "best-practices"];
  const catParams = cats.map((c) => `category=${c}`).join("&");
  const endpoint = `${base}?url=${encodeURIComponent(url)}&strategy=${strategy}&key=${PAGESPEED_API_KEY}&${catParams}`;

  const res = await fetch(endpoint);
  if (!res.ok) throw new Error("PageSpeed error");

  return res.json();
}

function parseTech(mob, desk) {
  const lhr = mob.lighthouseResult;
  const cats = lhr.categories;
  const a = lhr.audits;

  const perf = Math.round((cats.performance?.score || 0) * 100);
  const seo = Math.round((cats.seo?.score || 0) * 100);
  const acc = Math.round((cats.accessibility?.score || 0) * 100);
  const bp = Math.round((cats["best-practices"]?.score || 0) * 100);
  const deskPerf = Math.round((desk.lighthouseResult.categories.performance?.score || 0) * 100);

  return {
    overall: Math.round((perf + seo + acc + bp) / 4),
    perf,
    seo,
    acc,
    bp,
    deskPerf,
    fcp: a["first-contentful-paint"]?.displayValue || "—",
    lcp: a["largest-contentful-paint"]?.displayValue || "—",
    tbt: a["total-blocking-time"]?.displayValue || "—",
    cls: a["cumulative-layout-shift"]?.displayValue || "—",
    si: a["speed-index"]?.displayValue || "—",
    url: lhr.finalUrl,
    seoItems: [
      {
        label: "Title страницы",
        ok: a["document-title"]?.score !== 0 && a["document-title"]?.score != null,
        tip: "Добавьте <title> в <head> — 50–60 символов.",
      },
      {
        label: "Мета-описание",
        ok: a["meta-description"]?.score !== 0 && a["meta-description"]?.score != null,
        tip: "Добавьте <meta name='description' content='...'> — 150–160 символов.",
      },
      {
        label: "Canonical URL",
        ok: a["canonical"]?.score !== 0 && a["canonical"]?.score != null,
        tip: "Добавьте <link rel='canonical' href='https://yoursite.com/page'>.",
      },
      {
        label: "Robots.txt",
        ok: a["robots-txt"]?.score !== 0 && a["robots-txt"]?.score != null,
        tip: "Создайте robots.txt: User-agent: * / Allow: /",
      },
      {
        label: "Alt-теги у изображений",
        ok: a["image-alt"]?.score !== 0 && a["image-alt"]?.score != null,
        tip: "Добавьте alt='описание' к каждому <img>.",
      },
      {
        label: "Тексты ссылок",
        ok: a["link-text"]?.score !== 0 && a["link-text"]?.score != null,
        tip: "Замените «нажмите здесь» на конкретные описания.",
      },
      {
        label: "HTTPS",
        ok: a["is-on-https"]?.score !== 0 && a["is-on-https"]?.score != null,
        tip: "Подключите SSL-сертификат. Часто это бесплатно через хостинг или Let's Encrypt.",
      },
      {
        label: "HTTP → HTTPS редирект",
        ok: a["redirects-http"]?.score !== 0 && a["redirects-http"]?.score != null,
        tip: "Настройте 301-редирект с HTTP на HTTPS.",
      },
      {
        label: "Viewport мобильных",
        ok: a["viewport"]?.score !== 0 && a["viewport"]?.score != null,
        tip: "<meta name='viewport' content='width=device-width, initial-scale=1'>",
      },
      {
        label: "Размер кнопок на мобильном",
        ok: a["tap-targets"]?.score !== 0 && a["tap-targets"]?.score != null,
        tip: "Кнопки и ссылки должны быть достаточно крупными для нажатия на телефоне.",
      },
    ],
    geoItems: [
      {
        label: "Open Graph теги",
        ok: false,
        tip: "Добавьте og:title, og:description, og:image для красивого превью в соцсетях.",
      },
      {
        label: "Schema.org разметка",
        ok: false,
        tip: "Добавьте JSON-LD: Organization, LocalBusiness, Product или Service.",
      },
      {
        label: "Hreflang",
        ok: a["hreflang"]?.score !== 0 && a["hreflang"]?.score != null,
        tip: "Для мультиязычных сайтов добавьте <link rel='alternate' hreflang='ru'>.",
      },
      {
        label: "Sitemap.xml",
        ok: false,
        tip: "Создайте sitemap.xml и добавьте его в Google Search Console / Яндекс Вебмастер.",
      },
      {
        label: "Структурированные данные",
        ok: false,
        tip: "JSON-LD помогает AI-поисковикам и поисковым системам лучше понимать страницу.",
      },
    ],
  };
}

export default function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [tech, setTech] = useState(null);
  const [mkt, setMkt] = useState(null);
  const [mktLoading, setMktLoading] = useState(false);
  const [seoOverride, setSeoOverride] = useState(null);
  const [error, setError] = useState(null);
  const [focused, setFocused] = useState(false);

  const steps = [
    "Загружаю страницу...",
    "Анализирую скорость...",
    "Проверяю SEO...",
    "AI анализирует маркетинг...",
    "Готовлю отчёт...",
  ];

  async function run() {
    if (!url.trim()) return;

    let u = url.trim();
    if (!u.startsWith("http")) u = "https://" + u;

    setLoading(true);
    setError(null);
    setTech(null);
    setMkt(null);
    setSeoOverride(null);
    setStep(0);

    const iv = setInterval(() => {
      setStep((s) => Math.min(s + 1, steps.length - 1));
    }, 2500);

    try {
      const [mob, desk] = await Promise.all([
        fetchPageSpeed(u, "mobile"),
        fetchPageSpeed(u, "desktop"),
      ]);

      setTech(parseTech(mob, desk));
      setMktLoading(true);

      let html = "";

      try {
        const r = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(u)}`);
        html = (await r.json()).contents || "";
      } catch {
        html = "";
      }

      const ai = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, url: u }),
      });

      if (ai.ok) {
        const aiData = await ai.json();
        if (aiData.seoData) setSeoOverride(aiData.seoData);
        setMkt(aiData);
      }
    } catch (e) {
      console.error(e);
      setError("Не удалось проанализировать. Проверьте URL или попробуйте другой сайт.");
    } finally {
      clearInterval(iv);
      setLoading(false);
      setMktLoading(false);
    }
  }

  const sections = mkt?.sections ? Object.values(mkt.sections) : [];
  const icons = ["🎯", "💡", "👆", "🤝", "📋", "📱"];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        color: T.black,
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=Space+Grotesk:wght@700;800;900&display=swap');

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        ::placeholder {
          color: #bbb;
        }

        a {
          text-decoration: none;
          color: inherit;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .fu {
          animation: fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) both;
        }

        .fu1 {
          animation: fadeUp 0.5s 0.1s cubic-bezier(0.4,0,0.2,1) both;
        }

        .fu2 {
          animation: fadeUp 0.5s 0.2s cubic-bezier(0.4,0,0.2,1) both;
        }

        .btn-lime {
          transition: all 0.2s ease !important;
        }

        .btn-lime:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 28px rgba(200,255,61,0.35) !important;
        }

        .btn-blue {
          transition: all 0.2s ease !important;
        }

        .btn-blue:hover {
          transform: translateY(-1px) !important;
          box-shadow: 0 6px 20px rgba(27,99,255,0.3) !important;
        }

        @media (max-width: 640px) {
          .url-form {
            flex-direction: column;
          }

          .url-form button {
            width: 100%;
          }
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(27,99,255,0.07) 0%, transparent 65%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(200,255,61,0.08) 0%, transparent 65%)",
          }}
        />
      </div>

      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(240,237,230,0.85)",
          backdropFilter: "blur(16px)",
          borderBottom: `1px solid ${T.border}`,
          padding: "13px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <a href={MAIN_SITE_URL} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: T.black,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: 14,
            }}
          >
            К
          </span>

          <span style={{ fontSize: 14, fontWeight: 700, color: T.black }}>
            kirillova.online
          </span>
        </a>

        <a
          href={TELEGRAM_URL}
          target="_blank"
          rel="noreferrer"
          className="btn-blue"
          style={{
            background: T.blue,
            color: "#fff",
            borderRadius: 20,
            padding: "8px 18px",
            fontSize: 13,
            fontWeight: 700,
            boxShadow: "0 3px 12px rgba(27,99,255,0.25)",
          }}
        >
          Написать
        </a>
      </header>

      <section
        style={{
          position: "relative",
          zIndex: 1,
          padding: "64px 24px 48px",
          maxWidth: 720,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <div
          className="fu"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: T.white,
            border: `1px solid ${T.border}`,
            borderRadius: 20,
            padding: "6px 14px",
            marginBottom: 24,
            fontSize: 11,
            fontWeight: 700,
            color: T.gray,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#4CAF50",
              boxShadow: "0 0 6px #4CAF50",
              animation: "pulse 2s infinite",
            }}
          />
          Бесплатная AI-прожарка сайта
        </div>

        <h1
          className="fu1"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(32px, 6vw, 58px)",
            fontWeight: 900,
            lineHeight: 1.03,
            letterSpacing: "-0.04em",
            marginBottom: 10,
            color: T.black,
          }}
        >
          Где ваш сайт
        </h1>

        <h1
          className="fu1"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(32px, 6vw, 58px)",
            fontWeight: 900,
            lineHeight: 1.03,
            letterSpacing: "-0.04em",
            marginBottom: 20,
            background: `linear-gradient(135deg, ${T.blue} 0%, #5B8CFF 50%, #C8FF3D 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          теряет заявки?
        </h1>

        <p
          className="fu2"
          style={{
            fontSize: 15,
            color: T.gray,
            lineHeight: 1.7,
            marginBottom: 36,
            maxWidth: 500,
            margin: "0 auto 36px",
          }}
        >
          Вставьте ссылку — AI-аудит покажет первые точки потерь:
          оффер, доверие, SEO, скорость, структуру и путь заявки.
        </p>

        <div
          className="fu2 url-form"
          style={{
            display: "flex",
            gap: 8,
            maxWidth: 560,
            margin: "0 auto",
            background: T.white,
            border: `1.5px solid ${focused ? T.blue : T.border}`,
            borderRadius: 14,
            padding: 6,
            boxShadow: focused
              ? `0 0 0 3px rgba(27,99,255,0.1), 0 4px 20px rgba(0,0,0,0.06)`
              : "0 2px 12px rgba(0,0,0,0.05)",
            transition: "all 0.3s ease",
          }}
        >
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && run()}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="yoursite.ru или https://..."
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: T.black,
              fontSize: 15,
              fontWeight: 500,
              padding: "10px 14px",
              fontFamily: "inherit",
            }}
          />

          <button
            onClick={run}
            disabled={loading || !url.trim()}
            className="btn-lime"
            style={{
              background: loading ? T.lightgray : T.lime,
              color: T.black,
              border: "none",
              borderRadius: 10,
              padding: "10px 22px",
              fontSize: 14,
              fontWeight: 800,
              whiteSpace: "nowrap",
              fontFamily: "inherit",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 3px 12px rgba(200,255,61,0.3)",
            }}
          >
            {loading ? "Анализирую..." : "Проверить →"}
          </button>
        </div>

        <div
          className="fu2"
          style={{
            marginTop: 16,
            display: "flex",
            justifyContent: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <a
            href={CHECKLIST_BOT_URL}
            target="_blank"
            rel="noreferrer"
            style={{
              color: T.blue,
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            Забрать чек-лист «20 точек потери клиентов» →
          </a>
        </div>

        {error && <p style={{ marginTop: 14, color: T.red, fontSize: 13 }}>{error}</p>}
      </section>

      {loading && (
        <section
          style={{
            position: "relative",
            zIndex: 1,
            padding: "10px 24px 40px",
            maxWidth: 460,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              border: `3px solid ${T.lightgray}`,
              borderTop: `3px solid ${T.blue}`,
              borderRadius: "50%",
              margin: "0 auto 18px",
              animation: "spin 0.8s linear infinite",
            }}
          />

          <p style={{ fontSize: 15, fontWeight: 700, color: T.black, marginBottom: 5 }}>
            {steps[step]}
          </p>

          <p style={{ fontSize: 12, color: T.gray }}>Обычно 15–30 секунд</p>

          <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 5 }}>
            {steps.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i <= step ? 18 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: i <= step ? T.blue : T.lightgray,
                  transition: "all 0.3s",
                }}
              />
            ))}
          </div>
        </section>
      )}

      {(tech || mkt) && (
        <section
          style={{
            position: "relative",
            zIndex: 1,
            padding: "0 24px 72px",
            maxWidth: 920,
            margin: "0 auto",
          }}
          className="fu"
        >
          <p style={{ fontSize: 12, color: T.gray, marginBottom: 24, textAlign: "center" }}>
            Результаты для:{" "}
            <span style={{ color: T.black, fontWeight: 700 }}>{tech?.url || url}</span>
          </p>

          {tech && (
            <div
              style={{
                background: T.white,
                border: `1px solid ${T.border}`,
                borderRadius: 20,
                padding: "22px 26px",
                marginBottom: 28,
                display: "flex",
                alignItems: "center",
                gap: 20,
                flexWrap: "wrap",
                boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <ScoreRing score={tech.overall} size={72} />
                <span
                  style={{
                    fontSize: 10,
                    color: T.gray,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Технический
                </span>
              </div>

              {mkt?.overall_marketing_score !== undefined && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <ScoreRing score={mkt.overall_marketing_score} size={72} />
                  <span
                    style={{
                      fontSize: 10,
                      color: T.gray,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    Маркетинг
                  </span>
                </div>
              )}

              <div style={{ flex: 1, minWidth: 200 }}>
                <h2
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 17,
                    fontWeight: 800,
                    marginBottom: 10,
                    letterSpacing: "-0.02em",
                    color: T.black,
                  }}
                >
                  {tech.overall >= 80
                    ? "Сайт в хорошей форме"
                    : tech.overall >= 50
                    ? "Есть над чем поработать"
                    : "Сайт теряет клиентов"}
                </h2>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {[
                    { label: "Скорость моб", s: tech.perf },
                    { label: "Скорость десктоп", s: tech.deskPerf },
                    { label: "SEO", s: tech.seo },
                    { label: "Доступность", s: tech.acc },
                  ].map(({ label, s }) => (
                    <div
                      key={label}
                      style={{
                        background: scoreBg(s),
                        border: `1px solid ${scoreColor(s)}22`,
                        borderRadius: 8,
                        padding: "4px 10px",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 800, color: scoreColor(s) }}>
                        {s}
                      </span>
                      <span style={{ fontSize: 11, color: T.gray }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {[
            { num: "01", title: "Маркетинговый анализ", score: mkt?.overall_marketing_score, content: "mkt" },
            { num: "02", title: "SEO-аудит", score: seoOverride?.seoScore ?? tech?.seo, content: "seo" },
            { num: "03", title: "GEO / AI-поиск", content: "geo", subtitle: "Perplexity, ChatGPT, Яндекс AI" },
            { num: "04", title: "Технические метрики", content: "tech" },
          ].map(({ num, title, score, subtitle, content }) => (
            <div key={num} style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                <span
                  style={{
                    background: T.blue,
                    color: "#fff",
                    borderRadius: 8,
                    padding: "4px 10px",
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  {num}
                </span>

                <h2
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 17,
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    margin: 0,
                    color: T.black,
                  }}
                >
                  {title}
                </h2>

                {score !== undefined && (
                  <span style={{ fontSize: 13, color: T.gray }}>
                    — <span style={{ color: scoreColor(score), fontWeight: 800 }}>{score}</span>/100
                  </span>
                )}

                {subtitle && (
                  <span style={{ fontSize: 11, color: T.gray, fontStyle: "italic" }}>
                    {subtitle}
                  </span>
                )}
              </div>

              {content === "mkt" && (
                <>
                  {mktLoading && !mkt && (
                    <div
                      style={{
                        background: T.white,
                        border: `1px solid ${T.border}`,
                        borderRadius: 14,
                        padding: "28px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          border: `3px solid ${T.lightgray}`,
                          borderTop: `3px solid ${T.blue}`,
                          borderRadius: "50%",
                          margin: "0 auto 14px",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                      <p style={{ fontSize: 13, fontWeight: 700, color: T.black }}>
                        AI анализирует маркетинг...
                      </p>
                    </div>
                  )}

                  {sections.length > 0 && (
                    <>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                          gap: 10,
                          alignItems: "start",
                        }}
                      >
                        {sections.slice(0, 2).map((s, i) => (
                          <AccordionCard key={s.title} icon={icons[i]} {...s} delay={i * 60} />
                        ))}
                      </div>

                      {sections.length > 2 && (
                        <div
                          style={{
                            marginTop: 10,
                            borderRadius: 16,
                            border: "1px solid rgba(0,0,0,0.08)",
                            background: "#fff",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              filter: "blur(6px)",
                              pointerEvents: "none",
                              userSelect: "none",
                              opacity: 0.5,
                              maxHeight: 200,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                                gap: 10,
                                padding: 10,
                              }}
                            >
                              {sections.slice(2).map((s, i) => (
                                <AccordionCard key={s.title} icon={icons[i + 2]} {...s} delay={0} />
                              ))}
                            </div>
                          </div>

                          <div
                            style={{
                              background: "rgba(240,237,230,0.95)",
                              borderTop: "1px solid rgba(0,0,0,0.06)",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 10,
                              padding: "20px 24px",
                              textAlign: "center",
                            }}
                          >
                            <span style={{ fontSize: 28 }}>🔒</span>

                            <p style={{ fontSize: 15, fontWeight: 800, color: "#111", margin: 0 }}>
                              Полный маркетинговый анализ
                            </p>

                            <p style={{ fontSize: 13, color: "#555", margin: 0, maxWidth: 360 }}>
                              Ещё 4 блока: путь клиента, доверие, структура, мобильный UX.
                            </p>

                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
                              <a
                                href={TELEGRAM_URL}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  background: "#1B63FF",
                                  color: "#fff",
                                  borderRadius: 12,
                                  padding: "11px 20px",
                                  fontSize: 13,
                                  fontWeight: 800,
                                  textDecoration: "none",
                                  boxShadow: "0 4px 16px rgba(27,99,255,0.3)",
                                }}
                              >
                                Маркетинг-разбор за 3 500 ₽ →
                              </a>

                              <a
                                href={CHECKLIST_BOT_URL}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  background: "#fff",
                                  color: "#1B63FF",
                                  border: "2px solid #1B63FF",
                                  borderRadius: 12,
                                  padding: "11px 20px",
                                  fontSize: 13,
                                  fontWeight: 800,
                                  textDecoration: "none",
                                }}
                              >
                                Забрать чек-лист
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {(mkt?.quick_wins?.length > 0 || mkt?.top_problems?.length > 0) && (
                    <div
                      style={{
                        background: "#fff",
                        border: "1px solid rgba(0,0,0,0.08)",
                        borderRadius: 12,
                        overflow: "hidden",
                        marginTop: 10,
                      }}
                    >
                      <div
                        style={{
                          filter: "blur(5px)",
                          pointerEvents: "none",
                          userSelect: "none",
                          opacity: 0.5,
                          padding: "14px 18px",
                        }}
                      >
                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            color: T.green,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            marginBottom: 8,
                          }}
                        >
                          ⚡ Быстрые улучшения
                        </p>

                        {(mkt.quick_wins || []).slice(0, 2).map((w, i) => (
                          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5 }}>
                            <span style={{ color: T.green, fontWeight: 800 }}>→</span>
                            <span style={{ fontSize: 13, color: "#1B5E20" }}>{w}</span>
                          </div>
                        ))}

                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            color: T.red,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            margin: "10px 0 8px",
                          }}
                        >
                          🔥 Главные проблемы
                        </p>

                        {(mkt.top_problems || []).slice(0, 2).map((p, i) => (
                          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5 }}>
                            <span style={{ color: T.red, fontWeight: 800 }}>{i + 1}.</span>
                            <span style={{ fontSize: 13, color: "#B71C1C" }}>{p}</span>
                          </div>
                        ))}
                      </div>

                      <div
                        style={{
                          background: "rgba(240,237,230,0.95)",
                          borderTop: "1px solid rgba(0,0,0,0.06)",
                          padding: "16px 20px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: 12,
                        }}
                      >
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 800, color: "#111", margin: "0 0 3px" }}>
                            🔒 Выводы и план действий
                          </p>
                          <p style={{ fontSize: 12, color: T.gray, margin: 0 }}>
                            Быстрые улучшения и главные проблемы — в полном разборе.
                          </p>
                        </div>

                        <a
                          href={TELEGRAM_URL}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            background: "#1B63FF",
                            color: "#fff",
                            borderRadius: 10,
                            padding: "9px 16px",
                            fontSize: 12,
                            fontWeight: 800,
                            textDecoration: "none",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Получить разбор →
                        </a>
                      </div>
                    </div>
                  )}
                </>
              )}

              {content === "seo" && tech && (
                <div
                  style={{
                    background: T.white,
                    border: `1px solid ${T.border}`,
                    borderRadius: 16,
                    padding: "16px 18px",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.03)",
                  }}
                >
                  {(seoOverride?.seoItems || tech.seoItems).map((item, i) => (
                    <CheckItem key={i} {...item} />
                  ))}

                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
                    <a
                      href={TELEGRAM_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-blue"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        background: T.blue,
                        color: "#fff",
                        borderRadius: 10,
                        padding: "9px 15px",
                        fontSize: 13,
                        fontWeight: 700,
                        boxShadow: "0 3px 12px rgba(27,99,255,0.2)",
                      }}
                    >
                      🔧 Обсудить SEO с маркетологом →
                    </a>
                  </div>
                </div>
              )}

              {content === "geo" && tech && (
                <div
                  style={{
                    background: T.white,
                    border: `1px solid ${T.border}`,
                    borderRadius: 16,
                    padding: "16px 18px",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.03)",
                  }}
                >
                  <div
                    style={{
                      background: "#F8F5EF",
                      borderRadius: 10,
                      padding: "10px 13px",
                      marginBottom: 12,
                    }}
                  >
                    <p style={{ fontSize: 12, color: T.gray, lineHeight: 1.5, margin: 0 }}>
                      GEO — оптимизация для AI-поисковиков. Структурированные данные помогают
                      ChatGPT, Perplexity и AI-поиску правильно понять сайт.
                    </p>
                  </div>

                  {(seoOverride?.geoItems || tech.geoItems).map((item, i) => (
                    <CheckItem key={i} {...item} />
                  ))}

                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
                    <a
                      href={TELEGRAM_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-blue"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        background: T.blue,
                        color: "#fff",
                        borderRadius: 10,
                        padding: "9px 15px",
                        fontSize: 13,
                        fontWeight: 700,
                        boxShadow: "0 3px 12px rgba(27,99,255,0.2)",
                      }}
                    >
                      🤖 Обсудить GEO-оптимизацию →
                    </a>
                  </div>
                </div>
              )}

              {content === "tech" && tech && (
                <div
                  style={{
                    background: T.white,
                    border: `1px solid ${T.border}`,
                    borderRadius: 16,
                    padding: "16px 18px",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.03)",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(108px, 1fr))",
                      gap: 8,
                      marginBottom: 14,
                    }}
                  >
                    {[
                      { v: tech.fcp, d: "FCP — Первый контент" },
                      { v: tech.lcp, d: "LCP — Главный контент" },
                      { v: tech.si, d: "Speed Index" },
                      { v: tech.tbt, d: "TBT — Блокировка" },
                      { v: tech.cls, d: "CLS — Сдвиг макета" },
                    ].map(({ v, d }) => (
                      <div
                        key={d}
                        style={{
                          background: T.bg,
                          border: `1px solid ${T.border}`,
                          borderRadius: 10,
                          padding: "10px 12px",
                        }}
                      >
                        <div style={{ fontSize: 15, fontWeight: 800, color: T.black, marginBottom: 2 }}>
                          {v}
                        </div>
                        <div style={{ fontSize: 10, color: T.gray, fontWeight: 600, lineHeight: 1.3 }}>
                          {d}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    {[
                      { label: "Скорость мобильная", s: tech.perf },
                      { label: "Скорость десктоп", s: tech.deskPerf },
                      { label: "Доступность", s: tech.acc },
                      { label: "Best Practices", s: tech.bp },
                    ].map(({ label, s }) => (
                      <div
                        key={label}
                        style={{
                          background: scoreBg(s),
                          border: `1px solid ${scoreColor(s)}22`,
                          borderRadius: 10,
                          padding: "10px 13px",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            border: `2px solid ${scoreColor(s)}`,
                            background: T.white,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <span style={{ fontSize: 11, fontWeight: 900, color: scoreColor(s) }}>
                            {s}
                          </span>
                        </div>

                        <div>
                          <div style={{ fontSize: 10, color: T.gray, fontWeight: 600 }}>
                            {label}
                          </div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: scoreColor(s) }}>
                            {scoreLabel(s)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <a
                    href={TELEGRAM_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-blue"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: T.blue,
                      color: "#fff",
                      borderRadius: 10,
                      padding: "9px 15px",
                      fontSize: 13,
                      fontWeight: 700,
                      boxShadow: "0 3px 12px rgba(27,99,255,0.2)",
                    }}
                  >
                    ⚡ Обсудить оптимизацию скорости →
                  </a>
                </div>
              )}
            </div>
          ))}

          <div
            style={{
              background: T.white,
              border: `1px solid ${T.border}`,
              borderRadius: 20,
              padding: "28px 26px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
            }}
          >
            <h3
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 22,
                fontWeight: 900,
                marginBottom: 8,
                letterSpacing: "-0.03em",
                color: T.black,
                textAlign: "center",
              }}
            >
              Что делать дальше?
            </h3>

            <p
              style={{
                fontSize: 14,
                color: T.gray,
                textAlign: "center",
                marginBottom: 22,
                lineHeight: 1.6,
              }}
            >
              AI-аудит показал первые точки потерь. Теперь можно выбрать следующий шаг:
              сохранить чек-лист, остаться в канале или заказать человеческий разбор.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
              }}
            >
              <CTAPath
                href={CHECKLIST_BOT_URL}
                icon="📋"
                title="Забрать чек-лист"
                text="PDF «20 точек, где сайт теряет клиентов»: оффер, заявка, доверие, контент и AI-инструменты."
                action="Получить в Telegram-боте →"
                variant="green"
              />

              <CTAPath
                href={CHANNEL_URL}
                icon="📢"
                title="Подписаться на канал"
                text="Маркетинг, сайты и AI без воды: разборы, ошибки сайтов, инструменты и примеры воронок."
                action="Перейти в Prosto MARKETING →"
              />

              <CTAPath
                href={TELEGRAM_URL}
                icon="🔧"
                title="Заказать человеческий разбор"
                text="Я посмотрю сайт вручную и покажу, что мешает заявкам: оффер, структура, доверие, CTA или путь заявки."
                action="Маркетинг-разбор от 3 500 ₽ →"
                variant="blue"
              />
            </div>

            <div
              style={{
                marginTop: 18,
                background: "#EEF3FF",
                border: "1px solid #C5D5FF",
                borderRadius: 14,
                padding: "14px 16px",
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: 13, color: "#1A3A80", lineHeight: 1.55, margin: 0 }}>
                Логика простая: <b>AI-аудит</b> показывает первые проблемы →{" "}
                <b>чек-лист</b> помогает пройтись глубже → <b>разбор</b> показывает,
                что чинить в первую очередь.
              </p>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 18 }}>
            <button
              onClick={() => {
                setTech(null);
                setMkt(null);
                setUrl("");
              }}
              style={{
                background: "none",
                border: `1px solid ${T.border}`,
                color: T.gray,
                borderRadius: 10,
                padding: "8px 18px",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "inherit",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Проверить другой сайт
            </button>
          </div>
        </section>
      )}

      <footer
        style={{
          position: "relative",
          zIndex: 1,
          borderTop: `1px solid ${T.border}`,
          padding: "18px 24px",
          textAlign: "center",
          fontSize: 12,
          color: T.gray,
          background: "rgba(240,237,230,0.6)",
        }}
      >
        <a href={MAIN_SITE_URL} target="_blank" rel="noreferrer" style={{ fontWeight: 700 }}>
          kirillova.online
        </a>{" "}
        · Ксения Кириллoва — маркетолог, 15 лет в профессии ·{" "}
        <a href={CHANNEL_URL} target="_blank" rel="noreferrer" style={{ fontWeight: 700 }}>
          Prosto MARKETING
        </a>
      </footer>
    </div>
  );
}
