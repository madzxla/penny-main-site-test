import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import "./Home.css"
import Logo from "../assets/logo.png";

/** How long each card stays before auto-advancing. */
const STEP_MS = 6000;
const CODE = ["4", "8", "2", "0", "5"];

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Visuals (decorative, hidden from screen readers) ---------- */

function Phone({ children }: { children: ReactNode }) {
  return (
    <div className="cs-phone" aria-hidden="true">
      <div className="cs-phone-notch" />
      <div className="cs-phone-screen">{children}</div>
    </div>
  );
}

function CodeBoxes({ large = false }: { large?: boolean }) {
  return (
    <div className={`cs-code${large ? " lg" : ""}`}>
      {CODE.map((d, i) => (
        <span key={i}>{d}</span>
      ))}
    </div>
  );
}

function MapVisual() {
  return (
    <Phone>
      <div className="cs-map">
        <i className="cs-park p1" />
        <i className="cs-park p2" />
        <i className="cs-water" />
        <i className="cs-road h1" />
        <i className="cs-road h2" />
        <i className="cs-road v1" />
        <i className="cs-road v2" />
        <i className="cs-pin" style={{ top: 118, left: 46 }} />
        <i className="cs-pin" style={{ top: 214, left: 168 }} />
        <i className="cs-pin" style={{ top: 96, left: 158 }} />
        <i className="cs-pin on" style={{ top: 168, left: 96 }} />
      </div>
      <div className="cs-sheet">
        <strong>Bezmaksas kapučīno</strong>
        <span>Mārtiņa Kafija · 200m</span>
      </div>
    </Phone>
  );
}

function DealVisual() {
  return (
    <Phone>
      <div className="cs-deal-hero">
        <span className="cs-badge">Bezmaksas</span>
      </div>
      <div className="cs-deal-body">
        <p className="cs-deal-title">Bezmaksas kapučīno</p>
        <p className="cs-deal-meta">Mārtiņa Kafija · 200m</p>
        <div className="cs-deal-row">
          <span>Derīgs</span>
          <span>šodien līdz 18:00</span>
        </div>
        <div className="cs-btn">
          Saņemt piedāvājumu
          <i className="cs-tap" />
        </div>
      </div>
    </Phone>
  );
}

function VoucherVisual() {
  return (
    <Phone>
      <div className="cs-voucher">
        <p className="cs-label">Tavs kods</p>
        <CodeBoxes />
        <span className="cs-timer">Derīgs vēl 01:59:42</span>
        <p className="cs-voucher-deal">Bezmaksas kapučīno</p>
        <p className="cs-hint">Uzrādi šo kodu darbiniekam</p>
      </div>
    </Phone>
  );
}

function StaffVisual() {
  return (
    <div className="cs-tablet" aria-hidden="true">
      <div className="cs-tablet-bar">
        <img src={Logo} alt="Penny logo" className="brand-logo" />
        <span>Mārtiņa Kafija</span>
      </div>
      <div className="cs-tablet-body">
        <p className="cs-label">Ievadi klienta kodu</p>
        <CodeBoxes large />
        <div className="cs-btn cs-btn-inline">Apstiprināt</div>
      </div>
    </div>
  );
}

function DoneVisual() {
  return (
    <Phone>
      <div className="cs-done">
        <div className="cs-check">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </div>
        <p className="cs-done-title">Apstiprināts</p>
        <p className="cs-voucher-deal">Bezmaksas kapučīno</p>
        <p className="cs-hint">Mārtiņa Kafija · kods 48205</p>
      </div>
    </Phone>
  );
}

/* ---------- Steps ---------- */

const STEPS: { caption: string; visual: ReactNode }[] = [
  {
    caption: "Atver Penny lietotni un izvēlies kādu no piedāvājumiem tavā apkārtnē",
    visual: <MapVisual />,
  },
  {
    caption: "Viens pieskāriens un piedāvājums ir tavs.",
    visual: <DealVisual />,
  },
  {
    caption: "Sāc ceļu uz restorānu ar precīzu navigāciju lietotnē.",
    visual: <VoucherVisual />,
  },
  {
    caption: "Parādi savu kodu pie kases, lai to varētu pārbaudīt.",
    visual: <StaffVisual />,
  },
  {
    caption: "Izbaudi savu ēdienu, tas ir tik vienkārši.",
    visual: <DoneVisual />,
  },
];

const LAST = STEPS.length - 1;

/* ---------- Component ---------- */

export default function ClaimSteps() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const lockRef = useRef(false);
  const lockTimer = useRef<number | undefined>(undefined);

  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(() => !prefersReducedMotion());
  const [finished, setFinished] = useState(false);
  const [inView, setInView] = useState(false);

  const goTo = useCallback((index: number) => {
    const track = trackRef.current;
    const card = cardRefs.current[index];
    const first = cardRefs.current[0];
    if (!track || !card || !first) return;

    // Ignore scroll events while our own smooth scroll is in flight,
    // otherwise the active dot flickers through every card on the way.
    lockRef.current = true;
    window.clearTimeout(lockTimer.current);
    lockTimer.current = window.setTimeout(() => {
      lockRef.current = false;
    }, 700);

    setActive(index);
    setFinished(false);
    track.scrollTo({
      left: card.offsetLeft - first.offsetLeft,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, []);

  // Keep the active dot in sync when the user swipes / scrolls manually.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onScroll = () => {
      if (lockRef.current) return;
      const cards = cardRefs.current.filter(Boolean) as HTMLElement[];
      if (!cards.length) return;

      const base = cards[0].offsetLeft;
      let best = 0;
      let bestDist = Infinity;
      cards.forEach((c, i) => {
        const d = Math.abs(c.offsetLeft - base - track.scrollLeft);
        if (d < bestDist) {
          best = i;
          bestDist = d;
        }
      });
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 2) {
        best = cards.length - 1;
      }
      setActive(best);
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      window.clearTimeout(lockTimer.current);
    };
  }, []);

  // Only run the autoplay timer while the section is actually on screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const handleFillEnd = () => {
    if (active < LAST) {
      goTo(active + 1);
    } else {
      setPlaying(false);
      setFinished(true);
    }
  };

  const handlePlayPause = () => {
    if (finished) {
      goTo(0);
      setPlaying(true);
    } else {
      setPlaying((p) => !p);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight" && active < LAST) {
      e.preventDefault();
      goTo(active + 1);
    } else if (e.key === "ArrowLeft" && active > 0) {
      e.preventDefault();
      goTo(active - 1);
    }
  };

  const running = playing && inView;

  return (
    <section
      id="how-it-works"
      className="claim-steps"
      ref={sectionRef}
      aria-roledescription="carousel"
      aria-label="Kā darbojas Penny"
    >
      <h2 className="cs-heading">Tā nav raķešu zinātne</h2>

      <div
        className="cs-track"
        ref={trackRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-live={playing ? "off" : "polite"}
      >
        {STEPS.map((step, i) => (
          <article
            key={i}
            className="cs-card"
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} no ${STEPS.length}`}
          >
            <p className="cs-caption">{step.caption}</p>
            <div className="cs-stage">{step.visual}</div>
          </article>
        ))}
      </div>

      <div className="cs-controls">
        <div className="cs-pill">
          {STEPS.map((_, i) => (
            <button
              key={i}
              type="button"
              className="cs-dot"
              aria-label={`Solis ${i + 1}`}
              aria-current={i === active}
              onClick={() => goTo(i)}
            >
              <span className="cs-dot-mark">
                {i === active && (
                  <span
                    key={active}
                    className="cs-fill"
                    style={{
                      animationDuration: `${STEP_MS}ms`,
                      animationPlayState: running ? "running" : "paused",
                    }}
                    onAnimationEnd={handleFillEnd}
                  />
                )}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="cs-play"
          onClick={handlePlayPause}
          aria-label={
            finished ? "Atskaņot vēlreiz" : playing ? "Apturēt" : "Atskaņot"
          }
        >
          {finished ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17.65 6.35A7.96 7.96 0 0 0 12 4a8 8 0 1 0 7.73 10h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
            </svg>
          ) : playing ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5.2v13.6a.6.6 0 0 0 .92.5l10.7-6.8a.6.6 0 0 0 0-1L8.92 4.7A.6.6 0 0 0 8 5.2z" />
            </svg>
          )}
        </button>
      </div>

    </section>
  );
}