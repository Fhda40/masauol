import { motion } from "framer-motion";

/* ─── Reusable floating orb ─── */
function FloatOrb({
  cx, cy, r,
  color = "255,255,255",
  opacity = 0.18,
  delay = 0,
  amp = 8,
}: {
  cx: number; cy: number; r: number; color?: string;
  opacity?: number; delay?: number; amp?: number;
}) {
  return (
    <motion.circle
      cx={cx} cy={cy} r={r}
      fill={`rgba(${color},${opacity})`}
      animate={{ cy: [cy - amp * 0.5, cy + amp * 0.5, cy - amp * 0.5] }}
      transition={{ duration: 5 + delay * 0.7, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

/* ─── Gold particle dot ─── */
function Particle({ cx, cy, delay = 0 }: { cx: number; cy: number; delay?: number }) {
  return (
    <motion.circle
      cx={cx} cy={cy} r={2.5}
      fill="#C9A84C"
      animate={{
        cy: [cy, cy - 20, cy],
        opacity: [0.75, 0.15, 0.75],
        r: [2.5, 1.5, 2.5],
      }}
      transition={{ duration: 3.5 + delay * 0.4, repeat: Infinity, ease: "easeInOut", delay: delay * 0.6 }}
    />
  );
}

/* ─── Floating badge pill ─── */
function Badge({
  x, y, w,
  line1, line2,
  stroke = "rgba(201,168,76,0.25)",
  fill1 = "#A8893A",
  fill2 = "#64748b",
  delay = 0,
  dir = 1,
}: {
  x: number; y: number; w: number;
  line1: string; line2?: string;
  stroke?: string; fill1?: string; fill2?: string;
  delay?: number; dir?: number;
}) {
  const h = line2 ? 38 : 26;
  return (
    <motion.g
      animate={{ y: [0, -7 * dir, 0] }}
      transition={{ duration: 4 + delay * 0.5, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <rect x={x} y={y} width={w} height={h} rx={h / 2}
        fill="rgba(255,255,255,0.88)" stroke={stroke} strokeWidth="1" />
      <text
        x={x + w / 2} y={y + (line2 ? 14 : h / 2 + 3.5)}
        textAnchor="middle" fill={fill1}
        fontSize="10" fontWeight="700"
        fontFamily="'IBM Plex Sans Arabic', 'Readex Pro', system-ui, sans-serif"
      >
        {line1}
      </text>
      {line2 && (
        <text
          x={x + w / 2} y={y + 27}
          textAnchor="middle" fill={fill2}
          fontSize="7.5"
          fontFamily="'IBM Plex Sans Arabic', 'Readex Pro', system-ui, sans-serif"
        >
          {line2}
        </text>
      )}
    </motion.g>
  );
}

/* ─── Main illustration ─── */
export default function HeroIllustration() {
  /* Particle positions */
  const particles = [
    { cx: 38,  cy: 205, d: 0   },
    { cx: 362, cy: 195, d: 0.5 },
    { cx: 72,  cy: 315, d: 1   },
    { cx: 328, cy: 310, d: 1.5 },
    { cx: 128, cy: 52,  d: 2   },
    { cx: 272, cy: 58,  d: 2.5 },
    { cx: 22,  cy: 118, d: 1.8 },
    { cx: 378, cy: 128, d: 1.3 },
    { cx: 148, cy: 358, d: 0.3 },
    { cx: 252, cy: 352, d: 0.9 },
  ];

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <svg
        viewBox="0 0 400 400"
        style={{ width: "100%", height: "100%", overflow: "visible" }}
        aria-hidden="true"
      >
        <defs>
          {/* Beam gradient */}
          <linearGradient id="hi-beam" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#A8893A" />
            <stop offset="40%"  stopColor="#F0D78A" />
            <stop offset="60%"  stopColor="#F0D78A" />
            <stop offset="100%" stopColor="#A8893A" />
          </linearGradient>
          {/* Pillar gradient */}
          <linearGradient id="hi-pillar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#C9A84C" />
            <stop offset="100%" stopColor="#7A6228" />
          </linearGradient>
          {/* Soft gold glow filter */}
          <filter id="hi-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ── BACKGROUND AMBIENT GLOW ── */}
        <motion.circle cx={60} cy={360} r={170}
          fill="rgba(30,58,138,0.06)"
          animate={{ r: [170, 195, 170], opacity: [0.06, 0.03, 0.06] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle cx={345} cy={40} r={130}
          fill="rgba(201,168,76,0.07)"
          animate={{ r: [130, 155, 130], opacity: [0.07, 0.04, 0.07] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        {/* ── FLOATING GLASS ORBS ── */}
        <FloatOrb cx={42}  cy={170} r={55} opacity={0.16} delay={0.5} amp={10} />
        <FloatOrb cx={358} cy={240} r={60} opacity={0.13} delay={1.5} amp={9} />
        <FloatOrb cx={200} cy={375} r={45} opacity={0.10} delay={2.2} amp={7} />
        <FloatOrb cx={58}  cy={78}  r={32} opacity={0.22} delay={0.9} amp={8} />
        <FloatOrb cx={352} cy={88}  r={28} opacity={0.19} delay={1.3} amp={9} />

        {/* ── GOLD PARTICLES ── */}
        {particles.map((p, i) => (
          <Particle key={i} cx={p.cx} cy={p.cy} delay={p.d} />
        ))}

        {/* ── DECORATIVE SPINNING RINGS ── */}
        <motion.circle cx={200} cy={180} r={118}
          fill="none"
          stroke="rgba(201,168,76,0.07)"
          strokeWidth="1"
          strokeDasharray="5 9"
          animate={{ rotate: 360 }}
          style={{ originX: "200px", originY: "180px" }}
          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
        />
        <motion.circle cx={200} cy={180} r={145}
          fill="none"
          stroke="rgba(30,58,138,0.04)"
          strokeWidth="1"
          strokeDasharray="2 14"
          animate={{ rotate: -360 }}
          style={{ originX: "200px", originY: "180px" }}
          transition={{ duration: 44, repeat: Infinity, ease: "linear" }}
        />

        {/* ══════════════════════════════════════
            SCALES OF JUSTICE
            Pivot point: local (0,0) = global (200,165)
            ══════════════════════════════════════ */}
        <g transform="translate(200,165)">

          {/* Rotating group: beam + chains + pans */}
          <motion.g
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: "0px", originY: "0px" }}
          >
            {/* ── Beam ── */}
            <line x1="-108" y1="0" x2="108" y2="0"
              stroke="url(#hi-beam)" strokeWidth="5.5" strokeLinecap="round"
              filter="url(#hi-glow)" />

            {/* Beam end ornaments */}
            <circle cx="-108" cy="0" r="5.5" fill="#C9A84C" />
            <circle cx="108"  cy="0" r="5.5" fill="#C9A84C" />

            {/* ── Left chain ── */}
            <line x1="-108" y1="6" x2="-108" y2="50"
              stroke="#C9A84C" strokeWidth="1.5" strokeDasharray="4 3.5" opacity={0.7} />

            {/* ── Left pan (glass dish) ── */}
            <ellipse cx="-108" cy="60" rx="40" ry="10.5"
              fill="rgba(255,248,230,0.68)" stroke="#C9A84C" strokeWidth="1.5" />
            {/* Pan rim reflection */}
            <ellipse cx="-108" cy="57.5" rx="23" ry="4"
              fill="rgba(255,255,255,0.45)" />

            {/* ── Right chain ── */}
            <line x1="108" y1="6" x2="108" y2="50"
              stroke="#C9A84C" strokeWidth="1.5" strokeDasharray="4 3.5" opacity={0.7} />

            {/* ── Right pan (glass dish) ── */}
            <ellipse cx="108" cy="60" rx="40" ry="10.5"
              fill="rgba(255,248,230,0.68)" stroke="#C9A84C" strokeWidth="1.5" />
            {/* Pan rim reflection */}
            <ellipse cx="108" cy="57.5" rx="23" ry="4"
              fill="rgba(255,255,255,0.45)" />
          </motion.g>

        </g>
        {/* ══════════════════════════════════════ */}

        {/* ── TOP ORNAMENT (floating above the beam) ── */}
        <motion.g
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        >
          {/* Outer ring */}
          <circle cx="200" cy="118" r="18"
            fill="none" stroke="rgba(201,168,76,0.35)" strokeWidth="1.5" />
          {/* Glass fill */}
          <circle cx="200" cy="118" r="13"
            fill="rgba(255,248,230,0.65)" stroke="rgba(201,168,76,0.5)" strokeWidth="1.5" />
          {/* Gold dot center */}
          <circle cx="200" cy="118" r="4.5" fill="#C9A84C" />
          {/* Stem to center pin */}
          <line x1="200" y1="131" x2="200" y2="158"
            stroke="#C9A84C" strokeWidth="2" />
        </motion.g>

        {/* ── CENTER PIN (fixed) ── */}
        <circle cx="200" cy="165" r="9"
          fill="rgba(255,250,240,0.90)" stroke="#C9A84C" strokeWidth="2" />
        <circle cx="200" cy="165" r="4" fill="#C9A84C" />

        {/* ── PILLAR ── */}
        <rect x="197" y="174" width="6" height="95" rx="3"
          fill="url(#hi-pillar)" />

        {/* ── BASE ── */}
        <rect x="164" y="269" width="72" height="10" rx="5"
          fill="rgba(201,168,76,0.85)" />
        <rect x="176" y="278" width="48" height="7" rx="3.5"
          fill="rgba(140,106,26,0.65)" />

        {/* ── FLOATING BADGES ── */}

        {/* Left: years of experience */}
        <Badge
          x={8} y={144} w={82}
          line1="٢٠+ سنة"
          line2="خبرة قانونية"
          delay={0.5} dir={1}
        />

        {/* Right: satisfaction rate */}
        <Badge
          x={310} y={135} w={82}
          line1="٩٨٪ رضا"
          line2="العملاء"
          stroke="rgba(30,58,138,0.20)"
          fill1="#1E3A8A"
          delay={1.1} dir={-1}
        />

        {/* Bottom center: law reference */}
        <Badge
          x={82} y={310} w={236}
          line1="الأنظمة القانونية السعودية الرسمية"
          stroke="rgba(201,168,76,0.18)"
          fill1="#8C6A1A"
          delay={0.2} dir={1}
        />

        {/* Small: article tag */}
        <motion.g
          animate={{ y: [0, 6, 0], x: [0, 2, 0] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 1.8 }}
        >
          <rect x="26" y="255" width="68" height="26" rx="13"
            fill="rgba(30,58,138,0.07)" stroke="rgba(30,58,138,0.17)" strokeWidth="1" />
          <text x="60" y="272" textAnchor="middle" fill="#1E3A8A"
            fontSize="9" fontWeight="600"
            fontFamily="'IBM Plex Sans Arabic', 'Readex Pro', system-ui, sans-serif">
            المادة الثالثة
          </text>
        </motion.g>

        {/* Small: cases tag */}
        <motion.g
          animate={{ y: [0, -7, 0], x: [0, -2, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        >
          <rect x="306" y="255" width="78" height="26" rx="13"
            fill="rgba(22,163,74,0.07)" stroke="rgba(22,163,74,0.18)" strokeWidth="1" />
          <text x="345" y="272" textAnchor="middle" fill="#16a34a"
            fontSize="9" fontWeight="600"
            fontFamily="'IBM Plex Sans Arabic', 'Readex Pro', system-ui, sans-serif">
            ٥٠٠+ قضية
          </text>
        </motion.g>

      </svg>
    </div>
  );
}
