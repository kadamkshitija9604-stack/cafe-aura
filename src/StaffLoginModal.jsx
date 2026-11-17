import React, { useState, useEffect } from 'react';

const PRESET_ACCOUNTS = [
  {
    name: 'Kshitija Kadam',
    email: 'kadamkshitija9604@gmail.com',
    role: 'Super Admin',
    badge: 'Owner & Admin',
    icon: '👑',
    desc: 'Owner access to all café operations, backend database & management',
  },
  {
    name: 'Elena Rostova',
    email: 'admin@cafeaura.com',
    role: 'Super Admin',
    badge: 'Super Admin',
    icon: '⭐',
    desc: 'Full access to all café operations, staff, orders & audit logs',
  },
  {
    name: 'Sophia Lin',
    email: 'manager@cafeaura.com',
    role: 'Manager',
    badge: 'Store Manager',
    icon: '👔',
    desc: 'Daily operations, orders tracking, inventory & staff management',
  },
  {
    name: 'Marco Rossi',
    email: 'menu@cafeaura.com',
    role: 'Menu Manager',
    badge: 'Menu Manager',
    icon: '☕',
    desc: 'Menu curation, prices, categories, and culinary descriptions',
  },
  {
    name: 'Audit Viewer',
    email: 'viewer@cafeaura.com',
    role: 'Viewer',
    badge: 'Viewer',
    icon: '👁️',
    desc: 'Read-only access to view logs, metrics, and orders',
  },
];

export default function StaffLoginModal({
  open,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
  apiBaseUrl,
  adminPortalUrl,
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [activeTab, setActiveTab] = useState('quick'); // 'quick' | 'custom'

  useEffect(() => {
    if (open) {
      setErrorMsg(null);
      if (!email) {
        setEmail('kadamkshitija9604@gmail.com');
        setPassword('admin123');
      }
    }
  }, [open]);

  if (!open) return null;

  const handleSelectAccount = (acc) => {
    setEmail(acc.email);
    setPassword('admin123');
    setErrorMsg(null);
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      let res = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: cleanEmail, password }),
      }).catch(() => null);

      // Fallback attempt to relative /api/auth/login if cross-origin fails
      if (!res || !res.ok) {
        const fallbackRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: cleanEmail, password }),
        }).catch(() => null);
        if (fallbackRes && fallbackRes.ok) {
          res = fallbackRes;
        }
      }

      if (res && res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('cafe_aura_user', JSON.stringify(data.user));
              if (data.token) {
                localStorage.setItem('cafe_aura_token', data.token);
              }
            } catch (_) {}
          }
          onLoginSuccess(data.user, data.token);
          return;
        } else {
          setErrorMsg(data.error?.message || data.message || 'Login failed. Please check credentials.');
        }
      } else {
        const errJson = res ? await res.json().catch(() => ({})) : {};
        const msg = errJson.error?.message || errJson.message || 'Authentication failed. Please verify credentials.';
        setErrorMsg(msg);
      }
    } catch (err) {
      setErrorMsg('Network error connecting to backend API. Please make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(7, 4, 2, 0.82)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#140c07',
          border: '1px solid rgba(229, 163, 88, 0.35)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          color: '#faf7f2',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.8), 0 0 40px rgba(229, 163, 88, 0.1)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '1px solid rgba(183, 122, 74, 0.25)',
            paddingBottom: '16px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #e5a358, #8c4c1a)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                boxShadow: '0 4px 14px rgba(229, 163, 88, 0.3)',
              }}
            >
              🔒
            </div>
            <div>
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  margin: 0,
                  color: '#faf7f2',
                  fontFamily: 'Playfair Display, serif',
                }}
              >
                Staff & Admin Portal
              </h2>
              <p style={{ fontSize: '12px', margin: '3px 0 0', color: '#c5925e' }}>
                Backend Management &amp; Role-Based Access
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'rgba(250, 244, 233, 0.08)',
              border: '1px solid rgba(250, 244, 233, 0.15)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#dec7a8',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* If already logged in */}
        {currentUser ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div
              style={{
                padding: '16px',
                borderRadius: '16px',
                backgroundColor: 'rgba(34, 197, 94, 0.12)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  color: '#0c0704',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: 700,
                }}
              >
                ✓
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#faf7f2' }}>
                  {currentUser.displayName || 'Authorized User'}
                </div>
                <div style={{ fontSize: '12px', color: '#86efac' }}>
                  {currentUser.email} &bull;{' '}
                  <span
                    style={{
                      background: 'rgba(34, 197, 94, 0.25)',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                    }}
                  >
                    {(currentUser.role || 'staff').replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <a
                href={`${adminPortalUrl}/dashboard`}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #e5a358, #c5925e)',
                  color: '#0c0704',
                  fontWeight: 700,
                  fontSize: '13px',
                  textAlign: 'center',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(229, 163, 88, 0.35)',
                }}
              >
                <span>📊</span> Open Dashboard
              </a>
              <a
                href={`${adminPortalUrl}/orders`}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'rgba(250, 244, 233, 0.08)',
                  border: '1px solid rgba(229, 163, 88, 0.4)',
                  color: '#f3c88a',
                  fontWeight: 600,
                  fontSize: '13px',
                  textAlign: 'center',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <span>🛍️</span> View Orders
              </a>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                onClick={onLogout}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#fca5a5',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Sign Out
              </button>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(250, 244, 233, 0.08)',
                  border: '1px solid rgba(250, 244, 233, 0.15)',
                  color: '#dec7a8',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Close &amp; Stay Here
              </button>
            </div>
          </div>
        ) : (
          /* Login Form */
          <div>
            {/* Tabs */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                marginBottom: '16px',
                backgroundColor: 'rgba(250, 244, 233, 0.04)',
                padding: '4px',
                borderRadius: '12px',
                border: '1px solid rgba(250, 244, 233, 0.08)',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('quick')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: activeTab === 'quick' ? '#c5925e' : 'transparent',
                  color: activeTab === 'quick' ? '#0c0704' : '#dec7a8',
                  transition: 'all 0.2s ease',
                }}
              >
                ⚡ Quick Demo Accounts
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('custom')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: activeTab === 'custom' ? '#c5925e' : 'transparent',
                  color: activeTab === 'custom' ? '#0c0704' : '#dec7a8',
                  transition: 'all 0.2s ease',
                }}
              >
                ✍️ Custom Login
              </button>
            </div>

            {/* Quick Demo Accounts Selection */}
            {activeTab === 'quick' && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '11px', color: '#dec7a8', marginBottom: '8px', margin: '0 0 8px 2px' }}>
                  Select an authorized staff role to prefill credentials:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {PRESET_ACCOUNTS.map((acc) => {
                    const isSelected = email === acc.email;
                    return (
                      <div
                        key={acc.email}
                        onClick={() => handleSelectAccount(acc)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '12px',
                          border: isSelected
                            ? '1px solid #e5a358'
                            : '1px solid rgba(250, 244, 233, 0.1)',
                          backgroundColor: isSelected
                            ? 'rgba(229, 163, 88, 0.16)'
                            : 'rgba(250, 244, 233, 0.03)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <span>{acc.icon}</span>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#faf7f2' }}>
                            {acc.name}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: '10px',
                            color: isSelected ? '#e5a358' : '#c5925e',
                            fontWeight: 600,
                            marginBottom: '2px',
                          }}
                        >
                          {acc.badge}
                        </div>
                        <div style={{ fontSize: '10px', color: 'rgba(250, 244, 233, 0.5)' }}>
                          {acc.email}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '10px',
                  color: '#fca5a5',
                  fontSize: '12px',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#dec7a8',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cafeaura.com"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: 'rgba(250, 244, 233, 0.05)',
                    border: '1px solid rgba(183, 122, 74, 0.4)',
                    borderRadius: '10px',
                    color: '#faf7f2',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '6px',
                  }}
                >
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#dec7a8' }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#c5925e',
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: 'rgba(250, 244, 233, 0.05)',
                    border: '1px solid rgba(183, 122, 74, 0.4)',
                    borderRadius: '10px',
                    color: '#faf7f2',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '8px',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #e5a358, #c5925e)',
                  border: 'none',
                  color: '#0c0704',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 4px 14px rgba(229, 163, 88, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'transform 0.1s ease',
                }}
              >
                {loading ? (
                  <>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '14px',
                        height: '14px',
                        border: '2px solid #0c0704',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite',
                      }}
                    />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <span>☕</span> Sign In to Cafe Aura
                  </>
                )}
              </button>
            </form>

            {/* Direct Link to Dedicated Console */}
            <div
              style={{
                marginTop: '18px',
                paddingTop: '14px',
                borderTop: '1px solid rgba(183, 122, 74, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '11px',
                color: 'rgba(250, 244, 233, 0.55)',
              }}
            >
              <span>Prefer standalone admin page?</span>
              <a
                href={`${adminPortalUrl}/login`}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: '#e5a358',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Open Next.js Console ↗
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
