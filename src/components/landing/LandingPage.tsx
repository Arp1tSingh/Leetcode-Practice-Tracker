"use client";

import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Code2,
  Menu,
  Moon,
  RotateCcw,
  Sparkles,
  Sun,
  Target,
  TimerReset,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import "./landing.css";

const dashboardSignals = [
  { label: "Total problems", value: "328", detail: "+12 this week", icon: BookOpen, tone: "blue" },
  { label: "Reviews completed", value: "44", detail: "all clear until 18:00", icon: CheckCircle2, tone: "green" },
  { label: "Retrievability", value: "92", suffix: "%", detail: "steady across sets", icon: Activity, tone: "amber" },
];

const principles = [
  {
    number: "01",
    title: "Capture the pattern.",
    copy: "Turn a solved problem into a short retrieval prompt while the insight is still sharp.",
    icon: Code2,
  },
  {
    number: "02",
    title: "Recall at the edge.",
    copy: "A calibrated queue returns patterns near the point where they begin to fade.",
    icon: TimerReset,
  },
  {
    number: "03",
    title: "Keep the signal.",
    copy: "Watch durable recall compound without filling your week with manual planning.",
    icon: Target,
  },
];

function SectionRule({ label }: { label: string }) {
  return (
    <div className="section-rule">
      <span>{label}</span>
      <i />
    </div>
  );
}

function MetricCard({ item, index }: { item: (typeof dashboardSignals)[number]; index: number }) {
  const Icon = item.icon;
  return (
    <article className="metric-card" style={{ "--card-delay": `${index * 90}ms` } as React.CSSProperties}>
      <div className={`metric-icon tone-${item.tone}`}><Icon size={21} strokeWidth={2.1} /></div>
      <div className="metric-body">
        <span>{item.label}</span>
        <strong>{item.value}<em>{item.suffix}</em></strong>
        <small>{item.detail}</small>
      </div>
    </article>
  );
}

export function LandingPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    setMounted(true);
    const root = pageRef.current;
    if (!root) return;
    const revealed = root.querySelectorAll<HTMLElement>(".reveal");
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -48px" },
    );
    revealed.forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const jumpToLoop = () => document.getElementById("the-loop")?.scrollIntoView({ behavior: "smooth" });
  const jumpToStart = () => document.getElementById("start")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="landing-scope">
      <main ref={pageRef} className="site-shell">
        <header className="site-header">
          <a className="brand" href="#top" aria-label="Loopframe home">
            <img src="/manus-storage/loopframe-logo_605a2f6a.png" alt="" />
            <span>LOOPFRAME</span>
          </a>
          <nav className="nav-links" aria-label="Primary navigation">
            <a href="#the-loop">The loop</a>
            <a href="#signal">The signal</a>
            <a href="#start">Your loop</a>
          </nav>
          <div className="header-actions">
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme" suppressHydrationWarning>
              {mounted ? (theme === "dark" ? <Sun size={18} /> : <Moon size={18} />) : <span style={{ width: 18, height: 18, display: 'inline-block' }} />}
              <span>{mounted ? (theme === "dark" ? "Light" : "Dark") : "Theme"}</span>
            </button>
            <button className="menu-toggle" aria-label="Open navigation"><Menu size={20} /></button>
          </div>
        </header>

        <section id="top" className="hero-section">
          <div className="hero-gridline gridline-a" />
          <div className="hero-gridline gridline-b" />
          <div className="hero-copy">
            <p className="eyebrow reveal"><span className="live-dot" />SPACED REPETITION FOR DEVELOPERS</p>
            <h1 className="reveal" style={{ "--delay": "80ms" } as React.CSSProperties}>
              Make every solved problem <span>easier to retrieve.</span>
            </h1>
            <p className="hero-description reveal" style={{ "--delay": "160ms" } as React.CSSProperties}>
              Loopframe turns one-off problem solving into a deliberate review system—so patterns stay present when the next hard problem arrives.
            </p>
            <div className="hero-actions reveal" style={{ "--delay": "220ms" } as React.CSSProperties}>
              <Link href="/login" className="button button-primary">Build your review loop <ArrowDownRight size={18} /></Link>
              <button className="button button-quiet" onClick={jumpToLoop}>See how it works <ChevronDown size={18} /></button>
            </div>
            <div className="hero-note reveal" style={{ "--delay": "280ms" } as React.CSSProperties}>
              <RotateCcw size={16} /> Based on the FSRS scheduling model
            </div>
          </div>

          <div className="hero-visual reveal" style={{ "--delay": "140ms" } as React.CSSProperties}>
            <div className="visual-halo" />
            <div className="visual-backdrop"><img src="/manus-storage/loopframe-hero-dashboard_c684c0cb.png" alt="Abstract dark product dashboard visual" /></div>
            <div className="phone-surface">
              <div className="phone-topline"><span>Today’s loop</span><span>09:41</span></div>
              <div className="phone-heading"><p>Focus queue</p><strong>12 due today</strong></div>
              <div className="phone-progress"><span>Momentum</span><b><i /></b><em>68%</em></div>
              {dashboardSignals.map((item, index) => <MetricCard key={item.label} item={item} index={index} />)}
              <div className="phone-task"><span>Next review</span><strong>Monotonic stack</strong><i>→</i></div>
            </div>
            <div className="floating-tag tag-left"><Sparkles size={15} /><span>Retrieval first</span></div>
            <div className="floating-tag tag-right"><span className="blue-pulse" /> Queue stable</div>
          </div>
        </section>

        <section className="signal-band" aria-label="Loopframe benefit statement">
          <p className="reveal">Study fewer things. <span>Remember the right ones.</span></p>
          <ArrowUpRight className="reveal" size={31} />
        </section>

        <section id="the-loop" className="loop-section content-section">
          <SectionRule label="THE LOOP" />
          <div className="loop-intro">
            <h2 className="reveal">A review system that knows what to bring back.</h2>
            <p className="reveal" style={{ "--delay": "80ms" } as React.CSSProperties}>Less cramming. Less guessing. Build a catalog of problem-solving instincts that returns at the exact moment it needs reinforcement.</p>
          </div>
          <div className="principle-stack">
            {principles.map((item, index) => {
              const Icon = item.icon;
              return <article className="principle reveal" style={{ "--delay": `${index * 70}ms` } as React.CSSProperties} key={item.number}>
                <span className="principle-number">{item.number}</span>
                <div className="principle-icon"><Icon size={23} /></div>
                <div><h3>{item.title}</h3><p>{item.copy}</p></div>
                <ArrowUpRight className="principle-arrow" size={20} />
              </article>;
            })}
          </div>
        </section>

        <section id="signal" className="retention-section content-section">
          <div className="retention-copy">
            <SectionRule label="THE SIGNAL" />
            <h2 className="reveal">Let the algorithm manage the forgetting curve.</h2>
            <p className="reveal" style={{ "--delay": "70ms" } as React.CSSProperties}>FSRS uses your ratings over time to make each review more useful. Your queue adapts; your attention stays on the work.</p>
            <dl className="signal-stats reveal" style={{ "--delay": "130ms" } as React.CSSProperties}>
              <div><dt>REVIEW MODE</dt><dd>Adaptive</dd></div>
              <div><dt>MEMORY MODEL</dt><dd>FSRS</dd></div>
            </dl>
          </div>
          <div className="retention-visual reveal" style={{ "--delay": "110ms" } as React.CSSProperties}>
            <img src="/manus-storage/loopframe-retention-detail_e2b0c0de.png" alt="Abstract retention curve visualization" />
            <div className="curve-overlay"><span>RETRIEVABILITY</span><strong>92.4%</strong><small>↑ 8.1 pts this cycle</small></div>
          </div>
        </section>

        <section className="workflow-section content-section">
          <div className="workflow-image reveal"><img src="/manus-storage/loopframe-workflow-detail_4908fede.png" alt="Stack of abstract review cards" /></div>
          <div className="workflow-copy">
            <SectionRule label="FOR THE LONG GAME" />
            <h2 className="reveal">Practice becomes a personal playbook.</h2>
            <p className="reveal" style={{ "--delay": "80ms" } as React.CSSProperties}>Your review history becomes a compact record of the techniques, blind spots, and breakthroughs that shaped your coding practice.</p>
            <Link className="text-link reveal" style={{ "--delay": "140ms" } as React.CSSProperties} href="/login">Open the review queue <ArrowUpRight size={18} /></Link>
          </div>
        </section>

        <section id="start" className="closing-section">
          <div className="closing-rule" />
          <p className="eyebrow reveal">YOUR NEXT SOLVE CAN STICK</p>
          <h2 className="reveal" style={{ "--delay": "70ms" } as React.CSSProperties}>Build a stronger memory <span>for problem solving.</span></h2>
          <Link href="/login" className="button button-primary closing-button reveal" style={{ "--delay": "130ms" } as React.CSSProperties}>Start the loop <ArrowUpRight size={18} /></Link>
        </section>

        <footer className="site-footer">
          <a className="brand" href="#top"><img src="/manus-storage/loopframe-logo_605a2f6a.png" alt="" /><span>LOOPFRAME</span></a>
          <p>Built for durable technical recall.</p>
          <span>© 2026</span>
        </footer>
      </main>
    </div>
  );
}
