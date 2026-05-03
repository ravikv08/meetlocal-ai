// Shared theme tokens & primitives for meetlocal.ai design

const THEMES = {
  sunset: {
    name: 'Sunset',
    bg: '#0E0B08',
    bg2: '#181310',
    surface: '#1C1713',
    surface2: '#241E19',
    line: 'rgba(255, 230, 200, 0.08)',
    line2: 'rgba(255, 230, 200, 0.14)',
    text: '#F6EFE4',
    textDim: 'rgba(246, 239, 228, 0.62)',
    textMuted: 'rgba(246, 239, 228, 0.38)',
    a1: '#FF6A3D', // coral
    a2: '#FF2E78', // magenta
    a3: '#FFB84D', // amber
    grad: 'linear-gradient(135deg, #FFB84D 0%, #FF6A3D 45%, #FF2E78 100%)',
    gradSoft: 'linear-gradient(135deg, rgba(255,184,77,.18), rgba(255,46,120,.18))',
  },
  rainbow: {
    name: 'Rainbow',
    bg: '#0B0A10',
    bg2: '#14121C',
    surface: '#181624',
    surface2: '#201D30',
    line: 'rgba(230, 220, 255, 0.08)',
    line2: 'rgba(230, 220, 255, 0.14)',
    text: '#F1EEF9',
    textDim: 'rgba(241, 238, 249, 0.62)',
    textMuted: 'rgba(241, 238, 249, 0.38)',
    a1: '#7C5CFF',
    a2: '#FF4DA6',
    a3: '#3BD4C4',
    grad: 'linear-gradient(135deg, #FFB84D 0%, #FF4DA6 30%, #7C5CFF 60%, #3BD4C4 100%)',
    gradSoft: 'linear-gradient(135deg, rgba(124,92,255,.18), rgba(255,77,166,.18))',
  },
  mono: {
    name: 'Mono',
    bg: '#0D0D0D',
    bg2: '#141414',
    surface: '#1A1A1A',
    surface2: '#222222',
    line: 'rgba(255,255,255,0.08)',
    line2: 'rgba(255,255,255,0.14)',
    text: '#F5F5F5',
    textDim: 'rgba(245,245,245,0.62)',
    textMuted: 'rgba(245,245,245,0.38)',
    a1: '#EDEDED',
    a2: '#BFBFBF',
    a3: '#9B9B9B',
    grad: 'linear-gradient(135deg, #FFFFFF 0%, #BFBFBF 100%)',
    gradSoft: 'linear-gradient(135deg, rgba(255,255,255,.10), rgba(255,255,255,.04))',
  },
};

const FONT_DISPLAY = `'Inter Tight', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', system-ui, sans-serif`;
const FONT_BODY = `'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', system-ui, sans-serif`;
const FONT_MONO = `'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace`;

// Inject google font + base css once
(function injectBase() {
  if (typeof document === 'undefined' || document.getElementById('ml-base-css')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Inter+Tight:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap';
  document.head.appendChild(link);
  const s = document.createElement('style');
  s.id = 'ml-base-css';
  s.textContent = `
    .ml-scroll::-webkit-scrollbar{display:none}
    .ml-scroll{scrollbar-width:none}
    .ml-grad-text{background-image:var(--ml-grad);-webkit-background-clip:text;background-clip:text;color:transparent}
    .ml-btn{cursor:pointer;border:none;font-family:inherit;transition:transform .18s cubic-bezier(.2,.7,.3,1),filter .18s,background .18s,color .18s}
    .ml-btn:active{transform:scale(.97)}
    .ml-kbd{font-family:${FONT_MONO};font-size:10px;letter-spacing:.08em;text-transform:uppercase;opacity:.6}
    @keyframes ml-pulse{0%,100%{opacity:.55}50%{opacity:1}}
    @keyframes ml-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
    @keyframes ml-spin{to{transform:rotate(360deg)}}
    @keyframes ml-ping{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.4);opacity:0}}
    @keyframes ml-fadeup{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
    .ml-fadeup{animation:ml-fadeup .35s cubic-bezier(.2,.7,.3,1) both}
    @keyframes ml-drift{0%,100%{transform:translate(0,0)}50%{transform:translate(8px,-12px)}}
    @keyframes ml-neon{0%,100%{opacity:1;filter:brightness(1)}45%{opacity:.5;filter:brightness(.6)}48%{opacity:1;filter:brightness(1.2)}}
    @keyframes ml-marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
    @keyframes ml-heart-burst{0%{transform:scale(.4);opacity:0}30%{transform:scale(1.25);opacity:1}100%{transform:scale(1.6);opacity:0}}
    @keyframes ml-reel-progress{from{transform:scaleX(0)}to{transform:scaleX(1)}}
  `;
  document.head.appendChild(s);
})();

function useTheme(themeName = 'sunset') {
  return THEMES[themeName] || THEMES.sunset;
}

// Striped placeholder for imagery — tinted w/ theme gradient
function Placeholder({ caption, height = '100%', width = '100%', radius = 0, theme, variant = 'grad', style = {} }) {
  const t = theme || THEMES.sunset;
  const bg = variant === 'grad'
    ? `${t.grad}, repeating-linear-gradient(45deg, rgba(255,255,255,.05) 0 8px, transparent 8px 16px)`
    : `repeating-linear-gradient(45deg, ${t.surface2} 0 8px, ${t.surface} 8px 16px)`;
  return (
    <div style={{
      width, height, borderRadius: radius,
      backgroundImage: bg,
      backgroundBlendMode: 'overlay',
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'flex-end', padding: 10,
      ...style,
    }}>
      {caption && (
        <div style={{
          fontFamily: FONT_MONO, fontSize: 9, letterSpacing: '.06em',
          color: 'rgba(255,255,255,.75)', background: 'rgba(0,0,0,.45)',
          padding: '3px 6px', borderRadius: 3, textTransform: 'uppercase',
        }}>{caption}</div>
      )}
    </div>
  );
}

// Generated deterministic avatar gradient from seed
function avatarGrad(seed, theme) {
  let h = 0; for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const hue1 = h % 360; const hue2 = (hue1 + 60 + (h >> 8) % 120) % 360;
  return `linear-gradient(135deg, oklch(0.72 0.18 ${hue1}), oklch(0.58 0.2 ${hue2}))`;
}

function Avatar({ seed = 'x', size = 40, theme, initials, ring, style = {} }) {
  const t = theme || THEMES.sunset;
  const letters = (initials || seed).slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: size/2,
      background: avatarGrad(seed, t),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontFamily: FONT_DISPLAY, fontWeight: 600,
      fontSize: size * 0.34, letterSpacing: -0.3,
      flexShrink: 0,
      boxShadow: ring ? `0 0 0 2px ${t.bg}, 0 0 0 4px ${t.a1}` : 'none',
      ...style,
    }}>{letters}</div>
  );
}

Object.assign(window, { THEMES, FONT_DISPLAY, FONT_BODY, FONT_MONO, useTheme, Placeholder, Avatar, avatarGrad });
