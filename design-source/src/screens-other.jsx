// Chat, Booking confirm, Map, Reviews, Arrival screens
const uSt = React.useState, uEf = React.useEffect, uRf = React.useRef;

// small label helper used across screens
function Lbl({ theme, children, style }) {
  const t = theme || {};
  return (
    <div style={{
      fontFamily: typeof FONT_MONO !== 'undefined' ? FONT_MONO : 'ui-monospace, monospace',
      fontSize: 11,
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: t.textDim || '#888',
      ...style
    }}>{children}</div>
  );
}

// ───────────── CHAT ─────────────
function ChatScreen({ theme, goto, state, setState }) {
  const t = theme;
  const local = LOCALS.find(l => l.id === state.activeLocal) || LOCALS[0];
  const [msgs, setMsgs] = uSt(SEED_CHAT);
  const [typing, setTyping] = uSt(false);
  const [draft, setDraft] = uSt('');
  const scrollRef = uRf(null);

  uEf(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, typing]);

  const send = () => {
    if (!draft.trim()) return;
    setMsgs(m => [...m, { from: 'me', text: draft, time: 'now' }]);
    setDraft('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs(m => [...m, { from: 'them', text: "Got it — I'll confirm the booking on my side. See you at 9. 🍜", time: 'now' }]);
    }, 1600);
  };

  const prompts = ["What should I wear?", "Any dietary notes?", "Can we start 30min earlier?"];

  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.text, fontFamily: FONT_BODY, display: 'flex', flexDirection: 'column', '--ml-grad': t.grad }}>
      {/* header */}
      <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: `1px solid ${t.line}`, background: t.bg }}>
        <button onClick={() => goto('profile')} className="ml-btn" style={{ width: 34, height: 34, borderRadius: 17, background: t.surface, border: `1px solid ${t.line2}`, color: t.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="arrowLeft" size={15}/></button>
        <Avatar seed={local.name} size={40} theme={t} ring />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>{local.name} <span style={{ width: 7, height: 7, borderRadius: 4, background: '#4ADE80' }}/></div>
          <div style={{ fontSize: 12, color: t.textDim, fontFamily: FONT_MONO }}>Online · typically replies in {local.responseMin}m</div>
        </div>
        <button className="ml-btn" style={iconBtn(t)}><Icon name="mic" size={15}/></button>
        <button className="ml-btn" style={iconBtn(t)}><Icon name="cam" size={15}/></button>
        <button className="ml-btn" style={iconBtn(t)}><Icon name="menu" size={15}/></button>
      </div>

      {/* proposed plan card */}
      <div style={{ padding: '14px 24px 0' }}>
        <div style={{ background: t.surface, border: `1px solid ${t.line2}`, borderRadius: 14, padding: 14, display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: 11, background: t.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Icon name="flash" size={20}/></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontFamily: FONT_MONO, color: t.textMuted, letterSpacing: '.08em', textTransform: 'uppercase' }}>Proposed plan · awaiting confirm</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>Tonight 9 PM · 3h ramen + vinyl · $96 + fees</div>
          </div>
          <button onClick={() => goto('booking')} className="ml-btn" style={{ padding: '10px 16px', borderRadius: 10, background: t.text, color: t.bg, border: 'none', fontSize: 13, fontWeight: 600 }}>Confirm →</button>
        </div>
      </div>

      {/* messages */}
      <div ref={scrollRef} className="ml-scroll" style={{ flex: 1, overflow: 'auto', padding: '20px 24px 20px' }}>
        <div style={{ textAlign: 'center', fontSize: 11, color: t.textMuted, fontFamily: FONT_MONO, marginBottom: 16, letterSpacing: '.08em', textTransform: 'uppercase' }}>
          ─ Today, 18:42 ─
        </div>
        {msgs.map((m, i) => <Bubble key={i} m={m} theme={t} local={local} first={i === 0 || msgs[i-1].from !== m.from}/>)}
        {typing && (
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <Avatar seed={local.name} size={28} theme={t}/>
            <div style={{ background: t.surface, padding: '10px 14px', borderRadius: 16, borderTopLeftRadius: 4, display: 'flex', gap: 4, alignItems: 'center' }}>
              {[0,1,2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: 3, background: t.textDim, animation: 'ml-pulse 1.2s infinite', animationDelay: `${i*.15}s` }}/>)}
            </div>
          </div>
        )}
      </div>

      {/* quick prompts */}
      <div style={{ padding: '0 24px 12px', display: 'flex', gap: 8, overflowX: 'auto' }} className="ml-scroll">
        {prompts.map(p => (
          <button key={p} onClick={() => setDraft(p)} className="ml-btn" style={{ padding: '8px 14px', borderRadius: 100, background: t.surface, border: `1px solid ${t.line}`, color: t.textDim, fontSize: 12, whiteSpace: 'nowrap' }}>{p}</button>
        ))}
      </div>

      {/* composer */}
      <div style={{ padding: '12px 24px 20px', borderTop: `1px solid ${t.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: t.surface, border: `1px solid ${t.line2}`, borderRadius: 100, padding: '8px 8px 8px 18px' }}>
          <button className="ml-btn" style={{ ...iconBtn(t), width: 32, height: 32 }}><Icon name="plus" size={15}/></button>
          <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Message…" style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: t.text, fontSize: 14, fontFamily: FONT_BODY }}/>
          <button onClick={send} className="ml-btn" style={{ width: 36, height: 36, borderRadius: 18, background: draft ? t.grad : t.surface2, color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="send" size={15}/>
          </button>
        </div>
      </div>
    </div>
  );
}

function Bubble({ m, theme, local, first }) {
  const me = m.from === 'me';
  return (
    <div className="ml-fadeup" style={{ display: 'flex', gap: 10, marginBottom: 6, flexDirection: me ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
      {!me && (first ? <Avatar seed={local.name} size={28} theme={theme}/> : <div style={{ width: 28 }}/>)}
      <div style={{
        background: me ? theme.grad : theme.surface,
        color: me ? '#fff' : theme.text,
        padding: '10px 14px', borderRadius: 16,
        [me ? 'borderTopRightRadius' : 'borderTopLeftRadius']: first ? 4 : 16,
        fontSize: 14, lineHeight: 1.45, maxWidth: '70%',
        boxShadow: me ? `0 8px 24px ${theme.a1}33` : 'none',
      }}>{m.text}</div>
    </div>
  );
}
function iconBtn(t){return { width: 36, height: 36, borderRadius: 18, background: t.surface, border: `1px solid ${t.line2}`, color: t.text, display: 'flex', alignItems: 'center', justifyContent: 'center' };}

// ───────────── BOOKING CONFIRM ─────────────
// Checkout — inspired by Stripe, Airbnb, Uber.
// Principles: generous whitespace, one column, a single primary action,
// solid (non-gradient) CTA, mono for amounts, trust markers with restraint.
function BookingScreen({ theme, goto, state, setState, session }) {
  const t = theme;
  const local = LOCALS.find(l => l.id === state.activeLocal) || LOCALS[0];
  const hours = state.hours || 3;
  const slot = state.slot || '21:00';
  const when = state.when || 'tonight';
  const dateISO = state.date || null;
  const dateObj = dateISO ? new Date(dateISO) : null;
  const whenLabel = (() => {
    if (when === 'plan' && dateObj) return `${dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · ${slot}`;
    if (when === 'tonight')  return `Tonight · ${slot}`;
    if (when === 'tomorrow') return `Tomorrow · ${slot}`;
    if (when === 'week')     return slot;
    return `Tonight · ${slot}`;
  })();
  const subtotal = local.price * hours;
  const serviceFee = Math.round(subtotal * 0.08);
  const taxes = Math.round(subtotal * 0.03);
  const [insurance, setInsurance] = uSt(true);
  const insuranceFee = insurance ? 7 : 0;
  const total = subtotal + serviceFee + taxes + insuranceFee;
  const [payMethod, setPayMethod] = uSt('card');
  const [step, setStep] = uSt(0); // 0=review, 1=paying, 2=confirmed
  const [emailReceipt, setEmailReceipt] = uSt(true);

  const pay = () => {
    if (payMethod === 'card' && !session?.paymentCard) { session?.openCardModal?.(); return; }
    setStep(1);
    setTimeout(() => setStep(2), 1600);
  };
  const [editTime, setEditTime] = uSt(false);
  const setSlot = (v) => setState({ ...state, slot: v });
  const setDate = (v) => setState({ ...state, date: v, when: 'plan' });

  if (step === 2) return <BookingConfirmed theme={t} local={local} total={total} slot={slot} hours={hours} goto={goto} />;

  // Paper surface — lifted from the dark canvas, classy regardless of theme
  const paper = t.name === 'Monochrome' ? t.surface : '#FAFAF7';
  const paperBg = t.name === 'Monochrome' ? t.bg : '#F3F2EE';
  const ink = t.name === 'Monochrome' ? t.text : '#0E0B08';
  const inkDim = t.name === 'Monochrome' ? t.textDim : '#6B655D';
  const inkMute = t.name === 'Monochrome' ? t.textMuted : '#9A9289';
  const hair = t.name === 'Monochrome' ? t.line : '#E8E5DE';
  const hair2 = t.name === 'Monochrome' ? t.line2 : '#D6D2C8';

  return (
    <div style={{ width: '100%', height: '100%', background: paperBg, color: ink, fontFamily: FONT_BODY, overflow: 'auto', '--ml-grad': t.grad }} className="ml-scroll">
      {/* slim top bar */}
      <div style={{ padding: '18px 40px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: `1px solid ${hair}`, background: paperBg, position: 'sticky', top: 0, zIndex: 3 }}>
        <button onClick={() => goto('profile')} className="ml-btn" style={{ width: 34, height: 34, borderRadius: 17, background: 'transparent', border: `1px solid ${hair2}`, color: ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="arrowLeft" size={15}/></button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: inkDim }}>
          <Logo theme={{ ...t, text: ink }}/>
          <span style={{ width: 1, height: 14, background: hair2, margin: '0 10px' }}/>
          <span style={{ fontFamily: FONT_MONO, fontSize: 12 }}>Checkout</span>
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: inkDim, fontFamily: FONT_MONO }}>
          <Icon name="shield" size={13}/> Secured by Stripe · TLS 1.3
        </div>
      </div>

      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '56px 40px 120px', display: 'grid', gridTemplateColumns: '1fr 420px', gap: 64, alignItems: 'start' }}>
        {/* LEFT — single-column form */}
        <div>
          <div style={{ fontSize: 12, fontFamily: FONT_MONO, color: inkMute, textTransform: 'uppercase', letterSpacing: '.12em' }}>Confirm and pay</div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 42, fontWeight: 600, letterSpacing: -1.2, margin: '8px 0 0', color: ink, lineHeight: 1.06 }}>
            ${total}<span style={{ fontSize: 20, color: inkDim, fontWeight: 400 }}> · to meet {local.name.split(' ')[0]}</span>
          </h1>
          <div style={{ fontSize: 14, color: inkDim, marginTop: 10 }}>Authorized now. Charged only if {local.name.split(' ')[0]} accepts within 14 minutes.</div>

          {/* 1. Trip */}
          <Section t={t} num="1" title="Your trip" hair={hair} ink={ink} inkMute={inkMute}>
            <div style={{ background: paper, border: `1px solid ${hair}`, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', borderBottom: `1px solid ${hair}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: inkDim, fontFamily: FONT_MONO, letterSpacing: '.04em' }}>WHEN</div>
                  <div style={{ fontSize: 15, color: ink, fontWeight: 500, marginTop: 4 }}>{whenLabel}</div>
                </div>
                <button onClick={() => setEditTime(!editTime)} className="ml-btn" style={{ fontSize: 12, fontFamily: FONT_MONO, color: ink, background: 'transparent', border: `1px solid ${hair2}`, padding: '7px 14px', borderRadius: 100, letterSpacing: '.04em' }}>
                  {editTime ? 'Done' : 'Change'}
                </button>
              </div>
              {editTime && (
                <div style={{ padding: 16, borderBottom: `1px solid ${hair}`, background: t.name === 'Monochrome' ? t.bg : '#F3F2EE' }}>
                  <MiniCalendar theme={{ ...t, surface2: paper, line: hair, line2: hair2, text: ink, textDim: inkDim, textMuted: inkMute, bg: paper }} value={dateISO} onChange={setDate} slot={slot} setSlot={setSlot}/>
                  <div style={{ fontSize: 11, fontFamily: FONT_MONO, color: inkMute, marginTop: 10, letterSpacing: '.04em', textAlign: 'center' }}>
                    Synced with profile · times shown in {local.city} time
                  </div>
                </div>
              )}
              <TripRow ink={ink} inkDim={inkDim} hair={hair} k="Duration" v={`${hours} hours`}/>
              <TripRow ink={ink} inkDim={inkDim} hair={hair} k="Starts at" v={`${local.city} · ${local.neighborhood}`}/>
              <TripRow ink={ink} inkDim={inkDim} hair={hair} k="Guests" v="1 traveler" last/>
            </div>
          </Section>

          {/* 2. Pay with */}
          <Section t={t} num="2" title="Pay with" hair={hair} ink={ink} inkMute={inkMute}>
            <div style={{ display: 'grid', gap: 10 }}>
              <PayRow
                active={payMethod === 'apple'} onClick={() => setPayMethod('apple')}
                ink={ink} inkDim={inkDim} hair={hair} hair2={hair2} paper={paper}
                badge={<AppleBadge ink={ink}/>} label="Apple Pay" sub="Touch ID · fastest"
              />
              <PayRow
                active={payMethod === 'card'} onClick={() => setPayMethod('card')}
                ink={ink} inkDim={inkDim} hair={hair} hair2={hair2} paper={paper}
                badge={<CardBadge/>}
                label={session?.paymentCard ? `${session.paymentCard.brand || 'Card'} ending ${session.paymentCard.last4}` : 'Add card'}
                sub={session?.paymentCard ? 'Default payment method' : 'Visa · Mastercard · Amex'}
                action={session?.paymentCard ? 'Edit' : null}
                onAction={() => session?.openCardModal?.()}
              />
              <PayRow
                active={payMethod === 'google'} onClick={() => setPayMethod('google')}
                ink={ink} inkDim={inkDim} hair={hair} hair2={hair2} paper={paper}
                badge={<GoogleBadge/>} label="Google Pay" sub=""
              />
              <PayRow
                active={payMethod === 'klarna'} onClick={() => setPayMethod('klarna')}
                ink={ink} inkDim={inkDim} hair={hair} hair2={hair2} paper={paper}
                badge={<div style={{ width: 32, height: 20, borderRadius: 4, background: '#FFA8CD', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#17120F', letterSpacing: '.02em' }}>Klarna</div>}
                label="Pay in 4 · interest-free" sub={`4 × $${Math.round(total / 4)} · 0% APR`}
              />
            </div>
          </Section>

          {/* 3. Traveler details */}
          <Section t={t} num="3" title="Traveler details" hair={hair} ink={ink} inkMute={inkMute}>
            <div style={{ display: 'grid', gap: 10 }}>
              <TInput label="Full name" value={session?.user?.name || ''} hair={hair2} ink={ink} inkMute={inkMute} paper={paper}/>
              <TInput label="Email for receipt" value={session?.user?.email || ''} hair={hair2} ink={ink} inkMute={inkMute} paper={paper}/>
              <TInput label="Phone (for your local only)" value="+1 415 ···· ···" hair={hair2} ink={ink} inkMute={inkMute} paper={paper} mono/>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, fontSize: 13, color: inkDim, cursor: 'pointer' }}>
              <input type="checkbox" checked={emailReceipt} onChange={e => setEmailReceipt(e.target.checked)} style={{ accentColor: ink, width: 16, height: 16 }}/>
              Email me a receipt and trip itinerary
            </label>
          </Section>

          {/* 4. Cancellation */}
          <Section t={t} num="4" title="Cancellation" hair={hair} ink={ink} inkMute={inkMute}>
            <div style={{ background: paper, border: `1px solid ${hair}`, borderRadius: 14, padding: 18, fontSize: 14, color: ink, lineHeight: 1.55 }}>
              <b style={{ fontWeight: 600 }}>Free</b> cancellation until 1 hour before. After that, a 50% fee; no charge if your local can&rsquo;t make it.
            </div>
          </Section>

          {/* 5. Where you'll meet — Starbucks Rule */}
          <Section t={t} num="5" title="Where you'll meet" hair={hair} ink={ink} inkMute={inkMute}>
            {(() => {
              const spot = state.meetingSpot || defaultSpotFor(local.city);
              const catColor = { coffee: '#0E7C42', hotel: '#8B6F47', plaza: '#7B6CD9', museum: '#C44545', book: '#2A4A8A', station: '#5B5B5B' }[spot?.cat] || '#0E7C42';
              const catGlyph = { coffee: '★', hotel: '◆', plaza: '●', museum: '◇', book: '▤', station: '⚏' }[spot?.cat] || '★';
              return (
                <div style={{ background: paper, border: `1px solid ${hair}`, borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{ padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'flex-start', borderBottom: `1px solid ${hair}` }}>
                    <div style={{ width: 44, height: 44, borderRadius: 22, background: catColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 14 }}>{catGlyph}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: ink }}>{spot?.name || 'Pick a meeting spot'}</div>
                      <div style={{ fontSize: 13, color: inkDim, marginTop: 2 }}>{spot ? `${spot.area} · ${spot.hours}` : 'Public, well-lit places near you & your local'}</div>
                      {spot && (
                        <div style={{ fontSize: 11, fontFamily: FONT_MONO, color: inkMute, marginTop: 8, letterSpacing: '.06em' }}>
                          {spot.walk} min walk from {local.name.split(' ')[0]} · {spot.popular ? 'Popular pick' : 'Verified by MeetLocal'}
                        </div>
                      )}
                    </div>
                    <button onClick={() => goto('spots')} className="ml-btn" style={{ fontSize: 12, color: ink, background: 'transparent', border: `1px solid ${hair2}`, padding: '6px 12px', borderRadius: 100 }}>
                      {spot ? 'Change' : 'Pick spot'}
                    </button>
                  </div>
                  <div style={{ padding: '12px 20px', fontSize: 12, color: inkDim, fontFamily: FONT_MONO, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="shield" size={12}/> Starbucks Rule applies</span>
                    <span>·</span>
                    <span>{spot?.safety?.[0] || 'Public venue'}</span>
                    <span>·</span>
                    <span>Switch to private after 2 sessions</span>
                  </div>
                </div>
              );
            })()}
          </Section>

          {/* 6. Trip Confidence insurance */}
          <Section t={t} num="6" title="Trip Confidence" hair={hair} ink={ink} inkMute={inkMute}>
            <button onClick={() => setInsurance(!insurance)} className="ml-btn" style={{ width: '100%', textAlign: 'left', background: paper, border: `1.5px solid ${insurance ? ink : hair}`, borderRadius: 14, padding: 18, display: 'flex', gap: 14, alignItems: 'flex-start', cursor: 'pointer' }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: insurance ? ink : 'transparent', border: `1.5px solid ${insurance ? ink : hair2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: paper, flexShrink: 0, marginTop: 2 }}>
                {insurance && <Icon name="check" size={13} stroke={paper}/>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, color: ink }}>
                  Add Trip Confidence
                  <span style={{ fontSize: 11, fontFamily: FONT_MONO, padding: '2px 8px', background: '#0E0B08', color: '#fff', borderRadius: 100, letterSpacing: '.06em' }}>+$7</span>
                </div>
                <div style={{ fontSize: 13, color: inkDim, marginTop: 6, lineHeight: 1.55 }}>
                  Up to <b style={{ color: ink }}>$100K</b> medical · cancellation refunds · theft cover during the session. Underwritten by Lloyd's of London.
                </div>
                <div style={{ fontSize: 11, fontFamily: FONT_MONO, color: inkMute, marginTop: 8, letterSpacing: '.06em' }}>Pays out in 24h · 92% claim approval rate</div>
              </div>
            </button>
          </Section>

          {/* CTA */}
          <button
            onClick={pay}
            disabled={step === 1}
            className="ml-btn"
            style={{
              marginTop: 32, width: '100%', padding: '20px',
              borderRadius: 14, background: ink, color: paper, border: 'none',
              fontSize: 16, fontWeight: 600, letterSpacing: -0.2,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              opacity: step === 1 ? 0.7 : 1,
              fontFamily: FONT_BODY,
            }}
          >
            {step === 1 ? (
              <><span style={{ width: 14, height: 14, border: `2px solid ${paper}`, borderTopColor: 'transparent', borderRadius: 7, animation: 'ml-spin 0.7s linear infinite' }}/> Authorizing ${total}…</>
            ) : (
              <>Confirm & pay · ${total} USD</>
            )}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 18, fontSize: 12, color: inkMute, fontFamily: FONT_MONO }}>
            <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Icon name="shield" size={13}/> 256-bit encrypted</span>
            <span>·</span>
            <span>You won&rsquo;t be charged until accepted</span>
          </div>
        </div>

        {/* RIGHT — sticky summary */}
        <aside>
          <div style={{ position: 'sticky', top: 84, background: paper, border: `1px solid ${hair}`, borderRadius: 18, overflow: 'hidden' }}>
            {/* local header */}
            <div style={{ padding: 20, borderBottom: `1px solid ${hair}`, display: 'flex', gap: 14, alignItems: 'center' }}>
              <Avatar seed={local.name} size={52} theme={t}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: ink, letterSpacing: -0.2 }}>{local.name}</div>
                <div style={{ fontSize: 13, color: inkDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{local.tagline}</div>
              </div>
              <div style={{ fontSize: 13, color: ink, display: 'flex', gap: 4, alignItems: 'center' }}>
                <Icon name="star" size={13} stroke={ink}/> {local.rating}
              </div>
            </div>

            {/* price lines */}
            <div style={{ padding: 20, display: 'grid', gap: 10, fontSize: 14 }}>
              <SumRow k={`$${local.price} × ${hours} hours`} v={`$${subtotal}`} ink={ink} inkDim={inkDim}/>
              <SumRow k="Service fee" v={`$${serviceFee}`} ink={ink} inkDim={inkDim}/>
              <SumRow k="Taxes" v={`$${taxes}`} ink={ink} inkDim={inkDim}/>
              {insurance && <SumRow k="Trip Confidence" v={`$${insuranceFee}`} ink={ink} inkDim={inkDim}/>}
              <div style={{ borderTop: `1px solid ${hair}`, paddingTop: 12, marginTop: 2 }}>
                <SumRow k="Total" v={`$${total}`} ink={ink} inkDim={inkDim} bold/>
              </div>
            </div>

            {/* trust strip */}
            <div style={{ padding: '14px 20px 18px', borderTop: `1px solid ${hair}`, display: 'grid', gap: 10, fontSize: 12, color: inkDim }}>
              <TrustItem ink={ink} icon="shield">{local.name.split(' ')[0]} is ID-verified &middot; BG-checked {local.bgCheckDate}</TrustItem>
              <TrustItem ink={ink} icon="clock">14 min accept · we auto-rematch if missed</TrustItem>
              <TrustItem ink={ink} icon="lightning">100% refund if your local no-shows</TrustItem>
            </div>
          </div>

          <div style={{ marginTop: 14, fontSize: 11, color: inkMute, fontFamily: FONT_MONO, lineHeight: 1.55, padding: '0 4px' }}>
            By confirming, you agree to meetlocal&rsquo;s Terms, Community Guidelines, and Cancellation Policy. Payments are processed by Stripe Payments UK &amp; EU, Ltd.
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({ num, title, children, hair, ink, inkMute }) {
  return (
    <section style={{ marginTop: 36 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 14 }}>
        <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: inkMute, letterSpacing: '.1em' }}>0{num}</span>
        <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 600, letterSpacing: -0.4, margin: 0, color: ink }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function TripRow({ k, v, ink, inkDim, hair, last }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 18px', borderBottom: last ? 'none' : `1px solid ${hair}`, fontSize: 14 }}>
      <span style={{ color: inkDim }}>{k}</span>
      <span style={{ color: ink, fontWeight: 500 }}>{v}</span>
    </div>
  );
}

function PayRow({ active, onClick, badge, label, sub, action, onAction, ink, inkDim, hair, hair2, paper }) {
  return (
    <button onClick={onClick} className="ml-btn" style={{
      textAlign: 'left',
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '16px 18px', borderRadius: 12,
      background: active ? paper : 'transparent',
      border: `1.5px solid ${active ? ink : hair2}`,
      color: ink, fontFamily: FONT_BODY,
      transition: 'all .15s',
    }}>
      <div style={{ width: 22, height: 22, borderRadius: 11, border: `1.5px solid ${active ? ink : hair2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {active && <div style={{ width: 10, height: 10, borderRadius: 5, background: ink }}/>}
      </div>
      {badge}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: inkDim, marginTop: 2 }}>{sub}</div>}
      </div>
      {action && (
        <span onClick={(e) => { e.stopPropagation(); onAction?.(); }} style={{ fontSize: 13, fontWeight: 500, color: ink, textDecoration: 'underline', textUnderlineOffset: 3 }}>{action}</span>
      )}
    </button>
  );
}

function TInput({ label, value, hair, ink, inkMute, paper, mono }) {
  return (
    <label style={{ display: 'block', background: paper, border: `1.5px solid ${hair}`, borderRadius: 12, padding: '10px 16px 12px', cursor: 'text' }}>
      <div style={{ fontSize: 11, fontFamily: FONT_MONO, color: inkMute, textTransform: 'uppercase', letterSpacing: '.1em' }}>{label}</div>
      <input defaultValue={value} style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: 15, color: ink, fontFamily: mono ? FONT_MONO : FONT_BODY, padding: '4px 0 0', marginTop: 2 }}/>
    </label>
  );
}

function SumRow({ k, v, ink, inkDim, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: bold ? 16 : 14, color: bold ? ink : inkDim, fontWeight: bold ? 600 : 400 }}>
      <span>{k}</span><span style={{ color: ink, fontFamily: bold ? FONT_DISPLAY : FONT_BODY, letterSpacing: bold ? -0.3 : 0 }}>{v}</span>
    </div>
  );
}

function TrustItem({ icon, children, ink }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', lineHeight: 1.4 }}>
      <Icon name={icon} size={14} stroke={ink} style={{ marginTop: 1, flexShrink: 0 }}/>
      <span>{children}</span>
    </div>
  );
}

// Brand badges — restrained, not logo-flooded
function AppleBadge({ ink }) {
  return (
    <div style={{ width: 36, height: 22, borderRadius: 5, background: ink, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
      <svg width="11" height="13" viewBox="0 0 16 19" fill="currentColor"><path d="M13.4 14.3c-.8 1.6-1.7 3.2-3.2 3.3-1.5 0-1.9-.9-3.6-.9s-2.2.9-3.6.9c-1.5 0-2.5-1.7-3.3-3.3-1.6-3.2-2.9-9.1.2-13.1.9-1.1 2.2-1.8 3.6-1.9 1.4 0 2.7.9 3.6.9.9 0 2.5-1.2 4.2-1 .7 0 2.6.3 3.9 2.1-2.9 1.6-2.4 5.5.2 6.9-.1.1-.8 2-2 4.1zM9.5 3.9c.7-.8 1.1-1.9 1-3-1 .1-2.1.7-2.8 1.5-.6.7-1.1 1.8-1 2.9 1.1.1 2.1-.6 2.8-1.4z"/></svg>
    </div>
  );
}
function CardBadge() {
  return (
    <div style={{ width: 36, height: 22, borderRadius: 5, background: 'linear-gradient(135deg, #1A1F71, #0F72BA)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: FONT_MONO, fontSize: 7, fontWeight: 700, letterSpacing: '.04em' }}>VISA</div>
  );
}
function GoogleBadge() {
  return (
    <div style={{ width: 36, height: 22, borderRadius: 5, background: '#fff', border: '1px solid #E8E5DE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_BODY, fontWeight: 600, fontSize: 10, color: '#202124' }}>
      <span style={{ color: '#4285F4' }}>G</span><span style={{ color: '#EA4335' }}>o</span><span style={{ color: '#FBBC04' }}>o</span><span style={{ color: '#4285F4' }}>g</span><span style={{ color: '#34A853' }}>l</span><span style={{ color: '#EA4335' }}>e</span>
    </div>
  );
}

function BookingConfirmed({ theme, local, total, slot, hours, goto }) {
  const t = theme;
  const paper = t.name === 'Monochrome' ? t.surface : '#FAFAF7';
  const paperBg = t.name === 'Monochrome' ? t.bg : '#F3F2EE';
  const ink = t.name === 'Monochrome' ? t.text : '#0E0B08';
  const inkDim = t.name === 'Monochrome' ? t.textDim : '#6B655D';
  const inkMute = t.name === 'Monochrome' ? t.textMuted : '#9A9289';
  const hair = t.name === 'Monochrome' ? t.line : '#E8E5DE';
  const conf = 'ML-' + (1000 + Math.floor(Math.random() * 8999)) + '-KT';

  return (
    <div style={{ width: '100%', height: '100%', background: paperBg, color: ink, fontFamily: FONT_BODY, overflow: 'auto', '--ml-grad': t.grad }} className="ml-scroll">
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '80px 40px 120px', textAlign: 'center' }}>
        {/* green check — discreet, not a celebration */}
        <div className="ml-fadeup" style={{ width: 56, height: 56, borderRadius: 28, background: '#0E0B08', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
          <Icon name="check" size={24} stroke="#fff" strokeWidth={2.5}/>
        </div>
        <h1 className="ml-fadeup" style={{ fontFamily: FONT_DISPLAY, fontSize: 40, fontWeight: 600, letterSpacing: -1.2, margin: '24px 0 10px', color: ink, animationDelay: '.05s' }}>
          Request sent.
        </h1>
        <div className="ml-fadeup" style={{ fontSize: 16, color: inkDim, lineHeight: 1.5, animationDelay: '.1s' }}>
          {local.name.split(' ')[0]} has <b style={{ color: ink }}>14 minutes</b> to accept. If they can&rsquo;t, we&rsquo;ll match you with the next-best local automatically.
        </div>

        <div className="ml-fadeup" style={{ marginTop: 36, background: paper, border: `1px solid ${hair}`, borderRadius: 16, textAlign: 'left', overflow: 'hidden', animationDelay: '.18s' }}>
          <div style={{ padding: 20, borderBottom: `1px solid ${hair}`, display: 'flex', gap: 14, alignItems: 'center' }}>
            <Avatar seed={local.name} size={44} theme={t}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{local.name}</div>
              <div style={{ fontSize: 12, color: inkDim }}>{local.tagline}</div>
            </div>
            <span style={{ padding: '4px 10px', borderRadius: 100, background: '#F5F1E8', color: '#7A5A2E', fontSize: 11, fontFamily: FONT_MONO, letterSpacing: '.04em' }}>Awaiting accept</span>
          </div>
          <div style={{ padding: 20, display: 'grid', gap: 10, fontSize: 14 }}>
            <SumRow k="When" v={`Tonight · ${slot}`} ink={ink} inkDim={inkDim}/>
            <SumRow k="Duration" v={`${hours} hours`} ink={ink} inkDim={inkDim}/>
            <SumRow k="Confirmation" v={conf} ink={ink} inkDim={inkDim}/>
            <div style={{ borderTop: `1px solid ${hair}`, paddingTop: 10 }}>
              <SumRow k="Authorized" v={`$${total}`} ink={ink} inkDim={inkDim} bold/>
            </div>
          </div>
        </div>

        <div className="ml-fadeup" style={{ marginTop: 24, display: 'flex', gap: 10, animationDelay: '.25s' }}>
          <button onClick={() => goto('chat')} className="ml-btn" style={{ flex: 1, padding: '14px', borderRadius: 12, background: ink, color: paper, border: 'none', fontSize: 14, fontWeight: 600, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="chat" size={14}/> Message {local.name.split(' ')[0]}
          </button>
          <button onClick={() => goto('reviews')} className="ml-btn" style={{ flex: 1, padding: '14px', borderRadius: 12, background: 'transparent', color: ink, border: `1px solid ${hair}`, fontSize: 14, fontWeight: 500 }}>I've arrived</button>
        </div>
        <div style={{ fontSize: 12, color: inkMute, fontFamily: FONT_MONO, marginTop: 20 }}>Receipt emailed · Manage trip in Account</div>
      </div>
    </div>
  );
}

// ───────────── REVIEW / RATING ─────────────
function ReviewsScreen({ theme, goto }) {
  const t = theme;
  const [rating, setRating] = uSt(0);
  const [submitted, setSubmitted] = uSt(false);
  const [body, setBody] = uSt('');
  const tags = ['Hidden spots', 'Great food', 'Safe vibe', 'Local knowledge', 'Photography', 'Late-night'];
  const [picked, setPicked] = uSt([]);

  if (submitted) {
    return (
      <div style={{ width: '100%', height: '100%', background: t.bg, color: t.text, fontFamily: FONT_BODY, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center', '--ml-grad': t.grad }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
          {[1,2,3,4,5].map(i => <Icon key={i} name="star" size={28} stroke={t.a3} strokeWidth={2}/>)}
        </div>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 52, fontWeight: 700, letterSpacing: -1.8, margin: 0 }}>Thanks, traveler.</h1>
        <div style={{ fontSize: 17, color: t.textDim, maxWidth: 440, marginTop: 14 }}>Mika earned ${3 * 32 + 4}. Your review helps the next traveler land with someone great.</div>
        <button onClick={() => goto('home')} className="ml-btn" style={{ marginTop: 36, padding: '14px 28px', borderRadius: 100, background: t.text, color: t.bg, border: 'none', fontSize: 14, fontWeight: 600 }}>Find your next local →</button>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.text, fontFamily: FONT_BODY, overflow: 'auto', '--ml-grad': t.grad }} className="ml-scroll">
      <div style={{ padding: '20px 40px', borderBottom: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={() => goto('home')} className="ml-btn" style={iconBtn(t)}><Icon name="x" size={15}/></button>
        <div style={{ fontSize: 13, fontFamily: FONT_MONO, color: t.textDim }}>AFTER MEETUP · Leave a review</div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '56px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 56, alignItems: 'start' }}>
          <div>
            <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 56, fontWeight: 700, letterSpacing: -2, margin: 0, lineHeight: 1.02 }}>
              How was your<br/>night with <span className="ml-grad-text">Mika</span>?
            </h1>
            <div style={{ fontSize: 16, color: t.textDim, marginTop: 14 }}>3h · Ramen + vinyl + Shimokita alleys · finished 23:47</div>

            <div style={{ marginTop: 44 }}>
              <Lbl theme={t}>Overall</Lbl>
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                {[1,2,3,4,5].map(i => (
                  <button key={i} onClick={() => setRating(i)} className="ml-btn" style={{ background: 'transparent', border: 'none', padding: 6, color: rating >= i ? t.a3 : t.line2 }}>
                    <Icon name="star" size={44} stroke="currentColor" strokeWidth={1.8}/>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 32 }}>
              <Lbl theme={t}>What stood out?</Lbl>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                {tags.map(tag => {
                  const on = picked.includes(tag);
                  return (
                    <button key={tag} onClick={() => setPicked(p => on ? p.filter(x => x !== tag) : [...p, tag])} className="ml-btn" style={{ padding: '10px 14px', borderRadius: 100, background: on ? t.text : t.surface, color: on ? t.bg : t.text, border: `1px solid ${on ? t.text : t.line2}`, fontSize: 13, fontWeight: 500 }}>
                      {on && '✓ '}{tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: 32 }}>
              <Lbl theme={t}>Tell future travelers</Lbl>
              <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Mika took us to a tiny counter with 8 seats…" rows={4} style={{ width: '100%', marginTop: 12, background: t.surface, border: `1px solid ${t.line2}`, borderRadius: 12, padding: 16, color: t.text, fontSize: 15, fontFamily: FONT_BODY, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}/>
            </div>

            <button onClick={() => setSubmitted(true)} disabled={rating === 0} className="ml-btn" style={{ marginTop: 28, padding: '16px 28px', borderRadius: 14, background: rating ? t.grad : t.surface2, color: rating ? '#fff' : t.textMuted, border: 'none', fontSize: 15, fontWeight: 600, display: 'inline-flex', gap: 8, alignItems: 'center', cursor: rating ? 'pointer' : 'not-allowed', boxShadow: rating ? `0 10px 30px ${t.a1}44` : 'none' }}>
              Publish review <Icon name="arrow" size={15}/>
            </button>
          </div>

          {/* right — tip + trust */}
          <aside>
            <div style={{ background: t.surface, border: `1px solid ${t.line2}`, borderRadius: 20, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar seed="Mika T." size={52} theme={t}/>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>Tip Mika?</div>
                  <div style={{ fontSize: 12, color: t.textDim, marginTop: 2 }}>100% goes to them</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 16 }}>
                {['$5', '$10', '$20', 'Other'].map((v, i) => (
                  <button key={v} className="ml-btn" style={{ padding: '14px 0', borderRadius: 10, background: i === 1 ? t.text : t.surface2, color: i === 1 ? t.bg : t.text, border: `1px solid ${i === 1 ? t.text : t.line2}`, fontSize: 14, fontWeight: 600 }}>{v}</button>
                ))}
              </div>
            </div>

            <div style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 20, padding: 24, marginTop: 14 }}>
              <Lbl theme={t}>Trust</Lbl>
              <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                {[
                  { k: 'Anonymous to Mika', v: 'Reviews publish after both sides submit' },
                  { k: 'Earn $10 credit', v: 'Invite a friend who books their first trip' },
                  { k: 'Report a concern', v: '24/7 human support · 2 min avg' },
                ].map(it => (
                  <div key={it.k} style={{ fontSize: 13 }}>
                    <div style={{ fontWeight: 500 }}>{it.k}</div>
                    <div style={{ color: t.textDim, fontSize: 12, marginTop: 2 }}>{it.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// ───────────── ARRIVAL NOTIFICATION (for LOCAL) ─────────────
function ArrivalScreen({ theme, goto }) {
  const t = theme;
  const [accepted, setAccepted] = uSt(false);

  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.text, fontFamily: FONT_BODY, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', '--ml-grad': t.grad }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(800px 500px at 80% 0%, ${t.a1}2a, transparent 60%), radial-gradient(800px 500px at 0% 80%, ${t.a2}20, transparent 60%)` }}/>

      <div style={{ position: 'relative', padding: '20px 40px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: `1px solid ${t.line}` }}>
        <button onClick={() => goto('home')} className="ml-btn" style={iconBtn(t)}><Icon name="arrowLeft" size={15}/></button>
        <div style={{ fontSize: 13, fontFamily: FONT_MONO, color: t.textDim }}>LOCAL DASHBOARD · Mika (you)</div>
        <div style={{ flex: 1 }}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontFamily: FONT_MONO, color: t.textDim }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: '#4ADE80' }}/> Available tonight
        </div>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', position: 'relative' }}>
        {/* LEFT — incoming card */}
        <div style={{ padding: '56px 48px', borderRight: `1px solid ${t.line}` }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 100, background: t.surface, border: `1px solid ${t.a1}44`, fontSize: 11, fontFamily: FONT_MONO, color: t.a1, textTransform: 'uppercase', letterSpacing: '.08em' }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: t.a1, animation: 'ml-pulse 1.2s infinite' }}/>
            Incoming · 00:14 to accept
          </div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 44, fontWeight: 700, letterSpacing: -1.4, margin: '22px 0 0', lineHeight: 1.05 }}>
            A traveler<br/>just landed<br/><span className="ml-grad-text">5.2 km away.</span>
          </h1>

          <div style={{ marginTop: 36, background: t.surface, border: `1px solid ${t.line2}`, borderRadius: 18, padding: 22 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <Avatar seed="Priya K" size={52} theme={t} ring/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 600 }}>Priya K.</div>
                <div style={{ fontSize: 12, color: t.textDim, fontFamily: FONT_MONO }}>San Francisco → Tokyo · 4 days</div>
              </div>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: 13 }}>
                <Icon name="star" size={13} stroke={t.a3}/> 4.9 <span style={{ color: t.textDim }}>· 12 trips</span>
              </div>
            </div>
            <div style={{ marginTop: 18, padding: '14px 16px', background: t.surface2, borderRadius: 12, fontSize: 14, lineHeight: 1.5, color: t.text }}>
              "Hi! Love your vinyl + ramen combo. Available tonight from 8? Vegetarian-friendly ideally 🙏"
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 10, fontSize: 12, flexWrap: 'wrap' }}>
              <Tag theme={t} icon="clock">Tonight · 8 PM · 3h</Tag>
              <Tag theme={t} icon="pin">Start: Shinjuku Stn</Tag>
              <Tag theme={t} icon="wallet">$96 · you keep $76.80</Tag>
            </div>
          </div>

          <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
            <button onClick={() => setAccepted(true)} className="ml-btn" style={{ flex: 2, padding: '16px', borderRadius: 14, background: t.grad, color: '#fff', border: 'none', fontSize: 15, fontWeight: 600, boxShadow: `0 10px 30px ${t.a1}44`, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
              {accepted ? <><Icon name="check" size={16}/> Accepted — see you at 8</> : <>Accept · lock tonight</>}
            </button>
            <button className="ml-btn" style={{ flex: 1, padding: '16px', borderRadius: 14, background: 'transparent', color: t.text, border: `1px solid ${t.line2}`, fontSize: 14, fontWeight: 500 }}>Counter</button>
            <button className="ml-btn" style={{ padding: '16px', borderRadius: 14, background: 'transparent', color: t.textDim, border: `1px solid ${t.line2}`, fontSize: 14 }}>Pass</button>
          </div>
        </div>

        {/* RIGHT — earnings + queue */}
        <div style={{ padding: '56px 48px', background: t.bg2 }}>
          <Lbl theme={t}>This week</Lbl>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 72, fontWeight: 700, letterSpacing: -2.5, margin: '8px 0', lineHeight: 1 }}>
            $<span className="ml-grad-text">428</span><span style={{ fontSize: 28, color: t.textDim, fontWeight: 500 }}>.50</span>
          </div>
          <div style={{ fontSize: 13, color: t.textDim, display: 'flex', gap: 16 }}>
            <span><span style={{ color: '#4ADE80' }}>↑ 18%</span> vs last wk</span>
            <span>·</span>
            <span>6 meetups · 14h</span>
          </div>

          {/* sparkline */}
          <svg viewBox="0 0 300 60" style={{ width: '100%', height: 60, marginTop: 16 }}>
            <defs>
              <linearGradient id="spark" x1="0" x2="1"><stop offset="0" stopColor={t.a3}/><stop offset=".5" stopColor={t.a1}/><stop offset="1" stopColor={t.a2}/></linearGradient>
            </defs>
            <path d="M0 40 L30 35 L60 44 L90 28 L120 30 L150 22 L180 26 L210 14 L240 18 L270 8 L300 12" stroke="url(#spark)" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <path d="M0 40 L30 35 L60 44 L90 28 L120 30 L150 22 L180 26 L210 14 L240 18 L270 8 L300 12 L300 60 L0 60 Z" fill="url(#spark)" opacity=".1"/>
          </svg>

          <div style={{ marginTop: 32 }}>
            <Lbl theme={t}>Upcoming this week</Lbl>
            <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
              {[
                { d: 'Tonight · 8 PM', who: 'Priya K.', what: 'Ramen + vinyl', v: '$96', on: true },
                { d: 'Thu · 7 PM', who: 'Tom B.', what: 'Jazz kissa walk', v: '$64' },
                { d: 'Sat · 11 AM', who: 'Ana G. +1', what: 'Market + coffee', v: '$128' },
              ].map((it, i) => (
                <div key={i} style={{ background: t.surface, border: `1px solid ${it.on ? t.a1 : t.line}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ fontSize: 11, fontFamily: FONT_MONO, color: it.on ? t.a1 : t.textDim, width: 110, textTransform: 'uppercase', letterSpacing: '.06em' }}>{it.d}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{it.who}</div>
                    <div style={{ fontSize: 12, color: t.textDim }}>{it.what}</div>
                  </div>
                  <div style={{ fontSize: 14, fontFamily: FONT_MONO, fontWeight: 600 }}>{it.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 28, background: t.surface, border: `1px solid ${t.line}`, borderRadius: 14, padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: t.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.a3 }}><Icon name="lightning" size={18}/></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>3 more travelers arriving Fri–Sun</div>
              <div style={{ fontSize: 11, color: t.textDim, marginTop: 2 }}>Turn on <b>Auto-accept</b> to claim your next 2 slots instantly</div>
            </div>
            <div style={{ width: 38, height: 22, borderRadius: 11, background: t.grad, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: 9, background: '#fff' }}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ChatScreen, BookingScreen, ReviewsScreen, ArrivalScreen });
