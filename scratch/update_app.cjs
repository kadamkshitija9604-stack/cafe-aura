const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'src', 'App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

// 1. Ensure GalleryPage is imported
if (!content.includes("import GalleryPage from './GalleryPage.jsx';")) {
  content = content.replace("import './App.css';", "import './App.css';\nimport GalleryPage from './GalleryPage.jsx';");
}

// 2. Update Gallery component
const oldGalleryComponent = `/* ---------------- GALLERY ---------------- */
function Gallery({ onOpenFullGallery }){
  const labels = ["Coffee cup","Coffee beans","Café interior","Latte art","Desserts","Barista at work"];
  return (
    <section id="gallery" className="section-pad">
      <div className="wrap">
        <Reveal className="section-head">
          <div className="eyebrow">Peek Inside</div>
          <h2>A Little Coffee Gallery</h2>
        </Reveal>
        <div className="gallery-grid">
          {GALLERY.map((src,i)=>(
            <Reveal key={i} y={30} style={{transitionDelay:\`\${i*0.07}s\`}} className="gallery-item">
              <img src={src} alt={labels[i]} title={labels[i]} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}`;

const newGalleryComponent = `/* ---------------- GALLERY ---------------- */
function Gallery({ onOpenFullGallery }){
  const labels = ["Coffee cup","Coffee beans","Café interior","Latte art","Desserts","Barista at work"];
  return (
    <section id="gallery" className="section-pad">
      <div className="wrap">
        <Reveal className="section-head">
          <div className="eyebrow">Peek Inside</div>
          <h2>A Little Coffee Gallery</h2>
          <p>A glimpse into our daily craft, golden hour ambience and signature roasts.</p>
        </Reveal>
        <div className="gallery-grid">
          {GALLERY.map((src,i)=>(
            <Reveal key={i} y={30} style={{transitionDelay:\`\${i*0.07}s\`}} className="gallery-item">
              <img src={src} alt={labels[i]} title={labels[i]} />
            </Reveal>
          ))}
        </div>

        <Reveal y={20} style={{textAlign:'center', marginTop: 36}}>
          <button 
            className="btn btn-caramel" 
            onClick={onOpenFullGallery}
            style={{
              padding: '16px 36px',
              fontSize: '15px',
              fontWeight: '700',
              boxShadow: '0 10px 30px rgba(201, 131, 46, 0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <span>✨ Explore Full Dedicated Gallery (15+ Frames, Reels & Stories)</span>
            <span>→</span>
          </button>
        </Reveal>
      </div>
    </section>
  );
}`;

// Normalize line endings for replacement
const normalize = (s) => s.replace(/\r\n/g, '\n');

let normContent = normalize(content);
let normOld = normalize(oldGalleryComponent);
let normNew = normalize(newGalleryComponent);

if (normContent.includes(normOld)) {
  normContent = normContent.replace(normOld, normNew);
} else {
  console.log('Old gallery pattern not found directly, trying regex');
  normContent = normContent.replace(
    /\/\* ---------------- GALLERY ---------------- \*\/[\s\S]*?function Gallery[\s\S]*?<\/section>\s*\);\s*\}/,
    normNew
  );
}

// 3. Update App component for routing
const oldAppSnippet = `function App(){
  const [cart, setCart] = useState([]);
  const { menuData, featuredData, categoriesList } = useLiveMenu();
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
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

  const handleOrderPlaced = (order) => {
    setCart([]);
    setCheckoutOpen(false);
    setConfirmedOrder(order);
  };

  return (
    <React.Fragment>
      <Navbar onNav={navTo} cartCount={cart.length} onCart={()=>setCartOpen(true)} />
      <Hero onNav={navTo} />
      <Featured onAdd={addToCart} featuredData={featuredData} />
      <Process />
      <Offer onNav={navTo} />
      <Menu onAdd={addToCart} menuData={menuData} categoriesList={categoriesList} />
      <About />
      <Gallery />
      <Testimonials />
      <Newsletter />
      <Footer onNav={navTo} />

      <Cart
        items={cart}
        open={cartOpen}
        onClose={()=>setCartOpen(false)}
        onRemove={removeFromCart}
        onOpenCheckout={()=>setCheckoutOpen(true)}
      />

      <CheckoutModal
        open={checkoutOpen}
        items={cart}
        onClose={()=>setCheckoutOpen(false)}
        onOrderPlaced={handleOrderPlaced}
      />

      <OrderSuccessModal
        order={confirmedOrder}
        onClose={()=>setConfirmedOrder(null)}
      />
    </React.Fragment>
  );
}`;

const newAppSnippet = `function App(){
  const [cart, setCart] = useState([]);
  const { menuData, featuredData, categoriesList } = useLiveMenu();
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [isAdminPath, setIsAdminPath] = useState(false);
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'gallery'

  useEffect(()=>{
    ScrollTrigger.refresh();
    if (typeof window !== 'undefined') {
      const p = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (p.includes('admin')) {
        setIsAdminPath(true);
      } else if (p.includes('gallery') || hash.includes('gallery-page') || hash === '#gallery') {
        setCurrentPage('gallery');
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
    if (id === 'gallery' || id === 'gallery-page') {
      setCurrentPage('gallery');
      window.scrollTo({top: 0, behavior: 'smooth'});
      return;
    }
    if (currentPage !== 'home') {
      setCurrentPage('home');
      setTimeout(() => {
        const el = document.getElementById(id);
        if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
      }, 100);
      return;
    }
    const el = document.getElementById(id);
    if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
  };

  const handleOrderPlaced = (order) => {
    setCart([]);
    setCheckoutOpen(false);
    setConfirmedOrder(order);
  };

  return (
    <React.Fragment>
      {currentPage === 'gallery' ? (
        <GalleryPage
          onBackToHome={() => {
            setCurrentPage('home');
            window.scrollTo({top: 0, behavior: 'smooth'});
          }}
          onAddToCart={addToCart}
          cartCount={cart.length}
          onOpenCart={() => setCartOpen(true)}
        />
      ) : (
        <React.Fragment>
          <Navbar onNav={navTo} cartCount={cart.length} onCart={()=>setCartOpen(true)} />
          <Hero onNav={navTo} />
          <Featured onAdd={addToCart} featuredData={featuredData} />
          <Process />
          <Offer onNav={navTo} />
          <Menu onAdd={addToCart} menuData={menuData} categoriesList={categoriesList} />
          <About />
          <Gallery onOpenFullGallery={() => navTo('gallery-page')} />
          <Testimonials />
          <Newsletter />
          <Footer onNav={navTo} />
        </React.Fragment>
      )}

      <Cart
        items={cart}
        open={cartOpen}
        onClose={()=>setCartOpen(false)}
        onRemove={removeFromCart}
        onOpenCheckout={()=>setCheckoutOpen(true)}
      />

      <CheckoutModal
        open={checkoutOpen}
        items={cart}
        onClose={()=>setCheckoutOpen(false)}
        onOrderPlaced={handleOrderPlaced}
      />

      <OrderSuccessModal
        order={confirmedOrder}
        onClose={()=>setConfirmedOrder(null)}
      />
    </React.Fragment>
  );
}`;

let normOldApp = normalize(oldAppSnippet);
let normNewApp = normalize(newAppSnippet);

if (normContent.includes(normOldApp)) {
  normContent = normContent.replace(normOldApp, normNewApp);
  console.log('App function updated successfully!');
} else {
  console.log('Old App function not matched directly, using regex replacement');
  normContent = normContent.replace(
    /function App\(\)\s*\{[\s\S]*?export default App;/,
    normNewApp + '\n\nexport default App;'
  );
}

fs.writeFileSync(appPath, normContent, 'utf8');
console.log('App.jsx successfully written!');
