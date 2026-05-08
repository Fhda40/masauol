interface Props {
  size?: number;
  showText?: boolean;
  className?: string;
  id?: string;
}

export default function MasoulLogo({ size = 36, showText = true, className = "", id = "nav" }: Props) {
  const gId = `mg-${id}`;
  const sId = `ms-${id}`;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id={gId} x1="4" y1="4" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E8CC7A" />
            <stop offset="45%" stopColor="#C9A84C" />
            <stop offset="100%" stopColor="#8F6F2A" />
          </linearGradient>
          <filter id={sId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer ring — subtle */}
        <circle cx="22" cy="22" r="20" stroke={`url(#${gId})`} strokeWidth="0.6" strokeOpacity="0.2" />

        {/* Scale beam — slightly tilted (left pan heavier) */}
        <line x1="7" y1="20" x2="37" y2="17" stroke={`url(#${gId})`} strokeWidth="1.6" strokeLinecap="round" />

        {/* Pivot pillar */}
        <line x1="22" y1="10" x2="22" y2="30" stroke={`url(#${gId})`} strokeWidth="1.6" strokeLinecap="round" />

        {/* Pivot top dot */}
        <circle cx="22" cy="10" r="2.2" fill={`url(#${gId})`} />

        {/* Beam-pillar connector dot */}
        <circle cx="22" cy="18.5" r="1.4" fill={`url(#${gId})`} fillOpacity="0.7" />

        {/* Left chain */}
        <line x1="8" y1="20.3" x2="8" y2="28.5" stroke={`url(#${gId})`} strokeWidth="1" strokeLinecap="round" />

        {/* Right chain */}
        <line x1="36" y1="17.3" x2="36" y2="25.5" stroke={`url(#${gId})`} strokeWidth="1" strokeLinecap="round" />

        {/* Left pan (lower — heavier) */}
        <path d="M4.5 28.5 Q8 31 11.5 28.5" stroke={`url(#${gId})`} strokeWidth="1.8" strokeLinecap="round" fill="none" />

        {/* Right pan (higher — lighter) */}
        <path d="M32.5 25.5 Q36 28 39.5 25.5" stroke={`url(#${gId})`} strokeWidth="1.8" strokeLinecap="round" fill="none" />

        {/* Base + feet */}
        <line x1="17" y1="30" x2="27" y2="30" stroke={`url(#${gId})`} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="22" y1="30" x2="22" y2="35" stroke={`url(#${gId})`} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="15" y1="35" x2="29" y2="35" stroke={`url(#${gId})`} strokeWidth="1.8" strokeLinecap="round" />
      </svg>

      {/* Wordmark */}
      {showText && (
        <span
          className="font-black tracking-wide select-none"
          style={{
            fontSize: size * 0.44,
            background: "linear-gradient(135deg, #E8CC7A 0%, #C9A84C 50%, #A8893A 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "0.04em",
          }}
        >
          مسؤول
        </span>
      )}
    </div>
  );
}
