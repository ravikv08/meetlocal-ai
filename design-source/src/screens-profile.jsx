// Profile, Chat, Booking, Map, Reviews, Arrival screens
const { useState: uS, useEffect: uE, useRef: uR, useMemo: uM } = React;

// ───────────── PROFILE ─────────────
function ProfileScreen({ theme, goto, state, setState, session }) {
  const t = theme;
  const local = LOCALS.find(l => l.id === state.activeLocal) || LOCALS[0];

  return (
    <div style={{
      width: '100%', height: '100%', background: t.bg, color: t.text,
      fontFamily: FONT_BODY, overflow: 'auto', '--ml-grad': t.grad,
    }} className="ml-scroll">
      <TopBar theme={t} goto={goto} title="Back to discover" back="home" />

      {/* HERO image gallery */}
      <div style={{ padding: '8px 56px 0', display: 'grid', gap: 8,
        gridTemplateColumns: '2fr 1fr 1fr',
        gridTemplateRows: '240px 240px', height: 488 }}>
        <Placeholder caption={local.photo} theme={t} radius={16} style={{ gridRow: 'span 2' }} />
        <Placeholder caption="food spot" theme={t} radius={16} variant="flat" />
        <Placeholder caption="vinyl shop" theme={t} radius={16} />
        <Placeholder caption="alley bar" theme={t} radius={16} />
        <Placeholder caption="night walk" theme={t} radius={16} variant="flat" />
      </div>

      <div style={{ padding: '40px 56px 80px', display: 'grid', gridTemplateColumns: '1fr 400px', gap: 56 }}>
        {/* LEFT */}
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <ResidencyBadge local={local} theme={t} size="lg"/>
            <Tag theme={t} icon="check">Verified ID</Tag>
            <Tag theme={t} icon="shield">Background check · {local.bgCheckDate}</Tag>
            <Tag theme={t} icon="flash">Responds in {local.responseMin}m</Tag>
          </div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 56, fontWeight: 700, letterSpacing: -2, margin: 0, lineHeight: 1 }}>
            {local.name.split(' ')[0]}, <span className="ml-grad-text">{local.city}</span>
          </h1>
          <div style={{ marginTop: 14, fontSize: 18, color: t.textDim }}>{local.tagline}</div>

          <div style={{ display: 'flex', gap: 32, marginTop: 32, paddingTop: 24, borderTop: `1px solid ${t.line}` }}>
            <Stat theme={t} k="Rating" v={`${local.rating}★`} sub={`${local.reviews} reviews`} />
            <Stat theme={t} k="Languages" v={local.languages.join(' · ')} sub="native fluency" />
            <Stat theme={t} k="Response" v={`${local.responseMin} min`} sub="on average" />
            <Stat theme={t} k="Completed" v="186" sub="meetups" />
          </div>

          <section style={{ marginTop: 48 }}>
            <H2 theme={t}>About {local.name.split(' ')[0]}</H2>
            <p style={{ fontSize: 17, lineHeight: 1.55, color: t.text, maxWidth: 640, marginTop: 14 }}>
              {local.bio} I keep it small — max one guest at a time, usually 3–4 hours. We start with food, end with a walk, and you leave with at least two places you can come back to alone.
            </p>
          </section>

          {local.platforms?.length > 0 && (
            <section style={{ marginTop: 40 }}>
              <H2 theme={t}>Trusted across the city</H2>
              <div style={{ fontSize: 13, color: t.textMuted, marginTop: 6, marginBottom: 16 }}>
                Verified credentials from platforms {local.name.split(' ')[0]} already works on. We auto-import via API — not self-claimed.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {local.platforms.map(p => <PlatformBadge key={p.id} p={p} theme={t}/>)}
              </div>
            </section>
          )}

          {local.social && (Object.keys(local.social).length > 0) && (
            <section style={{ marginTop: 40 }}>
              <H2 theme={t}>Public social</H2>
              <div style={{ fontSize: 13, color: t.textMuted, marginTop: 6, marginBottom: 14 }}>
                Linked accounts. Follower counts and account age add to {local.name.split(' ')[0]}'s trust score — but never replace ID.
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {local.social.instagram && <SocialChip theme={t} kind="instagram" handle={local.social.instagram}/>}
                {local.social.linkedin && <SocialChip theme={t} kind="linkedin" handle={local.social.linkedin}/>}
                {local.social.snapchat && <SocialChip theme={t} kind="snapchat" handle={local.social.snapchat}/>}
              </div>
            </section>
          )}

          <section style={{ marginTop: 40 }}>
            <H2 theme={t}>What we might do</H2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16 }}>
              {[
                { t: 'Ramen + alley bars', d: '3h · Shimokita → Shibuya', p: 'From $96', i: 'food' },
                { t: 'Vinyl & jazz kissa', d: '2h · walk at pace', p: 'From $64', i: 'compass' },
                { t: 'Late-night photo walk', d: '2h · golden-lit signage', p: 'From $64', i: 'cam' },
              ].map(o => (
                <div key={o.t} style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 14, padding: 18 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: t.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.a1 }}>
                    <Icon name={o.i} size={18}/>
                  </div>
                  <div style={{ fontWeight: 600, marginTop: 14, fontSize: 15 }}>{o.t}</div>
                  <div style={{ fontSize: 13, color: t.textDim, marginTop: 4 }}>{o.d}</div>
                  <div style={{ fontSize: 12, fontFamily: FONT_MONO, color: t.a3, marginTop: 10 }}>{o.p}</div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginTop: 48 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <H2 theme={t}>Reviews · {local.rating}★</H2>
              <button onClick={() => goto('reviews')} className="ml-btn" style={{ background: 'transparent', color: t.a1, fontSize: 14, fontWeight: 500, border: 'none' }}>
                See all {local.reviews} →
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginTop: 18 }}>
              {REVIEWS_DATA.slice(0, 2).map(r => <ReviewCard key={r.id} r={r} theme={t} />)}
            </div>
          </section>
        </div>

        {/* RIGHT — booking card */}
        <aside style={{ position: 'sticky', top: 80, height: 'fit-content' }}>
          <BookingCard theme={t} local={local} goto={goto} setState={setState} state={state} session={session} />
        </aside>
      </div>
    </div>
  );
}

function Tag({ theme, icon, children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 10px', borderRadius: 100,
      background: theme.surface, border: `1px solid ${theme.line2}`,
      fontSize: 12, color: theme.textDim,
    }}>
      <Icon name={icon} size={12} stroke={theme.a1}/> {children}
    </span>
  );
}

function Stat({ theme, k, v, sub }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontFamily: FONT_MONO, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '.08em' }}>{k}</div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 600, letterSpacing: -0.6, marginTop: 4 }}>{v}</div>
      <div style={{ fontSize: 12, color: theme.textDim, marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function H2({ theme, children }) {
  return <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 600, letterSpacing: -0.5, margin: 0, color: theme.text }}>{children}</h2>;
}

// Local time zones for booking surface
const CITY_TZ = {
  'Tokyo': { tz: 'Asia/Tokyo', label: 'JST · Tokyo' },
  'Lisbon': { tz: 'Europe/Lisbon', label: 'WET · Lisbon' },
  'Mexico City': { tz: 'America/Mexico_City', label: 'CST · CDMX' },
  'Paris': { tz: 'Europe/Paris', label: 'CET · Paris' },
  'Marrakech': { tz: 'Africa/Casablanca', label: 'WET · Marrakech' },
  'Istanbul': { tz: 'Europe/Istanbul', label: 'TRT · Istanbul' },
};
function localTimeIn(city) {
  try {
    const cfg = CITY_TZ[city];
    if (!cfg) return null;
    const now = new Date().toLocaleTimeString('en-US', { timeZone: cfg.tz, hour: '2-digit', minute: '2-digit', hour12: false });
    return { time: now, label: cfg.label };
  } catch { return null; }
}

function BookingCard({ theme, local, goto, setState, state }) {
  const t = theme;
  // Read from global state with fallbacks → write back on every change so checkout syncs
  const hours = state.hours ?? 3;
  const when  = state.when  ?? 'tonight';
  const slot  = state.slot  ?? '21:00';
  const date  = state.date  ?? null;
  const setHours = (v) => setState({ ...state, hours: v });
  const setWhen  = (v) => setState({ ...state, when: v });
  const setSlot  = (v) => setState({ ...state, slot: v });
  const setDate  = (v) => setState({ ...state, date: v });
  const total = hours * local.price;
  const cityTime = localTimeIn(local.city);
  const horizons = [
    { id: 'tonight',  label: 'Tonight',     sub: 'Same-day · 90 min lead' },
    { id: 'tomorrow', label: 'Tomorrow',    sub: 'Pick a window' },
    { id: 'week',     label: 'This week',   sub: 'Mon → Sun' },
    { id: 'plan',     label: 'Plan ahead',  sub: 'Pick any date' },
  ];
  const slotsForHorizon = {
    tonight:  ['19:00', '21:00', '22:30'],
    tomorrow: ['10:00', '14:00', '19:30'],
    week:     ['Sat 18:00', 'Sun 11:00', 'Wed 20:00'],
  };
  // When user switches horizon, reset slot to the first valid one for that horizon
  React.useEffect(() => {
    if (when === 'plan') return; // calendar drives slot for plan
    if (!slotsForHorizon[when]?.includes(slot)) setSlot(slotsForHorizon[when][0]);
  }, [when]);

  return (
    <div style={{
      background: `${t.surface}ee`, backdropFilter: 'blur(20px)',
      border: `1px solid ${t.line2}`, borderRadius: 20, padding: 24,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: t.grad }}/>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 32, fontWeight: 700, letterSpacing: -1 }}>
            ${local.price}<span style={{ fontSize: 16, color: t.textDim, fontWeight: 500 }}>/hr</span>
          </div>
          <div style={{ fontSize: 12, color: t.textDim, marginTop: 2 }}>
            <span style={{ color: '#4ADE80' }}>●</span> Free in 30 min
          </div>
        </div>
        <div style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="star" size={13} stroke={t.a3}/> {local.rating} · {local.reviews}
        </div>
      </div>

      {/* Local time strip */}
      {cityTime && (
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: t.surface2, border: `1px solid ${t.line}`, borderRadius: 10, fontSize: 11, fontFamily: FONT_MONO, color: t.textDim, letterSpacing: '.04em' }}>
          <Icon name="clock" size={12} stroke={t.textDim}/>
          <span>{cityTime.label} · </span>
          <span style={{ color: t.text }}>{cityTime.time}</span>
          <span style={{ flex: 1 }}/>
          <span>booking shown in destination time</span>
        </div>
      )}

      <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
        <FormRow theme={t} label="When">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
            {horizons.map(h => (
              <button key={h.id} onClick={() => setWhen(h.id)} className="ml-btn" style={{
                textAlign: 'left', padding: '10px 12px', borderRadius: 10,
                background: when === h.id ? t.text : 'transparent',
                color: when === h.id ? t.bg : t.text,
                border: `1px solid ${when === h.id ? t.text : t.line2}`,
              }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{h.label}</div>
                <div style={{ fontSize: 10, fontFamily: FONT_MONO, marginTop: 2, opacity: 0.7, letterSpacing: '.04em' }}>{h.sub}</div>
              </button>
            ))}
          </div>
        </FormRow>

        <FormRow theme={t} label={when === 'plan' ? 'Pick a date' : when === 'week' ? 'Slot' : 'Meet at'}>
          {when === 'plan' ? (
            <MiniCalendar theme={t} value={date} onChange={setDate} slot={slot} setSlot={setSlot}/>
          ) : (
            <div style={{ display: 'flex', gap: 6 }}>
              {slotsForHorizon[when].map(s => (
                <button key={s} onClick={() => setSlot(s)} className="ml-btn" style={{
                  flex: 1, padding: '8px 0', borderRadius: 8,
                  background: slot === s ? t.text : 'transparent',
                  color: slot === s ? t.bg : t.text,
                  border: `1px solid ${slot === s ? t.text : t.line2}`,
                  fontSize: 12, fontWeight: 500, fontFamily: FONT_MONO,
                }}>{s}</button>
              ))}
            </div>
          )}
        </FormRow>

        <FormRow theme={t} label="Duration">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button className="ml-btn" onClick={() => setHours(Math.max(1, hours-1))} style={stepBtn(t)}>−</button>
            <div style={{ flex: 1, textAlign: 'center', fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 600 }}>{hours}h</div>
            <button className="ml-btn" onClick={() => setHours(Math.min(8, hours+1))} style={stepBtn(t)}>+</button>
          </div>
        </FormRow>
      </div>

      {when === 'tonight' && (
        <div style={{ marginTop: 12, padding: '8px 12px', background: `${t.a1}14`, border: `1px solid ${t.a1}33`, borderRadius: 10, fontSize: 11, fontFamily: FONT_MONO, color: t.text, letterSpacing: '.04em', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="lightning" size={12} stroke={t.a1}/>
          Same-day · books in under 2 hours · {local.name.split(' ')[0]} responds in {local.responseMin || 4} min
        </div>
      )}

      <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px dashed ${t.line2}`, fontSize: 14 }}>
        <Row theme={t} k={`$${local.price} × ${hours}h`} v={`$${total}`} />
        <Row theme={t} k="Service fee" v="$4" />
        <Row theme={t} k="Total" v={`$${total + 4}`} bold />
      </div>

      <button onClick={() => goto('chat')} className="ml-btn" style={{
        marginTop: 18, width: '100%', padding: '14px', borderRadius: 12,
        background: t.grad, color: '#fff', border: 'none',
        fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        boxShadow: `0 10px 30px ${t.a1}44`,
      }}>
        <Icon name="chat" size={16}/> Chat first, book after
      </button>
      <button onClick={() => { setState({ ...state, hours, slot, when, date }); goto('booking'); }} className="ml-btn" style={{
        marginTop: 8, width: '100%', padding: '14px', borderRadius: 12,
        background: 'transparent', color: t.text, border: `1px solid ${t.line2}`,
        fontSize: 14, fontWeight: 500,
      }}>
        Instant book · ${total + 4}
      </button>
      <div style={{ fontSize: 11, color: t.textMuted, textAlign: 'center', marginTop: 10, fontFamily: FONT_MONO }}>
        No charge until {local.name.split(' ')[0]} confirms
      </div>
    </div>
  );
}

function stepBtn(t){return{ width: 40, height: 40, borderRadius: 8, background: t.surface2, border: `1px solid ${t.line2}`, color: t.text, fontSize: 20 };}
function FormRow({ theme, label, children }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontFamily: FONT_MONO, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}
function Row({ theme, k, v, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontWeight: bold ? 600 : 400, color: bold ? theme.text : theme.textDim, fontSize: bold ? 15 : 13 }}>
      <span>{k}</span><span style={{ color: theme.text }}>{v}</span>
    </div>
  );
}
function ReviewCard({ r, theme }) {
  return (
    <div style={{ background: theme.surface, border: `1px solid ${theme.line}`, borderRadius: 14, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar seed={r.author} size={32} theme={theme} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{r.author}</div>
          <div style={{ fontSize: 11, color: theme.textDim, fontFamily: FONT_MONO }}>{r.date}</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 2, color: theme.a3 }}>
          {Array.from({length: r.rating}).map((_, i) => <Icon key={i} name="star" size={12} stroke={theme.a3} strokeWidth={2} />)}
        </div>
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.5, marginTop: 12, color: theme.text }}>"{r.body}"</div>
    </div>
  );
}

function TopBar({ theme, goto, title, back }) {
  return (
    <div style={{ padding: '20px 56px', display: 'flex', alignItems: 'center', gap: 18, background: theme.bg, borderBottom: `1px solid ${theme.line}`, position: 'sticky', top: 0, zIndex: 5, backdropFilter: 'blur(20px)' }}>
      <button onClick={() => goto(back)} className="ml-btn" style={{
        width: 36, height: 36, borderRadius: 18, background: theme.surface,
        border: `1px solid ${theme.line2}`, color: theme.text,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}><Icon name="arrowLeft" size={16}/></button>
      <div style={{ fontSize: 13, color: theme.textDim, fontFamily: FONT_MONO }}>{title}</div>
      <div style={{ flex: 1 }}/>
      <button className="ml-btn" style={{ ...chipLike(theme) }}><Icon name="share" size={14}/></button>
      <button className="ml-btn" style={{ ...chipLike(theme) }}><Icon name="heart" size={14}/></button>
    </div>
  );
}
function chipLike(t){return{ width: 36, height: 36, borderRadius: 18, background: theme_or_fallback(t).surface, border: `1px solid ${theme_or_fallback(t).line2}`, color: theme_or_fallback(t).text, display: 'flex', alignItems: 'center', justifyContent: 'center' };}
function theme_or_fallback(t){return t;}

// ───── platform credential badge (Airbnb / Uber / etc) ─────
function PlatformBadge({ p, theme }) {
  const t = theme;
  const meta = (typeof PLATFORMS !== 'undefined' && PLATFORMS[p.id]) || { name: p.label, color: t.a1, dot: '·' };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: t.surface, border: `1px solid ${t.line}`,
      borderRadius: 12, padding: '12px 14px',
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: meta.color, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: 13, fontFamily: FONT_BODY, flexShrink: 0,
        letterSpacing: '-0.02em',
      }}>{meta.dot}</div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: t.text, display: 'flex', alignItems: 'center', gap: 6 }}>
          {p.label}
          <span style={{ width: 14, height: 14, borderRadius: 7, background: t.a3, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 9, fontWeight: 800 }}>✓</span>
        </div>
        <div style={{ fontSize: 12, color: t.textDim, marginTop: 2, fontFamily: FONT_MONO }}>{p.sub}{p.years ? ` · ${p.years}y` : ''}</div>
      </div>
    </div>
  );
}

// ───── social handle chip ─────
function SocialChip({ theme, kind, handle }) {
  const t = theme;
  const meta = {
    instagram: { label: 'Instagram', color: '#E1306C', glyph: 'IG' },
    linkedin:  { label: 'LinkedIn',  color: '#0A66C2', glyph: 'in' },
    snapchat:  { label: 'Snapchat',  color: '#FFFC00', glyph: 'SC', textColor: '#000' },
  }[kind];
  if (!meta) return null;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      background: t.surface, border: `1px solid ${t.line}`,
      borderRadius: 100, padding: '6px 14px 6px 6px',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 14,
        background: meta.color, color: meta.textColor || '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 800, fontFamily: FONT_BODY, letterSpacing: '-0.04em',
      }}>{meta.glyph}</div>
      <span style={{ fontSize: 13, color: t.text, fontFamily: FONT_MONO }}>@{handle}</span>
    </div>
  );
}

Object.assign(window, { ProfileScreen, PlatformBadge, SocialChip, MiniCalendar, localTimeIn });

// ───────────── MINI CALENDAR ─────────────
function MiniCalendar({ theme, value, onChange, slot, setSlot }) {
  const t = theme;
  const today = new Date();
  const [view, setView] = uS(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const sel = value ? new Date(value) : null;
  const monthLabel = view.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const firstDay = new Date(view.getFullYear(), view.getMonth(), 1).getDay(); // 0=Sun
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(view.getFullYear(), view.getMonth(), d));
  const isSame = (a, b) => a && b && a.toDateString() === b.toDateString();
  const isPast = (d) => {
    const t0 = new Date(); t0.setHours(0,0,0,0);
    return d && d < t0;
  };
  const TIMES = ['09:00','11:00','14:00','17:00','19:00','21:00'];

  return (
    <div style={{ background: t.surface2, border: `1px solid ${t.line}`, borderRadius: 12, padding: 14 }}>
      {/* month nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <button onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))} className="ml-btn" style={{ width: 26, height: 26, borderRadius: 13, background: 'transparent', border: `1px solid ${t.line2}`, color: t.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="arrowLeft" size={11}/>
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 600, fontFamily: FONT_DISPLAY, letterSpacing: -0.2 }}>{monthLabel}</div>
        <button onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))} className="ml-btn" style={{ width: 26, height: 26, borderRadius: 13, background: 'transparent', border: `1px solid ${t.line2}`, color: t.text, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(180deg)' }}>
          <Icon name="arrowLeft" size={11}/>
        </button>
      </div>
      {/* dow header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {['S','M','T','W','T','F','S'].map((d, i) => <div key={i} style={{ textAlign: 'center', fontSize: 9, fontFamily: FONT_MONO, color: t.textMuted, letterSpacing: '.1em', padding: '4px 0' }}>{d}</div>)}
      </div>
      {/* grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i}/>;
          const past = isPast(d);
          const selected = isSame(d, sel);
          const todayMark = isSame(d, today);
          return (
            <button key={i} disabled={past} onClick={() => onChange(d.toISOString())} className="ml-btn" style={{
              padding: 0, height: 30, borderRadius: 7, border: 'none', cursor: past ? 'not-allowed' : 'pointer',
              background: selected ? t.text : todayMark ? t.surface : 'transparent',
              color: selected ? t.bg : past ? t.textMuted : t.text,
              fontSize: 12, fontFamily: FONT_MONO, fontWeight: selected ? 600 : 400,
              opacity: past ? 0.3 : 1,
              outline: todayMark && !selected ? `1px solid ${t.line2}` : 'none',
            }}>{d.getDate()}</button>
          );
        })}
      </div>
      {/* time grid (after date pick) */}
      {sel && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${t.line}` }}>
          <div style={{ fontSize: 10, fontFamily: FONT_MONO, color: t.textMuted, letterSpacing: '.08em', marginBottom: 6 }}>TIME</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
            {TIMES.map(s => (
              <button key={s} onClick={() => setSlot(s)} className="ml-btn" style={{
                padding: '7px 0', borderRadius: 6,
                background: slot === s ? t.text : 'transparent',
                color: slot === s ? t.bg : t.text,
                border: `1px solid ${slot === s ? t.text : t.line2}`,
                fontSize: 11, fontFamily: FONT_MONO,
              }}>{s}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
