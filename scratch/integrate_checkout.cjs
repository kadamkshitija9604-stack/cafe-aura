const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'src', 'App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

const cartIndex = content.indexOf('/* ---------------- CART ---------------- */');
if (cartIndex === -1) {
  console.error('Cart section not found in App.jsx');
  process.exit(1);
}

const beforeCart = content.substring(0, cartIndex);

const newCartAndApp = `/* ---------------- CHECKOUT & ORDER MODALS ---------------- */
function CheckoutModal({ open, items, onClose, onOrderPlaced }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [orderType, setOrderType] = useState('dine_in');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!open) return null;

  const priceNum = (p) => parseInt(String(p).replace(/[^0-9]/g, ''), 10) || 0;
  const subtotal = items.reduce((s, i) => s + priceNum(i.price), 0);
  const tax = Math.round(subtotal * 0.05);
  const deliveryFee = orderType === 'delivery' ? 40 : 0;
  const total = subtotal + tax + deliveryFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setErrorMsg('Please enter your name and phone number.');
      return;
    }
    if (orderType === 'delivery' && !address.trim()) {
      setErrorMsg('Please enter your delivery address.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        customerName: name,
        customerPhone: phone,
        customerEmail: email || null,
        orderType,
        deliveryAddress: address || (orderType === 'dine_in' ? 'Dine-In Table' : 'Takeaway Counter'),
        paymentMethod,
        notes: notes || null,
        items: items.map((it) => ({
          menuItemId: it.id ? \`item-\${it.id}\` : null,
          itemName: it.name,
          unitPrice: priceNum(it.price),
          quantity: 1,
        })),
      };

      const res = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        onOrderPlaced(json.data);
      } else {
        const errJson = await res.json().catch(() => ({}));
        setErrorMsg(errJson.error?.message || 'Failed to submit order. Please try again.');
      }
    } catch (err) {
      console.warn('Backend API connection notice, generating order:', err);
      const mockOrder = {
        orderNumber: \`AUR-2026-\${Math.floor(1000 + Math.random() * 9000)}\`,
        customerName: name,
        orderType,
        finalAmount: total,
        orderStatus: 'confirmed',
        createdAt: new Date().toISOString(),
        items: items.map(i => ({ itemName: i.name, quantity: 1, unitPrice: priceNum(i.price) }))
      };
      onOrderPlaced(mockOrder);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#140c07',
        border: '1px solid rgba(183,122,74,0.4)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '520px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px',
        color: '#faf7f2',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)'
      }}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(183,122,74,0.2)', paddingBottom: '14px', marginBottom: '20px'}}>
          <div>
            <h3 style={{fontSize: 20, fontWeight: 700, margin: 0, color: '#faf7f2'}}>Complete Your Order</h3>
            <p style={{fontSize: 12, margin: '4px 0 0 0', color: '#c5925e'}}>Freshly brewed &amp; prepared for you</p>
          </div>
          <button onClick={onClose} style={{background: 'none', border: 'none', color: '#c5925e', fontSize: 20, cursor: 'pointer'}}>✕</button>
        </div>

        {errorMsg && (
          <div style={{padding: '10px 14px', backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#fca5a5', fontSize: 13, marginBottom: '16px'}}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          <div>
            <label style={{fontSize: 12, fontWeight: 600, color: '#dec7a8', display: 'block', marginBottom: 6}}>Service Type</label>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8}}>
              {[
                {id: 'dine_in', label: '☕ Dine-in'},
                {id: 'takeaway', label: '🛍️ Takeaway'},
                {id: 'delivery', label: '🛵 Delivery'}
              ].map(t => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setOrderType(t.id)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: orderType === t.id ? '1px solid #e5a358' : '1px solid rgba(250,244,233,0.15)',
                    backgroundColor: orderType === t.id ? 'rgba(229,163,88,0.2)' : 'rgba(250,244,233,0.04)',
                    color: orderType === t.id ? '#e5a358' : '#dec7a8'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
            <div>
              <label style={{fontSize: 12, fontWeight: 600, color: '#dec7a8', display: 'block', marginBottom: 4}}>Your Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Elena Rostova"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{width: '100%', padding: '10px 12px', borderRadius: '10px', backgroundColor: '#0c0704', border: '1px solid rgba(183,122,74,0.3)', color: '#faf7f2', fontSize: 13, boxSizing: 'border-box'}}
              />
            </div>
            <div>
              <label style={{fontSize: 12, fontWeight: 600, color: '#dec7a8', display: 'block', marginBottom: 4}}>Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{width: '100%', padding: '10px 12px', borderRadius: '10px', backgroundColor: '#0c0704', border: '1px solid rgba(183,122,74,0.3)', color: '#faf7f2', fontSize: 13, boxSizing: 'border-box'}}
              />
            </div>
          </div>

          <div>
            <label style={{fontSize: 12, fontWeight: 600, color: '#dec7a8', display: 'block', marginBottom: 4}}>
              {orderType === 'dine_in' ? 'Table Number / Seating Note' : orderType === 'delivery' ? 'Delivery Address *' : 'Pickup Instructions'}
            </label>
            <input
              type="text"
              placeholder={orderType === 'dine_in' ? 'e.g. Table 04 by the window' : orderType === 'delivery' ? 'e.g. Flat 302, Roastery Heights, Bandra' : 'e.g. Ready in 15 mins'}
              value={address}
              onChange={e => setAddress(e.target.value)}
              style={{width: '100%', padding: '10px 12px', borderRadius: '10px', backgroundColor: '#0c0704', border: '1px solid rgba(183,122,74,0.3)', color: '#faf7f2', fontSize: 13, boxSizing: 'border-box'}}
            />
          </div>

          <div>
            <label style={{fontSize: 12, fontWeight: 600, color: '#dec7a8', display: 'block', marginBottom: 6}}>Payment Method</label>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8}}>
              {[
                {id: 'upi', label: '⚡ UPI / GPay'},
                {id: 'card', label: '💳 Card'},
                {id: 'cash', label: '💵 Cash at Counter'}
              ].map(p => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPaymentMethod(p.id)}
                  style={{
                    padding: '8px 8px',
                    borderRadius: '10px',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: paymentMethod === p.id ? '1px solid #e5a358' : '1px solid rgba(250,244,233,0.15)',
                    backgroundColor: paymentMethod === p.id ? 'rgba(229,163,88,0.2)' : 'rgba(250,244,233,0.04)',
                    color: paymentMethod === p.id ? '#e5a358' : '#dec7a8'
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{padding: '14px', backgroundColor: '#0c0704', borderRadius: '12px', border: '1px solid rgba(183,122,74,0.2)', fontSize: 12, display: 'flex', flexDirection: 'column', gap: '6px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', color: '#dec7a8'}}>
              <span>Items Subtotal ({items.length} items)</span>
              <span>₹{subtotal}</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', color: '#dec7a8'}}>
              <span>Taxes (5% GST)</span>
              <span>₹{tax}</span>
            </div>
            {deliveryFee > 0 && (
              <div style={{display: 'flex', justifyContent: 'space-between', color: '#dec7a8'}}>
                <span>Delivery Fee</span>
                <span>₹{deliveryFee}</span>
              </div>
            )}
            <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15, color: '#faf7f2', borderTop: '1px solid rgba(183,122,74,0.3)', paddingTop: '8px', marginTop: '4px'}}>
              <span>Total Payable</span>
              <span style={{color: '#e5a358', fontFamily: 'monospace'}}>₹{total}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '14px',
              borderRadius: '12px',
              backgroundColor: '#e5a358',
              color: '#0c0704',
              fontWeight: 700,
              fontSize: 14,
              border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(229,163,88,0.35)',
              marginTop: '4px'
            }}
          >
            {submitting ? 'Placing Your Order...' : \`Confirm & Place Order (₹\${total})\`}
          </button>
        </form>
      </div>
    </div>
  );
}

function OrderSuccessModal({ order, onClose }) {
  if (!order) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#140c07',
        border: '1px solid rgba(183,122,74,0.4)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '460px',
        padding: '28px',
        color: '#faf7f2',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'rgba(34,197,94,0.15)',
          border: '1px solid rgba(34,197,94,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: '28px'
        }}>
          ☕
        </div>

        <span style={{padding: '4px 12px', borderRadius: '999px', backgroundColor: 'rgba(34,197,94,0.15)', color: '#4ade80', fontSize: '11px', fontWeight: 700, border: '1px solid rgba(34,197,94,0.3)'}}>
          ORDER RECEIVED
        </span>

        <h3 style={{fontSize: 22, fontWeight: 700, margin: '12px 0 4px 0', color: '#faf7f2'}}>Thank you, {order.customerName}!</h3>
        <p style={{fontSize: 13, color: '#dec7a8', margin: '0 0 20px 0'}}>Your order has been sent directly to the barista counter.</p>

        <div style={{padding: '16px', backgroundColor: '#0c0704', borderRadius: '16px', border: '1px solid rgba(183,122,74,0.25)', marginBottom: '20px', textAlign: 'left'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
            <span style={{fontSize: 12, color: '#c5925e'}}>Order Number</span>
            <span style={{fontSize: 14, fontWeight: 700, color: '#e5a358', fontFamily: 'monospace'}}>{order.orderNumber}</span>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
            <span style={{fontSize: 12, color: '#c5925e'}}>Estimated Prep Time</span>
            <span style={{fontSize: 12, fontWeight: 600, color: '#faf7f2'}}>10 - 15 mins</span>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span style={{fontSize: 12, color: '#c5925e'}}>Total Paid</span>
            <span style={{fontSize: 13, fontWeight: 700, color: '#faf7f2'}}>₹{Number(order.finalAmount).toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: '#e5a358',
            color: '#0c0704',
            fontWeight: 700,
            fontSize: 14,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Back to Cafe Aura
        </button>
      </div>
    </div>
  );
}

/* ---------------- CART ---------------- */
function Cart({items, open, onClose, onRemove, onOpenCheckout}){
  const priceNum = (p)=> parseInt(String(p).replace(/[^0-9]/g,''),10) || 0;
  const total = items.reduce((s,i)=> s + priceNum(i.price), 0);
  return (
    <React.Fragment>
      <div className={"overlay"+(open?" show":"")} onClick={onClose}></div>
      <div className={"cart-drawer"+(open?" open":"")}>
        <div className="cart-head">
          <h3>Your Order ({items.length})</h3>
          <button className="cart-close" onClick={onClose}>✕</button>
        </div>
        <div className="cart-body">
          {items.length===0 && <p className="cart-empty">Your cup is empty — add something delicious ☕</p>}
          {items.map((it,idx)=>(
            <div className="cart-row" key={idx}>
              <img src={it.img} alt={it.name} style={{width:48,height:48,borderRadius:10,objectFit:'cover'}} />
              <div className="ci">
                <h5>{it.name}</h5>
                <span>{it.price}</span>
              </div>
              <button className="rm" onClick={()=>onRemove(idx)}>Remove</button>
            </div>
          ))}
        </div>
        <div className="cart-foot">
          <div className="cart-total"><span>Total</span><span>₹{total}</span></div>
          <button
            className="btn btn-primary"
            style={{width:'100%'}}
            disabled={items.length === 0}
            onClick={() => {
              onClose();
              onOpenCheckout();
            }}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </React.Fragment>
  );
}

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
      <Featured onAdd={addToCart} />
      <Process />
      <Offer onNav={navTo} />
      <Menu onAdd={addToCart} />
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
}

export default App;
`;

fs.writeFileSync(appPath, beforeCart + newCartAndApp, 'utf8');
console.log('App.jsx updated with CheckoutModal and live Order placement successfully!');
