import { APP_URL, FONT_MONO, Logo } from "./ui";

/** Minimal header for the trick index — the page is a reference, not a sales page. */
export function SiteHeader() {
  return (
    <header
      style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(248,250,252,0.85)",
        backdropFilter: "blur(14px) saturate(180%)",
        WebkitBackdropFilter: "blur(14px) saturate(180%)",
        borderBottom: "1px solid rgba(15,23,42,0.06)",
      }}
    >
      <div
        className="container"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0" }}
      >
        <a href="/" style={{ textDecoration: "none" }}><Logo /></a>
        <a
          className="btn-primary"
          href={APP_URL}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 16px",
            background: "var(--td-primary)", color: "#fff", borderRadius: 999,
            fontSize: 13, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap",
          }}
        >
          Open the app
        </a>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
      <div
        className="container"
        style={{ padding: "40px 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Logo size={18} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#64748b", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
            the wakeboard trick list
          </span>
        </div>
        <div style={{ display: "flex", gap: 22, fontSize: 13, color: "#64748b" }}>
          <a href={APP_URL} className="footer-link">Open the app</a>
          <a href="https://www.wakeboard.co.uk" className="footer-link">WakeboardUK</a>
          <a href="mailto:hello@wakeboard.com" className="footer-link">Contact</a>
        </div>
        <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>© 2026 Jeremy Nevill &amp; Mark Osmond</p>
      </div>

      {/* Provenance — the Global Trick List's origin and creators. Quiet, sitewide. */}
      <div className="container" style={{ paddingBottom: 40, marginTop: -20 }}>
        <p style={{ margin: 0, paddingTop: 20, borderTop: "1px solid #e2e8f0", fontSize: 12, lineHeight: 1.5, color: "#94a3b8", maxWidth: 620 }}>
          THE WAKEBOARD TRICK LIST at wakeboard.com is created by{" "}
          <a href="https://www.wakeboard.co.uk/Competitors/Details/2046" className="footer-link" style={{ color: "#64748b", fontWeight: 600 }}>Jeremy Nevill</a>
          {" & "}
          <a href="https://www.wakeboard.co.uk/Competitors/Details/865" className="footer-link" style={{ color: "#64748b", fontWeight: 600 }}>Mark Osmond</a>.
        </p>
      </div>
    </footer>
  );
}
