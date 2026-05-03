// App shell + router
const uState = React.useState;

function App() {
  const [themeName, setThemeName] = uState(() => localStorage.getItem('ml-theme') || 'sunset');
  const [page, setPage] = uState(() => localStorage.getItem('ml-page') || 'home');
  const [appState, setAppState] = uState(() => {
    try { return JSON.parse(localStorage.getItem('ml-state')) || { activeLocal: 'mika', query: 'Tokyo' }; }
    catch { return { activeLocal: 'mika', query: 'Tokyo' }; }
  });
  const [tweaksOpen, setTweaksOpen] = uState(false);

  // global session
  const [user, setUser] = uState(() => { try { return JSON.parse(localStorage.getItem('ml-user')); } catch { return null; } });
  const [paymentCard, setPaymentCard] = uState(() => { try { return JSON.parse(localStorage.getItem('ml-card')); } catch { return null; } });

  // modals
  const [authOpen, setAuthOpen] = uState(null); // 'signin' | 'signup' | null
  const [searchOpen, setSearchOpen] = uState(false);
  const [cardOpen, setCardOpen] = uState(false);

  const theme = THEMES[themeName];

  const goto = (p) => {
    // gate certain screens behind auth
    if ((p === 'booking' || p === 'chat') && !user) {
      setAuthOpen('signin');
      return;
    }
    if (p === 'onboarding') {
      setPage('onboarding'); localStorage.setItem('ml-page', 'onboarding'); return;
    }
    setPage(p);
    localStorage.setItem('ml-page', p);
  };
  const changeTheme = (name) => { setThemeName(name); localStorage.setItem('ml-theme', name); };
  const updateState = (s) => { setAppState(s); localStorage.setItem('ml-state', JSON.stringify(s)); };

  // Tweaks host protocol
  React.useEffect(() => {
    const h = (e) => {
      if (e.data?.type === '__activate_edit_mode') setTweaksOpen(true);
      if (e.data?.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', h);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', h);
  }, []);

  const session = {
    user, setUser: (u) => { setUser(u); u ? localStorage.setItem('ml-user', JSON.stringify(u)) : localStorage.removeItem('ml-user'); },
    paymentCard, setPaymentCard: (c) => { setPaymentCard(c); c ? localStorage.setItem('ml-card', JSON.stringify(c)) : localStorage.removeItem('ml-card'); },
    openAuth: (mode) => setAuthOpen(mode || 'signin'),
    openSearch: () => setSearchOpen(true),
    openCardModal: () => setCardOpen(true),
    signOut: () => { setUser(null); localStorage.removeItem('ml-user'); setPaymentCard(null); localStorage.removeItem('ml-card'); },
  };

  const Screen = {
    home: WebHome,
    reels: ReelsScreen,
    how: HowItWorksScreen,
    safety: SafetyScreen,
    become: BecomeLocalScreen,
    profile: ProfileScreen,
    chat: ChatScreen,
    booking: BookingScreen,
    spots: MeetingSpotPicker,
    reviews: ReviewsScreen,
    arrival: ArrivalScreen,
    concierge: ConciergeScreen,
    plus: PlusScreen,
    pulse: PulseScreen,
  }[page] || WebHome;

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: theme.bg, position: 'relative' }}>
      {page === 'onboarding' ? (
        <LocalOnboarding theme={theme} onClose={() => goto('home')} onDone={() => { session.setUser({ ...(user || {}), isLocal: true }); goto('arrival'); }} />
      ) : (
        <Screen theme={theme} goto={goto} state={appState} setState={updateState} session={session} />
      )}

      {/* Global modals */}
      {authOpen && (
        <AuthModal theme={theme} mode={authOpen} onClose={() => setAuthOpen(null)} onAuth={(u) => { session.setUser(u); setAuthOpen(null); }} />
      )}
      {searchOpen && (
        <SearchPalette theme={theme} value={appState.query} onClose={() => setSearchOpen(false)}
          onPick={(c) => { updateState({ ...appState, query: c.city }); setSearchOpen(false); }}/>
      )}
      {cardOpen && (
        <PaymentMethodModal theme={theme} onClose={() => setCardOpen(false)} onSave={(c) => { session.setPaymentCard(c); setCardOpen(false); }}/>
      )}

      {page !== 'onboarding' && <NavStrip page={page} goto={goto} theme={theme} session={session} />}
      {tweaksOpen && <TweaksPanel themeName={themeName} setThemeName={changeTheme} page={page} goto={goto} theme={theme} close={() => setTweaksOpen(false)}/>}
    </div>
  );
}

function NavStrip({ page, goto, theme, session }) {
  const t = theme;
  const items = [
    { id: 'home', label: 'Discover', icon: 'compass' },
    { id: 'concierge', label: 'Locally', icon: 'chat' },
    { id: 'reels', label: 'Reels', icon: 'flash' },
    { id: 'profile', label: 'Profile', icon: 'user' },
    { id: 'chat', label: 'Chat', icon: 'chat' },
    { id: 'booking', label: 'Book', icon: 'wallet' },
    { id: 'reviews', label: 'Review', icon: 'star' },
    { id: 'plus', label: 'Plus', icon: 'lightning' },
    { id: 'pulse', label: 'Pulse', icon: 'flash' },
    { id: 'arrival', label: 'Host', icon: 'shield' },
  ];
  return (
    <div style={{
      position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', gap: 4, padding: 6,
      background: `${t.surface}ee`, backdropFilter: 'blur(20px)',
      border: `1px solid ${t.line2}`, borderRadius: 100,
      boxShadow: '0 20px 60px rgba(0,0,0,.5)', zIndex: 50, fontFamily: FONT_BODY,
      maxWidth: 'calc(100vw - 40px)', flexWrap: 'wrap',
    }}>
      {items.map(it => (
        <button key={it.id} onClick={() => goto(it.id)} className="ml-btn" style={{
          padding: '8px 14px', borderRadius: 100,
          background: page === it.id ? t.text : 'transparent',
          color: page === it.id ? t.bg : t.textDim,
          border: 'none', fontSize: 12, fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Icon name={it.icon} size={13}/> {it.label}
        </button>
      ))}
      <div style={{ width: 1, background: t.line, margin: '4px 2px' }}/>
      <button onClick={() => goto('onboarding')} className="ml-btn" style={{
        padding: '8px 14px', borderRadius: 100, background: t.grad, color: '#fff',
        border: 'none', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
      }}><Icon name="shield" size={13}/> Become a local</button>
    </div>
  );
}

function TweaksPanel({ themeName, setThemeName, theme, close }) {
  const t = theme;
  return (
    <div style={{
      position: 'fixed', right: 20, top: 20, width: 260,
      background: `${t.surface}f0`, backdropFilter: 'blur(24px)',
      border: `1px solid ${t.line2}`, borderRadius: 16, padding: 18,
      color: t.text, fontFamily: FONT_BODY, zIndex: 100,
      boxShadow: '0 20px 60px rgba(0,0,0,.5)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontFamily: FONT_MONO, textTransform: 'uppercase', letterSpacing: '.08em', color: t.textDim }}>Tweaks</div>
        <div style={{ flex: 1 }}/>
        <button onClick={close} className="ml-btn" style={{ width: 26, height: 26, borderRadius: 13, background: 'transparent', border: 'none', color: t.textDim }}>×</button>
      </div>
      <div style={{ fontSize: 12, color: t.textDim, marginBottom: 8 }}>Color theme</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {['sunset', 'rainbow', 'mono'].map(k => {
          const tt = THEMES[k];
          return (
            <button key={k} onClick={() => { window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { theme: k } }, '*'); setThemeName(k); }} className="ml-btn" style={{
              padding: 8, borderRadius: 10, background: themeName === k ? t.surface2 : 'transparent',
              border: `1.5px solid ${themeName === k ? tt.a1 : t.line2}`,
              color: t.text, textAlign: 'left',
            }}>
              <div style={{ height: 36, borderRadius: 6, background: tt.grad, marginBottom: 6 }}/>
              <div style={{ fontSize: 11, fontFamily: FONT_MONO, textTransform: 'uppercase' }}>{tt.name}</div>
            </button>
          );
        })}
      </div>
      <div style={{ fontSize: 11, color: t.textMuted, marginTop: 14, lineHeight: 1.4 }}>
        Try: Sign in → search a city → book a local → add a payment card. Or hit "Become a local" in the bottom nav for the full onboarding.
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
