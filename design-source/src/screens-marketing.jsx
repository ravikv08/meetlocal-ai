// How it works, Safety, Become-a-local landing pages
const SP_uS = React.useState;

function HowItWorksScreen({ theme, goto, session }) {
  const t = theme;
  const [side, setSide] = SP_uS('traveler');

  const travelerSteps = [
    { n: '01', t: 'Tell us where you\'re landing', d: 'Tap the city, dates, and what you\'re into — food, music, photos, nothing in particular. Takes 15 seconds.', i: 'pin' },
    { n: '02', t: 'Pick a local from the grid', d: 'Every profile shows a Born-&-raised / Rooted / Seasoned badge, verified ID, background check date, and reviews from past travelers.', i: 'user' },
    { n: '03', t: 'Chat first, or instant-book', d: 'Message to feel out the vibe, or book directly — they have 14 minutes to accept before we auto-match you with the next-best local.', i: 'chat' },
    { n: '04', t: 'Meet up — we track the trip', d: 'Live map shows their ETA. Trip tracking shares with one trusted contact. SOS is one tap.', i: 'shield' },
    { n: '05', t: 'Review, tip, remember', d: '100% of tips go to your local. Reviews publish after both sides submit — no retaliation possible.', i: 'star' },
  ];
  const localSteps = [
    { n: '01', t: 'Apply in 10 minutes', d: 'Tell us who you are, where you\'re from, what you\'d love to show people. Set your own rate.', i: 'user' },
    { n: '02', t: 'Verify your identity', d: 'Government ID + liveness selfie via Persona. Most applicants clear in 90 seconds.', i: 'shield' },
    { n: '03', t: 'Prove your roots', d: 'Utility bill, lease, or birth record unlocks your residency badge. 10+ years → "Rooted". Born here → "Native" (highest trust signal, highest rate).', i: 'pin' },
    { n: '04', t: 'Clear a background check', d: 'Criminal + watchlist check via Checkr (US) or Sterling (intl). Same standard as Uber & Airbnb. 24h turnaround.', i: 'check' },
    { n: '05', t: 'Connect Stripe, go live', d: 'Bank account via Stripe Connect. Weekly payouts on Monday. You keep 80% of every booking.', i: 'wallet' },
  ];
  const steps = side === 'traveler' ? travelerSteps : localSteps;

  return (
    <div className="ml-scroll" style={{ width: '100%', height: '100%', overflow: 'auto', background: t.bg, color: t.text, fontFamily: FONT_BODY, '--ml-grad': t.grad }}>
      <MarketingNav theme={t} goto={goto} active="how" session={session}/>
      <section style={{ padding: '80px 56px 32px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ fontSize: 12, fontFamily: FONT_MONO, color: t.a1, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 20 }}>● How meetlocal.ai works</div>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 80, fontWeight: 700, letterSpacing: -2.4, margin: 0, lineHeight: .96 }}>
          Land anywhere.<br/>Meet <span className="ml-grad-text">someone real</span><br/>in hours, not days.
        </h1>
        <p style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 400, letterSpacing: -0.3, lineHeight: 1.35, margin: '24px 0 0', color: t.textDim, maxWidth: 620 }}>
          Someone who knows the spots, the shortcuts, and the stories.
        </p>
        <div style={{ display: 'inline-flex', marginTop: 40, background: t.surface, border: `1px solid ${t.line2}`, borderRadius: 100, padding: 4 }}>
          {['traveler', 'local'].map(k => (
            <button key={k} onClick={() => setSide(k)} className="ml-btn" style={{
              padding: '10px 22px', borderRadius: 100,
              background: side === k ? t.text : 'transparent', color: side === k ? t.bg : t.textDim,
              border: 'none', fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
            }}>{k === 'traveler' ? 'I\'m a traveler' : 'I\'m a local host'}</button>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 56px 60px' }}>
        <div style={{ display: 'grid', gap: 20 }}>
          {steps.map((s, i) => (
            <div key={s.n} style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 32, alignItems: 'start', padding: '32px 0', borderTop: i === 0 ? 'none' : `1px solid ${t.line}` }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 14, color: t.a1, letterSpacing: '.1em' }}>{s.n}</div>
              <div>
                <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 34, fontWeight: 600, letterSpacing: -0.8, margin: 0 }}>{s.t}</h3>
                <p style={{ fontSize: 17, lineHeight: 1.5, color: t.textDim, marginTop: 12, maxWidth: 620 }}>{s.d}</p>
              </div>
              <div style={{ width: 80, height: 80, borderRadius: 20, background: t.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: `0 20px 40px ${t.a1}33` }}>
                <Icon name={s.i} size={32}/>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: t.bg2, padding: '80px 56px', borderTop: `1px solid ${t.line}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {[
              { k: '147', v: 'cities live' },
              { k: '12,400+', v: 'vetted locals' },
              { k: '4.92★', v: 'avg rating' },
              { k: '3.2h', v: 'avg time to match' },
            ].map(s => (
              <div key={s.v}>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 52, fontWeight: 700, letterSpacing: -1.5 }} className="ml-grad-text">{s.k}</div>
                <div style={{ fontSize: 14, color: t.textDim, marginTop: 4 }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 56px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 48, fontWeight: 700, letterSpacing: -1.4, margin: 0 }}>Ready when you are.</h2>
        <div style={{ marginTop: 32, display: 'inline-flex', gap: 12 }}>
          <button onClick={() => goto('home')} className="ml-btn" style={{ padding: '14px 28px', borderRadius: 100, background: t.grad, color: '#fff', border: 'none', fontSize: 15, fontWeight: 600 }}>Find a local in Istanbul →</button>
          <button onClick={() => goto('onboarding')} className="ml-btn" style={{ padding: '14px 28px', borderRadius: 100, background: 'transparent', color: t.text, border: `1px solid ${t.line2}`, fontSize: 15, fontWeight: 500 }}>Become a local</button>
        </div>
      </section>
    </div>
  );
}

function SafetyScreen({ theme, goto, session }) {
  const t = theme;
  const pillars = [
    { i: 'shield', t: 'Every local verified', d: 'Government ID + liveness selfie matched via Persona. Background check via Checkr (US) or Sterling (intl) — same databases Uber & Airbnb use. Re-run annually.' },
    { i: 'pin', t: 'Live trip tracking', d: 'Your location is shared with up to 3 trusted contacts during every meetup. Auto-off at trip end. Your local never sees who\'s tracking.' },
    { i: 'flash', t: 'One-tap SOS', d: 'Press & hold the SOS button → we call local emergency services, share your live location, and alert your contacts. 24/7 human dispatcher on standby.' },
    { i: 'wallet', t: 'Payment protection', d: 'Your card is never shared. Pay through meetlocal.ai; locals are paid 24h after the meetup ends, so disputes can be resolved. Full refund if your local no-shows.' },
    { i: 'chat', t: 'Private chat, no DMs off-platform', d: 'Messages stay on the platform — detected phone / WhatsApp handoffs are flagged. AI monitors for grooming & scam patterns in real-time.' },
    { i: 'user', t: 'Two-way reviews, no retaliation', d: 'Reviews publish only after both sides submit (or 14 days elapse). Neither side can hold a rating hostage.' },
  ];

  return (
    <div className="ml-scroll" style={{ width: '100%', height: '100%', overflow: 'auto', background: t.bg, color: t.text, fontFamily: FONT_BODY, '--ml-grad': t.grad }}>
      <MarketingNav theme={t} goto={goto} active="safety" session={session}/>

      <section style={{ padding: '80px 56px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ fontSize: 12, fontFamily: FONT_MONO, color: t.a1, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 20 }}>● Trust & safety</div>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 88, fontWeight: 700, letterSpacing: -2.8, margin: 0, lineHeight: .94 }}>
          You meet a stranger.<br/>We make sure<br/>they&rsquo;re <span className="ml-grad-text">not one</span>.
        </h1>
        <p style={{ fontSize: 19, lineHeight: 1.5, color: t.textDim, maxWidth: 640, marginTop: 28 }}>
          Every local is ID-verified, background-checked, and rated by travelers before you ever see their profile. Here&rsquo;s every system standing between you and a bad night.
        </p>
      </section>

      <section style={{ padding: '40px 56px 60px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18 }}>
          {pillars.map(p => (
            <div key={p.t} style={{ background: t.surface, border: `1px solid ${t.line2}`, borderRadius: 18, padding: 28 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: t.surface2, color: t.a1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={p.i} size={20}/></div>
              <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 600, letterSpacing: -0.5, margin: '16px 0 10px' }}>{p.t}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.55, color: t.textDim, margin: 0 }}>{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: t.bg2, padding: '72px 56px', borderTop: `1px solid ${t.line}` }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ fontSize: 12, fontFamily: FONT_MONO, color: t.textDim, textTransform: 'uppercase', letterSpacing: '.1em' }}>What our checks cover</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginTop: 28 }}>
            <div>
              <h4 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 600, letterSpacing: -0.3, margin: 0, color: '#4ADE80' }}>We check</h4>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: 16, display: 'grid', gap: 12 }}>
                {['Global & national sex offender registry', 'Violent felony convictions (past 7 years)', 'Terrorism watchlists (OFAC, SDN)', 'Driver record: DUI & reckless driving', 'Identity document authenticity', 'Photo liveness match'].map(x => (
                  <li key={x} style={{ display: 'flex', gap: 10, fontSize: 14 }}><Icon name="check" size={16} stroke="#4ADE80"/> {x}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 600, letterSpacing: -0.3, margin: 0, color: t.textDim }}>We don\'t look at</h4>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: 16, display: 'grid', gap: 12 }}>
                {['Credit history or debt', 'Arrests without a conviction', 'Non-violent juvenile records', 'Minor traffic violations', 'Medical history', 'Immigration status'].map(x => (
                  <li key={x} style={{ display: 'flex', gap: 10, fontSize: 14, color: t.textDim }}><Icon name="x" size={16} stroke={t.textMuted}/> {x}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '64px 56px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ background: `linear-gradient(135deg, ${t.a1}18, transparent)`, border: `1px solid ${t.a1}55`, borderRadius: 20, padding: 40, display: 'flex', gap: 28, alignItems: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: 36, background: t.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="flash" size={32} stroke="#fff"/>
          </div>
          <div>
            <div style={{ fontSize: 12, fontFamily: FONT_MONO, color: t.a1, letterSpacing: '.1em', textTransform: 'uppercase' }}>24/7 · Human · &lt; 2 min response</div>
            <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 600, letterSpacing: -0.7, margin: '6px 0' }}>Something feels off? We&rsquo;re one tap away.</h3>
            <p style={{ fontSize: 15, color: t.textDim, margin: 0 }}>Real humans &mdash; not bots &mdash; answer every safety alert. Trained dispatchers, in-region. You&rsquo;ll hear from us before your next breath.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function BecomeLocalScreen({ theme, goto, session }) {
  const t = theme;
  return (
    <div className="ml-scroll" style={{ width: '100%', height: '100%', overflow: 'auto', background: t.bg, color: t.text, fontFamily: FONT_BODY, '--ml-grad': t.grad }}>
      <MarketingNav theme={t} goto={goto} active="become" session={session}/>

      <section style={{ padding: '80px 56px 40px', maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 48, alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 12, fontFamily: FONT_MONO, color: t.a1, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 20 }}>● Earn from your hometown</div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 84, fontWeight: 700, letterSpacing: -2.6, margin: 0, lineHeight: .94 }}>
            Your city<br/>is a <span className="ml-grad-text">paycheck</span>.
          </h1>
          <p style={{ fontSize: 19, lineHeight: 1.5, color: t.textDim, maxWidth: 560, marginTop: 24 }}>
            Show travelers your favorite ramen counter, rooftop, secondhand shop. Set your own rate. Work when you want. 10-minute application. You keep 80%.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 36 }}>
            <button onClick={() => goto('onboarding')} className="ml-btn" style={{ padding: '16px 28px', borderRadius: 100, background: t.grad, color: '#fff', border: 'none', fontSize: 15, fontWeight: 600, boxShadow: `0 10px 30px ${t.a1}44` }}>Start my application →</button>
            <button onClick={() => goto('how')} className="ml-btn" style={{ padding: '16px 28px', borderRadius: 100, background: 'transparent', color: t.text, border: `1px solid ${t.line2}`, fontSize: 15, fontWeight: 500 }}>How it works</button>
          </div>
        </div>
        <div style={{ background: t.surface, border: `1px solid ${t.line2}`, borderRadius: 24, padding: 32 }}>
          <div style={{ fontSize: 11, fontFamily: FONT_MONO, color: t.textDim, textTransform: 'uppercase', letterSpacing: '.1em' }}>Average local earns</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 88, fontWeight: 700, letterSpacing: -2.5, lineHeight: 1, margin: '8px 0' }} className="ml-grad-text">$1,840</div>
          <div style={{ fontSize: 14, color: t.textDim }}>per month · 12 meetups · ~4 hrs/wk</div>
          <div style={{ marginTop: 28, display: 'grid', gap: 10 }}>
            {[
              { k: 'You set your hourly rate', v: '$18 – $80' },
              { k: 'Your cut', v: '80%' },
              { k: 'Payout schedule', v: 'Weekly · Mondays' },
              { k: 'Fees to you', v: '$0' },
            ].map(r => (
              <div key={r.k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '10px 0', borderBottom: `1px solid ${t.line}` }}>
                <span style={{ color: t.textDim }}>{r.k}</span><span style={{ fontWeight: 500 }}>{r.v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '64px 56px', maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 40, fontWeight: 600, letterSpacing: -1, margin: 0 }}>Real locals. Real earnings.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 28 }}>
          {[
            { n: 'Elif A.', c: 'Istanbul · Karaköy', q: 'I host two ferry-and-meze nights a week. Pays my rent in Kadıköy and I\'ve made friends from 14 countries.', e: '$820 / mo' },
            { n: 'Mika T.', c: 'Tokyo · Shimokita', q: 'Late-night food crawls are already my hobby. Now someone pays me to do them. I never advertise — the platform does.', e: '$1,120 / mo' },
            { n: 'Diego R.', c: 'Mexico City · Roma', q: 'Between rideshare shifts, I do two mezcal nights a week. Way better pay, and I actually enjoy the work.', e: '$1,480 / mo' },
          ].map(l => (
            <div key={l.n} style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 16, padding: 24 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <Avatar seed={l.n} size={44} theme={t} ring/>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{l.n}</div>
                  <div style={{ fontSize: 12, color: t.textDim, fontFamily: FONT_MONO }}>{l.c}</div>
                </div>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.5, color: t.text, margin: '18px 0 16px' }}>"{l.q}"</p>
              <div style={{ fontSize: 20, fontFamily: FONT_DISPLAY, fontWeight: 700, letterSpacing: -0.5 }} className="ml-grad-text">{l.e}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '64px 56px 120px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 52, fontWeight: 700, letterSpacing: -1.6, margin: 0 }}>10 minutes.<br/>Then you&rsquo;re live.</h2>
        <button onClick={() => goto('onboarding')} className="ml-btn" style={{ marginTop: 32, padding: '16px 36px', borderRadius: 100, background: t.grad, color: '#fff', border: 'none', fontSize: 16, fontWeight: 600, boxShadow: `0 20px 40px ${t.a1}44` }}>
          Start my application →
        </button>
      </section>
    </div>
  );
}

function MarketingNav({ theme, goto, active, session }) {
  const t = theme;
  const tabs = [
    { id: 'home', k: 'discover', l: 'Discover' },
    { id: 'how', k: 'how', l: 'How it works' },
    { id: 'become', k: 'become', l: 'Become a local' },
    { id: 'safety', k: 'safety', l: 'Safety' },
  ];
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(24px)',
      background: `${t.bg}cc`, borderBottom: `1px solid ${t.line}`,
      padding: '18px 56px', display: 'flex', alignItems: 'center', gap: 32, whiteSpace: 'nowrap',
    }}>
      <Logo theme={t}/>
      <nav style={{ display: 'flex', gap: 28, fontSize: 14, color: t.textDim }}>
        {tabs.map(tab => (
          <a key={tab.k} onClick={() => goto(tab.id)} style={{ color: active === tab.k ? t.text : t.textDim, fontWeight: active === tab.k ? 500 : 400, cursor: 'pointer' }}>{tab.l}</a>
        ))}
      </nav>
      <div style={{ flex: 1 }}/>
      {session?.user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px 4px 4px', border: `1px solid ${t.line2}`, borderRadius: 100 }}>
          <Avatar seed={session.user.email || session.user.name} size={28} theme={t}/>
          <span style={{ fontSize: 13, fontWeight: 500, color: t.text }}>{session.user.name}</span>
        </div>
      ) : (
        <>
          <button onClick={() => session?.openAuth('signin')} className="ml-btn" style={{ padding: '10px 18px', borderRadius: 100, background: 'transparent', color: t.text, border: `1px solid ${t.line2}`, fontSize: 14, fontWeight: 500 }}>Sign in</button>
          <button onClick={() => session?.openAuth('signup')} className="ml-btn" style={{ padding: '10px 18px', borderRadius: 100, background: t.text, color: t.bg, fontSize: 14, fontWeight: 600, border: 'none' }}>Get started</button>
        </>
      )}
    </header>
  );
}

Object.assign(window, { HowItWorksScreen, SafetyScreen, BecomeLocalScreen, MarketingNav });
