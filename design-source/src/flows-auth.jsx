// Auth, Payment, Onboarding flows + residency badge components
const AUS = React.useState, AUE = React.useEffect, AUR = React.useRef;

// ───── RESIDENCY BADGE ─────
function ResidencyBadge({ local, theme, size = 'sm' }) {
  const t = theme;
  const r = RESIDENCY[local.residency] || RESIDENCY.newlocal;
  const big = size === 'lg';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: big ? 8 : 5,
      padding: big ? '6px 12px' : '4px 8px',
      borderRadius: 100,
      background: t.surface, border: `1px solid ${r.ring}55`,
      fontFamily: FONT_MONO, fontSize: big ? 11 : 10,
      letterSpacing: '.04em', textTransform: 'uppercase',
      color: t.text,
    }}>
      <span style={{ width: big ? 8 : 6, height: big ? 8 : 6, borderRadius: 4, background: r.ring, boxShadow: `0 0 8px ${r.ring}` }}/>
      {local.residency === 'native' ? `Born here · ${local.yearsInCity}y` :
       local.residency === 'rooted' ? `${local.yearsInCity}y local` :
       r.short}
    </span>
  );
}

// ───── AUTH MODAL ─────
function AuthModal({ theme, mode, onClose, onAuth }) {
  const t = theme;
  const [view, setView] = AUS(mode || 'signin');
  const [email, setEmail] = AUS('');
  const [pw, setPw] = AUS('');
  const [name, setName] = AUS('');
  const [err, setErr] = AUS('');
  const [loading, setLoading] = AUS(false);

  const submit = (e) => {
    e?.preventDefault();
    setErr('');
    if (!email.includes('@')) return setErr('Enter a valid email');
    if (pw.length < 6) return setErr('Password must be 6+ characters');
    if (view === 'signup' && !name) return setErr('Tell us your name');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onAuth({ name: view === 'signup' ? name : email.split('@')[0], email });
    }, 900);
  };

  return (
    <Overlay onClose={onClose} theme={t}>
      <div style={{
        width: 440, background: t.surface, borderRadius: 20,
        border: `1px solid ${t.line2}`, padding: 36, position: 'relative',
        fontFamily: FONT_BODY, color: t.text,
        boxShadow: `0 40px 80px rgba(0,0,0,.6), 0 0 60px ${t.a1}22`,
      }} onClick={e => e.stopPropagation()}>
        <CloseBtn onClick={onClose} theme={t}/>
        <Logo theme={t}/>
        <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 700, letterSpacing: -0.8, margin: '20px 0 6px' }}>
          {view === 'signin' ? 'Welcome back' : 'Create your account'}
        </h2>
        <div style={{ fontSize: 13, color: t.textDim, marginBottom: 24 }}>
          {view === 'signin' ? 'Continue finding locals wherever you land.' : 'Land anywhere. Meet someone in hours.'}
        </div>

        <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
          <SocialBtn theme={t} icon="G" label="Continue with Google" onClick={() => { setLoading(true); setTimeout(() => onAuth({ name: 'Alex', email: 'alex@gmail.com', social: 'google' }), 700); }}/>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <SocialBtn theme={t} icon="" label="Apple" onClick={() => onAuth({ name: 'Alex', email: 'alex@icloud.com', social: 'apple' })}/>
            <SocialBtn theme={t} icon="IG" label="Instagram" onClick={() => onAuth({ name: 'Alex', email: 'alex@ig.com', social: 'instagram' })}/>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0', color: t.textMuted, fontSize: 11, fontFamily: FONT_MONO }}>
          <div style={{ flex: 1, height: 1, background: t.line }}/>OR<div style={{ flex: 1, height: 1, background: t.line }}/>
        </div>

        <form onSubmit={submit} style={{ display: 'grid', gap: 10 }}>
          {view === 'signup' && (
            <Field theme={t} label="Full name" value={name} onChange={setName} placeholder="Alex Morgan"/>
          )}
          <Field theme={t} label="Email" value={email} onChange={setEmail} type="email" placeholder="you@email.com" autoFocus/>
          <Field theme={t} label="Password" value={pw} onChange={setPw} type="password" placeholder="••••••••"/>
          {err && <div style={{ color: '#FF6A6A', fontSize: 12 }}>{err}</div>}
          <button type="submit" className="ml-btn" disabled={loading} style={{
            marginTop: 8, padding: '14px', borderRadius: 12,
            background: t.grad, color: '#fff', border: 'none',
            fontSize: 14, fontWeight: 600, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center',
          }}>
            {loading ? <Spinner/> : <>{view === 'signin' ? 'Sign in' : 'Create account'} <Icon name="arrow" size={14}/></>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: t.textDim }}>
          {view === 'signin' ? "New to meetlocal.ai? " : 'Already have an account? '}
          <a onClick={() => setView(view === 'signin' ? 'signup' : 'signin')} style={{ color: t.a1, cursor: 'pointer', fontWeight: 500 }}>
            {view === 'signin' ? 'Create one' : 'Sign in'}
          </a>
        </div>
      </div>
    </Overlay>
  );
}

function Overlay({ children, onClose, theme }) {
  return (
    <div onClick={onClose} className="ml-fadeup" style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)',
      backdropFilter: 'blur(12px)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>{children}</div>
  );
}
function CloseBtn({ onClick, theme }) {
  return <button onClick={onClick} className="ml-btn" style={{ position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: 16, background: 'transparent', border: 'none', color: theme.textDim, fontSize: 18 }}>×</button>;
}
function Spinner({ size = 14 }) {
  return <span style={{ width: size, height: size, border: `2px solid #fff`, borderTopColor: 'transparent', borderRadius: size/2, animation: 'ml-spin .7s linear infinite' }}/>;
}
function Field({ theme, label, value, onChange, type = 'text', placeholder, autoFocus }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 11, fontFamily: FONT_MONO, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>{label}</div>
      <input
        autoFocus={autoFocus}
        type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '12px 14px', background: theme.bg, border: `1px solid ${theme.line2}`, borderRadius: 10, color: theme.text, fontSize: 14, fontFamily: FONT_BODY, outline: 'none', boxSizing: 'border-box' }}
        onFocus={e => e.currentTarget.style.borderColor = theme.a1}
        onBlur={e => e.currentTarget.style.borderColor = theme.line2}
      />
    </label>
  );
}
function SocialBtn({ theme, icon, label, onClick }) {
  return (
    <button onClick={onClick} className="ml-btn" style={{
      padding: '12px 14px', borderRadius: 10, background: theme.bg,
      border: `1px solid ${theme.line2}`, color: theme.text,
      fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    }}>
      <span style={{ width: 20, height: 20, borderRadius: 10, background: theme.surface2, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_MONO }}>{icon}</span>
      {label}
    </button>
  );
}

// ───── SEARCH COMMAND PALETTE ─────
function SearchPalette({ theme, onClose, onPick, value: initial = '' }) {
  const t = theme;
  const [q, setQ] = AUS(initial);
  const results = CITY_SUGGESTIONS.filter(c =>
    (c.city + c.country).toLowerCase().includes(q.toLowerCase())
  );

  AUE(() => {
    const k = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, []);

  return (
    <Overlay onClose={onClose} theme={t}>
      <div style={{
        width: 560, background: t.surface, borderRadius: 18,
        border: `1px solid ${t.line2}`, overflow: 'hidden',
        boxShadow: `0 40px 80px rgba(0,0,0,.6)`,
      }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${t.line}` }}>
          <Icon name="search" size={18} stroke={t.textDim}/>
          <input
            autoFocus value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search cities, neighborhoods, locals…"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: t.text, fontSize: 16, fontFamily: FONT_BODY }}
          />
          <span className="ml-kbd" style={{ color: t.textMuted, padding: '3px 6px', border: `1px solid ${t.line2}`, borderRadius: 4 }}>ESC</span>
        </div>
        <div className="ml-scroll" style={{ maxHeight: 420, overflowY: 'auto', padding: 8 }}>
          {results.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: t.textDim, fontSize: 14 }}>No cities found for "{q}"</div>
          ) : results.map(c => (
            <button key={c.city} onClick={() => onPick(c)} className="ml-btn" style={{
              width: '100%', padding: '12px 14px', background: 'transparent',
              border: 'none', color: t.text, display: 'flex', alignItems: 'center', gap: 14,
              borderRadius: 10, textAlign: 'left',
            }}
            onMouseEnter={e => e.currentTarget.style.background = t.surface2}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: t.grad, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="pin" size={16} stroke="#fff"/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{c.city}<span style={{ color: t.textDim, fontWeight: 400, marginLeft: 6 }}>{c.country}</span></div>
                <div style={{ fontSize: 12, color: t.textDim, fontFamily: FONT_MONO, marginTop: 2 }}>{c.locals} locals · {c.tz}</div>
              </div>
              <Icon name="arrow" size={14} stroke={t.textDim}/>
            </button>
          ))}
        </div>
      </div>
    </Overlay>
  );
}

// ───── PAYMENT METHOD MODAL ─────
function PaymentMethodModal({ theme, onClose, onSave }) {
  const t = theme;
  const [card, setCard] = AUS('');
  const [exp, setExp] = AUS('');
  const [cvc, setCvc] = AUS('');
  const [name, setName] = AUS('');
  const [zip, setZip] = AUS('');
  const [err, setErr] = AUS('');
  const [loading, setLoading] = AUS(false);

  const formatCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExp = (v) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? `${d.slice(0,2)}/${d.slice(2)}` : d; };

  const brand = card.startsWith('4') ? 'Visa' : card.startsWith('5') ? 'Mastercard' : card.startsWith('3') ? 'Amex' : '';

  const submit = (e) => {
    e.preventDefault();
    setErr('');
    const digits = card.replace(/\s/g, '');
    if (digits.length < 15) return setErr('Enter a valid card number');
    if (exp.length < 5) return setErr('Enter expiry as MM/YY');
    if (cvc.length < 3) return setErr('CVC must be 3-4 digits');
    if (!name) return setErr('Cardholder name required');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSave({ last4: digits.slice(-4), brand, exp, name });
    }, 1400);
  };

  return (
    <Overlay onClose={onClose} theme={t}>
      <div style={{ width: 460, background: t.surface, borderRadius: 20, border: `1px solid ${t.line2}`, padding: 32, position: 'relative', color: t.text, fontFamily: FONT_BODY }} onClick={e => e.stopPropagation()}>
        <CloseBtn onClick={onClose} theme={t}/>
        <div style={{ fontSize: 11, fontFamily: FONT_MONO, color: t.textDim, textTransform: 'uppercase', letterSpacing: '.08em', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="shield" size={12} stroke={t.a1}/> Secured by Stripe · 256-bit TLS
        </div>
        <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 700, letterSpacing: -0.6, margin: '10px 0 22px' }}>Add payment method</h2>

        {/* card preview */}
        <div style={{ background: t.grad, borderRadius: 14, padding: 22, color: '#fff', minHeight: 150, position: 'relative', marginBottom: 22, fontFamily: FONT_MONO, boxShadow: '0 20px 40px rgba(0,0,0,.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div style={{ width: 40, height: 28, borderRadius: 5, background: 'rgba(255,255,255,.3)' }}/>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 700, letterSpacing: -0.4 }}>{brand || 'CARD'}</div>
          </div>
          <div style={{ fontSize: 20, letterSpacing: '.08em', marginTop: 24, fontWeight: 500 }}>
            {card || '•••• •••• •••• ••••'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, fontSize: 12, opacity: .9 }}>
            <div>
              <div style={{ fontSize: 9, opacity: .7, letterSpacing: '.08em' }}>CARDHOLDER</div>
              <div style={{ marginTop: 2 }}>{name.toUpperCase() || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: 9, opacity: .7, letterSpacing: '.08em' }}>EXP</div>
              <div style={{ marginTop: 2 }}>{exp || '••/••'}</div>
            </div>
          </div>
        </div>

        <form onSubmit={submit} style={{ display: 'grid', gap: 10 }}>
          <Field theme={t} label="Card number" value={card} onChange={v => setCard(formatCard(v))} placeholder="1234 5678 9012 3456" autoFocus/>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <Field theme={t} label="Expiry" value={exp} onChange={v => setExp(formatExp(v))} placeholder="MM/YY"/>
            <Field theme={t} label="CVC" value={cvc} onChange={v => setCvc(v.replace(/\D/g,'').slice(0,4))} placeholder="123"/>
            <Field theme={t} label="ZIP" value={zip} onChange={v => setZip(v.slice(0,6))} placeholder="10001"/>
          </div>
          <Field theme={t} label="Name on card" value={name} onChange={setName} placeholder="Alex Morgan"/>
          {err && <div style={{ color: '#FF6A6A', fontSize: 12 }}>{err}</div>}
          <button type="submit" className="ml-btn" disabled={loading} style={{ marginTop: 10, padding: '14px', borderRadius: 12, background: t.grad, color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
            {loading ? <><Spinner/> Tokenizing via Stripe…</> : <>Save card <Icon name="check" size={14}/></>}
          </button>
        </form>
      </div>
    </Overlay>
  );
}

Object.assign(window, { ResidencyBadge, AuthModal, SearchPalette, PaymentMethodModal, Overlay, CloseBtn, Spinner, Field, SocialBtn });
