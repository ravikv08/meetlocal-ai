// Local onboarding wizard — identity + background check + residency verification
const LO_uS = React.useState;

// Auto-format US date input as user types: MM/DD/YYYY
function formatUSDate(raw) {
  const digits = (raw || '').replace(/\D/g, '').slice(0, 8);
  let out = digits;
  if (digits.length > 4) out = digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4);
  else if (digits.length > 2) out = digits.slice(0, 2) + '/' + digits.slice(2);
  return out;
}

function LocalOnboarding({ theme, onClose, onDone }) {
  const t = theme;
  const [step, setStep] = LO_uS(0);
  const [data, setData] = LO_uS({
    firstName: '', lastName: '', dob: '', phone: '',
    idType: 'passport', idFront: false, idBack: false, selfie: false,
    address: '', yearsInCity: '', residencyType: '',
    rootDocs: [], // utility bill, lease, birth cert etc
    bgCheckConsent: false, ssn: '', bgRunning: false, bgDone: false,
    payoutBank: '', payoutAcct: '',
    profile: { bio: '', offerings: [], price: 25, languages: [] },
  });

  const steps = [
    { key: 'welcome', label: 'Welcome' },
    { key: 'identity', label: 'Identity' },
    { key: 'verify-id', label: 'ID check' },
    { key: 'residency', label: 'Residency' },
    { key: 'background', label: 'Background' },
    { key: 'payout', label: 'Payouts' },
    { key: 'profile', label: 'Profile' },
    { key: 'done', label: 'Live' },
  ];

  const next = () => setStep(s => Math.min(steps.length - 1, s + 1));
  const back = () => setStep(s => Math.max(0, s - 1));
  const set = (patch) => setData(d => ({ ...d, ...patch }));

  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.text, fontFamily: FONT_BODY, display: 'flex', flexDirection: 'column', '--ml-grad': t.grad, overflow: 'hidden' }}>
      {/* progress rail */}
      <div style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', gap: 18, borderBottom: `1px solid ${t.line}` }}>
        <button onClick={onClose} className="ml-btn" style={{ width: 34, height: 34, borderRadius: 17, background: t.surface, border: `1px solid ${t.line2}`, color: t.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="x" size={14}/>
        </button>
        <div style={{ fontSize: 12, fontFamily: FONT_MONO, color: t.textDim, letterSpacing: '.08em', textTransform: 'uppercase' }}>Become a local · Step {step + 1} of {steps.length}</div>
        <div style={{ flex: 1, display: 'flex', gap: 4 }}>
          {steps.map((s, i) => (
            <div key={s.key} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? t.grad : t.surface2, transition: 'background .3s' }}/>
          ))}
        </div>
        <div style={{ fontSize: 12, color: t.textDim }}>{steps[step].label}</div>
      </div>

      <div className="ml-scroll" style={{ flex: 1, overflow: 'auto', padding: '48px 40px 120px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', opacity: 1 }} key={step}>
          {step === 0 && <StepWelcome t={t} next={next}/>}
          {step === 1 && <StepIdentity t={t} data={data} set={set} next={next}/>}
          {step === 2 && <StepVerifyID t={t} data={data} set={set} next={next}/>}
          {step === 3 && <StepResidency t={t} data={data} set={set} next={next}/>}
          {step === 4 && <StepBackground t={t} data={data} set={set} next={next}/>}
          {step === 5 && <StepPayout t={t} data={data} set={set} next={next}/>}
          {step === 6 && <StepProfile t={t} data={data} set={set} next={next}/>}
          {step === 7 && <StepDone t={t} data={data} onDone={onDone}/>}
        </div>
      </div>

      {step > 0 && step < 7 && (
        <div style={{ padding: '16px 40px', borderTop: `1px solid ${t.line}`, display: 'flex', justifyContent: 'space-between', background: t.bg }}>
          <button onClick={back} className="ml-btn" style={{ padding: '10px 16px', borderRadius: 10, background: 'transparent', color: t.text, border: `1px solid ${t.line2}`, fontSize: 13 }}>← Back</button>
          <div style={{ fontSize: 11, color: t.textMuted, fontFamily: FONT_MONO, alignSelf: 'center' }}>Your data is encrypted · never sold</div>
        </div>
      )}
    </div>
  );
}

function H1Step({ t, children, sub }) {
  return (
    <>
      <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 44, fontWeight: 700, letterSpacing: -1.4, margin: 0, lineHeight: 1.04 }}>{children}</h1>
      {sub && <div style={{ fontSize: 16, color: t.textDim, marginTop: 12, maxWidth: 540 }}>{sub}</div>}
    </>
  );
}
function Lbl2({ t, children }) { return <div style={{ fontSize: 11, fontFamily: FONT_MONO, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '.08em' }}>{children}</div>; }
function NextBtn({ t, onClick, disabled, label = 'Continue' }) {
  return (
    <button onClick={onClick} disabled={disabled} className="ml-btn" style={{
      marginTop: 32, padding: '14px 22px', borderRadius: 12,
      background: disabled ? t.surface2 : t.grad, color: disabled ? t.textMuted : '#fff',
      border: 'none', fontSize: 14, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'inline-flex', gap: 8, alignItems: 'center',
      boxShadow: disabled ? 'none' : `0 10px 30px ${t.a1}44`,
    }}>
      {label} <Icon name="arrow" size={14}/>
    </button>
  );
}

function StepWelcome({ t, next }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontFamily: FONT_MONO, color: t.a1, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 16 }}>
        ● Join 12,400+ locals in 147 cities
      </div>
      <H1Step t={t} sub="We vet every local with ID, background, and residency checks — the same standard as Uber drivers and Airbnb hosts. 10 minutes. 100% free.">
        Earn from<br/>your <span className="ml-grad-text">hometown</span>.
      </H1Step>

      <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {[
          { k: '$28', v: 'avg / hour', d: 'Locals set their own rate' },
          { k: '4.2h', v: 'avg meetup', d: '1–6h micro-experiences' },
          { k: '80%', v: 'payout', d: 'We keep 20% to run trust & safety' },
        ].map(s => (
          <div key={s.k} style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 14, padding: 20 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 32, fontWeight: 700, letterSpacing: -0.8 }}>{s.k}</div>
            <div style={{ fontSize: 13, fontWeight: 500, marginTop: 2 }}>{s.v}</div>
            <div style={{ fontSize: 12, color: t.textDim, marginTop: 4 }}>{s.d}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 36, background: t.surface, border: `1px solid ${t.line2}`, borderRadius: 16, padding: 24 }}>
        <Lbl2 t={t}>What you'll need</Lbl2>
        <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
          {[
            { i: 'user', k: 'Government ID', d: 'Passport, driver\'s license, or national ID' },
            { i: 'cam', k: 'A selfie', d: 'Matched to your ID in real time' },
            { i: 'pin', k: 'Proof of address', d: 'Utility bill, lease, or bank statement · required for "Native" or "Rooted" badge' },
            { i: 'shield', k: 'Background check consent', d: 'US/EU: Checkr-powered · 24h turnaround' },
            { i: 'wallet', k: 'Bank details for payouts', d: 'Connected via Stripe Connect · weekly deposits' },
          ].map(r => (
            <div key={r.k} style={{ display: 'flex', gap: 14, alignItems: 'start' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: t.surface2, color: t.a1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={r.i} size={16}/></div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{r.k}</div>
                <div style={{ fontSize: 12, color: t.textDim, marginTop: 2 }}>{r.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <NextBtn t={t} onClick={next} label="Start application"/>
    </div>
  );
}

// Country codes — focused list of common origin markets
const PHONE_COUNTRIES = [
  { code: '+1',   flag: '🇺🇸', name: 'USA' },
  { code: '+1',   flag: '🇨🇦', name: 'Canada' },
  { code: '+44',  flag: '🇬🇧', name: 'UK' },
  { code: '+33',  flag: '🇫🇷', name: 'France' },
  { code: '+49',  flag: '🇩🇪', name: 'Germany' },
  { code: '+39',  flag: '🇮🇹', name: 'Italy' },
  { code: '+34',  flag: '🇪🇸', name: 'Spain' },
  { code: '+90',  flag: '🇹🇷', name: 'Türkiye' },
  { code: '+81',  flag: '🇯🇵', name: 'Japan' },
  { code: '+82',  flag: '🇰🇷', name: 'Korea' },
  { code: '+91',  flag: '🇮🇳', name: 'India' },
  { code: '+86',  flag: '🇨🇳', name: 'China' },
  { code: '+61',  flag: '🇦🇺', name: 'Australia' },
  { code: '+52',  flag: '🇲🇽', name: 'Mexico' },
  { code: '+55',  flag: '🇧🇷', name: 'Brazil' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+972', flag: '🇮🇱', name: 'Israel' },
];

function formatPhoneByCountry(digits, code) {
  // US/CA: (415) 555-0182
  if (code === '+1') {
    const d = digits.slice(0, 10);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `(${d.slice(0,3)}) ${d.slice(3)}`;
    return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  }
  // Default: groups of 3
  const d = digits.slice(0, 12);
  return d.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
}

function PhoneOTP({ theme, data, set }) {
  const t = theme;
  const [country, setCountry] = LO_uS('+1');
  const [openCC, setOpenCC] = LO_uS(false);
  const [stage, setStage] = LO_uS('input'); // input | sending | otp | verifying | done
  const [otp, setOtp] = LO_uS('');
  const [otpError, setOtpError] = LO_uS('');
  const [resendIn, setResendIn] = LO_uS(0);

  React.useEffect(() => {
    if (resendIn <= 0) return;
    const id = setTimeout(() => setResendIn(s => s - 1), 1000);
    return () => clearTimeout(id);
  }, [resendIn]);

  const digits = (data.phone || '').replace(/\D/g, '');
  const valid = (country === '+1' && digits.length === 10) || (country !== '+1' && digits.length >= 7);
  const verified = data.phoneVerified;

  const sendOTP = () => {
    setStage('sending');
    setTimeout(() => {
      setStage('otp');
      setOtp('');
      setOtpError('');
      setResendIn(30);
    }, 800);
  };

  const verifyOTP = (val) => {
    setOtp(val);
    if (val.length === 6) {
      setStage('verifying');
      setTimeout(() => {
        // Demo: any code starting with 1 fails, else succeeds.
        if (val.startsWith('0')) {
          setStage('otp');
          setOtpError('Code did not match. Try 123456.');
          setOtp('');
        } else {
          set({ phoneVerified: true, phoneCountry: country });
          setStage('done');
        }
      }, 700);
    }
  };

  const editPhone = () => {
    setStage('input');
    set({ phoneVerified: false });
    setOtp('');
    setOtpError('');
  };

  const cc = PHONE_COUNTRIES.find(c => c.code === country) || PHONE_COUNTRIES[0];

  return (
    <div>
      <div style={{ display: 'block' }}>
        <span style={{ display: 'block', fontSize: 12, letterSpacing: '.01em', color: t.textDim, marginBottom: 6 }}>Phone</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'stretch', position: 'relative' }}>
          {/* Country code dropdown */}
          <button onClick={() => setOpenCC(v => !v)} disabled={verified || stage === 'sending' || stage === 'verifying'}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0 12px', height: 44,
              background: t.surface, border: `1px solid ${t.line}`, borderRadius: 10,
              color: t.text, fontSize: 14, cursor: verified ? 'default' : 'pointer',
              fontFamily: 'inherit', whiteSpace: 'nowrap', opacity: verified ? .7 : 1
            }}>
            <span style={{ fontSize: 16 }}>{cc.flag}</span>
            <span style={{ fontFeatureSettings: '"tnum"' }}>{cc.code}</span>
            {!verified && <span style={{ fontSize: 10, opacity: .6 }}>▾</span>}
          </button>

          {/* Phone number */}
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="tel"
              value={formatPhoneByCountry(digits, country)}
              onChange={e => set({ phone: e.target.value.replace(/\D/g, '').slice(0, 15), phoneVerified: false })}
              disabled={verified || stage === 'sending' || stage === 'verifying' || stage === 'otp'}
              placeholder={country === '+1' ? '(415) 555-0182' : '555 0182'}
              style={{
                width: '100%', height: 44, padding: '0 44px 0 14px',
                background: t.surface, border: `1px solid ${verified ? '#10B981' : t.line}`, borderRadius: 10,
                color: t.text, fontSize: 15, outline: 'none', fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
            {verified && (
              <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 22, height: 22, borderRadius: 11, background: '#10B981', display: 'grid', placeItems: 'center' }}>
                <Icon name="check" size={14} stroke="#fff" strokeWidth={2.5}/>
              </span>
            )}
          </div>

          {/* Send OTP button */}
          {!verified && stage === 'input' && (
            <button onClick={sendOTP} disabled={!valid}
              style={{
                padding: '0 16px', height: 44,
                background: valid ? t.text : t.surface,
                color: valid ? t.bg : t.textDim,
                border: `1px solid ${valid ? t.text : t.line}`,
                borderRadius: 10, fontSize: 13, fontWeight: 600,
                cursor: valid ? 'pointer' : 'default',
                fontFamily: 'inherit', whiteSpace: 'nowrap'
              }}>
              Send code
            </button>
          )}
          {stage === 'sending' && (
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', height: 44, color: t.textDim, fontSize: 13 }}>
              <Spinner size={14}/><span style={{ marginLeft: 8 }}>Sending…</span>
            </div>
          )}

          {/* Country dropdown panel */}
          {openCC && !verified && (
            <div style={{ position: 'absolute', top: 50, left: 0, zIndex: 50, width: 240, maxHeight: 280, overflow: 'auto',
              background: t.bg2, border: `1px solid ${t.line}`, borderRadius: 12, padding: 6,
              boxShadow: '0 12px 40px rgba(0,0,0,.5)' }}>
              {PHONE_COUNTRIES.map(c => (
                <button key={c.name} onClick={() => { setCountry(c.code); setOpenCC(false); set({ phone: '', phoneVerified: false }); }}
                  style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 10, padding: '8px 10px',
                    background: country === c.code ? t.surface : 'transparent', border: 'none', borderRadius: 8,
                    color: t.text, fontSize: 13, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                  <span style={{ fontSize: 16 }}>{c.flag}</span>
                  <span style={{ flex: 1 }}>{c.name}</span>
                  <span style={{ color: t.textDim, fontFeatureSettings: '"tnum"' }}>{c.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* OTP input row */}
      {(stage === 'otp' || stage === 'verifying') && !verified && (
        <div style={{ marginTop: 12, padding: 16, background: t.surface, border: `1px solid ${t.line}`, borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 13, color: t.text }}>
              Enter the 6-digit code sent to <span style={{ fontFeatureSettings: '"tnum"' }}>{country} {formatPhoneByCountry(digits, country)}</span>
            </div>
            <button onClick={editPhone} style={{ background: 'none', border: 'none', color: t.a1, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>
          </div>
          <input
            type="text"
            inputMode="numeric"
            autoFocus
            maxLength={6}
            value={otp}
            onChange={e => verifyOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            style={{
              width: '100%', height: 52, padding: '0 16px',
              background: t.bg, border: `1px solid ${otpError ? '#EF4444' : t.line}`, borderRadius: 10,
              color: t.text, fontSize: 22, letterSpacing: '0.5em', textAlign: 'center',
              outline: 'none', fontFamily: 'inherit', fontFeatureSettings: '"tnum"',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: otpError ? '#EF4444' : t.textDim }}>
            <span>{otpError || (stage === 'verifying' ? 'Verifying…' : 'Demo: enter any 6 digits to verify')}</span>
            <button onClick={resendIn > 0 ? undefined : sendOTP} disabled={resendIn > 0}
              style={{ background: 'none', border: 'none', color: resendIn > 0 ? t.textDim : t.a1, fontSize: 12, cursor: resendIn > 0 ? 'default' : 'pointer', fontFamily: 'inherit' }}>
              {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
            </button>
          </div>
        </div>
      )}

      {verified && (
        <div style={{ marginTop: 8, fontSize: 12, color: '#10B981', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="check" size={12} stroke="#10B981" strokeWidth={2.5}/>
          Phone verified
        </div>
      )}
    </div>
  );
}

function StepIdentity({ t, data, set, next }) {
  const ok = data.firstName && data.lastName && data.dob && data.phoneVerified;
  return (
    <div>
      <H1Step t={t} sub="Legal name as it appears on your government ID. We'll match it automatically next step.">Tell us who you are</H1Step>
      <div style={{ marginTop: 32, display: 'grid', gap: 12, maxWidth: 520 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field theme={t} label="First name" value={data.firstName} onChange={v => set({ firstName: v })} placeholder="Alex"/>
          <Field theme={t} label="Last name" value={data.lastName} onChange={v => set({ lastName: v })} placeholder="Morgan"/>
        </div>
        <Field theme={t} label="Date of birth" value={data.dob} onChange={v => set({ dob: formatUSDate(v) })} placeholder="MM/DD/YYYY"/>
        <PhoneOTP theme={t} data={data} set={set}/>
      </div>
      <div style={{ marginTop: 24, background: t.surface, border: `1px solid ${t.line}`, borderRadius: 12, padding: 14, fontSize: 12, color: t.textDim, display: 'flex', gap: 10, alignItems: 'center' }}>
        <Icon name="shield" size={14} stroke={t.a1}/>
        We never share your legal name with travelers — only your display name on your profile.
      </div>
      <NextBtn t={t} onClick={next} disabled={!ok}/>
    </div>
  );
}

function StepVerifyID({ t, data, set, next }) {
  const [stage, setStage] = LO_uS(data.idFront && data.idBack && data.selfie ? 'done' : 'type');

  const advance = (to) => setStage(to);
  const simulate = (key) => {
    set({ [key]: true });
    setTimeout(() => {
      if (key === 'idFront') advance('back');
      else if (key === 'idBack') advance('selfie');
      else if (key === 'selfie') advance('scanning');
    }, 500);
  };

  React.useEffect(() => {
    if (stage === 'scanning') {
      const t1 = setTimeout(() => advance('done'), 2200);
      return () => clearTimeout(t1);
    }
  }, [stage]);

  return (
    <div>
      <H1Step t={t} sub="Powered by Persona. Government ID + liveness selfie. Most applicants clear in under 90 seconds.">Verify your ID</H1Step>

      {stage === 'type' && (
        <div style={{ marginTop: 32 }}>
          <Lbl2 t={t}>ID document type</Lbl2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 12 }}>
            {[
              { k: 'passport', l: 'Passport', i: 'globe' },
              { k: 'license', l: 'Driver\'s license', i: 'car' },
              { k: 'national', l: 'National ID', i: 'user' },
            ].map(o => (
              <button key={o.k} onClick={() => { set({ idType: o.k }); advance('front'); }} className="ml-btn" style={{ padding: 20, background: data.idType === o.k ? t.surface2 : t.surface, border: `1.5px solid ${data.idType === o.k ? t.a1 : t.line2}`, color: t.text, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
                <Icon name={o.i} size={20} stroke={t.a1}/>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{o.l}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {stage === 'front' && <IDCapture t={t} label="Front of document" onCapture={() => simulate('idFront')} captured={data.idFront}/>}
      {stage === 'back' && <IDCapture t={t} label="Back of document" onCapture={() => simulate('idBack')} captured={data.idBack}/>}
      {stage === 'selfie' && <SelfieCapture t={t} onCapture={() => simulate('selfie')}/>}

      {stage === 'scanning' && (
        <div style={{ marginTop: 40, padding: 40, background: t.surface, borderRadius: 16, border: `1px solid ${t.line2}`, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: t.grad, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 10px 40px ${t.a1}55` }}>
            <Spinner size={24}/>
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 600, marginTop: 18 }}>Matching your face to your ID…</div>
          <div style={{ fontSize: 13, color: t.textDim, marginTop: 8, fontFamily: FONT_MONO }}>Running biometric checks · 98% complete</div>
          <div style={{ marginTop: 20, display: 'flex', gap: 12, justifyContent: 'center', fontSize: 12, color: t.textDim }}>
            <CheckItem t={t} done>Face detected</CheckItem>
            <CheckItem t={t} done>Liveness passed</CheckItem>
            <CheckItem t={t}>Cross-match</CheckItem>
          </div>
        </div>
      )}

      {stage === 'done' && (
        <div style={{ marginTop: 40, padding: 32, background: t.surface, borderRadius: 16, border: `1px solid #4ADE8044`, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 28, background: '#4ADE80', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={28} stroke="#052e16" strokeWidth={3}/>
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 600, marginTop: 16 }}>ID verified ✓</div>
          <div style={{ fontSize: 13, color: t.textDim, marginTop: 6 }}>Match confidence 99.2% · You'll get a ✓ Verified ID badge</div>
          <NextBtn t={t} onClick={next}/>
        </div>
      )}
    </div>
  );
}
function IDCapture({ t, label, onCapture, captured }) {
  return (
    <div style={{ marginTop: 32 }}>
      <Lbl2 t={t}>{label}</Lbl2>
      <div style={{ marginTop: 14, aspectRatio: '16/10', background: t.surface, border: `2px dashed ${t.line2}`, borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, position: 'relative', overflow: 'hidden' }}>
        {/* viewfinder corners */}
        {['tl', 'tr', 'bl', 'br'].map(c => (
          <div key={c} style={{ position: 'absolute', [c.includes('t') ? 'top' : 'bottom']: 20, [c.includes('l') ? 'left' : 'right']: 20, width: 24, height: 24, border: `2px solid ${t.a1}`, borderRadius: 4, borderRight: c.endsWith('r') ? undefined : 'none', borderLeft: c.endsWith('l') ? undefined : 'none', borderTop: c.startsWith('t') ? undefined : 'none', borderBottom: c.startsWith('b') ? undefined : 'none' }}/>
        ))}
        <Icon name="cam" size={42} stroke={t.textDim}/>
        <div style={{ fontSize: 14, color: t.textDim, textAlign: 'center', padding: '0 20px' }}>Align your document inside the frame</div>
        <button onClick={onCapture} className="ml-btn" style={{ padding: '12px 20px', borderRadius: 100, background: t.grad, color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, display: 'flex', gap: 8, alignItems: 'center' }}>
          <Icon name="cam" size={14}/> Capture {label.split(' ')[0].toLowerCase()}
        </button>
      </div>
    </div>
  );
}
function SelfieCapture({ t, onCapture }) {
  return (
    <div style={{ marginTop: 32 }}>
      <Lbl2 t={t}>Liveness selfie</Lbl2>
      <div style={{ marginTop: 14, aspectRatio: '1', maxWidth: 420, margin: '14px auto 0', background: t.surface, border: `1px solid ${t.line2}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 20, borderRadius: '50%', border: `2px dashed ${t.a1}`, animation: 'ml-pulse 2s infinite' }}/>
        <Icon name="user" size={100} stroke={t.textDim} strokeWidth={1}/>
      </div>
      <div style={{ textAlign: 'center', marginTop: 18 }}>
        <div style={{ fontSize: 13, color: t.textDim, marginBottom: 14 }}>Look at the camera, blink twice</div>
        <button onClick={onCapture} className="ml-btn" style={{ padding: '12px 24px', borderRadius: 100, background: t.grad, color: '#fff', border: 'none', fontSize: 13, fontWeight: 600 }}>
          Take selfie
        </button>
      </div>
    </div>
  );
}
function CheckItem({ t, done, children }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, opacity: done ? 1 : 0.5 }}>
      {done ? <span style={{ width: 14, height: 14, borderRadius: 7, background: '#4ADE80', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={9} stroke="#052e16" strokeWidth={3}/></span> : <Spinner size={12}/>}
      {children}
    </span>
  );
}

function StepResidency({ t, data, set, next }) {
  const [city, setCity] = LO_uS('');
  const years = parseInt(data.yearsInCity) || 0;
  const bornHere = data.residencyType === 'born';
  const suggestedBadge = bornHere ? 'native' : years >= 10 ? 'rooted' : years >= 3 ? 'seasoned' : 'newlocal';
  const rb = RESIDENCY[suggestedBadge];

  const ok = data.residencyType && city && (bornHere || years > 0);

  return (
    <div>
      <H1Step t={t} sub="This is what makes meetlocal.ai different. Travelers can filter for Native or 10+ year locals. Verified roots = higher rate.">
        How deep are<br/>your <span className="ml-grad-text">roots</span>?
      </H1Step>

      <div style={{ marginTop: 32, display: 'grid', gap: 12, maxWidth: 520 }}>
        <Field theme={t} label="Which city?" value={city} onChange={setCity} placeholder="Tokyo, Lisbon, Mexico City…"/>

        <div style={{ marginTop: 6 }}>
          <Lbl2 t={t}>Your relationship to this city</Lbl2>
          <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
            {[
              { k: 'born', l: 'Born & raised', d: 'Native · highest trust signal', badge: 'native' },
              { k: 'longterm', l: 'Moved here long ago', d: 'Tell us how many years', badge: null },
              { k: 'recent', l: 'Moved recently', d: 'Less than 3 years', badge: 'newlocal' },
            ].map(o => (
              <label key={o.k} style={{ display: 'flex', gap: 12, padding: 14, background: data.residencyType === o.k ? t.surface2 : t.surface, border: `1.5px solid ${data.residencyType === o.k ? t.a1 : t.line2}`, borderRadius: 12, cursor: 'pointer' }}>
                <input type="radio" name="resi" checked={data.residencyType === o.k} onChange={() => set({ residencyType: o.k })} style={{ accentColor: t.a1 }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{o.l}</div>
                  <div style={{ fontSize: 12, color: t.textDim, marginTop: 2 }}>{o.d}</div>
                </div>
                {o.badge && (
                  <span style={{ alignSelf: 'center', padding: '4px 10px', borderRadius: 100, background: t.bg, border: `1px solid ${RESIDENCY[o.badge].ring}55`, fontSize: 10, fontFamily: FONT_MONO, textTransform: 'uppercase', color: RESIDENCY[o.badge].ring, letterSpacing: '.05em' }}>
                    {RESIDENCY[o.badge].short}
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>

        {data.residencyType === 'longterm' && (
          <Field theme={t} label="Years living here" value={data.yearsInCity} onChange={v => set({ yearsInCity: v.replace(/\D/g,'').slice(0,2) })} placeholder="e.g. 14"/>
        )}

        {data.residencyType && (
          <div style={{ marginTop: 12, padding: 16, background: t.surface, border: `1px solid ${t.line2}`, borderRadius: 12 }}>
            <Lbl2 t={t}>Documents we'll need to verify</Lbl2>
            <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
              {bornHere && <DocRow t={t} label="Birth certificate or long-form ID" req/>}
              <DocRow t={t} label="Proof of address (utility bill, lease, bank stmt — last 90 days)" req/>
              {years >= 5 && <DocRow t={t} label="Earlier address records (optional · unlocks +20% visibility)" />}
              <DocRow t={t} label="Local reference (optional, 1 of 3 required for Native)" />
            </div>
          </div>
        )}

        {data.residencyType && (
          <div style={{ marginTop: 16, padding: 20, background: `linear-gradient(135deg, ${rb.ring}18, transparent)`, border: `1px solid ${rb.ring}55`, borderRadius: 14 }}>
            <div style={{ fontSize: 11, fontFamily: FONT_MONO, color: t.textDim, textTransform: 'uppercase', letterSpacing: '.08em' }}>Your badge will be</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: 22, background: rb.ring, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 700, fontFamily: FONT_MONO, fontSize: 14 }}>
                {rb.short[0]}
              </div>
              <div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 600 }}>{rb.label}</div>
                <div style={{ fontSize: 12, color: t.textDim, marginTop: 2 }}>{rb.desc} · shown to every traveler</div>
              </div>
            </div>
          </div>
        )}
      </div>
      <NextBtn t={t} onClick={next} disabled={!ok}/>
    </div>
  );
}
function DocRow({ t, label, req }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: t.text }}>
      <span style={{ width: 16, height: 16, borderRadius: 8, border: `1.5px solid ${t.line2}` }}/>
      <span>{label}</span>
      {req && <span style={{ marginLeft: 'auto', fontSize: 10, fontFamily: FONT_MONO, color: t.a1, textTransform: 'uppercase' }}>Required</span>}
    </div>
  );
}

function StepBackground({ t, data, set, next }) {
  const [phase, setPhase] = LO_uS(data.bgDone ? 'done' : 'consent');

  const run = () => {
    setPhase('running');
    setTimeout(() => { set({ bgDone: true }); setPhase('done'); }, 2600);
  };

  return (
    <div>
      <H1Step t={t} sub="We run a criminal background check through Checkr (US) or Sterling (intl). We look at sex offender registry, violent felonies, and serious driving infractions — the same as rideshare.">
        Background check
      </H1Step>

      {phase === 'consent' && (
        <>
          <div style={{ marginTop: 28, background: t.surface, border: `1px solid ${t.line2}`, borderRadius: 14, padding: 22 }}>
            <Lbl2 t={t}>What we check</Lbl2>
            <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
              {[
                'Global & national sex offender registry',
                'Violent felony convictions (last 7 years)',
                'Serious traffic violations (DUI, reckless)',
                'Terrorism watchlists (OFAC, SDN)',
              ].map(x => (
                <div key={x} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                  <Icon name="check" size={14} stroke={t.a1}/> {x}
                </div>
              ))}
            </div>
            <div style={{ borderTop: `1px solid ${t.line}`, marginTop: 16, paddingTop: 16 }}>
              <Lbl2 t={t}>What we don't look at</Lbl2>
              <div style={{ fontSize: 12, color: t.textDim, marginTop: 6, lineHeight: 1.5 }}>
                Credit history · arrests without conviction · non-violent juvenile records · minor traffic offenses
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18, display: 'grid', gap: 12, maxWidth: 520 }}>
            <Field theme={t} label="SSN last 4 (US only)" value={data.ssn} onChange={v => set({ ssn: v.replace(/\D/g,'').slice(0,4) })} placeholder="••••" type="password"/>
            <label style={{ display: 'flex', gap: 10, fontSize: 13, color: t.textDim, cursor: 'pointer', padding: 14, background: t.surface, border: `1px solid ${t.line2}`, borderRadius: 12 }}>
              <input type="checkbox" checked={data.bgCheckConsent} onChange={e => set({ bgCheckConsent: e.target.checked })} style={{ accentColor: t.a1, marginTop: 3 }}/>
              <span>I authorize meetlocal.ai and its vendor (Checkr) to process my background check and I've read the <a style={{ color: t.a1 }}>Disclosure & Summary of Rights</a>.</span>
            </label>
          </div>
          <button onClick={run} disabled={!data.bgCheckConsent} className="ml-btn" style={{ marginTop: 28, padding: '14px 22px', borderRadius: 12, background: data.bgCheckConsent ? t.grad : t.surface2, color: data.bgCheckConsent ? '#fff' : t.textMuted, border: 'none', fontSize: 14, fontWeight: 600, display: 'inline-flex', gap: 8, alignItems: 'center', cursor: data.bgCheckConsent ? 'pointer' : 'not-allowed' }}>
            <Icon name="shield" size={14}/> Run background check
          </button>
        </>
      )}

      {phase === 'running' && (
        <div style={{ marginTop: 40, padding: 40, background: t.surface, borderRadius: 16, border: `1px solid ${t.line2}`, textAlign: 'center' }}>
          <Spinner size={32}/>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 600, marginTop: 18 }}>Check in progress</div>
          <div style={{ fontSize: 13, color: t.textDim, marginTop: 8, fontFamily: FONT_MONO }}>Queries running across 40+ databases · ~24 hours for final clear</div>
          <div style={{ marginTop: 20, display: 'flex', gap: 14, justifyContent: 'center', fontSize: 12 }}>
            <CheckItem t={t} done>Identity matched</CheckItem>
            <CheckItem t={t} done>Global watchlist</CheckItem>
            <CheckItem t={t}>County records</CheckItem>
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div style={{ marginTop: 40, padding: 32, background: t.surface, borderRadius: 16, border: `1px solid #4ADE8044`, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 28, background: '#4ADE80', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="shield" size={28} stroke="#052e16" strokeWidth={2.5}/>
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 600, marginTop: 16 }}>Preliminary check: clear</div>
          <div style={{ fontSize: 13, color: t.textDim, marginTop: 6, maxWidth: 380, margin: '6px auto 0' }}>Full clearance pending (usually 6–24h). You can build your profile in the meantime.</div>
          <NextBtn t={t} onClick={next}/>
        </div>
      )}
    </div>
  );
}

function StepPayout({ t, data, set, next }) {
  const ok = data.payoutBank && data.payoutAcct.length >= 8;
  return (
    <div>
      <H1Step t={t} sub="We use Stripe Connect to pay you out. Weekly deposits on Monday. No fees on your end.">Payouts</H1Step>
      <div style={{ marginTop: 28, padding: 18, background: t.surface, border: `1px solid ${t.line2}`, borderRadius: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 44, height: 28, borderRadius: 5, background: '#635BFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 10, fontFamily: FONT_MONO }}>STRIPE</div>
        <div style={{ flex: 1, fontSize: 13, color: t.textDim }}>Bank-grade encryption · PCI-DSS level 1 · SOC 2 certified</div>
      </div>

      <div style={{ marginTop: 18, display: 'grid', gap: 12, maxWidth: 520 }}>
        <Field theme={t} label="Bank name" value={data.payoutBank} onChange={v => set({ payoutBank: v })} placeholder="Chase · Revolut · Nubank…"/>
        <Field theme={t} label="Account / IBAN" value={data.payoutAcct} onChange={v => set({ payoutAcct: v.replace(/\s/g,'').slice(0,34) })} placeholder="GB29 NWBK 6016 1331 9268 19"/>
      </div>

      <div style={{ marginTop: 20, padding: 16, background: `linear-gradient(135deg, ${t.a3}18, transparent)`, border: `1px solid ${t.line2}`, borderRadius: 12, fontSize: 12, color: t.textDim, display: 'flex', gap: 10, alignItems: 'start' }}>
        <Icon name="flash" size={14} stroke={t.a3}/>
        <span>First payout takes 7 days for trust & safety. After that, weekly on Monday — and you can request <b>instant payout</b> for a 1% fee.</span>
      </div>
      <NextBtn t={t} onClick={next} disabled={!ok}/>
    </div>
  );
}

function StepProfile({ t, data, set, next }) {
  const p = data.profile;
  const setP = (patch) => set({ profile: { ...p, ...patch } });
  const offerings = ['Food crawl', 'City walk', 'Photos', 'Drive', 'Nightlife', 'Markets', 'Coffee', 'History', 'Music', 'Wine'];
  const ok = p.bio.length > 40 && p.offerings.length > 0 && p.price > 0;
  return (
    <div>
      <H1Step t={t} sub="Last step. Travelers will see this.">Build your profile</H1Step>

      <div style={{ marginTop: 28, display: 'grid', gap: 16, maxWidth: 580 }}>
        <div>
          <Lbl2 t={t}>Your story · min 40 chars ({p.bio.length}/300)</Lbl2>
          <textarea value={p.bio} onChange={e => setP({ bio: e.target.value.slice(0, 300) })} rows={4} placeholder="Raised in Tokyo, 12 years of late-night food crawls through Shimokita…" style={{ width: '100%', marginTop: 8, background: t.bg, border: `1px solid ${t.line2}`, borderRadius: 10, padding: 14, color: t.text, fontSize: 14, fontFamily: FONT_BODY, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}/>
        </div>

        <div>
          <Lbl2 t={t}>What you offer · pick any</Lbl2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {offerings.map(o => {
              const on = p.offerings.includes(o);
              return (
                <button key={o} onClick={() => setP({ offerings: on ? p.offerings.filter(x => x !== o) : [...p.offerings, o] })} className="ml-btn" style={{ padding: '8px 14px', borderRadius: 100, background: on ? t.text : t.surface, color: on ? t.bg : t.text, border: `1px solid ${on ? t.text : t.line2}`, fontSize: 13 }}>
                  {on && '✓ '}{o}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <Lbl2 t={t}>Your hourly rate · USD</Lbl2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 44, fontWeight: 700 }}>${p.price}</div>
              <input type="range" min={10} max={80} value={p.price} onChange={e => setP({ price: parseInt(e.target.value) })} style={{ flex: 1, accentColor: t.a1 }}/>
            </div>
            <div style={{ fontSize: 11, color: t.textDim, fontFamily: FONT_MONO }}>You keep ${(p.price * 0.8).toFixed(0)} / hr</div>
          </div>
          <div>
            <Lbl2 t={t}>Languages</Lbl2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {['EN','ES','FR','JA','PT','ZH','DE','IT','AR'].map(l => {
                const on = p.languages.includes(l);
                return <button key={l} onClick={() => setP({ languages: on ? p.languages.filter(x => x !== l) : [...p.languages, l] })} className="ml-btn" style={{ padding: '6px 10px', borderRadius: 6, background: on ? t.a1 : t.surface, color: on ? '#fff' : t.text, border: `1px solid ${on ? t.a1 : t.line2}`, fontSize: 11, fontFamily: FONT_MONO, letterSpacing: '.04em' }}>{l}</button>;
              })}
            </div>
          </div>
        </div>
      </div>
      <NextBtn t={t} onClick={next} disabled={!ok} label="Publish profile"/>
    </div>
  );
}

function StepDone({ t, data, onDone }) {
  return (
    <div style={{ textAlign: 'center', paddingTop: 40 }}>
      <div style={{ width: 96, height: 96, borderRadius: 48, background: t.grad, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 20px 60px ${t.a1}88` }}>
        <Icon name="check" size={44} stroke="#fff" strokeWidth={2.5}/>
      </div>
      <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 56, fontWeight: 700, letterSpacing: -2, margin: '28px 0 10px' }}>You're live.</h1>
      <div style={{ fontSize: 17, color: t.textDim, maxWidth: 480, margin: '0 auto' }}>
        Welcome, {data.firstName || 'local'}. Your profile is visible to travelers in {data.residencyType ? 'your city' : 'the area'} right now. Full background clearance usually lands within 24h — we'll email you.
      </div>
      <div style={{ marginTop: 40, display: 'inline-grid', gridTemplateColumns: 'repeat(3, auto)', gap: 14, padding: 20, background: t.surface, border: `1px solid ${t.line2}`, borderRadius: 16 }}>
        <div>
          <Lbl2 t={t}>ID</Lbl2>
          <div style={{ fontSize: 14, marginTop: 4, color: '#4ADE80', fontWeight: 500 }}>✓ Verified</div>
        </div>
        <div>
          <Lbl2 t={t}>Residency</Lbl2>
          <div style={{ fontSize: 14, marginTop: 4, color: '#4ADE80', fontWeight: 500 }}>✓ Pending docs</div>
        </div>
        <div>
          <Lbl2 t={t}>Background</Lbl2>
          <div style={{ fontSize: 14, marginTop: 4, color: t.a3, fontWeight: 500 }}>~ 24h pending</div>
        </div>
      </div>
      <div style={{ marginTop: 32 }}>
        <button onClick={onDone} className="ml-btn" style={{ padding: '14px 28px', borderRadius: 100, background: t.text, color: t.bg, border: 'none', fontSize: 14, fontWeight: 600 }}>
          Go to my dashboard →
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { LocalOnboarding });
