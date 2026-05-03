// AI Concierge · MeetLocal Plus · Pulse (real-time arrivals)
const { useState: nfSt, useEffect: nfEf, useRef: nfRf } = React;

// ───────────────────────────────────────────────────────────
// AI CONCIERGE — chat surface w/ LLM-style trip planning
// ───────────────────────────────────────────────────────────
const SEED_CONCIERGE = [
  { from: 'ai', body: "Hi — I'm Locally, your trip concierge. Tell me where you're headed and what kind of night you want. I'll match you with two or three locals and pre-build the route.", time: '2:14 PM' },
  { from: 'me', body: 'Istanbul this Friday, 8pm. Solo. I want food + one rooftop + nothing touristy.', time: '2:14 PM' },
  { from: 'ai', body: "Got it. Solo, Friday 20:00, food → rooftop, off-strip. Two strong matches:", time: '2:14 PM', cards: [
    { who: 'Elif · Karaköy', why: "31-yr native, hosts solo travelers weekly. Knows three meze places that don't appear on Google.", minutes: 4, price: 26 },
    { who: 'Zeynep · Kadıköy', why: "Asian side. Ferry-then-rooftop is her signature route. Speaks DE if you prefer.", minutes: 3, price: 24 },
  ]},
  { from: 'ai', body: "Want me to book Elif and pre-write your intro? I can also draft the 3-stop route so she just confirms.", time: '2:14 PM', quickReplies: ['Book Elif & draft route', 'Show Zeynep first', 'Solo-female safety brief'] },
];

function ConciergeScreen({ theme, goto, state, setState }) {
  const t = theme;
  const [msgs, setMsgs] = nfSt(SEED_CONCIERGE);
  const [draft, setDraft] = nfSt('');
  const [thinking, setThinking] = nfSt(false);
  const scroller = nfRf(null);

  nfEf(() => { if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; }, [msgs, thinking]);

  const send = (text) => {
    const body = (text ?? draft).trim();
    if (!body) return;
    setDraft('');
    const time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    setMsgs(m => [...m, { from: 'me', body, time }]);
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setMsgs(m => [...m, {
        from: 'ai', time,
        body: "Booked. Elif confirmed in 4 min. I drafted your route — three stops, 12-min walks max, ends on a rooftop with a Bosphorus view. Tap to review.",
        route: [
          { t: '20:00', stop: 'Karaköy Lokantası', note: 'meze · Elif knows the table' },
          { t: '21:30', stop: 'Mürver', note: 'rooftop · Bosphorus side' },
          { t: '23:00', stop: 'Arkaoda', note: 'late · vinyl bar Elif DJs at sometimes' },
        ],
      }]);
    }, 1400);
  };

  const ink = t.text, paper = t.bg, surf = t.surface, surf2 = t.surface2, hair = t.line, hair2 = t.line2, dim = t.textDim, mute = t.textMuted;

  return (
    <div style={{ width: '100%', height: '100%', background: paper, color: ink, fontFamily: FONT_BODY, display: 'flex', flexDirection: 'column', '--ml-grad': t.grad }}>
      {/* HEADER */}
      <div style={{ padding: '18px 32px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: `1px solid ${hair}` }}>
        <button onClick={() => goto('home')} className="ml-btn" style={{ width: 34, height: 34, borderRadius: 17, background: surf, border: `1px solid ${hair2}`, color: ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="arrowLeft" size={15}/></button>
        <div style={{ width: 38, height: 38, borderRadius: 19, background: t.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 14, position: 'relative' }}>
          L
          <span style={{ position: 'absolute', bottom: -1, right: -1, width: 11, height: 11, borderRadius: 6, background: '#10B981', border: `2px solid ${paper}` }}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.2 }}>Locally <span style={{ fontWeight: 400, color: dim, fontFamily: FONT_MONO, fontSize: 11, marginLeft: 6, letterSpacing: '.06em' }}>· AI CONCIERGE</span></div>
          <div style={{ fontSize: 12, color: mute, fontFamily: FONT_MONO, marginTop: 2 }}>Trained on 142K real meet-ups · always on</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: mute, fontFamily: FONT_MONO, padding: '6px 10px', border: `1px solid ${hair2}`, borderRadius: 100 }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: '#10B981' }}/>
          +210% conversion vs. browse
        </div>
      </div>

      {/* CHAT */}
      <div ref={scroller} className="ml-scroll" style={{ flex: 1, overflow: 'auto', padding: '32px 32px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {/* hero pill */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', border: `1px solid ${hair2}`, borderRadius: 100, fontSize: 11, fontFamily: FONT_MONO, color: mute, letterSpacing: '.08em' }}>
              <span style={{ width: 5, height: 5, borderRadius: 3, background: t.a1 }}/>
              SESSION · TRIP TO ISTANBUL · APR 25
            </div>
          </div>

          {msgs.map((m, i) => (
            <ConciergeBubble key={i} m={m} t={t} goto={goto} setState={setState} state={state}/>
          ))}

          {thinking && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 18 }}>
              <div style={{ width: 28, height: 28, borderRadius: 14, background: t.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11 }}>L</div>
              <div style={{ background: surf, border: `1px solid ${hair}`, borderRadius: 18, padding: '14px 18px', display: 'flex', gap: 5 }}>
                {[0, 1, 2].map(d => <span key={d} style={{ width: 6, height: 6, borderRadius: 3, background: dim, animation: 'ml-pulse 1.2s infinite', animationDelay: `${d * 0.15}s` }}/>)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* COMPOSER */}
      <div style={{ padding: '18px 32px 24px', borderTop: `1px solid ${hair}`, background: paper }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {['Plan a Friday night', 'Solo-female safe routes', 'Kid-friendly Tokyo', 'Surprise me'].map(p => (
              <button key={p} onClick={() => send(p)} className="ml-btn" style={{ background: surf, border: `1px solid ${hair2}`, color: dim, fontSize: 12, padding: '7px 12px', borderRadius: 100, fontFamily: FONT_MONO, letterSpacing: '.02em' }}>{p}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: surf, border: `1px solid ${hair2}`, borderRadius: 14, padding: '10px 12px 10px 18px' }}>
            <input
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') send(); }}
              placeholder="Where to, and what kind of evening?"
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: ink, fontSize: 14, fontFamily: FONT_BODY }}
            />
            <button onClick={() => send()} className="ml-btn" disabled={!draft.trim()} style={{ width: 38, height: 38, borderRadius: 12, background: draft.trim() ? ink : surf2, color: draft.trim() ? paper : mute, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="send" size={15}/>
            </button>
          </div>
          <div style={{ fontSize: 11, color: mute, fontFamily: FONT_MONO, marginTop: 10, textAlign: 'center', letterSpacing: '.04em' }}>
            Locally never books without your confirm · payments held until your local accepts
          </div>
        </div>
      </div>
    </div>
  );
}

function ConciergeBubble({ m, t, goto, setState, state }) {
  const ink = t.text, paper = t.bg, surf = t.surface, hair = t.line, hair2 = t.line2, dim = t.textDim, mute = t.textMuted;
  const mine = m.from === 'me';
  return (
    <div style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', gap: 12, marginBottom: 18, alignItems: 'flex-end' }}>
      {!mine && <div style={{ width: 28, height: 28, borderRadius: 14, background: t.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>L</div>}
      <div style={{ maxWidth: '82%', display: 'flex', flexDirection: 'column', gap: 10, alignItems: mine ? 'flex-end' : 'flex-start' }}>
        <div style={{
          background: mine ? ink : surf,
          color: mine ? paper : ink,
          border: mine ? 'none' : `1px solid ${hair}`,
          borderRadius: 18,
          borderBottomRightRadius: mine ? 6 : 18,
          borderBottomLeftRadius: mine ? 18 : 6,
          padding: '12px 16px',
          fontSize: 14,
          lineHeight: 1.55,
          letterSpacing: -0.1,
        }}>{m.body}</div>

        {m.cards && (
          <div style={{ display: 'grid', gap: 8, width: '100%' }}>
            {m.cards.map((c, i) => (
              <button key={i} onClick={() => { setState({ ...state, activeLocal: c.who.toLowerCase().includes('elif') ? 'elif' : 'zeynep' }); goto('profile'); }} className="ml-btn" style={{ textAlign: 'left', background: surf, border: `1px solid ${hair2}`, borderRadius: 14, padding: 14, color: ink, display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer' }}>
                <div style={{ width: 40, height: 40, borderRadius: 20, background: t.grad, flexShrink: 0 }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: ink }}>{c.who}</div>
                  <div style={{ fontSize: 12, color: dim, marginTop: 4, lineHeight: 1.45 }}>{c.why}</div>
                  <div style={{ fontSize: 11, fontFamily: FONT_MONO, color: mute, marginTop: 8, letterSpacing: '.04em' }}>responds in {c.minutes} min · ${c.price}/hr</div>
                </div>
                <Icon name="arrowLeft" size={14} stroke={mute} style={{ transform: 'rotate(180deg)', marginTop: 14 }}/>
              </button>
            ))}
          </div>
        )}

        {m.route && (
          <div style={{ background: surf, border: `1px solid ${hair2}`, borderRadius: 14, padding: 16, width: '100%' }}>
            <div style={{ fontSize: 11, fontFamily: FONT_MONO, color: mute, letterSpacing: '.08em', marginBottom: 12 }}>YOUR ROUTE · 3 STOPS</div>
            {m.route.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: i === m.route.length - 1 ? 0 : 14, marginBottom: i === m.route.length - 1 ? 0 : 14, borderBottom: i === m.route.length - 1 ? 'none' : `1px solid ${hair}`, alignItems: 'flex-start' }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: ink, fontWeight: 500, width: 48, flexShrink: 0 }}>{s.t}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: ink }}>{s.stop}</div>
                  <div style={{ fontSize: 12, color: dim, marginTop: 2 }}>{s.note}</div>
                </div>
              </div>
            ))}
            <button onClick={() => goto('booking')} className="ml-btn" style={{ marginTop: 14, width: '100%', padding: 12, borderRadius: 10, background: ink, color: paper, border: 'none', fontSize: 13, fontWeight: 600 }}>
              Confirm trip · $96 + fees
            </button>
          </div>
        )}

        {m.quickReplies && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {m.quickReplies.map(q => (
              <button key={q} className="ml-btn" style={{ background: 'transparent', border: `1px solid ${hair2}`, color: ink, fontSize: 12, padding: '7px 12px', borderRadius: 100 }}>{q}</button>
            ))}
          </div>
        )}

        <div style={{ fontSize: 10, color: mute, fontFamily: FONT_MONO, padding: '0 4px' }}>{m.time}</div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// MEETLOCAL PLUS — subscription upsell
// ───────────────────────────────────────────────────────────
function PlusScreen({ theme, goto }) {
  const t = theme;
  const [tier, setTier] = nfSt('plus');
  const [annual, setAnnual] = nfSt(true);

  const tiers = {
    free: { name: 'Free', price: 0, lines: ['Browse + book locals', 'Standard 8% service fee', 'Email support'] },
    plus: { name: 'Plus', price: annual ? 9 : 12, lines: ['0% service fee on every booking', '2 free re-matches per trip', 'Concierge priority queue', 'Cancel up to 30 min before', 'Trip Confidence insurance included'] },
    pro:  { name: 'Pro', price: annual ? 24 : 32, lines: ['Everything in Plus', 'Unlimited re-matches', 'Same-day rebooking guarantee', 'Annual “city pass” — 12 cities, prepaid hours', 'Dedicated human concierge'] },
  };

  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.text, fontFamily: FONT_BODY, overflow: 'auto', '--ml-grad': t.grad }} className="ml-scroll">
      {/* HEADER */}
      <div style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: `1px solid ${t.line}` }}>
        <button onClick={() => goto('home')} className="ml-btn" style={{ width: 34, height: 34, borderRadius: 17, background: t.surface, border: `1px solid ${t.line2}`, color: t.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="arrowLeft" size={15}/></button>
        <div style={{ fontSize: 13, fontFamily: FONT_MONO, color: t.textDim, letterSpacing: '.08em' }}>MEETLOCAL · MEMBERSHIP</div>
      </div>

      {/* HERO */}
      <section style={{ padding: '80px 56px 48px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ fontSize: 11, fontFamily: FONT_MONO, color: t.textMuted, letterSpacing: '.12em', marginBottom: 18 }}>FOR FREQUENT TRAVELERS</div>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 84, fontWeight: 700, letterSpacing: -3, margin: 0, lineHeight: 0.96 }}>
          Travel like<br/>you live there.
          <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 7, background: t.grad, marginLeft: 14, verticalAlign: 'middle' }}/>
        </h1>
        <p style={{ fontSize: 19, color: t.textDim, maxWidth: 600, marginTop: 28, lineHeight: 1.5 }}>
          Plus members pay no service fees, jump the concierge queue, and get a free re-match if their local can't make it. The cost of one cancelled tour, every year.
        </p>

        {/* annual toggle */}
        <div style={{ marginTop: 36, display: 'inline-flex', padding: 4, background: t.surface, border: `1px solid ${t.line2}`, borderRadius: 100, fontSize: 13 }}>
          {[['monthly', 'Monthly'], ['annual', 'Annual · save 25%']].map(([k, label]) => {
            const active = (annual && k === 'annual') || (!annual && k === 'monthly');
            return (
              <button key={k} onClick={() => setAnnual(k === 'annual')} className="ml-btn" style={{ padding: '8px 18px', borderRadius: 100, background: active ? t.text : 'transparent', color: active ? t.bg : t.textDim, border: 'none', fontSize: 13, fontWeight: 500 }}>{label}</button>
            );
          })}
        </div>
      </section>

      {/* TIERS */}
      <section style={{ padding: '0 56px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {Object.entries(tiers).map(([k, v]) => {
            const active = tier === k;
            const featured = k === 'plus';
            return (
              <button key={k} onClick={() => setTier(k)} className="ml-btn" style={{
                textAlign: 'left',
                background: active && featured ? t.grad : t.surface,
                border: `1.5px solid ${active ? (featured ? 'transparent' : t.text) : t.line2}`,
                borderRadius: 18, padding: 28, cursor: 'pointer',
                color: active && featured ? '#fff' : t.text,
                position: 'relative',
                transition: 'all .2s',
              }}>
                {featured && <div style={{ position: 'absolute', top: 18, right: 18, fontSize: 10, fontFamily: FONT_MONO, padding: '4px 8px', background: active ? 'rgba(255,255,255,.2)' : t.text, color: active ? '#fff' : t.bg, borderRadius: 100, letterSpacing: '.08em' }}>MOST POPULAR</div>}
                <div style={{ fontSize: 13, fontFamily: FONT_MONO, opacity: 0.7, letterSpacing: '.08em' }}>{v.name.toUpperCase()}</div>
                <div style={{ fontSize: 56, fontFamily: FONT_DISPLAY, fontWeight: 700, letterSpacing: -2, marginTop: 14, lineHeight: 1 }}>
                  ${v.price}
                  <span style={{ fontSize: 14, fontWeight: 400, opacity: 0.7, fontFamily: FONT_BODY, marginLeft: 4 }}>/mo</span>
                </div>
                <div style={{ fontSize: 12, opacity: 0.7, fontFamily: FONT_MONO, marginTop: 6 }}>
                  {v.price === 0 ? 'Forever' : `billed ${annual ? 'annually' : 'monthly'}`}
                </div>
                <div style={{ borderTop: `1px solid ${active && featured ? 'rgba(255,255,255,.2)' : t.line}`, margin: '24px 0', height: 1 }}/>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12, fontSize: 13.5, lineHeight: 1.45 }}>
                  {v.lines.map(l => (
                    <li key={l} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ width: 16, height: 16, borderRadius: 8, background: active && featured ? 'rgba(255,255,255,.25)' : t.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                        <Icon name="check" size={10} stroke={active && featured ? '#fff' : t.text}/>
                      </span>
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="ml-btn" disabled={tier === 'free'} style={{ padding: '16px 32px', borderRadius: 100, background: t.grad, color: '#fff', border: 'none', fontSize: 15, fontWeight: 600, opacity: tier === 'free' ? 0.4 : 1 }}>
            Start {tiers[tier].name} · {tier === 'free' ? 'free forever' : `$${tiers[tier].price}/mo`}
          </button>
          <div style={{ fontSize: 12, fontFamily: FONT_MONO, color: t.textMuted, letterSpacing: '.04em' }}>
            14-day refund · cancel anytime · we'll prorate
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section style={{ padding: '32px 56px 96px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[
            { stat: '$340', label: 'avg. saved on fees per Plus member, per year' },
            { stat: '7.4×', label: 'more trips booked vs. free tier' },
            { stat: '92%', label: 'renew at year one' },
          ].map((s, i) => (
            <div key={i} style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 16, padding: 32 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 56, fontWeight: 700, letterSpacing: -2, lineHeight: 1 }}>{s.stat}</div>
              <div style={{ fontSize: 13, color: t.textDim, marginTop: 14, lineHeight: 1.5 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// PULSE — real-time arrivals feed (host-side)
// ───────────────────────────────────────────────────────────
const PULSE_SEED = [
  { id: 'a', name: 'Lukas, 28', from: 'Berlin', city: 'Istanbul', land: 'IST · 21:40', match: 94, want: 'Late food + jazz · solo', flag: '🇩🇪', mins: 12, price: 26, hours: 3, langs: ['EN', 'DE'] },
  { id: 'b', name: 'Priya, 34', from: 'Mumbai', city: 'Istanbul', land: 'SAW · 18:20', match: 89, want: 'Karaköy walk + photos', flag: '🇮🇳', mins: 41, price: 24, hours: 2, langs: ['EN'] },
  { id: 'c', name: 'Eli + Maya', from: 'Tel Aviv', city: 'Istanbul', land: 'IST · 23:05', match: 86, want: 'Asian-side rooftop', flag: '🇮🇱', mins: 88, price: 24, hours: 4, langs: ['EN', 'HE'] },
  { id: 'd', name: 'Marco, 41', from: 'Milan', city: 'Istanbul', land: 'IST · arrived', match: 81, want: "Authentic dinner, no tourist menu", flag: '🇮🇹', mins: 0, price: 30, hours: 3, langs: ['EN', 'IT'] },
  { id: 'e', name: 'Yuki, 26', from: 'Tokyo', city: 'Istanbul', land: 'SAW · tomorrow 09:15', match: 78, want: 'Day trip — historic peninsula', flag: '🇯🇵', mins: 720, price: 22, hours: 5, langs: ['EN', 'JA'] },
];

function PulseScreen({ theme, goto }) {
  const t = theme;
  const [items, setItems] = nfSt(PULSE_SEED);
  const [acceptedId, setAcceptedId] = nfSt(null);
  const [pulse, setPulse] = nfSt(0);

  // animate the live count
  nfEf(() => {
    const id = setInterval(() => setPulse(p => p + 1), 2200);
    return () => clearInterval(id);
  }, []);

  const accept = (id) => {
    setAcceptedId(id);
    setTimeout(() => {
      setItems(it => it.filter(x => x.id !== id));
      setAcceptedId(null);
    }, 1200);
  };
  const decline = (id) => setItems(it => it.filter(x => x.id !== id));

  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.text, fontFamily: FONT_BODY, overflow: 'auto', '--ml-grad': t.grad }} className="ml-scroll">
      <div style={{ padding: '20px 40px', borderBottom: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={() => goto('home')} className="ml-btn" style={{ width: 36, height: 36, borderRadius: 18, background: t.surface, border: `1px solid ${t.line2}`, color: t.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="arrowLeft" size={15}/></button>
        <div style={{ fontSize: 13, fontFamily: FONT_MONO, color: t.textDim, letterSpacing: '.08em' }}>PULSE · ISTANBUL · LOCAL DASHBOARD</div>
        <div style={{ flex: 1 }}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontFamily: FONT_MONO, color: t.textDim, letterSpacing: '.04em' }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: '#10B981', animation: 'ml-pulse 1.4s infinite' }}/>
          LIVE · {items.length} arriving now
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 40px 100px' }}>
        {/* HERO STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 36 }}>
          {[
            { k: 'Travelers landing today', v: '247', tone: t.text },
            { k: 'Match-ready for you', v: items.length, tone: t.a1 },
            { k: 'Avg. accept time', v: '4.2 min', tone: t.text },
            { k: 'Your earnings · this week', v: '$486', tone: t.text },
          ].map((s, i) => (
            <div key={i} style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 11, fontFamily: FONT_MONO, color: t.textMuted, letterSpacing: '.06em' }}>{s.k.toUpperCase()}</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 38, fontWeight: 700, letterSpacing: -1.2, marginTop: 10, color: s.tone, lineHeight: 1 }}>{s.v}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 18 }}>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 28, fontWeight: 600, letterSpacing: -0.8, margin: 0 }}>Arriving in your city</h2>
          <div style={{ fontSize: 13, color: t.textDim }}>Match-scored against your tags &amp; hours</div>
          <div style={{ flex: 1 }}/>
          <div style={{ display: 'flex', gap: 6 }}>
            {['All', 'Solo', 'Tonight', 'High-match'].map((c, i) => (
              <button key={c} className="ml-btn" style={{ background: i === 0 ? t.surface2 : 'transparent', border: `1px solid ${t.line2}`, color: t.text, fontSize: 12, padding: '6px 12px', borderRadius: 100, fontFamily: FONT_MONO, letterSpacing: '.04em' }}>{c}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          {items.map(p => (
            <PulseRow key={p.id} p={p} t={t} onAccept={() => accept(p.id)} onDecline={() => decline(p.id)} accepted={acceptedId === p.id}/>
          ))}
          {items.length === 0 && (
            <div style={{ padding: 60, textAlign: 'center', background: t.surface, border: `1px dashed ${t.line2}`, borderRadius: 14, color: t.textDim, fontSize: 14 }}>
              All clear. Pulse will ping you the second a high-match traveler lands.
            </div>
          )}
        </div>

        <div style={{ marginTop: 32, padding: 24, background: t.surface, border: `1px solid ${t.line}`, borderRadius: 16, display: 'flex', gap: 18, alignItems: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: 22, background: t.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="lightning" size={20} stroke="#fff"/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Auto-accept high-match travelers</div>
            <div style={{ fontSize: 13, color: t.textDim, marginTop: 4 }}>We'll book any 90+ match in your tags &amp; hours, send the intro, and notify you. Locals using auto-accept earn 38% more.</div>
          </div>
          <button className="ml-btn" style={{ padding: '12px 22px', borderRadius: 100, background: t.text, color: t.bg, border: 'none', fontSize: 13, fontWeight: 600 }}>Turn on</button>
        </div>
      </div>
    </div>
  );
}

function PulseRow({ p, t, onAccept, onDecline, accepted }) {
  const matchColor = p.match >= 90 ? '#10B981' : p.match >= 85 ? t.a1 : t.textDim;
  const arriving = p.mins === 0 ? 'Just landed' : p.mins < 60 ? `in ${p.mins} min` : p.mins < 1440 ? `in ${Math.round(p.mins / 60)}h` : 'tomorrow';

  return (
    <div style={{
      background: accepted ? t.grad : t.surface,
      border: `1px solid ${accepted ? 'transparent' : t.line}`,
      borderRadius: 14, padding: 18,
      display: 'flex', gap: 18, alignItems: 'center',
      transition: 'all .3s',
      color: accepted ? '#fff' : t.text,
    }}>
      <div style={{ position: 'relative' }}>
        <div style={{ width: 50, height: 50, borderRadius: 25, background: accepted ? 'rgba(255,255,255,.2)' : t.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{p.flag}</div>
        <div style={{ position: 'absolute', bottom: -4, right: -4, padding: '2px 6px', background: accepted ? '#fff' : matchColor, color: accepted ? matchColor : '#fff', fontSize: 10, fontFamily: FONT_MONO, borderRadius: 100, fontWeight: 600, letterSpacing: '.02em' }}>{p.match}</div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.2 }}>{p.name}</div>
          <span style={{ fontSize: 12, color: accepted ? 'rgba(255,255,255,.7)' : t.textDim }}>· from {p.from}</span>
        </div>
        <div style={{ fontSize: 13, color: accepted ? 'rgba(255,255,255,.85)' : t.textDim, marginTop: 4 }}>"{p.want}"</div>
        <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 11, fontFamily: FONT_MONO, color: accepted ? 'rgba(255,255,255,.7)' : t.textMuted, letterSpacing: '.04em' }}>
          <span>{p.land}</span>
          <span>· {arriving}</span>
          <span>· {p.hours}h × ${p.price}</span>
          <span>· {p.langs.join(' / ')}</span>
        </div>
      </div>

      {accepted ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600 }}>
          <Icon name="check" size={16} stroke="#fff"/> Accepted
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onDecline} className="ml-btn" style={{ width: 38, height: 38, borderRadius: 19, background: 'transparent', border: `1px solid ${t.line2}`, color: t.textDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="x" size={14}/>
          </button>
          <button onClick={onAccept} className="ml-btn" style={{ padding: '0 18px', height: 38, borderRadius: 19, background: t.text, color: t.bg, border: 'none', fontSize: 13, fontWeight: 600 }}>
            Accept
          </button>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ConciergeScreen, PlusScreen, PulseScreen });
