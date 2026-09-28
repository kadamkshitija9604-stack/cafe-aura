const fs = require('fs');

let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Define useLiveMenu hook definition
const useLiveMenuCode = `
/* ---------------- LIVE MENU HOOK ---------------- */
function useLiveMenu() {
  const [menuData, setMenuData] = useState(MENU);
  const [featuredData, setFeaturedData] = useState(FEATURED);
  const [categoriesList, setCategoriesList] = useState(Object.keys(MENU));
  const [loading, setLoading] = useState(true);

  const fetchMenu = async () => {
    try {
      let itemsRes = await fetch('/api/menu').catch(() => null);
      if (!itemsRes || !itemsRes.ok) {
        itemsRes = await fetch('http://localhost:3000/api/menu').catch(() => null);
      }

      let catsRes = await fetch('/api/categories').catch(() => null);
      if (!catsRes || !catsRes.ok) {
        catsRes = await fetch('http://localhost:3000/api/categories').catch(() => null);
      }

      let items = null;
      let categories = null;

      if (itemsRes && itemsRes.ok) {
        items = await itemsRes.json();
      }
      if (catsRes && catsRes.ok) {
        categories = await catsRes.json();
      }

      // Local storage fallback
      if (!items && typeof window !== 'undefined') {
        const saved = localStorage.getItem('cafe_aura_menu_items');
        if (saved) {
          try { items = JSON.parse(saved); } catch (e) {}
        }
      }
      if (!categories && typeof window !== 'undefined') {
        const savedCats = localStorage.getItem('cafe_aura_categories');
        if (savedCats) {
          try { categories = JSON.parse(savedCats); } catch (e) {}
        }
      }

      if (items && Array.isArray(items) && items.length > 0) {
        const grouped = {};
        const catNames = [];

        if (categories && Array.isArray(categories)) {
          categories.forEach(cat => {
            if (cat.isActive !== false) {
              const cName = cat.name || cat.title;
              if (cName && !grouped[cName]) {
                grouped[cName] = [];
                catNames.push(cName);
              }
            }
          });
        }

        const featuredList = [];

        items.forEach(it => {
          const catName = it.categoryName || it.category || 'Specialties';
          if (!grouped[catName]) {
            grouped[catName] = [];
            catNames.push(catName);
          }

          const priceVal = typeof it.price === 'number' ? it.price : (parseFloat(String(it.price).replace(/[^0-9.]/g, '')) || 0);
          const priceFormatted = '$' + priceVal.toFixed(2);

          const formattedItem = {
            id: it.id || it.name,
            name: it.name,
            desc: it.description || it.desc || '',
            price: priceFormatted,
            rawPrice: priceVal,
            img: it.imageUrl || it.img || 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=500&auto=format&fit=crop',
            isAvailable: it.isAvailable !== false,
            isFeatured: !!it.isFeatured,
            isBestseller: !!it.isBestseller,
            isVegetarian: !!it.isVegetarian,
            category: catName,
          };

          grouped[catName].push(formattedItem);

          if (formattedItem.isFeatured || formattedItem.isBestseller) {
            featuredList.push(formattedItem);
          }
        });

        const finalCats = catNames.filter(c => grouped[c] && grouped[c].length > 0);

        if (finalCats.length > 0) {
          setMenuData(grouped);
          setCategoriesList(finalCats);
        }
        if (featuredList.length > 0) {
          setFeaturedData(featuredList);
        }
      }
    } catch (err) {
      console.warn('Live menu fetch failed, using fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
    const handleStorage = (e) => {
      if (e.key === 'cafe_aura_menu_items' || e.key === 'cafe_aura_categories') {
        fetchMenu();
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', fetchMenu);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', fetchMenu);
    };
  }, []);

  return { menuData, featuredData, categoriesList, loading, refetch: fetchMenu };
}
`;

// 2. Updated Featured Component
const updatedFeaturedCode = `
/* ---------------- FEATURED ---------------- */
function Featured({onAdd, featuredData}){
  const items = featuredData && featuredData.length > 0 ? featuredData : FEATURED;
  return (
    <section id="featured" className="section-pad">
      <div className="wrap">
        <Reveal className="section-head">
          <div className="eyebrow">Handpicked Favourites</div>
          <h2>Your Daily Cup of Happiness</h2>
        </Reveal>
        <div className="card-grid">
          {items.map((c,i)=>(
            <Reveal key={c.id || c.name} y={50} style={{transitionDelay:\`\${i*0.1}s\`}}>
              <div className="coffee-card">
                <div className="img-wrap"><img src={c.img} alt={c.name} /></div>
                <h3>{c.name}</h3>
                <p>{c.desc}</p>
                <div className="card-foot">
                  <span className="price">{c.price}</span>
                  <button className="add-btn" onClick={()=>onAdd(c)}>+ Add to Order</button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
`;

// 3. Updated Menu Component
const updatedMenuCode = `
/* ---------------- MENU ---------------- */
function Menu({onAdd, menuData, categoriesList}){
  const cats = categoriesList && categoriesList.length > 0 ? categoriesList : Object.keys(menuData || MENU);
  const [active, setActive] = useState(cats[0] || 'Artisan Coffee');

  useEffect(() => {
    if (cats.length > 0 && !cats.includes(active)) {
      setActive(cats[0]);
    }
  }, [cats, active]);

  const activeItems = (menuData && menuData[active]) || (MENU && MENU[active]) || [];

  return (
    <section id="menu" className="section-pad">
      <div className="wrap">
        <Reveal className="section-head">
          <div className="eyebrow">— FULL MENU —</div>
          <h2>Crafted for Every Coffee Craving</h2>
          <p className="sub" style={{marginTop: '16px'}}>Freshly brewed. Carefully crafted. Made for you.</p>
        </Reveal>

        <Reveal className="menu-special" y={20}>
          <div className="special-card">
            <img src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=500&auto=format&fit=crop" alt="Café Aura Signature Blend" />
            <div className="special-content">
              <div className="special-badge">★ Chef's Choice</div>
              <h3>Café Aura Signature Blend</h3>
              <p>Our exclusive house blend featuring notes of dark chocolate, toasted hazelnut, and a hint of sweet caramel. A truly unforgettable cup.</p>
              <div className="special-foot">
                <span className="price">₹320</span>
                <button className="btn btn-primary" onClick={()=>onAdd({name:"Café Aura Signature Blend", desc:"Our exclusive house blend.", price:"₹320", img:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=500&auto=format&fit=crop"})}>
                  + Add to Order
                </button>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal className="menu-tabs" y={10}>
          {cats.map(c=>(
            <button key={c} className={"menu-tab"+(active===c?" active":"")} onClick={()=>setActive(c)}>{c}</button>
          ))}
        </Reveal>
        
        <div className="menu-grid">
          {activeItems.map((item,i)=>(
            <Reveal key={item.id || item.name} y={24} style={{transitionDelay:\`\${i*0.06}s\`}}>
              <div className="menu-item-premium">
                <div className="img-wrap">
                  <img src={item.img} alt={item.name} />
                </div>
                <div className="mi-body">
                  <h4>{item.name}</h4>
                  <p>{item.desc}</p>
                </div>
                <div className="mi-foot">
                  <span className="price">{item.price}</span>
                  <button className="add-btn-circular" onClick={()=>onAdd(item)}>+</button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
`;

// Replace Featured
const featStart = code.indexOf('/* ---------------- FEATURED ---------------- */');
const featEnd = code.indexOf('/* ---------------- PROCESS ---------------- */');
if (featStart !== -1 && featEnd !== -1) {
  code = code.slice(0, featStart) + useLiveMenuCode + '\n' + updatedFeaturedCode + '\n' + code.slice(featEnd);
}

// Replace Menu
const menuStart = code.indexOf('/* ---------------- MENU ---------------- */');
const menuEnd = code.indexOf('/* ---------------- ABOUT ---------------- */');
if (menuStart !== -1 && menuEnd !== -1) {
  code = code.slice(0, menuStart) + updatedMenuCode + '\n' + code.slice(menuEnd);
}

// Replace in App()
const oldAppSignature = 'function App(){\n  const [cart, setCart] = useState([]);';
const newAppSignature = 'function App(){\n  const [cart, setCart] = useState([]);\n  const { menuData, featuredData, categoriesList } = useLiveMenu();';
code = code.replace(oldAppSignature, newAppSignature);

code = code.replace(
  '<Featured onAdd={addToCart} />',
  '<Featured onAdd={addToCart} featuredData={featuredData} />'
);

code = code.replace(
  '<Menu onAdd={addToCart} />',
  '<Menu onAdd={addToCart} menuData={menuData} categoriesList={categoriesList} />'
);

// Price parser fix in CheckoutModal
code = code.replace(
  "const priceNum = (p) => parseInt(String(p).replace(/[^0-9]/g, ''), 10) || 0;",
  "const priceNum = (p) => { if (typeof p === 'number') return p; const clean = String(p).replace(/[^0-9.]/g, ''); return parseFloat(clean) || 0; };"
);

fs.writeFileSync('src/App.jsx', code, 'utf8');
console.log('App.jsx successfully updated with live menu integration!');
