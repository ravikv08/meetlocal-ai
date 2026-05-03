// ─────────────────────────────────────────────────────────────────────
// MEETING SPOT PICKER
// Airbnb-style spot picker: search input + category chips + result cards.
// Each spot is a vetted public place — coffee, hotel lobby, plaza, museum.
// Reinforces the "Starbucks Rule" safety thesis.
// ─────────────────────────────────────────────────────────────────────
const { useState: uSt2 } = React;

function MeetingSpotPicker({ theme, goto, state, setState }) {
  const t = theme;
  const local = LOCALS.find(l => l.id === state.activeLocal) || LOCALS[0];
  const city = local.city;
  const allSpots = MEETING_SPOTS[city] || [];

  const [query, setQuery] = uSt2('');
  const [cat, setCat] = uSt2('all');
  const [picked, setPicked] = uSt2(state.meetingSpot?.id || (defaultSpotFor(city)?.id ?? null));

  // Paper surface — matches Booking
  const paper   = t.name === 'Monochrome' ? t.surface  : '#FAFAF7';
  const paperBg = t.name === 'Monochrome' ? t.bg       : '#F3F2EE';
  const ink     = t.name === 'Monochrome' ? t.text     : '#0E0B08';
  const inkDim  = t.name === 'Monochrome' ? t.textDim  : '#6B655D';
  const inkMute = t.name === 'Monochrome' ? t.textMuted: '#9A9289';
  const hair    = t.name === 'Monochrome' ? t.line     : '#E8E5DE';
  const hair2   = t.name === 'Monochrome' ? t.line2    : '#D6D2C8';

  const q = query.trim().toLowerCase();
  const filtered = allSpots.filter(s => {
    if (cat !== 'all' && s.cat !== cat) return false;
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.area.toLowerCase().includes(q) ||
      (s.cat === 'coffee' && 'coffee café cafe'.includes(q)) ||
      (s.chain && 'starbucks'.includes(q))
    );
  });

  const confirm = (spot) => {
    setState({ ...state, meetingSpot: spot });
    goto('booking');
  };

  return (
    <div style={{ width: '100%', height: '100%', background: paperBg, color: ink, fontFamily: FONT_BODY, overflow: 'auto', '--ml-grad': t.grad }} className="ml-scroll">
      {/* slim top bar */}
      <div style={{ padding: '18px 40px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: `1px solid ${hair}`, background: paperBg, position: 'sticky', top: 0, zIndex: 5 }}>
        <button onClick={() => goto('booking')} className="ml-btn" style={{ width: 34, height: 34, borderRadius: 17, background: 'transparent', border: `1px solid ${hair2}`, color: ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="arrowLeft" size={15}/>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: inkDim }}>
          <Logo theme={{ ...t, text: ink }}/>
          <span style={{ width: 1, height: 14, background: hair2, margin: '0 10px' }}/>
          <span style={{ fontFamily: FONT_MONO, fontSize: 12 }}>Pick a meeting spot</span>
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: inkDim, fontFamily: FONT_MONO }}>
          <Icon name="shield" size={13}/> All spots are public, well-lit & verified
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 40px 120px' }}>
        <div style={{ fontSize: 12, fontFamily: FONT_MONO, color: inkMute, textTransform: 'uppercase', letterSpacing: '.12em' }}>● Step 1 of checkout</div>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 48, fontWeight: 600, letterSpacing: -1.4, margin: '8px 0 0', color: ink, lineHeight: 1.04 }}>
          Where will you meet {local.name.split(' ')[0]}?
        </h1>
        <p style={{ fontSize: 15, color: inkDim, marginTop: 12, maxWidth: 620, lineHeight: 1.5 }}>
          Pick a public, well-lit place for your first meetup. <b style={{ color: ink }}>The Starbucks Rule:</b> always meet in public for the first session — switch to private only after you both feel safe.
        </p>

        {/* Search bar — Airbnb-style pill */}
        <div style={{ marginTop: 28, background: paper, border: `1.5px solid ${hair2}`, borderRadius: 100, padding: 6, display: 'flex', alignItems: 'center', gap: 4, maxWidth: 720, boxShadow: '0 6px 20px rgba(0,0,0,.04)' }}>
          <div style={{ flex: 1, padding: '10px 22px', borderRight: `1px solid ${hair}` }}>
            <div style={{ fontSize: 11, fontFamily: FONT_MONO, color: inkMute, letterSpacing: '.08em' }}>CITY</div>
            <div style={{ fontSize: 14, color: ink, fontWeight: 500, marginTop: 2 }}>{city} · {local.neighborhood}</div>
          </div>
          <div style={{ flex: 1.4, padding: '10px 22px' }}>
            <div style={{ fontSize: 11, fontFamily: FONT_MONO, color: inkMute, letterSpacing: '.08em' }}>SEARCH</div>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Spot name, neighborhood, or zip…"
              style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: ink, fontFamily: FONT_BODY, padding: '4px 0 0', marginTop: 2 }}
            />
          </div>
          <button className="ml-btn" style={{ padding: '14px 22px', borderRadius: 100, background: ink, color: paper, border: 'none', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="search" size={14} stroke={paper}/> Search
          </button>
        </div>

        {/* Category chips */}
        <div style={{ marginTop: 28, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SPOT_CATS.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)} className="ml-btn" style={{
              padding: '10px 18px', borderRadius: 100,
              background: cat === c.id ? ink : 'transparent',
              color: cat === c.id ? paper : ink,
              border: `1px solid ${cat === c.id ? ink : hair2}`,
              fontSize: 13, fontWeight: 500,
            }}>{c.label}</button>
          ))}
        </div>

        {/* result count */}
        <div style={{ marginTop: 28, fontSize: 13, color: inkDim, fontFamily: FONT_MONO, letterSpacing: '.04em', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>{filtered.length} {filtered.length === 1 ? 'spot' : 'spots'} in {city}</span>
          <span>·</span>
          <span>Sorted by walk distance from {local.name.split(' ')[0]}</span>
        </div>

        {/* Result cards */}
        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {filtered.map(s => (
            <SpotCard
              key={s.id}
              spot={s}
              localName={local.name.split(' ')[0]}
              picked={picked === s.id}
              onPick={() => setPicked(s.id)}
              onConfirm={() => confirm(s)}
              ink={ink} inkDim={inkDim} inkMute={inkMute} hair={hair} hair2={hair2} paper={paper}
              theme={t}
            />
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center', background: paper, border: `1px dashed ${hair2}`, borderRadius: 16, color: inkDim, fontSize: 14 }}>
              No spots match. Try a different category or clear your search.
            </div>
          )}
        </div>

        {/* sticky confirm bar */}
        {picked && (
          <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: ink, color: paper, padding: '14px 14px 14px 24px', borderRadius: 100, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 18px 50px rgba(0,0,0,.25), 0 4px 12px rgba(0,0,0,.15)', zIndex: 10, maxWidth: 'calc(100% - 80px)' }}>
            <Icon name="pin" size={14} stroke={paper}/>
            <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 320 }}>
              {allSpots.find(s => s.id === picked)?.name}
            </div>
            <button onClick={() => confirm(allSpots.find(s => s.id === picked))} className="ml-btn" style={{ padding: '10px 20px', borderRadius: 100, background: paper, color: ink, border: 'none', fontSize: 13, fontWeight: 600 }}>
              Use this spot →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────── one result card ───────
function SpotCard({ spot, localName, picked, onPick, onConfirm, ink, inkDim, inkMute, hair, hair2, paper, theme }) {
  const t = theme;
  // Coloured photo placeholder driven by category
  const catColor = {
    coffee:  '#0E7C42',  // Starbucks-ish green
    hotel:   '#8B6F47',  // warm
    plaza:   '#7B6CD9',  // public
    museum:  '#C44545',  // museum red
    book:    '#2A4A8A',  // ink blue
    station: '#5B5B5B',  // grey
  }[spot.cat] || ink;

  const catGlyph = {
    coffee: '★', hotel: '◆', plaza: '●', museum: '◇', book: '▤', station: '⚏',
  }[spot.cat] || '●';

  const catLabel = SPOT_CATS.find(c => c.id === spot.cat)?.label.replace(/s$/, '') || 'Spot';

  return (
    <button onClick={onPick} className="ml-btn" style={{
      textAlign: 'left', background: paper, border: `1.5px solid ${picked ? ink : hair}`,
      borderRadius: 18, overflow: 'hidden', display: 'flex', flexDirection: 'column',
      transition: 'all .15s', cursor: 'pointer',
      transform: picked ? 'translateY(-2px)' : 'none',
      boxShadow: picked ? '0 12px 32px rgba(0,0,0,.08)' : 'none',
    }}>
      {/* Photo placeholder */}
      <div style={{ position: 'relative', height: 160, background: `linear-gradient(135deg, ${catColor} 0%, ${catColor}aa 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(45deg, transparent 0 14px, rgba(255,255,255,.04) 14px 28px)` }}/>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 64, color: '#fff', opacity: 0.35, fontWeight: 700 }}>{catGlyph}</div>

        {/* badges */}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
          {spot.chain && (
            <div style={{ padding: '5px 10px', background: 'rgba(255,255,255,.95)', color: ink, borderRadius: 100, fontSize: 11, fontWeight: 600, letterSpacing: '.02em' }}>
              ★ Starbucks Rule
            </div>
          )}
          {spot.popular && !spot.chain && (
            <div style={{ padding: '5px 10px', background: 'rgba(255,255,255,.95)', color: ink, borderRadius: 100, fontSize: 11, fontWeight: 600, letterSpacing: '.02em' }}>
              Popular
            </div>
          )}
        </div>
        <div style={{ position: 'absolute', top: 12, right: 12, padding: '5px 10px', background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(6px)', color: '#fff', borderRadius: 100, fontSize: 11, fontWeight: 500, fontFamily: FONT_MONO, textTransform: 'capitalize' }}>
          {catLabel}
        </div>

        {picked && (
          <div style={{ position: 'absolute', bottom: 12, right: 12, width: 32, height: 32, borderRadius: 16, background: ink, color: paper, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,.3)' }}>
            <Icon name="check" size={15} stroke={paper}/>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: 18, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: ink, letterSpacing: -0.2 }}>{spot.name}</div>
            <div style={{ fontSize: 13, color: inkDim, marginTop: 2 }}>{spot.area}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: ink, fontWeight: 500 }}>
            <Icon name="star" size={12} stroke={ink}/>
            {spot.rating}
          </div>
        </div>

        {/* meta row */}
        <div style={{ display: 'flex', gap: 14, marginTop: 12, fontSize: 12, color: inkDim, fontFamily: FONT_MONO, letterSpacing: '.02em' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="pin" size={11}/> {spot.walk} min from {localName}</span>
          <span>·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="clock" size={11}/> {spot.hours}</span>
        </div>

        {/* busy bar */}
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: inkMute, fontFamily: FONT_MONO, letterSpacing: '.06em', marginBottom: 5 }}>
            <span>BUSY NOW</span>
            <span style={{ color: spot.busy > 0.7 ? '#0E7C42' : (spot.busy > 0.4 ? ink : inkDim) }}>
              {spot.busy > 0.8 ? 'Very busy' : spot.busy > 0.6 ? 'Busy' : spot.busy > 0.4 ? 'Moderate' : 'Quiet'}
            </span>
          </div>
          <div style={{ height: 4, background: hair, borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${spot.busy * 100}%`, height: '100%', background: spot.busy > 0.7 ? '#0E7C42' : ink, borderRadius: 2 }}/>
          </div>
        </div>

        {/* safety tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 14 }}>
          {spot.safety.map(tag => (
            <span key={tag} style={{ fontSize: 11, padding: '3px 8px', background: 'transparent', border: `1px solid ${hair2}`, color: inkDim, borderRadius: 100, fontFamily: FONT_MONO, letterSpacing: '.02em' }}>
              <Icon name="shield" size={9}/> {tag}
            </span>
          ))}
        </div>

        <div style={{ flex: 1 }}/>

        {/* CTA row */}
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <button onClick={(e) => { e.stopPropagation(); onConfirm(); }} className="ml-btn" style={{ flex: 1, padding: '11px', borderRadius: 10, background: picked ? ink : 'transparent', color: picked ? paper : ink, border: `1.5px solid ${picked ? ink : hair2}`, fontSize: 13, fontWeight: 600 }}>
            {picked ? 'Use this spot →' : 'Select'}
          </button>
        </div>
      </div>
    </button>
  );
}

Object.assign(window, { MeetingSpotPicker });
