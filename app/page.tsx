"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  APP_URL, FONT_DISPLAY, FONT_MONO, Icon,
  ButtonPrimary, ButtonSecondary, Logo,
} from "@/components/ui";
import { Phone } from "@/components/Phone";

// Screenshots captured from app.wakeboard.com (see public/shots/README.md).
const SHOT_TRICKS = "/shots/tricks.png";
const SHOT_BAG = "/shots/bag.png";
const SHOT_TRAIN = "/shots/train.png";

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      style={{
        position: "sticky", top: 0, zIndex: 50,
        background: scrolled ? "rgba(248,250,252,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(14px) saturate(180%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(14px) saturate(180%)" : "none",
        borderBottom: scrolled ? "1px solid rgba(15,23,42,0.06)" : "1px solid transparent",
        transition: "background 200ms ease, border-color 200ms ease",
      }}
    >
      <div
        className="container"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 0" }}
      >
        <a href="#top" style={{ textDecoration: "none" }}><Logo /></a>
        <nav style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <a className="nav-link nav-links-secondary" href="#features">Features</a>
          <a className="nav-link nav-links-secondary" href="#how">How it works</a>
          <a className="nav-link nav-links-secondary" href="#riders">For riders</a>
          <span style={{ width: 14 }} />
          <ButtonSecondary href={APP_URL}>Sign in</ButtonSecondary>
          <ButtonPrimary href={APP_URL}>Get started {Icon.arrow(14)}</ButtonPrimary>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section style={{ position: "relative", overflow: "hidden" }}>
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: -100, pointerEvents: "none",
          background: `
            radial-gradient(circle at 18% 10%, color-mix(in oklch, var(--td-primary) 18%, transparent) 0%, transparent 38%),
            radial-gradient(circle at 88% 28%, color-mix(in oklch, var(--td-primary) 10%, transparent) 0%, transparent 42%),
            radial-gradient(circle at 50% 90%, rgba(255,255,255,1) 0%, transparent 50%)
          `,
          filter: "blur(4px)",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(rgba(15,23,42,0.07) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage: "linear-gradient(180deg, rgba(0,0,0,0.6), transparent 70%)",
          WebkitMaskImage: "linear-gradient(180deg, rgba(0,0,0,0.6), transparent 70%)",
        }}
      />
      <div
        className="container hero-grid"
        style={{
          position: "relative", padding: "64px 0 96px",
          display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 56, alignItems: "center",
        }}
      >
        <div>
          <a
            href={APP_URL}
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "6px 6px 6px 14px", borderRadius: 999,
              background: "#fff", border: "1px solid #e2e8f0", textDecoration: "none",
              color: "#0f172a", fontSize: 12, fontWeight: 600, marginBottom: 28,
              boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--td-primary)" }} />
              Now in open beta
            </span>
            <span
              style={{
                background: "#f1f5f9", color: "#475569", padding: "4px 10px",
                borderRadius: 999, fontSize: 11, fontWeight: 700,
                display: "flex", alignItems: "center", gap: 4,
              }}
            >
              Free for early riders {Icon.arrow(11)}
            </span>
          </a>

          <h1
            style={{
              margin: 0, fontFamily: FONT_DISPLAY,
              fontSize: "clamp(44px, 6vw, 72px)", lineHeight: 0.98, letterSpacing: "-0.035em",
              fontWeight: 700, color: "#0f172a", textWrap: "balance",
            }}
          >
            <span style={{ display: "block" }}>
              Your wakeboard{" "}
              <span style={{ color: "var(--td-primary)", fontStyle: "italic" }}>trick</span>
            </span>
            <span style={{ display: "block" }}>bag.</span>
          </h1>

          <p
            style={{
              margin: "24px 0 32px", fontSize: 18, lineHeight: 1.5,
              color: "#475569", maxWidth: 520, textWrap: "pretty",
            }}
          >
            Every trick, every session, every rider — in one place. Build your
            bag. Train with plans. Share your dex.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <ButtonPrimary href={APP_URL} size="lg">Open the app {Icon.arrow(15)}</ButtonPrimary>
            <ButtonSecondary href="#features" size="lg">Browse the trick list</ButtonSecondary>
          </div>

          <div style={{ marginTop: 36, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center", color: "#64748b", fontSize: 13 }}>
            {["Free during beta", "Works on phone & dock", "No app store needed"].map((t) => (
              <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "var(--td-primary)" }}>{Icon.check(14)}</span> {t}
              </span>
            ))}
          </div>
        </div>

        <div
          className="hero-visual"
          style={{ position: "relative", height: 680, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div style={{ position: "absolute", left: "4%", top: 30, transform: "rotate(-6deg)", opacity: 0.92 }}>
            <Phone src={SHOT_TRAIN} alt="Train screen — practice plans and runs" width={240} height={510} />
          </div>
          <div style={{ position: "absolute", right: "2%", top: 0, transform: "rotate(6deg)", opacity: 0.92 }}>
            <Phone src={SHOT_BAG} alt="Bag screen — your tricks by status" width={240} height={510} />
          </div>
          <div style={{ position: "absolute", top: 60, zIndex: 2 }}>
            <Phone src={SHOT_TRICKS} alt="Tricks screen — the searchable trick database" width={320} height={660} priority />
          </div>
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const codes = ["HS BR", "TS BR", "TAN", "HS 180", "TS 180", "HS 360", "TS 360", "INDY", "METH", "WB", "KGB", "PR", "SW HS BR", "SF 180", "HS FR", "TS FR"];
  const row = [...codes, ...codes, ...codes];
  return (
    <div style={{ borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", background: "#ffffff", overflow: "hidden", padding: "18px 0" }}>
      <div style={{ display: "flex", gap: 36, animation: "marquee 60s linear infinite", whiteSpace: "nowrap", alignItems: "center" }}>
        {row.map((c, i) => (
          <span key={i} style={{ fontFamily: FONT_MONO, fontSize: 14, color: "#64748b", letterSpacing: "0.08em", fontWeight: 500, flexShrink: 0 }}>
            <span style={{ color: "var(--td-primary)", marginRight: 14 }}>◆</span>{c}
          </span>
        ))}
      </div>
    </div>
  );
}

function Pillar({
  phoneSrc, phoneAlt, eyebrow, title, body, bullets, reverse = false,
}: {
  phoneSrc: string; phoneAlt: string; eyebrow: string; title: string;
  body: string; bullets: string[]; reverse?: boolean;
}) {
  return (
    <div
      className="pillar-grid"
      style={{
        display: "grid", gridTemplateColumns: reverse ? "1fr 1.1fr" : "1.1fr 1fr",
        gap: 64, alignItems: "center", padding: "72px 0", borderTop: "1px solid #e2e8f0",
      }}
    >
      <div style={{ gridRow: 1, gridColumn: reverse ? 2 : 1 }}>
        <p style={{ margin: 0, fontFamily: FONT_MONO, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--td-primary)", fontWeight: 600 }}>{eyebrow}</p>
        <h2 style={{ margin: "12px 0 18px", fontFamily: FONT_DISPLAY, fontSize: "clamp(34px, 4vw, 48px)", lineHeight: 1.02, letterSpacing: "-0.025em", fontWeight: 700, color: "#0f172a", textWrap: "balance" }}>{title}</h2>
        <p style={{ margin: "0 0 28px", fontSize: 17, lineHeight: 1.5, color: "#475569", maxWidth: 460, textWrap: "pretty" }}>{body}</p>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
          {bullets.map((b, i) => (
            <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: 14, color: "#334155", lineHeight: 1.4 }}>
              <span style={{ marginTop: 2, flexShrink: 0, width: 22, height: 22, borderRadius: 999, background: "color-mix(in oklch, var(--td-primary) 12%, white)", color: "var(--td-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>{Icon.check(13)}</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
      <div style={{ gridRow: 1, gridColumn: reverse ? 1 : 2, display: "flex", justifyContent: "center", position: "relative" }}>
        <div aria-hidden="true" style={{ position: "absolute", inset: "8% 14%", borderRadius: 80, background: "radial-gradient(circle, color-mix(in oklch, var(--td-primary) 16%, white) 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div style={{ position: "relative" }}>
          <Phone src={phoneSrc} alt={phoneAlt} width={320} height={660} />
        </div>
      </div>
    </div>
  );
}

function Features() {
  return (
    <section id="features" style={{ background: "#ffffff" }}>
      <div className="container">
        <Pillar
          eyebrow="01 · The Dex"
          title="Every wakeboard trick. One searchable bag."
          body="A complete, community-curated trick database. Search by name, short code, surface or spin — then add the ones you want to track to your own bag."
          bullets={[
            "359+ tricks, from Ollies to KGBs and Pete Roses",
            "Search by short code: HS BR, TS 360, SW IN 540",
            "Filter by surface, spin, stance and difficulty",
          ]}
          phoneSrc={SHOT_TRICKS}
          phoneAlt="Tricks screen — searchable trick database"
        />
        <Pillar
          reverse
          eyebrow="02 · Train"
          title="Plans you actually ride. Runs you can stick."
          body="Build practice plans or competition runs, then log every set against them. See exactly how often you ride a plan and what you land each time."
          bullets={[
            "Practice plans and 2-pass competition runs",
            "Quick session logging — landed, learning, bailed",
            "Per-session stats and history per plan",
          ]}
          phoneSrc={SHOT_TRAIN}
          phoneAlt="Train screen — plans and session logging"
        />
        <Pillar
          eyebrow="03 · Your Bag"
          title="A bag that grows with every set."
          body="Tricks move from learning → landed → consistent as you log them. Share your bag with coaches, friends or the whole wakeboard.com community."
          bullets={[
            "Status colour-coded: amber, green and violet",
            "Add grabs, wraps and stance modifiers per trick",
            "Public rider profile at wakeboard.com/rider/you",
          ]}
          phoneSrc={SHOT_BAG}
          phoneAlt="Bag screen — tricks by status"
        />
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Sign in", body: "Create your free rider profile. Pick your home spot and stance.", icon: Icon.search(22) },
    { n: "02", title: "Build your bag", body: "Search the trick list. Tap to add. Tag with grabs, wraps and stance.", icon: Icon.pulse(22) },
    { n: "03", title: "Log a session", body: "Open a plan dockside. Mark every attempt: landed, learning, or bailed.", icon: Icon.check(22) },
    { n: "04", title: "Share your dex", body: "Send your public rider URL to your coach or your crew.", icon: Icon.share(22) },
  ];
  return (
    <section id="how" style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
      <div className="container" style={{ padding: "96px 0" }}>
        <div style={{ maxWidth: 720, marginBottom: 56 }}>
          <p style={{ margin: 0, fontFamily: FONT_MONO, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--td-primary)", fontWeight: 600 }}>How it works</p>
          <h2 style={{ margin: "12px 0 0", fontFamily: FONT_DISPLAY, fontSize: "clamp(34px, 4vw, 48px)", lineHeight: 1.02, letterSpacing: "-0.025em", fontWeight: 700, color: "#0f172a", textWrap: "balance" }}>
            Four steps to a trick log that <span style={{ fontStyle: "italic", color: "var(--td-primary)" }}>tells the truth</span>.
          </h2>
        </div>
        <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
          {steps.map((s) => (
            <div key={s.n} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24, position: "relative" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "color-mix(in oklch, var(--td-primary) 10%, white)", color: "var(--td-primary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>{s.icon}</div>
              <p style={{ margin: 0, fontFamily: FONT_MONO, fontSize: 11, color: "#94a3b8", letterSpacing: "0.15em", fontWeight: 600 }}>{s.n}</p>
              <h3 style={{ margin: "6px 0 8px", fontSize: 18, fontWeight: 700, fontFamily: FONT_DISPLAY, letterSpacing: "-0.015em", color: "#0f172a" }}>{s.title}</h3>
              <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.5 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RidersStrip() {
  const stats = [
    { v: "359", l: "tricks indexed" },
    { v: "4", l: "surface types" },
    { v: "1,800+", l: "sessions logged" },
    { v: "∞", l: "progressions to chase" },
  ];
  return (
    <section id="riders" style={{ background: "#ffffff", borderTop: "1px solid #e2e8f0" }}>
      <div className="container" style={{ padding: "64px 0" }}>
        <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: "1px solid #e2e8f0", borderRadius: 20, overflow: "hidden" }}>
          {stats.map((s, i) => (
            <div key={i} style={{ padding: "32px 28px", borderRight: i < 3 ? "1px solid #e2e8f0" : "none" }}>
              <p style={{ margin: 0, fontFamily: FONT_DISPLAY, fontSize: 44, fontWeight: 700, letterSpacing: "-0.03em", color: "#0f172a", lineHeight: 1 }}>{s.v}</p>
              <p style={{ margin: "10px 0 0", fontFamily: FONT_MONO, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b" }}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section style={{ background: "#f8fafc" }}>
      <div className="container" style={{ padding: "96px 0" }}>
        <div style={{ background: "#0f172a", color: "#fff", borderRadius: 28, padding: "clamp(48px, 6vw, 80px)", position: "relative", overflow: "hidden" }}>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "24px 24px", opacity: 0.7, pointerEvents: "none" }} />
          <div aria-hidden="true" style={{ position: "absolute", right: -120, top: -120, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, color-mix(in oklch, var(--td-primary) 70%, white) 0%, transparent 60%)", filter: "blur(30px)", opacity: 0.45, pointerEvents: "none" }} />
          <div style={{ position: "relative", maxWidth: 720 }}>
            <p style={{ margin: 0, fontFamily: FONT_MONO, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "color-mix(in oklch, var(--td-primary) 50%, white)", fontWeight: 600 }}>Get on the water</p>
            <h2 style={{ margin: "14px 0 20px", fontFamily: FONT_DISPLAY, fontSize: "clamp(36px, 5vw, 56px)", lineHeight: 1.02, letterSpacing: "-0.028em", fontWeight: 700, color: "#fff", textWrap: "balance" }}>
              Start your trick bag in <span style={{ fontStyle: "italic", color: "color-mix(in oklch, var(--td-primary) 60%, white)" }}>under a minute</span>.
            </h2>
            <p style={{ margin: "0 0 36px", fontSize: 18, lineHeight: 1.5, color: "rgba(255,255,255,0.7)", maxWidth: 540 }}>
              Free for early riders. No app store. Works on whatever phone you take to the dock.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <ButtonPrimary href={APP_URL} size="lg">Open the app {Icon.arrow(15)}</ButtonPrimary>
              <a href="#how" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 24px", background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.16)", borderRadius: 999, fontSize: 15, fontWeight: 700, textDecoration: "none" }}>See how it works</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
      <div className="container" style={{ padding: "40px 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Logo size={18} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#94a3b8", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>v1.0 — open beta</span>
        </div>
        <div style={{ display: "flex", gap: 22, fontSize: 13, color: "#64748b" }}>
          <a href={APP_URL} className="footer-link">Open app</a>
          <a href="#features" className="footer-link">Features</a>
          <a href="https://wakeboard.co.uk" className="footer-link">WakeboardUK</a>
          <a href="mailto:hello@wakeboard.com" className="footer-link">Contact</a>
        </div>
        <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>© 2026 wakeboard.com</p>
      </div>
    </footer>
  );
}

export default function Page(): ReactNode {
  return (
    <>
      <a id="top" />
      <Nav />
      <Hero />
      <Marquee />
      <Features />
      <HowItWorks />
      <RidersStrip />
      <FinalCTA />
      <Footer />
    </>
  );
}
