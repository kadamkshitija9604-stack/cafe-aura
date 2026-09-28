const fs = require('fs');

let css = fs.readFileSync('src/App.css', 'utf8');

// Replace hero-cup styling with hero-video-card & hero-video styling
const oldHeroCupSection = `  .hero-cup-wrap{position:relative; z-index:3;}
  .hero-cup{
    width:270px; border-radius:26px; box-shadow: 0 40px 70px -25px rgba(58,36,22,0.55);
    border:6px solid var(--white); object-fit:cover; height:340px;
  }`;

const newHeroVideoSection = `  .hero-cup-wrap{position:relative; z-index:3;}
  .hero-video-card{
    position:relative; width:330px; height:420px; border-radius:32px;
    overflow:hidden; box-shadow: 0 35px 75px -20px rgba(58,36,22,0.55);
    border:6px solid var(--white); background:var(--espresso-2);
    cursor:pointer; transition:transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
  }
  .hero-video-card:hover{
    transform:translateY(-4px);
    box-shadow: 0 40px 85px -15px rgba(58,36,22,0.65);
  }
  .hero-video{
    width:100%; height:100%; object-fit:cover; display:block;
  }
  .hero-video-tag{
    position:absolute; top:16px; left:16px; z-index:5;
    background:rgba(28,19,12,0.72); backdrop-filter:blur(8px);
    color:#fff; padding:6px 14px; border-radius:20px; font-size:12px;
    font-weight:700; display:flex; align-items:center; gap:8px;
    letter-spacing:0.5px; border:1px solid rgba(255,255,255,0.22);
    pointer-events:none;
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
    position:absolute; bottom:16px; right:16px; z-index:5;
    display:flex; gap:8px;
  }
  .hero-ctrl-btn{
    width:36px; height:36px; border-radius:50%; background:rgba(28,19,12,0.72);
    backdrop-filter:blur(8px); color:#fff; display:flex; align-items:center;
    justify-content:center; font-size:14px; cursor:pointer;
    border:1px solid rgba(255,255,255,0.25); transition:all .2s ease;
  }
  .hero-ctrl-btn:hover{
    background:var(--caramel); transform:scale(1.1); color:#fff;
  }`;

css = css.replace(oldHeroCupSection, newHeroVideoSection);

// Update small screen media queries for hero-video-card
css = css.replace('.hero-cup{width:190px; height:250px;}', '.hero-video-card{width:260px; height:330px; border-radius:24px;}');

fs.writeFileSync('src/App.css', css);
console.log('App.css updated successfully!');
