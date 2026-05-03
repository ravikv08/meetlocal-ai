// Reels overlays — Comments drawer, Share sheet, Creator peek, Why am I seeing this,
// Create composer, Daily streak toast. All pure React, no external deps.

const RO_uS = React.useState, RO_uE = React.useEffect, RO_uR = React.useRef;

// ---------- Comments Drawer ----------
function CommentsDrawer({ reel, theme, onClose }) {
  const t = theme;
  const [list, setList] = RO_uS(() => (REEL_COMMENTS[reel.id] || []).slice());
  const [draft, setDraft] = RO_uS('');
  const [sort, setSort] = RO_uS('top'); // 'top' | 'new'
  const inputRef = RO_uR(null);

  RO_uE(() => { inputRef.current?.focus(); }, []);

  const sorted = React.useMemo(() => {
    const a = list.slice();
    if (sort === 'top') a.sort((x, y) => (y.likes || 0) - (x.likes || 0));
    return a;
  }, [list, sort]);

  const send = () => {
    const body = draft.trim();
    if (!body) return;
    setList(l => [{ u: 'you', avatar: 'You', t: 'now', body, likes: 0, mine: true }, ...l]);
    setDraft('');
  };

  return (
    <div className="ml-fadeup" onClick={onClose} style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,.55)',
      zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxWidth: 560, maxHeight: '78%',
        background: '#111', borderTopLeftRadius: 20, borderTopRightRadius: 20,
        display: 'flex', flexDirection: 'column',
        color: '#fff', fontFamily: FONT_BODY,
        border: '1px solid rgba(255,255,255,.08)',
      }}>
        {/* handle + header */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 6px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.2)' }}/>
        </div>
        <div style={{ padding: '8px 20px 12px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{list.length.toLocaleString()} comments</div>
          <div style={{ flex: 1 }}/>
          {['top', 'new'].map(k => (
            <button key={k} onClick={() => setSort(k)} className="ml-btn" style={{
              padding: '4px 10px', borderRadius: 100, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em',
              fontFamily: FONT_MONO, background: sort === k ? 'rgba(255,255,255,.12)' : 'transparent',
              color: sort === k ? '#fff' : 'rgba(255,255,255,.5)', border: '1px solid rgba(255,255,255,.1)',
            }}>{k}</button>
          ))}
          <button onClick={onClose} className="ml-btn" style={iconSm}>×</button>
        </div>

        {/* list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
          {sorted.map((c, i) => (
            <CommentRow key={i} c={c} theme={t}/>
          ))}
        </div>

        {/* composer */}
        <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,.06)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <Avatar seed="You" size={32} theme={t}/>
          <input ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder={`Reply to @${reel.city.toLowerCase()}…`}
            style={{
              flex: 1, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
              color: '#fff', borderRadius: 100, padding: '10px 14px', fontSize: 13, outline: 'none',
              fontFamily: FONT_BODY,
            }}/>
          <button onClick={send} className="ml-btn" style={{
            padding: '10px 16px', borderRadius: 100, background: draft.trim() ? t.grad : 'rgba(255,255,255,.08)',
            color: '#fff', border: 'none', fontSize: 13, fontWeight: 600,
          }}>Send</button>
        </div>
      </div>
    </div>
  );
}

function CommentRow({ c, theme }) {
  const [liked, setLiked] = RO_uS(false);
  return (
    <div style={{ display: 'flex', gap: 10, padding: '10px 20px', alignItems: 'flex-start' }}>
      <Avatar seed={c.avatar} size={32} theme={theme}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>@{c.u}</span>
          {c.verified && <span style={{ color: '#60a5fa', fontSize: 11 }}>✓</span>}
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>· {c.t}</span>
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.35, color: c.mine ? '#ffcc80' : 'rgba(255,255,255,.92)' }}>{c.body}</div>
        <div style={{ display: 'flex', gap: 14, marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,.5)', fontFamily: FONT_MONO }}>
          <button onClick={() => setLiked(l => !l)} className="ml-btn" style={{ background: 'transparent', border: 'none', color: liked ? '#ff4f87' : 'rgba(255,255,255,.5)', padding: 0, fontSize: 11 }}>
            {liked ? '♥' : '♡'} {(c.likes || 0) + (liked ? 1 : 0)}
          </button>
          <button className="ml-btn" style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,.5)', padding: 0, fontSize: 11 }}>Reply</button>
        </div>
        {c.reply && (
          <div style={{ marginTop: 8, padding: 10, background: 'rgba(255,255,255,.03)', borderRadius: 8, fontSize: 12, color: 'rgba(255,255,255,.75)', borderLeft: '2px solid rgba(255,255,255,.15)' }}>
            <span style={{ color: '#ffcc80', fontWeight: 600 }}>@creator</span> · {c.reply}
          </div>
        )}
      </div>
    </div>
  );
}

const iconSm = {
  width: 28, height: 28, borderRadius: 14, background: 'rgba(255,255,255,.08)',
  border: 'none', color: '#fff', fontSize: 18, lineHeight: '26px',
};

// ---------- Share Sheet ----------
function ShareSheet({ reel, theme, onShare, onClose }) {
  const t = theme;
  const channels = [
    { id: 'wa', label: 'WhatsApp', color: '#25D366', glyph: 'W' },
    { id: 'ig', label: 'Instagram', grad: 'linear-gradient(135deg,#833AB4,#FD1D1D,#F77737)', glyph: 'IG' },
    { id: 'x',  label: 'X',        color: '#000', stroke: '#fff', glyph: '𝕏' },
    { id: 'tg', label: 'Telegram', color: '#2AABEE', glyph: 'T' },
    { id: 'fb', label: 'Facebook', color: '#1877F2', glyph: 'f' },
    { id: 'sms',label: 'Messages', color: '#34C759', glyph: '💬' },
    { id: 'mail',label: 'Email',    color: '#6b7280', glyph: '@' },
    { id: 'copy',label: 'Copy link',color: '#222', stroke: '#fff', glyph: '🔗' },
  ];
  const link = `meetlocal.ai/r/${reel.id}`;

  return (
    <div className="ml-fadeup" onClick={onClose} style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 50,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxWidth: 560, background: '#111',
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        color: '#fff', fontFamily: FONT_BODY, padding: '8px 0 22px',
        border: '1px solid rgba(255,255,255,.08)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.2)' }}/>
        </div>
        <div style={{ padding: '10px 22px 14px', fontSize: 15, fontWeight: 600 }}>Share reel</div>

        {/* channel rail */}
        <div style={{ display: 'flex', gap: 18, padding: '4px 22px 16px', overflowX: 'auto' }} className="ml-reels-feed">
          {channels.map(c => (
            <button key={c.id} onClick={() => onShare(c.label)} className="ml-btn" style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              background: 'transparent', border: 'none', color: '#fff', flexShrink: 0,
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 26,
                background: c.grad || c.color, border: c.stroke ? `1.5px solid ${c.stroke}` : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 700, color: '#fff',
              }}>{c.glyph}</div>
              <div style={{ fontSize: 11 }}>{c.label}</div>
            </button>
          ))}
        </div>

        {/* link pill */}
        <div style={{ margin: '0 22px', padding: '12px 14px', background: 'rgba(255,255,255,.05)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, border: '1px solid rgba(255,255,255,.08)' }}>
          <Icon name="share" size={14}/>
          <div style={{ flex: 1, fontFamily: FONT_MONO, fontSize: 12, color: 'rgba(255,255,255,.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link}</div>
          <button onClick={() => onShare('Copy link')} className="ml-btn" style={{
            padding: '6px 12px', borderRadius: 100, background: '#fff', color: '#000',
            border: 'none', fontSize: 11, fontWeight: 600, fontFamily: FONT_MONO,
          }}>Copy</button>
        </div>

        {/* actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '14px 22px 0' }}>
          <SheetAction icon="bookmark" label="Save to list" onClick={() => onShare('Saved to list')}/>
          <SheetAction icon="flash" label="Remix this reel" onClick={() => onShare('Remix started')}/>
          <SheetAction icon="chat" label="Send in DM" onClick={() => onShare('DM opened')}/>
          <SheetAction icon="pin" label="Add to trip" onClick={() => onShare('Added to trip')}/>
        </div>
      </div>
    </div>
  );
}

function SheetAction({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="ml-btn" style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,.04)',
      border: '1px solid rgba(255,255,255,.08)', color: '#fff',
      fontSize: 13, fontWeight: 500,
    }}>
      <Icon name={icon} size={15}/> {label}
    </button>
  );
}

// ---------- Creator Peek ----------
function CreatorPeek({ reel, local, theme, onClose, onViewProfile, onChat, onFollow, following }) {
  const t = theme;
  const stats = [
    { k: 'Reels', v: '34' },
    { k: 'Followers', v: '12.4k' },
    { k: 'Rating', v: '4.98' },
    { k: 'Response', v: '< 2h' },
  ];
  return (
    <div className="ml-fadeup" onClick={onClose} style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 50,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxWidth: 560, background: '#111',
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        color: '#fff', fontFamily: FONT_BODY, padding: '16px 22px 22px',
        border: '1px solid rgba(255,255,255,.08)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.2)' }}/>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar seed={local?.name || reel.localId} size={68} theme={t} ring/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{local?.name || 'Local'}</div>
              <ResidencyBadge local={local} theme={t} size="sm"/>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', marginTop: 2, fontFamily: FONT_MONO }}>
              @{(local?.name || '').split(' ')[0].toLowerCase()}_{reel.city.toLowerCase().replace(/\s/g, '')}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', marginTop: 6 }}>
              {reel.city} · {reel.neighborhood} · ${reel.bookRate}/h
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, margin: '18px 0', padding: '14px 0', borderTop: '1px solid rgba(255,255,255,.06)', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          {stats.map(s => (
            <div key={s.k} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 600, fontFamily: FONT_DISPLAY }}>{s.v}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: FONT_MONO, marginTop: 2 }}>{s.k}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <button onClick={onFollow} className="ml-btn" style={{
            padding: '12px', borderRadius: 12, background: following ? 'rgba(255,255,255,.08)' : '#fff',
            color: following ? '#fff' : '#000', border: '1px solid rgba(255,255,255,.1)',
            fontSize: 13, fontWeight: 600,
          }}>{following ? '✓ Following' : '+ Follow'}</button>
          <button onClick={onChat} className="ml-btn" style={{
            padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,.06)', color: '#fff',
            border: '1px solid rgba(255,255,255,.08)', fontSize: 13, fontWeight: 500,
          }}>Message</button>
          <button onClick={onViewProfile} className="ml-btn" style={{
            padding: '12px', borderRadius: 12, background: t.grad, color: '#fff',
            border: 'none', fontSize: 13, fontWeight: 600,
          }}>View profile</button>
        </div>
      </div>
    </div>
  );
}

// ---------- Why am I seeing this ----------
function WhyPanel({ reel, theme, onClose }) {
  const t = theme;
  return (
    <div className="ml-fadeup" onClick={onClose} style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxWidth: 420, background: '#0c0c0c',
        borderRadius: 18, border: '1px solid rgba(255,255,255,.08)',
        color: '#fff', fontFamily: FONT_BODY, padding: 22,
      }}>
        <div style={{ fontSize: 11, fontFamily: FONT_MONO, letterSpacing: '.12em', textTransform: 'uppercase', color: t.a2, marginBottom: 8 }}>Why you're seeing this</div>
        <div style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.3, marginBottom: 18 }}>
          Your feed is tuned by 3 signals — and it's working.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(reel.reasons || []).map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: 14, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontFamily: FONT_MONO, color: t.a2, flexShrink: 0 }}>{i+1}</div>
              <div style={{ fontSize: 14, lineHeight: 1.4, color: 'rgba(255,255,255,.9)', paddingTop: 4 }}>{r}</div>
            </div>
          ))}
        </div>

        <div style={{ margin: '22px 0 0', padding: 16, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', marginBottom: 10, fontFamily: FONT_MONO, letterSpacing: '.05em', textTransform: 'uppercase' }}>Adjust</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['More like this', 'Less ' + (reel.tags[0] || 'this'), 'Hide creator', 'Not interested'].map(x => (
              <button key={x} className="ml-btn" style={{
                padding: '6px 10px', borderRadius: 100, fontSize: 11,
                background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', color: '#fff',
              }}>{x}</button>
            ))}
          </div>
        </div>

        <button onClick={onClose} className="ml-btn" style={{
          marginTop: 18, width: '100%', padding: 12, borderRadius: 12,
          background: '#fff', color: '#000', border: 'none', fontSize: 13, fontWeight: 600,
        }}>Got it</button>
      </div>
    </div>
  );
}

// ---------- Create Composer ----------
function ReelComposer({ theme, onClose, onPost }) {
  const t = theme;
  const [step, setStep] = RO_uS('pick'); // pick -> template -> details -> posting -> done
  const [template, setTemplate] = RO_uS(null);
  const [caption, setCaption] = RO_uS('');
  const [location, setLocation] = RO_uS('');
  const [tags, setTags] = RO_uS('');
  const [category, setCategory] = RO_uS('food');
  const [progress, setProgress] = RO_uS(0);

  const templates = [
    { id: 'hidden', label: 'Hidden spot', sub: '3 clips · 20s', hue: 220 },
    { id: 'ba',     label: 'Before/After', sub: '2 clips · 15s', hue: 310 },
    { id: 'tour',   label: 'Day in the life', sub: '5 clips · 30s', hue: 28 },
    { id: 'food',   label: 'Food drop',    sub: '3 clips · 18s', hue: 14 },
    { id: 'pov',    label: 'POV walk',     sub: '1 clip · 25s', hue: 200 },
    { id: 'blank',  label: 'Start from scratch', sub: 'Custom', hue: 0 },
  ];

  RO_uE(() => {
    if (step !== 'posting') return;
    let p = 0;
    const id = setInterval(() => {
      p += 7 + Math.random() * 10;
      setProgress(Math.min(100, p));
      if (p >= 100) { clearInterval(id); setTimeout(() => setStep('done'), 350); }
    }, 140);
    return () => clearInterval(id);
  }, [step]);

  return (
    <div style={{
      position: 'absolute', inset: 0, background: '#000', zIndex: 60,
      color: '#fff', fontFamily: FONT_BODY, display: 'flex', flexDirection: 'column',
    }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <button onClick={onClose} className="ml-btn" style={iconSm}>×</button>
        <div style={{ fontSize: 15, fontWeight: 600 }}>
          {step === 'pick' ? 'Create a reel' : step === 'template' ? 'Pick a template' : step === 'details' ? 'Add details' : step === 'posting' ? 'Publishing…' : 'Live'}
        </div>
        <div style={{ flex: 1 }}/>
        {step === 'details' && (
          <button onClick={() => setStep('posting')} className="ml-btn" style={{
            padding: '8px 16px', borderRadius: 100, background: t.grad, color: '#fff',
            border: 'none', fontSize: 13, fontWeight: 600,
          }}>Post</button>
        )}
      </div>

      {/* body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '22px' }} className="ml-reels-feed">
        {step === 'pick' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 560, margin: '0 auto' }}>
            <SourceCard icon="📷" title="Camera" sub="Record in-app" theme={t} onClick={() => setStep('template')}/>
            <SourceCard icon="🎞" title="Upload" sub="From library" theme={t} onClick={() => setStep('template')}/>
            <SourceCard icon="✨" title="From a trip" sub="Auto-assemble" theme={t} onClick={() => setStep('template')}/>
            <SourceCard icon="🗺" title="Location-first" sub="Pin a spot, add clips" theme={t} onClick={() => setStep('template')}/>
          </div>
        )}

        {step === 'template' && (
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', marginBottom: 10, fontFamily: FONT_MONO, textTransform: 'uppercase', letterSpacing: '.08em' }}>Templates that perform</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {templates.map(tp => (
                <button key={tp.id} onClick={() => { setTemplate(tp); setStep('details'); }} className="ml-btn" style={{
                  padding: 0, borderRadius: 14, border: `1px solid ${template?.id === tp.id ? t.a1 : 'rgba(255,255,255,.08)'}`,
                  background: '#0c0c0c', color: '#fff', textAlign: 'left', overflow: 'hidden',
                }}>
                  <div style={{ height: 110, background: `linear-gradient(135deg, hsl(${tp.hue}, 70%, 45%) 0%, hsl(${(tp.hue+40)%360}, 60%, 25%) 100%)`, position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,.25), transparent 60%)' }}/>
                    <div style={{ position: 'absolute', bottom: 10, right: 10, fontFamily: FONT_MONO, fontSize: 10, color: 'rgba(255,255,255,.8)', padding: '3px 8px', borderRadius: 100, background: 'rgba(0,0,0,.3)' }}>TEMPLATE</div>
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{tp.label}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', marginTop: 3, fontFamily: FONT_MONO }}>{tp.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'details' && (
          <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* preview */}
            <div style={{ height: 180, borderRadius: 14, background: `linear-gradient(135deg, hsl(${template?.hue || 20}, 70%, 45%) 0%, hsl(${((template?.hue || 20)+40)%360}, 60%, 25%) 100%)`, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,.05) 20px, rgba(255,255,255,.05) 21px)' }}/>
              <div style={{ position: 'absolute', bottom: 14, left: 14, fontSize: 12, fontFamily: FONT_MONO, color: 'rgba(255,255,255,.9)' }}>0:{String(template?.id === 'ba' ? 15 : 22).padStart(2, '0')} · {template?.label || 'Custom'}</div>
              <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 6 }}>
                {['Trim','Music','FX','Text'].map(x => (
                  <button key={x} className="ml-btn" style={{ padding: '6px 10px', borderRadius: 100, background: 'rgba(0,0,0,.45)', border: '1px solid rgba(255,255,255,.15)', color: '#fff', fontSize: 11 }}>{x}</button>
                ))}
              </div>
            </div>

            {/* caption */}
            <div>
              <Label>Caption</Label>
              <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={3}
                placeholder="The spice souk at 7am before the tour buses…"
                style={{ width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: '#fff', borderRadius: 12, padding: 12, fontSize: 13, fontFamily: FONT_BODY, resize: 'vertical', outline: 'none' }}/>
            </div>

            {/* location */}
            <div>
              <Label>Location</Label>
              <div style={{ position: 'relative' }}>
                <input value={location} onChange={(e) => setLocation(e.target.value)}
                  placeholder="Auto-detect · or type an address"
                  style={{ width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: '#fff', borderRadius: 12, padding: '12px 14px 12px 40px', fontSize: 13, outline: 'none' }}/>
                <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}><Icon name="pin" size={14}/></div>
                <button onClick={() => setLocation('Detected · Karaköy, Istanbul')} className="ml-btn" style={{
                  position: 'absolute', right: 6, top: 6, bottom: 6, padding: '0 12px', borderRadius: 100,
                  background: 'rgba(255,255,255,.08)', border: 'none', color: '#fff', fontSize: 11, fontFamily: FONT_MONO,
                }}>Use GPS</button>
              </div>
            </div>

            {/* tags + category */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <Label>Tags</Label>
                <input value={tags} onChange={(e) => setTags(e.target.value)}
                  placeholder="#ramen #latenight"
                  style={{ width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: '#fff', borderRadius: 12, padding: 12, fontSize: 13, outline: 'none' }}/>
              </div>
              <div>
                <Label>Category</Label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: '#fff', borderRadius: 12, padding: 12, fontSize: 13, outline: 'none' }}>
                  {REEL_CATEGORIES.filter(c => c.kind === 'topic').map(c => (
                    <option key={c.id} value={c.id} style={{ background: '#111' }}>{c.emoji} {c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* options */}
            <div style={{ padding: 14, border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Toggle label="Allow remix" hint="Let others use your clips as templates" defaultOn/>
              <Toggle label="Book button on reel" hint="Shows your hourly rate under the caption" defaultOn/>
              <Toggle label="Share to Instagram + WhatsApp" hint="Cross-post after publish"/>
            </div>
          </div>
        )}

        {step === 'posting' && (
          <div style={{ maxWidth: 420, margin: '60px auto 0', textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', fontFamily: FONT_MONO, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 14 }}>Publishing</div>
            <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 22 }}>Uploading · encoding · CDN</div>
            <div style={{ height: 6, background: 'rgba(255,255,255,.08)', borderRadius: 100, overflow: 'hidden', marginBottom: 22 }}>
              <div style={{ height: '100%', width: `${progress}%`, background: t.grad, borderRadius: 100, transition: 'width .15s' }}/>
            </div>
            {[
              { label: 'Upload to S3', done: progress > 30 },
              { label: 'Transcode 1080p / 720p / 480p', done: progress > 55 },
              { label: 'Auto-tag location + objects', done: progress > 75 },
              { label: 'Push to CDN · 180 edges', done: progress > 92 },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', fontSize: 13, color: s.done ? '#fff' : 'rgba(255,255,255,.35)' }}>
                <span style={{ width: 18, color: s.done ? '#4ade80' : 'rgba(255,255,255,.25)' }}>{s.done ? '✓' : '○'}</span>
                {s.label}
              </div>
            ))}
          </div>
        )}

        {step === 'done' && (
          <div style={{ maxWidth: 420, margin: '80px auto 0', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: 36, margin: '0 auto 18px', background: t.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>✓</div>
            <div style={{ fontSize: 26, fontWeight: 600, marginBottom: 8, fontFamily: FONT_DISPLAY, letterSpacing: -0.4 }}>Your reel is live.</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,.65)', lineHeight: 1.5, marginBottom: 22 }}>
              We're showing it to ~120 travelers matching your city and interests. Early engagement signal decides whether it goes wider.
            </div>
            <button onClick={() => onPost({ template, caption, location, tags, category })} className="ml-btn" style={{
              padding: '12px 24px', borderRadius: 100, background: '#fff', color: '#000',
              border: 'none', fontSize: 13, fontWeight: 600,
            }}>See it in the feed</button>
          </div>
        )}
      </div>
    </div>
  );
}

function SourceCard({ icon, title, sub, theme, onClick }) {
  return (
    <button onClick={onClick} className="ml-btn" style={{
      padding: 20, borderRadius: 14, background: 'rgba(255,255,255,.03)',
      border: '1px solid rgba(255,255,255,.08)', color: '#fff', textAlign: 'left',
    }}>
      <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 4, fontFamily: FONT_MONO }}>{sub}</div>
    </button>
  );
}

function Label({ children }) {
  return <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: FONT_MONO, color: 'rgba(255,255,255,.5)', marginBottom: 8 }}>{children}</div>;
}

function Toggle({ label, hint, defaultOn }) {
  const [on, setOn] = RO_uS(!!defaultOn);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>{hint}</div>
      </div>
      <button onClick={() => setOn(v => !v)} className="ml-btn" style={{
        width: 44, height: 26, borderRadius: 13, padding: 0,
        background: on ? '#4ade80' : 'rgba(255,255,255,.15)',
        border: 'none', position: 'relative', transition: 'all .2s',
      }}>
        <div style={{
          position: 'absolute', top: 3, left: on ? 21 : 3, width: 20, height: 20,
          borderRadius: 10, background: '#fff', transition: 'left .2s',
          boxShadow: '0 2px 6px rgba(0,0,0,.3)',
        }}/>
      </button>
    </div>
  );
}

Object.assign(window, { CommentsDrawer, ShareSheet, CreatorPeek, WhyPanel, ReelComposer });
