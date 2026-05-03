// Reels — the growth-engine feed: feed switcher · category rail · create ·
// comments drawer · share sheet · creator peek · why-am-i-seeing-this · streak nudge.

const RL_uS = React.useState, RL_uE = React.useEffect, RL_uR = React.useRef, RL_uM = React.useMemo;

function ReelsScreen({ theme, goto, state, setState, session }) {
  const t = theme;

  const [feed, setFeed] = RL_uS(() => localStorage.getItem('ml-reel-feed') || 'foryou');
  const [active, setActive] = RL_uS(0);
  const [muted, setMuted] = RL_uS(true);
  const [toast, setToast] = RL_uS(null);

  const [likes, setLikes] = RL_uS(() => { try { return JSON.parse(localStorage.getItem('ml-reel-likes')) || {}; } catch { return {}; } });
  const [saves, setSaves] = RL_uS(() => { try { return JSON.parse(localStorage.getItem('ml-reel-saves')) || {}; } catch { return {}; } });
  const [follows, setFollows] = RL_uS(() => { try { return JSON.parse(localStorage.getItem('ml-reel-follows')) || {}; } catch { return {}; } });

  const [drawer, setDrawer] = RL_uS(null); // {kind, reel}
  const [showComposer, setShowComposer] = RL_uS(false);
  const [streakShown, setStreakShown] = RL_uS(false);

  const containerRef = RL_uR(null);

  // Filter reels by feed
  const visibleReels = RL_uM(() => {
    if (feed === 'foryou') return REELS;
    if (feed === 'nearby') return REELS.filter(r => ['TR', 'FR'].includes(r.country));
    if (feed === 'following') return REELS.filter(r => follows[r.localId]);
    // topic id
    return REELS.filter(r => r.category === feed);
  }, [feed, follows]);

  // Reset to top when feed changes
  RL_uE(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    setActive(0);
  }, [feed]);

  // Show streak nudge once per session on mount
  RL_uE(() => {
    if (!streakShown) { setStreakShown(true); setTimeout(() => setToast(null), 10); }
  }, []);

  const flashToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 1700); };

  const toggleLike = (id) => setLikes(l => { const n = { ...l, [id]: !l[id] }; localStorage.setItem('ml-reel-likes', JSON.stringify(n)); return n; });
  const toggleSave = (id) => { setSaves(s => { const n = { ...s, [id]: !s[id] }; localStorage.setItem('ml-reel-saves', JSON.stringify(n)); return n; }); flashToast(saves[id] ? 'Removed from saves' : 'Saved to your list'); };
  const toggleFollow = (lid) => setFollows(f => { const n = { ...f, [lid]: !f[lid] }; localStorage.setItem('ml-reel-follows', JSON.stringify(n)); return n; });

  const onScroll = (e) => {
    const h = e.currentTarget.clientHeight;
    const idx = Math.round(e.currentTarget.scrollTop / h);
    if (idx !== active && idx >= 0 && idx < visibleReels.length) setActive(idx);
  };

  const shown = (n) => n > 999 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'K' : n;

  const setFeedPersist = (f) => { setFeed(f); localStorage.setItem('ml-reel-feed', f); };

  return (
    <div style={{
      width: '100%', height: '100%', background: '#000', position: 'relative',
      color: '#fff', fontFamily: FONT_BODY, overflow: 'hidden',
    }}>
      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 6,
        padding: '18px 20px 14px',
        background: 'linear-gradient(to bottom, rgba(0,0,0,.65), transparent)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <Logo theme={{ ...t, text: '#fff' }}/>
          <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: 'rgba(255,255,255,.5)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Reels</div>
          <div style={{ flex: 1 }}/>
          <StreakChip theme={t}/>
          <button onClick={() => setMuted(m => !m)} className="ml-btn" style={reelIconBtn}>
            <Icon name="mic" size={15}/>
            {muted && <span style={{ position: 'absolute', fontSize: 22, top: -4, right: 4, color: '#fff' }}>⁄</span>}
          </button>
          <button onClick={() => setShowComposer(true)} className="ml-btn" style={{ ...reelIconBtn, background: t.grad, border: 'none' }}>
            <span style={{ fontSize: 20, fontWeight: 300, lineHeight: 1 }}>+</span>
          </button>
        </div>

        {/* Feed switcher + category rail */}
        <FeedSwitcher feed={feed} setFeed={setFeedPersist} theme={t}/>
      </div>

      {/* Feed */}
      <div
        ref={containerRef}
        onScroll={onScroll}
        className="ml-reels-feed"
        style={{ width: '100%', height: '100%', overflowY: 'auto', scrollSnapType: 'y mandatory', scrollbarWidth: 'none' }}
      >
        {visibleReels.length === 0 ? (
          <EmptyFeed feed={feed} theme={t} onSwitch={() => setFeedPersist('foryou')}/>
        ) : (
          visibleReels.map((r, i) => (
            <ReelCard
              key={r.id}
              reel={r}
              theme={t}
              active={i === active}
              liked={!!likes[r.id]}
              saved={!!saves[r.id]}
              following={!!follows[r.localId]}
              likeCount={r.likes + (likes[r.id] ? 1 : 0)}
              muted={muted}
              onLike={() => toggleLike(r.id)}
              onSave={() => toggleSave(r.id)}
              onComments={() => setDrawer({ kind: 'comments', reel: r })}
              onShare={() => setDrawer({ kind: 'share', reel: r })}
              onCreatorTap={() => setDrawer({ kind: 'creator', reel: r })}
              onWhy={() => setDrawer({ kind: 'why', reel: r })}
              onBook={() => { setState({ ...state, activeLocal: r.localId, query: r.city }); goto('profile'); }}
              onChat={() => { setState({ ...state, activeLocal: r.localId }); goto('chat'); }}
              onChip={(cat) => setFeedPersist(cat)}
              shown={shown}
            />
          ))
        )}
      </div>

      {/* Swipe hint (first reel only) */}
      {active === 0 && visibleReels.length > 1 && (
        <div style={{ position: 'absolute', right: 20, bottom: 120, zIndex: 4, pointerEvents: 'none' }}>
          <div style={{ background: 'rgba(0,0,0,.55)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 100, padding: '6px 12px', fontSize: 11, fontFamily: FONT_MONO, color: 'rgba(255,255,255,.75)', display: 'flex', gap: 6, alignItems: 'center', backdropFilter: 'blur(14px)' }}>
            <span style={{ animation: 'ml-pulse 1.8s infinite' }}>↑</span> Swipe for more
          </div>
        </div>
      )}

      {/* Counter */}
      <div style={{ position: 'absolute', top: 130, right: 22, zIndex: 4, fontFamily: FONT_MONO, fontSize: 11, color: 'rgba(255,255,255,.55)', letterSpacing: '.08em', pointerEvents: 'none' }}>
        {visibleReels.length > 0 ? `${String(active + 1).padStart(2, '0')} / ${String(visibleReels.length).padStart(2, '0')}` : '—'}
      </div>

      {/* Toast */}
      {toast && (
        <div className="ml-fadeup" style={{ position: 'absolute', bottom: 110, left: '50%', transform: 'translateX(-50%)', background: '#fff', color: '#000', padding: '10px 18px', borderRadius: 100, fontSize: 13, fontWeight: 500, zIndex: 55, boxShadow: '0 10px 30px rgba(0,0,0,.5)', whiteSpace: 'nowrap' }}>{toast}</div>
      )}

      {/* Drawers */}
      {drawer?.kind === 'comments' && <CommentsDrawer reel={drawer.reel} theme={t} onClose={() => setDrawer(null)}/>}
      {drawer?.kind === 'share' && <ShareSheet reel={drawer.reel} theme={t} onClose={() => setDrawer(null)} onShare={(ch) => { setDrawer(null); flashToast(`Shared via ${ch}`); }}/>}
      {drawer?.kind === 'creator' && (() => {
        const local = LOCALS.find(l => l.id === drawer.reel.localId);
        return <CreatorPeek
          reel={drawer.reel} local={local} theme={t}
          following={!!follows[drawer.reel.localId]}
          onFollow={() => { toggleFollow(drawer.reel.localId); flashToast(follows[drawer.reel.localId] ? 'Unfollowed' : 'Following ✓'); }}
          onChat={() => { setDrawer(null); setState({ ...state, activeLocal: drawer.reel.localId }); goto('chat'); }}
          onViewProfile={() => { setDrawer(null); setState({ ...state, activeLocal: drawer.reel.localId, query: drawer.reel.city }); goto('profile'); }}
          onClose={() => setDrawer(null)}/>;
      })()}
      {drawer?.kind === 'why' && <WhyPanel reel={drawer.reel} theme={t} onClose={() => setDrawer(null)}/>}

      {/* Composer */}
      {showComposer && <ReelComposer theme={t} onClose={() => setShowComposer(false)} onPost={() => { setShowComposer(false); flashToast('Reel live · 120 early viewers'); }}/>}

      <style>{`
        .ml-reels-feed::-webkit-scrollbar { display: none; }
        @keyframes ml-reel-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes ml-heart-burst { 0% { transform: scale(0); opacity: 0; } 40% { transform: scale(1.3); opacity: 1; } 100% { transform: scale(.9); opacity: 0; } }
        @keyframes ml-neon { 0%,100% { opacity: 1; } 50% { opacity: .65; } }
      `}</style>
    </div>
  );
}

// ---------- Feed Switcher ----------
function FeedSwitcher({ feed, setFeed, theme }) {
  const t = theme;
  const systems = REEL_CATEGORIES.filter(c => c.kind === 'system');
  const topics = REEL_CATEGORIES.filter(c => c.kind === 'topic');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Primary feed tabs */}
      <div style={{ display: 'flex', gap: 22, alignItems: 'center', justifyContent: 'center' }}>
        {systems.map(s => (
          <button key={s.id} onClick={() => setFeed(s.id)} className="ml-btn" style={{
            background: 'transparent', border: 'none', padding: '4px 2px',
            color: feed === s.id ? '#fff' : 'rgba(255,255,255,.45)',
            fontSize: 14, fontWeight: feed === s.id ? 700 : 500, letterSpacing: -0.2,
            position: 'relative',
          }}>
            {s.label}
            {feed === s.id && <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', width: 18, height: 2, background: '#fff', borderRadius: 1 }}/>}
          </button>
        ))}
      </div>

      {/* Topic pill rail */}
      <div className="ml-reels-feed" style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '4px 0', margin: '0 -20px', paddingLeft: 20, paddingRight: 20 }}>
        {topics.map(topic => (
          <button key={topic.id} onClick={() => setFeed(topic.id)} className="ml-btn" style={{
            padding: '6px 12px', borderRadius: 100, fontSize: 12, fontWeight: 500,
            background: feed === topic.id ? '#fff' : 'rgba(255,255,255,.1)',
            color: feed === topic.id ? '#000' : '#fff',
            border: '1px solid rgba(255,255,255,.12)',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            flexShrink: 0, whiteSpace: 'nowrap', backdropFilter: 'blur(10px)',
          }}>
            <span>{topic.emoji}</span> {topic.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Streak Chip ----------
function StreakChip({ theme }) {
  const days = 7;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 10px 5px 8px', borderRadius: 100,
      background: 'rgba(255,180,60,.15)', border: '1px solid rgba(255,180,60,.3)',
      fontSize: 11, fontFamily: FONT_MONO, color: '#ffd28a',
    }}>
      <span style={{ fontSize: 13 }}>🔥</span>
      <span style={{ fontWeight: 700 }}>{days}</span>
      <span style={{ opacity: .65, textTransform: 'uppercase', letterSpacing: '.06em' }}>day</span>
    </div>
  );
}

// ---------- Empty Feed ----------
function EmptyFeed({ feed, theme, onSwitch }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, scrollSnapAlign: 'start' }}>
      <div style={{ maxWidth: 320, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16, opacity: .8 }}>{feed === 'following' ? '👥' : '✨'}</div>
        <div style={{ fontSize: 19, fontWeight: 600, marginBottom: 8 }}>
          {feed === 'following' ? 'Follow locals to fill this feed' : 'No reels in this tag yet'}
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', lineHeight: 1.5, marginBottom: 20 }}>
          {feed === 'following' ? 'Tap any creator\'s avatar and hit + Follow. Their new reels show up here first.' : 'Try another category, or jump back to For you.'}
        </div>
        <button onClick={onSwitch} className="ml-btn" style={{
          padding: '10px 18px', borderRadius: 100, background: '#fff', color: '#000',
          border: 'none', fontSize: 13, fontWeight: 600,
        }}>Browse For you</button>
      </div>
    </div>
  );
}

const reelIconBtn = {
  width: 36, height: 36, borderRadius: 18,
  background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.12)',
  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
  backdropFilter: 'blur(14px)', position: 'relative', cursor: 'pointer',
};

// ---------- Reel Card ----------
function ReelCard({ reel, theme, active, liked, saved, following, likeCount, muted, onLike, onSave, onComments, onShare, onCreatorTap, onWhy, onBook, onChat, onChip, shown }) {
  const local = LOCALS.find(l => l.id === reel.localId);
  const [heartBurst, setHeartBurst] = RL_uS(false);
  const dblClickTimer = RL_uR(null);

  const handleTap = () => {
    if (dblClickTimer.current) {
      clearTimeout(dblClickTimer.current); dblClickTimer.current = null;
      if (!liked) onLike();
      setHeartBurst(true); setTimeout(() => setHeartBurst(false), 700);
    } else {
      dblClickTimer.current = setTimeout(() => { dblClickTimer.current = null; }, 280);
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', scrollSnapAlign: 'start', scrollSnapStop: 'always', overflow: 'hidden', flexShrink: 0 }}>
      <ReelVisual visual={reel.visual} active={active} onDoubleClick={handleTap}/>

      {heartBurst && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 5 }}>
          <div style={{ fontSize: 140, animation: 'ml-heart-burst .7s ease-out both' }}>❤️</div>
        </div>
      )}

      {/* Gradient wash */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.8) 0%, rgba(0,0,0,.25) 32%, transparent 58%), linear-gradient(to right, rgba(0,0,0,.35) 0%, transparent 45%)', pointerEvents: 'none' }}/>

      {/* Why-am-I-seeing-this chip, top-left under nav */}
      {(reel.reasons || []).length > 0 && (
        <button onClick={onWhy} className="ml-btn" style={{
          position: 'absolute', top: 130, left: 22, zIndex: 4,
          padding: '5px 10px', borderRadius: 100, fontSize: 10, fontFamily: FONT_MONO,
          background: 'rgba(0,0,0,.45)', border: '1px solid rgba(255,255,255,.12)',
          color: 'rgba(255,255,255,.8)', backdropFilter: 'blur(14px)',
          display: 'inline-flex', alignItems: 'center', gap: 6, letterSpacing: '.04em',
          maxWidth: 'calc(100% - 160px)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          <span style={{ color: theme.a2 }}>●</span> {reel.reasons[0]}
        </button>
      )}

      {/* Right action rail */}
      <div style={{ position: 'absolute', right: 14, bottom: 180, display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', zIndex: 4 }}>
        <ActionBtn onClick={onCreatorTap} label={null}>
          <div style={{ position: 'relative' }}>
            <Avatar seed={local?.name || reel.localId} size={48} theme={theme} ring/>
            {!following && (
              <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', width: 22, height: 22, borderRadius: 11, background: theme.grad, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #000', fontSize: 14, fontWeight: 700 }}>+</div>
            )}
            {following && (
              <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', width: 22, height: 22, borderRadius: 11, background: '#4ade80', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #000', fontSize: 12, fontWeight: 700 }}>✓</div>
            )}
          </div>
        </ActionBtn>

        <ActionBtn onClick={onLike} label={shown(likeCount)}>
          <div style={{ fontSize: 30, lineHeight: 1, transform: liked ? 'scale(1.15)' : 'scale(1)', transition: 'transform .2s' }}>
            {liked ? '❤️' : '🤍'}
          </div>
        </ActionBtn>

        <ActionBtn onClick={onComments} label={shown(reel.comments)}>
          <Icon name="chat" size={26} stroke="#fff" strokeWidth={1.8}/>
        </ActionBtn>

        <ActionBtn onClick={onShare} label={shown(reel.shares)}>
          <Icon name="share" size={26} stroke="#fff" strokeWidth={1.8}/>
        </ActionBtn>

        <ActionBtn onClick={onSave} label={shown(reel.saves)}>
          <div style={{ fontSize: 22, color: saved ? '#fbbf24' : '#fff', transition: 'color .2s' }}>{saved ? '◆' : '◇'}</div>
        </ActionBtn>

        {/* Music disc */}
        <button onClick={() => onChip(reel.category)} className="ml-btn" style={{
          width: 40, height: 40, borderRadius: 20, padding: 2, border: 'none',
          background: `conic-gradient(${theme.a1}, ${theme.a2}, ${theme.a3}, ${theme.a1})`,
          animation: active ? 'ml-spin 6s linear infinite' : 'none',
        }}>
          <div style={{ width: '100%', height: '100%', borderRadius: 18, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="star" size={14} stroke="#fff"/>
          </div>
        </button>
      </div>

      {/* Bottom content */}
      <div style={{ position: 'absolute', left: 0, right: 78, bottom: 110, padding: '0 22px', zIndex: 4, color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <button onClick={onCreatorTap} className="ml-btn" style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 15, fontWeight: 600, padding: 0, letterSpacing: -0.2 }}>
            @{(local?.name || '').split(' ')[0].toLowerCase()}_{reel.city.toLowerCase().replace(/\s/g, '')}
          </button>
          <ResidencyBadge local={local} theme={theme} size="sm"/>
          {!following && (
            <button onClick={onCreatorTap} className="ml-btn" style={{ padding: '3px 10px', borderRadius: 100, border: '1px solid rgba(255,255,255,.4)', background: 'transparent', color: '#fff', fontSize: 11, fontWeight: 600 }}>Follow</button>
          )}
        </div>

        <button onClick={() => onChip(reel.category)} className="ml-btn" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 100,
          background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(12px)', fontSize: 12, marginBottom: 10,
          border: 'none', color: '#fff',
        }}>
          <Icon name="pin" size={12}/> {reel.city} · {reel.neighborhood}
        </button>

        <div style={{ fontSize: 15, lineHeight: 1.4, maxWidth: 520, textShadow: '0 2px 8px rgba(0,0,0,.6)' }}>
          {reel.caption}
        </div>

        <div style={{ marginTop: 8, fontSize: 13, color: 'rgba(255,255,255,.8)' }}>
          {reel.tags.map(tag => (
            <button key={tag} onClick={() => onChip(reel.category)} className="ml-btn" style={{
              marginRight: 6, color: '#fff', fontWeight: 500, background: 'transparent', border: 'none', padding: 0, fontSize: 13,
            }}>#{tag}</button>
          ))}
        </div>

        {/* Music marquee */}
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,.8)', fontFamily: FONT_MONO }}>
          <span>♪</span>
          <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: 260 }}>
            <span style={{ display: 'inline-block', animation: active ? 'ml-marquee 18s linear infinite' : 'none' }}>
              {reel.music} &nbsp; · &nbsp; {reel.music} &nbsp; · &nbsp;
            </span>
          </div>
        </div>

        {/* Book CTA + views counter */}
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onBook} className="ml-btn" style={{
            padding: '11px 16px', borderRadius: 100, background: '#fff', color: '#000',
            border: 'none', fontSize: 13, fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', gap: 8,
            boxShadow: '0 10px 30px rgba(0,0,0,.35)',
          }}>
            <Icon name="lightning" size={13}/> Book {(local?.name || '').split(' ')[0]} · ${reel.bookRate}/h
          </button>
          <button onClick={onChat} className="ml-btn" style={{
            padding: '11px 14px', borderRadius: 100, background: 'rgba(255,255,255,.12)', color: '#fff',
            border: '1px solid rgba(255,255,255,.18)', fontSize: 13, fontWeight: 500, backdropFilter: 'blur(12px)',
          }}>Chat first</button>
        </div>

        {/* Views/watch meta */}
        <div style={{ marginTop: 10, fontSize: 11, color: 'rgba(255,255,255,.5)', fontFamily: FONT_MONO, letterSpacing: '.04em' }}>
          {shown(reel.views)} views · {reel.duration}s
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ position: 'absolute', bottom: 94, left: 22, right: 22, height: 2, background: 'rgba(255,255,255,.15)', borderRadius: 1, overflow: 'hidden', zIndex: 4 }}>
        <div style={{ height: '100%', background: '#fff', borderRadius: 1, width: '100%', transformOrigin: 'left', animation: active ? `ml-reel-progress ${reel.duration}s linear infinite` : 'none' }}/>
      </div>
    </div>
  );
}

function ActionBtn({ children, label, onClick }) {
  return (
    <button onClick={onClick} className="ml-btn" style={{ background: 'transparent', border: 'none', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: 0 }}>
      {children}
      {label && <span style={{ fontSize: 11, fontWeight: 500, fontFamily: FONT_MONO, letterSpacing: '.02em' }}>{label}</span>}
    </button>
  );
}

// ---------- Procedural Visual ----------
function ReelVisual({ visual, active, onDoubleClick }) {
  const { kind, hue = 20, neon, time = 'night' } = visual;
  const isNight = time === 'night';
  const sky =
    time === 'sunset' ? `linear-gradient(180deg, hsl(${hue}, 75%, 42%) 0%, hsl(${(hue+330)%360}, 70%, 28%) 50%, hsl(${(hue+280)%360}, 55%, 12%) 100%)` :
    time === 'day'    ? `linear-gradient(180deg, hsl(${hue}, 40%, 68%) 0%, hsl(${hue}, 50%, 48%) 60%, hsl(${hue}, 60%, 28%) 100%)` :
    time === 'dusk'   ? `linear-gradient(180deg, hsl(${hue}, 50%, 22%) 0%, hsl(${(hue+20)%360}, 60%, 32%) 55%, hsl(${hue}, 70%, 45%) 100%)` :
                        `linear-gradient(180deg, hsl(${(hue+220)%360}, 45%, 10%) 0%, hsl(${hue}, 60%, 18%) 55%, hsl(${hue}, 75%, 30%) 100%)`;

  return (
    <div onClick={onDoubleClick} style={{ position: 'absolute', inset: 0, background: sky, overflow: 'hidden', cursor: 'pointer' }}>
      {/* parallax ground */}
      <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(180deg, transparent, transparent 40px, rgba(0,0,0,.08) 40px, rgba(0,0,0,.08) 41px)`, transform: 'perspective(600px) rotateX(55deg) translateY(40%)', opacity: .5 }}/>

      {/* sun/moon */}
      <div style={{ position: 'absolute', top: '18%', right: '20%', width: 140, height: 140, borderRadius: 70, background: isNight ? 'rgba(255,240,220,.75)' : `hsl(${(hue+20)%360}, 90%, 70%)`, filter: `blur(${isNight ? 8 : 0}px)`, boxShadow: `0 0 120px hsl(${hue}, 80%, 55%)`, animation: active ? 'ml-drift 40s ease-in-out infinite' : 'none' }}/>

      {/* silhouette skyline */}
      <svg viewBox="0 0 400 300" preserveAspectRatio="none" style={{ position: 'absolute', bottom: '30%', left: 0, right: 0, width: '100%', height: '40%' }}>
        <path d="M0 300 L0 220 L40 220 L40 180 L80 180 L80 160 L120 160 L120 200 L160 200 L160 140 L200 140 L200 190 L240 190 L240 170 L280 170 L280 200 L320 200 L320 150 L360 150 L360 180 L400 180 L400 300 Z" fill="rgba(0,0,0,.55)"/>
      </svg>

      {/* Dome variant */}
      {kind === 'dome' && (
        <svg viewBox="0 0 400 300" preserveAspectRatio="none" style={{ position: 'absolute', bottom: '25%', left: 0, right: 0, width: '100%', height: '50%' }}>
          <path d="M200 80 Q240 80 250 130 L250 200 L150 200 L150 130 Q160 80 200 80 Z M160 140 L160 60 M240 140 L240 60" fill="rgba(0,0,0,.6)" stroke="rgba(0,0,0,.7)" strokeWidth="1"/>
          <circle cx="200" cy="100" r="4" fill="rgba(255,240,180,.9)"/>
        </svg>
      )}

      {/* Crossing variant - walkers */}
      {kind === 'crossing' && (
        <div style={{ position: 'absolute', bottom: '25%', left: 0, right: 0, height: '30%' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(90deg, rgba(255,255,255,.3), rgba(255,255,255,.3) 14px, transparent 14px, transparent 28px)', transform: 'perspective(400px) rotateX(75deg)', opacity: .6 }}/>
        </div>
      )}

      {/* neon signs */}
      {(neon || kind === 'street' || kind === 'bar') && (
        <>
          <NeonSign text={kind === 'bar' ? 'OPEN' : 'RAMEN'} color={`hsl(${hue}, 95%, 62%)`} top="34%" left="12%" delay={0} active={active}/>
          <NeonSign text={kind === 'bar' ? '酒' : '営業中'} color={`hsl(${(hue+180)%360}, 90%, 60%)`} top="44%" left="62%" delay={1.2} active={active}/>
          <NeonSign text="24h" color={`hsl(${(hue+280)%360}, 90%, 65%)`} top="28%" left="72%" delay={2.1} active={active}/>
        </>
      )}

      {/* water */}
      {kind === 'water' && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: `linear-gradient(180deg, hsl(${hue}, 60%, 20%) 0%, hsl(${(hue+20)%360}, 70%, 35%) 100%)`, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(255,255,255,.06) 6px, rgba(255,255,255,.06) 8px)', animation: active ? 'ml-shimmer 3s linear infinite' : 'none' }}/>
        </div>
      )}

      {/* walls */}
      {kind === 'walls' && (
        <div style={{ position: 'absolute', inset: 0 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ position: 'absolute', top: `${18 + i*22}%`, left: `${(i*33+10)%75}%`, width: 120, height: 80, borderRadius: 4, background: `hsl(${(hue+i*45)%360}, 75%, ${55+i*5}%)`, transform: `rotate(${i%2?-3:3}deg)`, boxShadow: '0 10px 40px rgba(0,0,0,.4)' }}/>
          ))}
        </div>
      )}

      {/* market */}
      {kind === 'market' && (
        <div style={{ position: 'absolute', bottom: '28%', left: '8%', right: '8%', display: 'flex', gap: 8 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ flex: 1, height: 70, borderRadius: 6, background: `hsl(${(hue+i*30)%360}, 75%, 50%)`, boxShadow: 'inset 0 -14px 20px rgba(0,0,0,.25), 0 6px 18px rgba(0,0,0,.4)' }}/>
          ))}
        </div>
      )}

      {/* alley */}
      {kind === 'alley' && (
        <svg viewBox="0 0 400 400" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <path d="M0 400 L160 240 L240 240 L400 400 Z" fill={`hsl(${hue}, 30%, 12%)`} opacity=".7"/>
          <path d="M160 240 L160 120 L240 120 L240 240" stroke={`hsl(${hue}, 40%, 35%)`} strokeWidth="1" fill="none"/>
        </svg>
      )}

      {/* rooftop */}
      {kind === 'rooftop' && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', background: `repeating-linear-gradient(45deg, hsl(${hue}, 65%, 48%), hsl(${hue}, 65%, 48%) 18px, hsl(${(hue+10)%360}, 60%, 40%) 18px, hsl(${(hue+10)%360}, 60%, 40%) 36px)`, clipPath: 'polygon(0 30%, 100% 0, 100% 100%, 0 100%)' }}/>
      )}

      {/* industrial */}
      {kind === 'industrial' && (
        <div style={{ position: 'absolute', bottom: '25%', left: '15%', right: '15%', height: '40%', background: `linear-gradient(180deg, hsl(${hue}, 25%, 35%), hsl(${hue}, 20%, 20%))`, borderRadius: '2px 2px 0 0', boxShadow: 'inset 0 0 60px rgba(0,0,0,.5)' }}>
          {[0,1,2,3,4,5].map(i => (
            <div key={i} style={{ position: 'absolute', top: `${15 + (i%2)*25}%`, left: `${(i%3)*30 + 8}%`, width: 30, height: 40, background: `hsl(${hue}, 60%, 70%)`, opacity: .7, borderRadius: '2px 2px 0 0' }}/>
          ))}
        </div>
      )}

      {/* particles */}
      {[...Array(14)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute', width: 3, height: 3, borderRadius: 2, background: 'rgba(255,255,255,.55)',
          top: `${(i * 37) % 90}%`, left: `${(i * 53) % 95}%`,
          animation: active ? `ml-drift ${8 + (i%5)*2}s ease-in-out infinite` : 'none',
          animationDelay: `${(i%7)*.3}s`, boxShadow: '0 0 6px rgba(255,255,255,.6)',
        }}/>
      ))}

      {/* vignette */}
      <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 200px rgba(0,0,0,.6)', pointerEvents: 'none' }}/>
    </div>
  );
}

function NeonSign({ text, color, top, left, delay = 0, active }) {
  return (
    <div style={{
      position: 'absolute', top, left, fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700,
      color, textShadow: `0 0 6px ${color}, 0 0 14px ${color}, 0 0 26px ${color}`,
      padding: '6px 12px', border: `1.5px solid ${color}`, borderRadius: 3,
      boxShadow: `0 0 14px ${color}88, inset 0 0 8px ${color}55`,
      animation: active ? `ml-neon 2.6s ease-in-out infinite ${delay}s` : 'none',
      letterSpacing: '.06em',
    }}>{text}</div>
  );
}

Object.assign(window, { ReelsScreen });
