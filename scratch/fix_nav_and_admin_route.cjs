const fs = require('fs');

let content = fs.readFileSync('src/App.jsx', 'utf8');

const navCode = `/* ---------------- NAV ---------------- */
function Navbar({onNav, cartCount, onCart}){
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(()=>{
    const onScroll = ()=> setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return ()=> window.removeEventListener('scroll', onScroll);
  },[]);

  const links = [["Home","home"],["Menu","menu"],["About","about"],["Gallery","gallery"],["Contact","footer"]];

  const go = (id)=>{ setOpen(false); onNav(id); };

  return (
    <React.Fragment>
      <nav className={"navbar" + (scrolled?" scrolled":"")}>
        <div className="wrap nav-inner">
          <div className="logo" onClick={()=>go('home')} style={{cursor:'pointer'}}>
            <img src="/logo.png" className="logo-mark" style={{objectFit: 'cover', background: 'none'}} alt="logo" />
            <div>Cafe Aura<small>Café &amp; Roastery</small></div>
          </div>
          <ul className="nav-links">
            {links.map(l=> <li key={l[1]}><a onClick={()=>go(l[1])} style={{cursor:'pointer'}}>{l[0]}</a></li>)}
            <li><a href="http://localhost:3000/dashboard" target="_blank" rel="noreferrer" style={{color:'var(--caramel)', fontWeight:600}}>Admin ↗</a></li>
          </ul>
          <div className="nav-cta" style={{display:'flex', gap:12, alignItems:'center'}}>
            <a href="http://localhost:3000/dashboard" target="_blank" rel="noreferrer" className="btn btn-outline-light" style={{padding:'8px 16px', fontSize:13, textDecoration:'none'}}>Admin Portal</a>
            <button className="btn btn-primary" onClick={()=>go('menu')}>Order Now</button>
          </div>
          <button className="hamburger" onClick={()=>setOpen(true)} aria-label="Open menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      <div className={"mobile-menu" + (open?" open":"")}>
        <button className="cart-close" style={{position:'absolute', top:24, right:24, background:'rgba(250,244,233,0.15)', color:'#fff'}} onClick={()=>setOpen(false)}>✕</button>
        {links.map(l=> <a key={l[1]} onClick={()=>go(l[1])}>{l[0]}</a>)}
        <a href="http://localhost:3000/dashboard" target="_blank" rel="noreferrer" style={{color:'var(--caramel)', fontWeight:700}}>Admin Portal ↗</a>
        <button className="btn btn-caramel" style={{marginTop:10}} onClick={()=>go('menu')}>Order Now</button>
      </div>
    </React.Fragment>
  );
}

/* ---------------- HERO ---------------- */`;

// Replace from "/* ---------------- NAV ---------------- */" up to "/* ---------------- HERO ---------------- */"
content = content.replace(/\/\* ---------------- NAV ---------------- \*\/[\s\S]*?\/\* ---------------- HERO ---------------- \*\//, navCode);

// Add Admin gateway view at /admin in App component
const adminGateway = `
/* ---------------- ADMIN GATEWAY ---------------- */
function AdminGatewayView(){
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0c0704',
      color: '#faf7f2',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        padding: '16px 24px',
        backgroundColor: '#140c07',
        borderBottom: '1px solid rgba(183,122,74,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <img src="/logo.png" style={{width: 36, height: 36, borderRadius: 8, objectFit: 'cover'}} alt="Cafe Aura" />
          <div>
            <h1 style={{fontSize: 16, fontWeight: 700, margin: 0, color: '#faf7f2'}}>Cafe Aura Admin Portal</h1>
            <p style={{fontSize: 12, margin: 0, color: '#c5925e'}}>Next.js Enterprise Management Console</p>
          </div>
        </div>

        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <a href="/" style={{
            padding: '8px 16px',
            fontSize: 13,
            color: '#dec7a8',
            backgroundColor: 'rgba(250,244,233,0.08)',
            border: '1px solid rgba(250,244,233,0.2)',
            borderRadius: 8,
            textDecoration: 'none'
          }}>
            ← Return to Website
          </a>
          <a href="http://localhost:3000/dashboard" target="_blank" rel="noreferrer" style={{
            padding: '8px 18px',
            fontSize: 13,
            fontWeight: 600,
            color: '#0c0704',
            background: 'linear-gradient(to right, #e5a358, #c5925e)',
            borderRadius: 8,
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(229,163,88,0.25)'
          }}>
            Open in Dedicated Window ↗
          </a>
        </div>
      </div>

      <div style={{flex: 1, position: 'relative', width: '100%', height: 'calc(100vh - 69px)'}}>
        <iframe
          src="http://localhost:3000/dashboard"
          title="Cafe Aura Admin Panel"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block'
          }}
        />
      </div>
    </div>
  );
}

/* ---------------- APP ---------------- */
function App(){
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [isAdminPath, setIsAdminPath] = useState(false);

  useEffect(()=>{
    ScrollTrigger.refresh();
    if (typeof window !== 'undefined') {
      const p = window.location.pathname.toLowerCase();
      if (p.includes('admin')) {
        setIsAdminPath(true);
      }
    }
  },[]);

  if (isAdminPath) {
    return <AdminGatewayView />;
  }

  const addToCart = (item)=>{
    setCart(prev=>[...prev, item]);
    setCartOpen(true);
  };
  const removeFromCart = (idx)=>{
    setCart(prev=> prev.filter((_,i)=> i!==idx));
  };

  const navTo = (id)=>{
    const el = document.getElementById(id);
    if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
  };

  return (
    <React.Fragment>
      <Navbar onNav={navTo} cartCount={cart.length} onCart={()=>setCartOpen(true)} />
      <Hero onNav={navTo} />
      <Featured onAdd={addToCart} />
      <Process />
      <Offer onNav={navTo} />
      <Menu onAdd={addToCart} />
      <About />
      <Gallery />
      <Testimonials />
      <Newsletter />
      <Footer onNav={navTo} />

      <Cart items={cart} open={cartOpen} onClose={()=>setCartOpen(false)} onRemove={removeFromCart} />
    </React.Fragment>
  );
}
`;

content = content.replace(/\/\* ---------------- APP ---------------- \*\/[\s\S]*?export default App;/, adminGateway + '\nexport default App;');

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('App.jsx updated successfully!');
