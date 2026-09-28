const fs = require('fs');

let css = fs.readFileSync('src/App.css', 'utf8');

// 1. Add unscrolled navbar contrast rules
const navContrast = `  .navbar:not(.scrolled) .logo{color:var(--white);}
  .navbar:not(.scrolled) .logo small{color:var(--caramel-2);}
  .navbar:not(.scrolled) .nav-links a{color:var(--cream);}
  .navbar:not(.scrolled) .nav-links a:hover{color:var(--caramel-2);}
  .navbar:not(.scrolled) .btn-primary{background:var(--caramel); color:#fff;}
  .navbar:not(.scrolled) .btn-primary:hover{background:var(--caramel-2); transform:translateY(-3px);}
  .navbar:not(.scrolled) .hamburger span{background:var(--cream);}`;

// 2. Replace the old hero block with full-width hero styles
const oldHeroRegex = /\/\* HERO \*\/[\s\S]*?(?=\/\* SECTION HEADS \*\/)/;

const newHeroCSS = `/* FULL-WIDTH HERO */
  .hero-fullwidth{
    position: relative;
    width: 100%;
    min-height: 94vh;
    display: flex;
    align-items: center;
    overflow: hidden;
    padding: 140px 0 50px;
    background: var(--espresso-2);
  }
  .hero-full-video{
    position: absolute;
    top: 0; left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 1;
  }
  .hero-full-overlay{
    position: absolute;
    top: 0; left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    background: linear-gradient(90deg, rgba(20,12,7,0.88) 0%, rgba(20,12,7,0.72) 48%, rgba(20,12,7,0.35) 82%, rgba(20,12,7,0.55) 100%),
                linear-gradient(0deg, rgba(20,12,7,0.85) 0%, transparent 40%);
  }
  .hero-full-content{
    position: relative;
    z-index: 3;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: calc(94vh - 190px);
  }
  .hero-text-block{
    max-width: 640px;
  }
  .hero-fullwidth .eyebrow{
    color: var(--caramel-2);
  }
  .hero-fullwidth .hero-title{
    font-size: clamp(40px, 5.5vw, 68px);
    line-height: 1.05;
    letter-spacing: -1px;
    color: var(--white);
  }
  .hero-fullwidth .hero-title span{
    color: var(--caramel-2);
  }
  .hero-fullwidth p.sub{
    font-size: 17px;
    max-width: 480px;
    margin: 22px 0 32px;
    color: rgba(250,244,233,0.9);
    line-height: 1.7;
  }
  .hero-ctas{
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }
  .btn-outline-light{
    background: rgba(250,244,233,0.12);
    color: var(--white);
    border: 1.5px solid rgba(250,244,233,0.45);
    backdrop-filter: blur(8px);
  }
  .btn-outline-light:hover{
    background: rgba(250,244,233,0.25);
    color: var(--white);
    transform: translateY(-3px);
    border-color: rgba(250,244,233,0.85);
  }
  .hero-fullwidth .stats-row{
    display: flex;
    gap: 40px;
    margin-top: 40px;
    flex-wrap: wrap;
  }
  .hero-fullwidth .stats-row .stat b{
    font-family: 'Fredoka';
    font-size: 26px;
    display: block;
    color: var(--white);
  }
  .hero-fullwidth .stats-row .stat span{
    font-size: 12px;
    color: var(--caramel-2);
    font-weight: 600;
    letter-spacing: 0.5px;
  }
  .hero-bottom-bar{
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: 48px;
    gap: 20px;
    flex-wrap: wrap;
  }
  .hero-badges-group{
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }
  .hero-badge-float{
    background: rgba(255,253,249,0.94);
    backdrop-filter: blur(14px);
    border-radius: 18px;
    padding: 12px 18px;
    box-shadow: 0 15px 35px rgba(0,0,0,0.35);
    display: flex;
    align-items: center;
    gap: 10px;
    border: 1px solid rgba(255,255,255,0.6);
  }
  .hero-badge-float .num{
    font-family: 'Fredoka';
    font-weight: 700;
    font-size: 18px;
    color: var(--espresso-2);
  }
  .hero-badge-float .lbl{
    font-size: 10.5px;
    color: var(--coffee);
    font-weight: 600;
  }
  .hero-video-bar{
    display: flex;
    align-items: center;
    gap: 12px;
    margin-left: auto;
  }
  .hero-live-pill{
    background: rgba(20,12,7,0.72);
    backdrop-filter: blur(10px);
    color: var(--white);
    padding: 8px 16px;
    border-radius: 30px;
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.8px;
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid rgba(255,255,255,0.22);
  }
  .pulse-dot{
    width:8px; height:8px; background:#4ade80; border-radius:50%;
    box-shadow:0 0 10px #4ade80; animation:pulseDot 1.8s infinite;
  }
  @keyframes pulseDot{
    0%, 100%{opacity:1; transform:scale(1);}
    50%{opacity:0.35; transform:scale(0.85);}
  }
  .hero-video-controls{
    display: flex;
    gap: 8px;
  }
  .hero-ctrl-btn{
    width: 38px; height: 38px; border-radius: 50%;
    background: rgba(20,12,7,0.72);
    backdrop-filter: blur(10px);
    color: var(--white);
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; cursor: pointer;
    border: 1px solid rgba(255,255,255,0.25);
    transition: all .2s ease;
  }
  .hero-ctrl-btn:hover{
    background: var(--caramel);
    transform: scale(1.1);
  }
  .eyebrow{
    display:inline-flex; align-items:center; gap:8px;
    font-weight:700; font-size:12.5px; letter-spacing:2.5px; color:var(--caramel);
    text-transform:uppercase; margin-bottom:22px;
  }
  .eyebrow::before{content:''; width:26px; height:2px; background:var(--caramel); display:inline-block; border-radius:2px;}
`;

// Insert nav contrast rules right before /* HERO */ or mobile-menu
if (!css.includes('.navbar:not(.scrolled) .logo')) {
  css = css.replace('.mobile-menu.open{transform:translateY(0);}', '.mobile-menu.open{transform:translateY(0);}\n' + navContrast);
}

css = css.replace(oldHeroRegex, newHeroCSS + '\n  ');

fs.writeFileSync('src/App.css', css);
console.log('App.css updated for Full-Width Hero!');
