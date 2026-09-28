const fs = require('fs');

// 1. Update App.jsx
let app = fs.readFileSync('src/App.jsx', 'utf8');

const fullHero = `/* ---------------- HERO ---------------- */
function Hero({onNav}){
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(()=>{
    gsap.fromTo(".hero-eyebrow", {opacity:0, y:20}, {opacity:1, y:0, duration:.7, delay:.1});
    gsap.fromTo(".hero-title", {opacity:0, y:30}, {opacity:1, y:0, duration:.8, delay:.25});
    gsap.fromTo(".hero-sub", {opacity:0, y:20}, {opacity:1, y:0, duration:.8, delay:.4});
    gsap.fromTo(".hero-ctas", {opacity:0, y:20}, {opacity:1, y:0, duration:.8, delay:.55});
    gsap.fromTo(".stat-item", {opacity:0, y:20}, {opacity:1, y:0, duration:.6, stagger:.1, delay:.7});
    gsap.fromTo(".hero-badge-float", {scale:0, opacity:0}, {scale:1, opacity:1, duration:.6, stagger:.15, delay:.85, ease:"back.out(2)"});
    gsap.fromTo(".hero-video-bar", {opacity:0, y:15}, {opacity:1, y:0, duration:.6, delay:1});
  },[]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section id="home" className="hero-fullwidth">
      <video
        ref={videoRef}
        src="/cafe_video.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="hero-full-video"
      />
      <div className="hero-full-overlay"></div>

      <div className="wrap hero-full-content">
        <div className="hero-text-block">
          <div className="eyebrow hero-eyebrow" style={{color:'var(--caramel-2)'}}>Freshly Brewed • Every Day</div>
          <h1 className="hero-title">Good Coffee.<br/>Good <span>Mood.</span></h1>
          <p className="sub hero-sub">Freshly brewed coffee, delicious bites and cozy moments — made specially for you, one cup at a time.</p>
          <div className="hero-ctas">
            <button className="btn btn-caramel" onClick={()=>onNav('menu')}>Explore Menu</button>
            <button className="btn btn-outline-light" onClick={()=>onNav('menu')}>Order Coffee</button>
          </div>
          <div className="stats-row">
            <div className="stat stat-item"><b>10+</b><span>COFFEE VARIETIES</span></div>
            <div className="stat stat-item"><b>1000+</b><span>HAPPY CUSTOMERS</span></div>
            <div className="stat stat-item"><b>4.9★</b><span>AVERAGE RATING</span></div>
          </div>
        </div>

        <div className="hero-bottom-bar">
          <div className="hero-badges-group">
            <div className="hero-badge-float">
              <span style={{fontSize:20}}>🌱</span>
              <div><span className="num">100%</span><br/><span className="lbl">ARABICA BEANS</span></div>
            </div>
            <div className="hero-badge-float">
              <span style={{fontSize:20}}>⭐</span>
              <div><span className="num">4.9/5</span><br/><span className="lbl">CUSTOMER RATED</span></div>
            </div>
          </div>

          <div className="hero-video-bar">
            <div className="hero-live-pill">
              <span className="pulse-dot"></span>
              <span>LIVE • CAFE AURA</span>
            </div>
            <div className="hero-video-controls">
              <button
                className="hero-ctrl-btn"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
              <button
                className="hero-ctrl-btn"
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? '🔇' : '🔊'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}`;

app = app.replace(/\/\* ---------------- HERO ---------------- \*\/[\s\S]*?(?=\/\* ---------------- REVEAL WRAPPER ---------------- \*\/)/, fullHero + '\n\n');
fs.writeFileSync('src/App.jsx', app);
console.log('App.jsx updated with Full-Width Hero!');
