// Web landing / home + discover feed — for meetlocal.ai web app (desktop)
// This is the primary hero artboard (1440x900).

const { useState, useMemo, useEffect, useRef } = React;

function WebHome({ theme, goto, state, setState, session }) {
  const t = theme;
  const [query, setQuery] = useState(state.query || 'Tokyo');
  const [cat, setCat] = useState(state.cat || 'all');
  const [chipFilters, setChipFilters] = useState({});

  React.useEffect(() => { setQuery(state.query || 'Tokyo'); }, [state.query]);

  const filtered = useMemo(() => {
    let list = LOCALS;
    if (query) list = list.filter(l => (l.city + ' ' + l.neighborhood + ' ' + l.name + ' ' + l.tags.join(' ')).toLowerCase().includes(query.toLowerCase()));
    if (cat !== 'all') {
      const match = { food: 'Food', history: 'History', photo: 'Photos', drive: 'Drive', night: 'Nightlife', market: 'Markets', hidden: 'Hidden', beach: 'Beach', founders: 'Founders' }[cat];
      list = list.filter(l => l.tags.some(x => x.toLowerCase() === (match||cat).toLowerCase()) || cat === 'hidden' || cat === 'founders');
    }
    if (chipFilters.soon) list = list.filter(l => l.availableIn < 1);
    if (chipFilters.cheap) list = list.filter(l => l.price < 30);
    if (chipFilters.five) list = list.filter(l => l.rating >= 4.95);
    if (chipFilters.native) list = list.filter(l => l.residency === 'native' || l.residency === 'rooted');
    if (chipFilters.en) list = list.filter(l => l.languages.includes('EN'));
    return list;
  }, [query, cat, chipFilters]);

  return (
    <div style={{
      width: '100%', height: '100%', background: t.bg, color: t.text,
      fontFamily: FONT_BODY, position: 'relative', overflow: 'auto',
      '--ml-grad': t.grad,
    }} className="ml-scroll">

      {/* grain / vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(1200px 600px at 80% -10%, ${t.a2}22, transparent 60%), radial-gradient(900px 500px at -10% 30%, ${t.a1}1a, transparent 60%)`,
      }}/>

      {/* nav */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        backdropFilter: 'blur(24px)',
        background: `${t.bg}cc`,
        borderBottom: `1px solid ${t.line}`,
        padding: '18px 56px', display: 'flex', alignItems: 'center', gap: 32,
        whiteSpace: 'nowrap',
      }}>
        <Logo theme={t} />
        <nav style={{ display: 'flex', gap: 28, fontSize: 14, color: t.textDim, whiteSpace: 'nowrap' }}>
          <a style={{ color: t.text, fontWeight: 500, cursor: 'pointer' }} onClick={() => goto('home')}>Discover</a>
          <a style={{ cursor: 'pointer' }} onClick={() => goto('how')}>How it works</a>
          <a style={{ cursor: 'pointer' }} onClick={() => goto('become')}>Become a local</a>
          <a style={{ cursor: 'pointer' }} onClick={() => goto('safety')}>Safety</a>
        </nav>
        <div style={{ flex: 1 }} />
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, fontSize: 12,
          fontFamily: FONT_MONO, color: t.textDim,
          padding: '6px 10px', border: `1px solid ${t.line2}`, borderRadius: 100,
        }}>
          <Icon name="globe" size={14} /> EN · USD
        </div>
        {session?.user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => goto('onboarding')} className="ml-btn" style={{ padding: '10px 16px', borderRadius: 100, background: 'transparent', color: t.text, border: `1px solid ${t.line2}`, fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', display: 'flex', gap: 6, alignItems: 'center' }}>
              <Icon name="shield" size={13}/> Become a local
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px 4px 4px', border: `1px solid ${t.line2}`, borderRadius: 100 }}>
              <Avatar seed={session.user.email || session.user.name} size={28} theme={t}/>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{session.user.name}</span>
              <button onClick={() => session.signOut()} className="ml-btn" style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'transparent', color: t.textDim, border: `1px solid ${t.line}` }}>Sign out</button>
            </div>
          </div>
        ) : (
          <>
            <button onClick={() => session?.openAuth('signin')} className="ml-btn" style={{
              padding: '10px 18px', borderRadius: 100, background: 'transparent', color: t.text,
              border: `1px solid ${t.line2}`, fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap',
            }}>Sign in</button>
            <button onClick={() => session?.openAuth('signup')} className="ml-btn" style={{
              padding: '10px 18px', borderRadius: 100, background: t.text, color: t.bg,
              fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', border: 'none',
            }}>Get started</button>
          </>
        )}
      </header>

      {/* HERO */}
      <section style={{ padding: '80px 56px 40px', position: 'relative' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 12px', borderRadius: 100,
          border: `1px solid ${t.line2}`, background: t.surface,
          fontSize: 12, fontFamily: FONT_MONO, color: t.textDim, marginBottom: 28,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: t.a1, boxShadow: `0 0 12px ${t.a1}`, animation: 'ml-pulse 1.8s infinite' }} />
          NEW · Arrive on-demand. Meet in 5 hours, not 5 days.
        </div>
        <h1 style={{
          fontFamily: FONT_DISPLAY, fontSize: 92, lineHeight: 0.96,
          letterSpacing: -3, fontWeight: 700, margin: 0, maxWidth: 860,
          color: t.text,
        }}>
          Every city<br/>
          has <span className="ml-grad-text">a friend</span><br/>
          you haven't met.
        </h1>
        <p style={{
          marginTop: 28, maxWidth: 520, fontSize: 18, lineHeight: 1.5, color: t.textDim,
        }}>
          Open meetlocal.ai when you land. Within hours, you're with a vetted local who knows the spots, the shortcuts, and the stories. Build your network of friends across the planet. One city at a time.
        </p>

        {/* search bar */}
        <div style={{
          marginTop: 48, display: 'flex', alignItems: 'stretch',
          background: t.surface, border: `1px solid ${t.line2}`, borderRadius: 100,
          padding: 6, maxWidth: 780, boxShadow: `0 20px 60px rgba(0,0,0,.4), 0 0 60px ${t.a1}22`,
        }}>
          <button onClick={() => session?.openSearch()} className="ml-btn" style={{ flex: 1, textAlign: 'left', background: 'transparent', border: 'none', padding: '12px 22px', borderRadius: 100, color: t.text }}>
            <div style={{ fontSize: 11, fontFamily: FONT_MONO, color: t.textMuted, letterSpacing: '.06em', textTransform: 'uppercase' }}>Where</div>
            <div style={{ marginTop: 2, fontSize: 15 }}>{query || 'Search any city…'}</div>
          </button>
          <Divider theme={t} />
          <SearchField label="When" value="Tonight · 9 PM" theme={t} />
          <Divider theme={t} />
          <SearchField label="Vibe" value="Food & drinks" theme={t} />
          <button onClick={() => session?.openSearch()} className="ml-btn" style={{
            padding: '0 22px', borderRadius: 100, background: t.grad, color: '#fff',
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600,
            border: 'none', minWidth: 140,
          }}>
            <Icon name="search" size={18} />
            Find locals
          </button>
        </div>

        {/* quick chips */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          {[
            { k: 'soon',   l: 'Available in <1h' },
            { k: 'en',     l: 'Speaks English' },
            { k: 'cheap',  l: 'Under $30/hr' },
            { k: 'native', l: '🌟 Born & raised / 10+ yrs' },
            { k: 'five',   l: '4.95★ & up' },
          ].map(c => {
            const on = chipFilters[c.k];
            return (
              <button key={c.k} onClick={() => setChipFilters(f => ({ ...f, [c.k]: !f[c.k] }))} className="ml-btn" style={{
                padding: '8px 14px', borderRadius: 100,
                background: on ? t.text : t.surface, color: on ? t.bg : t.textDim,
                border: `1px solid ${on ? t.text : t.line}`, fontSize: 13,
              }}>{on && '✓ '}{c.l}</button>
            );
          })}
        </div>

        {/* live arrival ticker — pinned top-right, dismissible */}
      </section>
      <LiveArrivalDock theme={t} />

      {/* categories */}
      <section style={{ padding: '32px 56px 16px', display: 'flex', gap: 12, overflowX: 'auto' }} className="ml-scroll">
        <CatChip active={cat === 'all'} onClick={() => setCat('all')} theme={t} icon="compass" label="All" />
        {CATEGORIES.map(c => (
          <CatChip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)} theme={t} icon={c.icon} label={c.label} />
        ))}
      </section>

      {/* discover grid */}
      <section style={{ padding: '24px 56px 56px' }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24,
        }}>
          <div>
            <h2 style={{
              fontFamily: FONT_DISPLAY, fontSize: 36, fontWeight: 600, letterSpacing: -1,
              margin: 0, color: t.text,
            }}>Available tonight in <em style={{ fontStyle: 'normal', backgroundImage: t.grad, WebkitBackgroundClip: 'text', color: 'transparent' }}>{query}</em></h2>
            <div style={{ fontSize: 14, color: t.textDim, marginTop: 6, fontFamily: FONT_MONO }}>
              {filtered.length} locals · sorted by response time · updated 14s ago
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="ml-btn" style={chipBtn(t)}><Icon name="filter" size={15}/> Filters</button>
            <button className="ml-btn" style={chipBtn(t)}><Icon name="pin" size={15}/> Map view</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {filtered.slice(0, 8).map((l, i) => (
            <LocalCard key={l.id} local={l} theme={t} onClick={() => { setState({ ...state, activeLocal: l.id }); goto('profile'); }} featured={i === 0} />
          ))}
          {filtered.length === 0 && Array.from({length: 4}).map((_, i) => (
            <div key={i} style={{ height: 380, background: t.surface, borderRadius: 16, opacity: 0.4 }}/>
          ))}
        </div>
      </section>

      {/* FOOTER band */}
      <section style={{ padding: '40px 56px 80px', borderTop: `1px solid ${t.line}` }}>
        <div style={{ display: 'flex', gap: 48, color: t.textDim, fontSize: 13, alignItems: 'center' }}>
          <span style={{ fontFamily: FONT_MONO, color: t.textMuted }}>© 2026 meetlocal.ai</span>
          <a style={{ cursor: 'pointer' }} onClick={() => goto('safety')}>Trust & safety</a>
          <a>Help</a>
          <a>Press</a>
          <a>Careers</a>
          <div style={{ flex: 1 }}/>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontFamily: FONT_MONO, fontSize: 11 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: '#4ADE80' }}/>
            47 locals online now
          </div>
        </div>
      </section>
    </div>
  );
}

function Logo({ theme }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8, background: theme.grad,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 6px 24px ${theme.a1}55`,
      }}>
        <div style={{ width: 10, height: 10, borderRadius: 5, background: theme.bg }}/>
      </div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 700, letterSpacing: -0.5, color: theme.text }}>
        meetlocal<span style={{ color: theme.textDim, fontWeight: 500 }}>.ai</span>
      </div>
    </div>
  );
}

function SearchField({ label, value, onChange, placeholder, theme }) {
  return (
    <label style={{ flex: 1, padding: '12px 22px', cursor: 'text', borderRadius: 100 }}>
      <div style={{ fontSize: 11, fontFamily: FONT_MONO, color: theme.textMuted, letterSpacing: '.06em', textTransform: 'uppercase' }}>{label}</div>
      <input
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        readOnly={!onChange}
        placeholder={placeholder}
        style={{
          background: 'transparent', border: 'none', outline: 'none',
          color: theme.text, fontSize: 15, fontFamily: FONT_BODY,
          padding: 0, marginTop: 2, width: '100%',
        }}
      />
    </label>
  );
}

function Divider({ theme }) {
  return <div style={{ width: 1, background: theme.line, margin: '10px 0' }}/>;
}

function chipBtn(t) {
  return {
    padding: '10px 14px', borderRadius: 100, background: t.surface,
    color: t.text, border: `1px solid ${t.line2}`, fontSize: 13, fontWeight: 500,
    display: 'inline-flex', alignItems: 'center', gap: 6,
  };
}

function CatChip({ active, onClick, theme, icon, label }) {
  return (
    <button onClick={onClick} className="ml-btn" style={{
      padding: '12px 18px', borderRadius: 100,
      background: active ? theme.text : theme.surface,
      color: active ? theme.bg : theme.text,
      border: `1px solid ${active ? theme.text : theme.line2}`,
      fontSize: 13, fontWeight: 500,
      display: 'inline-flex', alignItems: 'center', gap: 8,
      whiteSpace: 'nowrap',
    }}>
      <Icon name={icon} size={16} /> {label}
    </button>
  );
}

function LocalCard({ local, theme, onClick, featured }) {
  const t = theme;
  return (
    <button onClick={onClick} className="ml-btn" style={{
      background: t.surface, border: `1px solid ${t.line}`, borderRadius: 16,
      padding: 0, textAlign: 'left', color: t.text, overflow: 'hidden',
      display: 'flex', flexDirection: 'column', gridRow: featured ? 'span 1' : 'auto',
    }}
    onMouseEnter={(e) => e.currentTarget.style.borderColor = t.line2}
    onMouseLeave={(e) => e.currentTarget.style.borderColor = t.line}
    >
      <div style={{ position: 'relative', aspectRatio: '4/5' }}>
        <Placeholder caption={local.photo} theme={t} height="100%" />
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {local.availableIn < 1 && (
            <Badge theme={t} variant="hot">
              <span style={{ width: 6, height: 6, borderRadius: 3, background: '#4ADE80', animation: 'ml-pulse 1.4s infinite' }}/>
              Free now
            </Badge>
          )}
          {local.availableIn >= 1 && (
            <Badge theme={t}>In {local.availableIn}h</Badge>
          )}
          {(local.residency === 'native' || local.residency === 'rooted') && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 9px', borderRadius: 100,
              background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(8px)',
              fontFamily: FONT_MONO, fontSize: 10, letterSpacing: '.05em', textTransform: 'uppercase', color: '#fff',
              border: `1px solid ${RESIDENCY[local.residency].ring}99`,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: RESIDENCY[local.residency].ring, boxShadow: `0 0 8px ${RESIDENCY[local.residency].ring}` }}/>
              {local.residency === 'native' ? 'Native' : `${local.yearsInCity}y local`}
            </span>
          )}
        </div>
        <div className="ml-btn" role="button" style={{
          position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: 16,
          background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(8px)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }} onClick={(e) => e.stopPropagation()}>
          <Icon name="heart" size={15}/>
        </div>
      </div>
      <div style={{ padding: '16px 16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: -0.2 }}>{local.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
            <Icon name="star" size={13} stroke={t.a3}/>
            <span>{local.rating}</span>
            <span style={{ color: t.textMuted }}>({local.reviews})</span>
          </div>
        </div>
        <div style={{ fontSize: 13, color: t.textDim, lineHeight: 1.35 }}>{local.tagline}</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
          {local.tags.slice(0, 3).map(tg => (
            <span key={tg} style={{
              fontFamily: FONT_MONO, fontSize: 10, letterSpacing: '.05em', textTransform: 'uppercase',
              padding: '3px 7px', borderRadius: 3, background: t.surface2, color: t.textDim,
            }}>{tg}</span>
          ))}
        </div>
        <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: `1px solid ${t.line}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: t.textDim }}>
            <Icon name="pin" size={12}/> {local.neighborhood} · {local.distance}mi
          </div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>
            ${local.price}<span style={{ fontSize: 12, color: t.textDim, fontWeight: 400 }}>/hr</span>
          </div>
        </div>
      </div>
    </button>
  );
}

function Badge({ theme, children, variant }) {
  const t = theme;
  const bg = variant === 'hot' ? 'rgba(0,0,0,.55)' : 'rgba(0,0,0,.45)';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 9px', borderRadius: 100,
      background: bg, backdropFilter: 'blur(8px)',
      fontFamily: FONT_MONO, fontSize: 10, letterSpacing: '.05em',
      textTransform: 'uppercase', color: '#fff',
      border: '1px solid rgba(255,255,255,.12)',
    }}>{children}</span>
  );
}

function LiveArrivalDock({ theme }) {
  const t = theme;
  const [open, setOpen] = React.useState(true);
  const [idx, setIdx] = React.useState(0);
  const arrivals = [
    { city: 'Tokyo',     port: 'Haneda',    n: 3, intent: 'food tonight',  window: '7–10 PM', avatars: ['aa','bb','cc'] },
    { city: 'Istanbul',  port: 'IST',       n: 2, intent: 'rooftop bars',  window: '9 PM',   avatars: ['dd','ee'] },
    { city: 'Lisbon',    port: 'Humberto',  n: 4, intent: 'fado + dinner', window: 'tonight', avatars: ['ff','gg','hh','ii'] },
    { city: 'Mexico CDMX', port: 'AICM',    n: 5, intent: 'street tacos',  window: '8 PM',   avatars: ['jj','kk','ll','mm','nn'] },
  ];
  React.useEffect(() => {
    if (!open) return;
    const id = setInterval(() => setIdx(i => (i + 1) % arrivals.length), 4500);
    return () => clearInterval(id);
  }, [open, arrivals.length]);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="ml-btn" style={{
        position: 'fixed', right: 24, bottom: 24, zIndex: 60,
        padding: '10px 14px', borderRadius: 100,
        background: t.surface, border: `1px solid ${t.line2}`, color: t.text,
        fontSize: 12, fontFamily: FONT_MONO, letterSpacing: '.06em',
        display: 'flex', alignItems: 'center', gap: 8, backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 24px rgba(0,0,0,.35)',
      }}>
        <span style={{ position: 'relative', width: 8, height: 8 }}>
          <span style={{ position: 'absolute', inset: 0, borderRadius: 4, background: t.a1 }}/>
          <span style={{ position: 'absolute', inset: 0, borderRadius: 4, background: t.a1, animation: 'ml-ping 1.6s infinite' }}/>
        </span>
        LIVE · {arrivals.length} cities
      </button>
    );
  }

  const a = arrivals[idx];
  return (
    <div style={{
      position: 'fixed', right: 24, bottom: 24, zIndex: 60, width: 320,
      background: `${t.bg2}f2`, backdropFilter: 'blur(20px)',
      border: `1px solid ${t.line2}`, borderRadius: 18,
      padding: 16, overflow: 'hidden',
      boxShadow: '0 16px 48px rgba(0,0,0,.45)',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: t.gradSoft, opacity: .35, pointerEvents: 'none' }}/>
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 10, fontFamily: FONT_MONO, color: t.textDim, letterSpacing: '.08em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ position: 'relative', width: 7, height: 7 }}>
              <span style={{ position: 'absolute', inset: 0, borderRadius: 4, background: t.a1 }}/>
              <span style={{ position: 'absolute', inset: 0, borderRadius: 4, background: t.a1, animation: 'ml-ping 1.6s infinite' }}/>
            </span>
            Live · {a.city}, now
          </div>
          <button onClick={() => setOpen(false)} className="ml-btn" style={{
            width: 22, height: 22, borderRadius: 11, background: 'transparent',
            border: `1px solid ${t.line}`, color: t.textDim, fontSize: 11,
            display: 'grid', placeItems: 'center',
          }} aria-label="Dismiss">×</button>
        </div>
        <div key={idx} style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 600, marginTop: 10, letterSpacing: -0.3, lineHeight: 1.25, animation: 'ml-fadeup .5s' }}>
          {a.n} travelers landed at {a.port}
        </div>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
          {a.avatars.slice(0, 4).map((s, i) => (
            <Avatar key={s+i} seed={s} size={22} theme={t} style={{ marginLeft: i ? -6 : 0, border: `2px solid ${t.bg2}` }} />
          ))}
          <div style={{ fontSize: 11, color: t.textDim, marginLeft: 8 }}>{a.intent} · {a.window}</div>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
          {arrivals.map((_, i) => (
            <span key={i} style={{ flex: 1, height: 2, borderRadius: 1, background: i === idx ? t.text : t.line }}/>
          ))}
        </div>
      </div>
    </div>
  );
}

function LiveArrivalCard({ theme }) {
  const t = theme;
  return (
    <div style={{
      background: `${t.surface}dd`, backdropFilter: 'blur(20px)',
      border: `1px solid ${t.line2}`, borderRadius: 20,
      padding: 20, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0, background: t.gradSoft, opacity: .6, pointerEvents: 'none',
      }}/>
      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 11, fontFamily: FONT_MONO, color: t.textDim, letterSpacing: '.08em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ position: 'relative', width: 8, height: 8 }}>
            <span style={{ position: 'absolute', inset: 0, borderRadius: 4, background: t.a1 }}/>
            <span style={{ position: 'absolute', inset: 0, borderRadius: 4, background: t.a1, animation: 'ml-ping 1.6s infinite' }}/>
          </span>
          Live · Tokyo, now
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 600, marginTop: 12, letterSpacing: -0.4 }}>
          3 travelers just landed<br/>at Haneda.
        </div>
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: -10 }}>
          {['aa', 'bb', 'cc'].map((s, i) => (
            <Avatar key={s} seed={s} size={28} theme={t} style={{ marginLeft: i ? -8 : 0, border: `2px solid ${t.surface}` }} />
          ))}
          <div style={{ fontSize: 12, color: t.textDim, marginLeft: 10 }}>looking for food tonight · 7–10 PM</div>
        </div>
        <button className="ml-btn" style={{
          marginTop: 16, width: '100%', padding: '12px 14px', borderRadius: 12,
          background: t.text, color: t.bg, fontSize: 13, fontWeight: 600, border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>Accept a request <Icon name="arrow" size={14}/></button>
      </div>
    </div>
  );
}

Object.assign(window, { WebHome });
