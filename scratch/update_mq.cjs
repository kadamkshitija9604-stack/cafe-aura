const fs = require('fs');

let css = fs.readFileSync('src/App.css', 'utf8');

// Update 980px media query
const old980 = `@media(max-width:980px){
    .nav-links, .nav-cta{display:none;}
    .hamburger{display:flex;}
    .hero-grid{grid-template-columns:1fr; text-align:center;}
    .hero p.sub{margin-left:auto; margin-right:auto;}
    .hero-ctas{justify-content:center;}
    .stats-row{justify-content:center;}`;

const new980 = `@media(max-width:980px){
    .nav-links, .nav-cta{display:none;}
    .hamburger{display:flex;}
    .hero-fullwidth{padding:120px 0 40px; min-height:80vh;}
    .hero-bottom-bar{flex-direction:column; align-items:flex-start; gap:18px;}
    .hero-video-bar{margin-left:0; width:100%; justify-content:space-between;}`;

css = css.replace(old980, new980);

// Update 520px media query
const old520 = `@media(max-width:520px){
    .wrap{padding:0 20px;}
    .hero{padding:140px 0 60px;}
    .hero-art{height:380px;}
    .hero-circle{width:280px; height:280px;}
    .hero-video-card{width:260px; height:330px; border-radius:24px;}`;

const new520 = `@media(max-width:520px){
    .wrap{padding:0 20px;}
    .hero-fullwidth{padding:110px 0 35px; min-height:85vh;}
    .hero-fullwidth .hero-title{font-size:36px;}
    .hero-fullwidth p.sub{font-size:15px; margin:16px 0 24px;}
    .hero-badges-group{width:100%;}
    .hero-badge-float{flex:1; padding:10px 14px;}`;

css = css.replace(old520, new520);

fs.writeFileSync('src/App.css', css);
console.log('App.css media queries updated!');
