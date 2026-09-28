const fs = require('fs');

// 1. Update App.jsx
let appContent = fs.readFileSync('src/App.jsx', 'utf8');

const newHero = `/* ---------------- HERO ---------------- */
function Hero({onNav}){
  const artRef = useRef(null);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(()=>{
    gsap.fromTo(".hero-eyebrow", {opacity:0, y:20}, {opacity:1, y:0, duration:.7, delay:.1});
    gsap.fromTo(".hero-title", {opacity:0, y:30}, {opacity:1, y:0, duration:.8, delay:.25});
    gsap.fromTo(".hero-sub", {opacity:0, y:20}, {opacity:1, y:0, duration:.8, delay:.4});
    gsap.fromTo(".hero-ctas", {opacity:0, y:20}, {opacity:1, y:0, duration:.8, delay:.55});
    gsap.fromTo(".stat-item", {opacity:0, y:20}, {opacity:1, y:0, duration:.6, stagger:.1, delay:.7});
    gsap.fromTo(".hero-circle", {scale:0.6, opacity:0}, {scale:1, opacity:1, duration:1, delay:.2, ease:"back.out(1.6)"});
    gsap.fromTo(".hero-cup-wrap", {y:60, opacity:0}, {y:0, opacity:1, duration:.9, delay:.4, ease:"power3.out"});
    gsap.fromTo(".hero-badge", {scale:0, opacity:0}, {scale:1, opacity:1, duration:.6, stagger:.15, delay:1, ease:"back.out(2)"});
    gsap.to(".float-bean", {y:-16, duration:2.4, ease:"sine.inOut", yoyo:true, repeat:-1, stagger:{each:.3, from:"random"}});
    gsap.to(".hero-cup-wrap", {y:-14, duration:2.6, ease:"sine.inOut", yoyo:true, repeat:-1, delay:1.2});
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
    <section id="home" className="hero">
      <div className="wrap hero-grid">
        <div>
          <div className="eyebrow hero-eyebrow">Freshly Brewed • Every Day</div>
          <h1 className="hero-title">Good Coffee.<br/>Good <span>Mood.</span></h1>
          <p className="sub hero-sub">Freshly brewed coffee, delicious bites and cozy moments — made specially for you, one cup at a time.</p>
          <div className="hero-ctas">
            <button className="btn btn-primary" onClick={()=>onNav('menu')}>Explore Menu</button>
            <button className="btn btn-outline" onClick={()=>onNav('menu')}>Order Coffee</button>
          </div>
          <div className="stats-row">
            <div className="stat stat-item"><b>10+</b><span>COFFEE VARIETIES</span></div>
            <div className="stat stat-item"><b>1000+</b><span>HAPPY CUSTOMERS</span></div>
            <div className="stat stat-item"><b>4.9★</b><span>AVERAGE RATING</span></div>
          </div>
        </div>

        <div className="hero-art" ref={artRef}>
          <div className="hero-circle"></div>
          <div className="bean float-bean" style={{position:'absolute', top:'2%', left:'2%', transform:'rotate(-20deg)'}}></div>
          <div className="bean float-bean" style={{position:'absolute', bottom:'10%', right:'4%', transform:'rotate(30deg)'}}></div>
          <div className="bean float-bean" style={{position:'absolute', top:'40%', right:'-2%', transform:'rotate(10deg)', width:16, height:22}}></div>
          <div className="bean float-bean" style={{position:'absolute', bottom:'34%', left:'-4%', transform:'rotate(-8deg)', width:16, height:22}}></div>

          <div className="hero-cup-wrap">
            <div className="hero-video-card">
              <video
                ref={videoRef}
                src="/cafe_video.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="hero-video"
                onClick={togglePlay}
              />
              <div className="hero-video-tag">
                <span className="pulse-dot"></span>
                <span>Craft In Action</span>
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

          <div className="hero-badge top">
            <span style={{fontSize:22}}>🌱</span>
            <div><span className="num">100%</span><br/><span className="lbl">ARABICA BEANS</span></div>
          </div>
          <div className="hero-badge bottom">
            <span style={{fontSize:22}}>⭐</span>
            <div><span className="num">4.9/5</span><br/><span className="lbl">CUSTOMER RATED</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}`;

appContent = appContent.replace(/\/\* ---------------- HERO ---------------- \*\/[\s\S]*?(?=\/\* ---------------- REVEAL WRAPPER ---------------- \*\/)/, newHero + '\n\n');
fs.writeFileSync('src/App.jsx', appContent);
console.log('App.jsx updated successfully!');
