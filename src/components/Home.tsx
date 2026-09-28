import { useEffect, useRef, useState } from "react";
import Logo from "../assets/logo.png";
import RigaVideo from "../assets/background.mp4";
import "./Home.css";
import ClaimSteps from "./ClaimSteps";

const SCRUB_DISTANCE = 2400;
const ZOOM_DISTANCE = 900;
const ZOOM_AMOUNT = 0.15;
const ZOOM_MAX_RADIUS = 28;

const FAQ_ITEMS = [
  {
    question: "Vai Penny piedāvājumi ir bez maksas?",
    answer:
      "Jā. Lietotne un visi pieejamie piedāvājumi ir bez maksas. Lietotnē arī nav reklāmas vai citi traucējumi.",
  },
  {
    question: "Kādus piedāvājumus var atrast Penny?",
    answer:
      "Lietotnē varēsi atrast piedāvājumus bezmaksas ēdieniem un dzēriem vai īpašām atlaidēm un piedāvājumiem. Restorāni, kafejnīcas - mums ir viss, ko tava sirds kāro.",
  },
  {
    question: "Kādās pilsētās Penny ir pieejams?",
    answer:
      "Mēs sākam mūsu pilota fāzi Rīgas centrā un apkārtējos rajonos. Ļoti drīz sāksim darbu arī citos rajonos un pilsētās atkarībā no pieprasījuma.",
  },
  {
    question: "Kā es varu sākt lietot Penny?",
    answer:
      "Ielādē lietotni Google Play Store vai App Store (drīzumā), ievadi savu tālruņa numuru un sāc lietot Penny uzreiz.",
  },
];

function HomeFaq() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="home-faq">
      <div className="home-faq-header">
        <h1 className="cs-heading">Jautājumi?</h1>
      </div>

      <div className="home-faq-list">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openFaq === index;
          return (
            <div
              key={item.question}
              className={`home-faq-item${isOpen ? " open" : ""}`}
            >
              <button
                type="button"
                className="home-faq-question"
                aria-expanded={isOpen}
                onClick={() => setOpenFaq(isOpen ? null : index)}
              >
                <span>{item.question}</span>
                <span className="home-faq-icon" aria-hidden="true">
                  {isOpen ? "−" : "+"}
                </span>
              </button>

              {isOpen && (
                <div className="home-faq-answer">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function VideoScrub() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  const [videoProgress, setVideoProgress] = useState(0);
  const [, setZoomProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const supportLines = [
    { start: 0, end: 0.45, text: "Bezmaksas ēdiens un izcilas atlaides" },
    { start: 0.45, end: 0.8, text: "Tikai no vislabākajām vietām Rīgā" },
    { start: 0.8, end: 2, text: "Lejupielādē Penny tagad" },
  ];

  const activeSupportLine =
    supportLines.find(
      (line) =>
        videoProgress >= line.start &&
        videoProgress < line.end
    ) ?? supportLines[supportLines.length - 1];

  const activeSupportText = activeSupportLine.text;

  const durationRef = useRef(0);
  const readyRef = useRef(false);
  const lastSeekTimeRef = useRef(0);
  const pendingProgressRef = useRef<number | null>(null);
  const seekingRef = useRef(false);

  const seekTo = (progress: number) => {
    const video = videoRef.current;
    if (!video || !readyRef.current || durationRef.current === 0) return;

    const target = progress * durationRef.current;
    if (Math.abs(target - lastSeekTimeRef.current) < 0.01) return;

    lastSeekTimeRef.current = target;

    if (seekingRef.current) {
      pendingProgressRef.current = progress;
      return;
    }

    video.currentTime = target;
  };

  const applyZoomProgress = (progress: number) => {
    const pin = pinRef.current;
    if (!pin) return;

    const scale = 1 - ZOOM_AMOUNT * progress;
    const radius = ZOOM_MAX_RADIUS * progress;
    const shadow = 0.45 * progress;

    pin.style.setProperty("--zoom-scale", scale.toFixed(4));
    pin.style.setProperty("--zoom-radius", `${radius.toFixed(1)}px`);
    pin.style.setProperty("--zoom-shadow", shadow.toFixed(3));
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();

    const handleMetadata = () => {
      durationRef.current = video.duration;
      readyRef.current = true;
      seekTo(0);
    };

    const handleWaiting = () => setLoading(true);
    const handleCanPlay = () => setLoading(false);
    const handleSeeking = () => (seekingRef.current = true);
    
    const handleSeeked = () => {
      seekingRef.current = false;
      if (pendingProgressRef.current !== null) {
        const progress = pendingProgressRef.current;
        pendingProgressRef.current = null;
        seekTo(progress);
      }
    };

    video.addEventListener("loadedmetadata", handleMetadata);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("seeking", handleSeeking);
    video.addEventListener("seeked", handleSeeked);

    // --- NATIVE SCROLL TRACKING ---
    const handleScroll = () => {
      if (!stageRef.current) return;

      // getBoundingClientRect().top tells us exactly where the container is relative to the viewport.
      const rect = stageRef.current.getBoundingClientRect();
      const scrolledIntoStage = -rect.top;

      let newVideoProgress = 0;
      let newZoomProgress = 0;

      // 1. Before the stage
      if (scrolledIntoStage <= 0) {
        newVideoProgress = 0;
        newZoomProgress = 0;
      } 
      // 2. Scrubbing video phase (first 2400px)
      else if (scrolledIntoStage <= SCRUB_DISTANCE) {
        newVideoProgress = scrolledIntoStage / SCRUB_DISTANCE;
        newZoomProgress = 0;
      } 
      // 3. Zooming phase (next 900px)
      else if (scrolledIntoStage <= SCRUB_DISTANCE + ZOOM_DISTANCE) {
        newVideoProgress = 1;
        newZoomProgress = (scrolledIntoStage - SCRUB_DISTANCE) / ZOOM_DISTANCE;
      } 
      // 4. After the stage
      else {
        newVideoProgress = 1;
        newZoomProgress = 1;
      }

      // Batch visual updates into the next animation frame for smoothness
      requestAnimationFrame(() => {
        setVideoProgress(newVideoProgress);
        setZoomProgress(newZoomProgress);
        seekTo(newVideoProgress);
        applyZoomProgress(newZoomProgress);
      });
    };

    // Keep the iOS unlocker (browsers require user interaction before media manipulation)
    const unlockVideo = () => {
      video.play().then(() => video.pause()).catch(() => {});
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("touchstart", unlockVideo, { once: true, passive: true });
    window.addEventListener("click", unlockVideo, { once: true });

    // Run once on mount to set initial state
    handleScroll();

    return () => {
      video.removeEventListener("loadedmetadata", handleMetadata);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("seeking", handleSeeking);
      video.removeEventListener("seeked", handleSeeked);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand-wrap">
            <img src={Logo} alt="Penny logo" className="brand-logo" />
          </div>

          <nav className="topnav" aria-label="Main navigation">
            <a href="#download" className="nav-cta">Lejupielādē</a>
          </nav>
        </div>
      </header>

      {/* 
        The stage defines the total scrollable distance. 
        100vh (so the pin takes up the screen) + the scrub distance + the zoom distance.
      */}
      <div
        className="scroll-stage"
        ref={stageRef}
        style={{
          height: `calc(100vh + ${SCRUB_DISTANCE + ZOOM_DISTANCE}px)`,
          position: "relative"
        }}
      >
        <div
          className="pin"
          ref={pinRef}
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden"
          }}
        >
          <div 
            className="video-wrap"
            style={{
               transform: `scale(var(--zoom-scale, 1))`,
               borderRadius: `var(--zoom-radius, 0px)`
               // (Adjust the shadow math above to match whatever your CSS was doing)
            }}
          >
            <video
              ref={videoRef}
              src={RigaVideo}
              muted
              playsInline
              preload="auto"
            />

            <div className="video-overlay" />
            <div className="video-gradient" />

            <div className="video-copy">
              <h1>Labs ēdiens, tieši aiz stūra</h1>
              <p
                key={activeSupportText}
                className="support-line"
              >
                {activeSupportText === supportLines[2].text ? (
                  <>
                    <span>Lejupielādē</span>
                    <img
                      src={Logo}
                      alt="Penny logo"
                      className="support-logo"
                    />
                    <span>tagad</span>
                  </>
                ) : (
                  activeSupportText
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <ClaimSteps />
      <HomeFaq />

      <section className="home-download" id="download">
        <div className="home-download-inner">
          <div className="home-download-copy">
            <h1 className="cs-heading">Lejupielādē tagad</h1>
            <a href="">
              <img alt="Get it on Google Play" src="https://appure.io/badges/playstore/en.svg" height="60" />
            </a>
          </div>
        </div>
      </section>

      <div className="scroll-spacer" />

      <div className={`loading-note ${loading ? "show" : ""}`}>
        buffering video…
      </div>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <span>© 2026 Penny. Visas tiesības aizsargātas.</span>
        </div>
      </footer>
    </>
  );
}