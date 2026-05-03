// Minimal line icons, 1.5px stroke, consistent 24px viewBox.
const Icon = ({ name, size = 20, stroke = 'currentColor', strokeWidth = 1.5, style = {} }) => {
  const paths = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
    pin: <><path d="M12 21s-7-6.5-7-12a7 7 0 1 1 14 0c0 5.5-7 12-7 12Z"/><circle cx="12" cy="9" r="2.5"/></>,
    star: <path d="M12 3.5l2.7 5.5 6 .8-4.4 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6L3.3 9.8l6-.8L12 3.5Z"/>,
    arrow: <><path d="M4 12h16"/><path d="m14 6 6 6-6 6"/></>,
    arrowLeft: <><path d="M20 12H4"/><path d="M10 6l-6 6 6 6"/></>,
    send: <path d="M4 12 20 4l-4 16-4-8-8-4Z"/>,
    check: <path d="m5 12 5 5 10-12"/>,
    x: <><path d="M6 6l12 12"/><path d="M18 6 6 18"/></>,
    dot: <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>,
    mic: <><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/></>,
    cam: <><path d="M4 7h4l2-2h4l2 2h4v12H4z"/><circle cx="12" cy="13" r="4"/></>,
    chat: <path d="M4 5h16v11H9l-5 4z"/>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 20a8 8 0 0 1 16 0"/></>,
    shield: <path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3Z"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    menu: <><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></>,
    plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    food: <><path d="M4 10h16"/><path d="M6 10c0-3 2-5 6-5s6 2 6 5"/><path d="M4 14h16v2a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z"/></>,
    walk: <><circle cx="13" cy="4.5" r="1.5"/><path d="M10 21l2-6-3-3 3-5 3 4 3 1"/></>,
    car: <><path d="M5 13l2-5h10l2 5"/><path d="M4 13h16v5H4z"/><circle cx="8" cy="18" r="1.5"/><circle cx="16" cy="18" r="1.5"/></>,
    moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/>,
    bag: <><path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></>,
    heart: <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.7A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z"/>,
    flash: <path d="m13 3-8 12h6l-1 6 8-12h-6l1-6Z"/>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 3 2.5 15 0 18"/><path d="M12 3c-2.5 3-2.5 15 0 18"/></>,
    filter: <><path d="M4 5h16"/><path d="M7 12h10"/><path d="M10 19h4"/></>,
    wallet: <><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M16 13h2"/><path d="M3 10h18"/></>,
    lightning: <path d="m13 2-9 13h6l-1 7 9-13h-6l1-7Z"/>,
    share: <><circle cx="6" cy="12" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="m8 11 8-4"/><path d="m8 13 8 4"/></>,
    home: <><path d="m3 11 9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 3v4"/><path d="M16 3v4"/></>,
    compass: <><circle cx="12" cy="12" r="9"/><path d="m15 9-1.5 4.5L9 15l1.5-4.5z" fill="currentColor" stroke="none"/></>,
    bookmark: <path d="M6 3h12v18l-6-4-6 4z"/>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'block', flexShrink: 0, ...style }}>
      {paths[name] || <circle cx="12" cy="12" r="8"/>}
    </svg>
  );
};

window.Icon = Icon;
