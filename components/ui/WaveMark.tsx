export function WaveMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 140"
      role="img"
      aria-label="잔잔한 물결"
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="wave-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eafafd" />
          <stop offset="100%" stopColor="#cdeef5" />
        </linearGradient>
      </defs>
      <rect width="240" height="140" fill="url(#wave-sky)" />
      <path
        d="M0 96c24-14 42-14 64 0s42 14 64 0 42-14 64 0 42 14 64 0v44H0z"
        fill="#7bddec"
        opacity="0.55"
      />
      <path
        d="M0 110c24-12 42-12 64 0s42 12 64 0 42-12 64 0 42 12 64 0v30H0z"
        fill="#37c5d8"
        opacity="0.7"
      />
      <path
        d="M0 124c24-10 42-10 64 0s42 10 64 0 42-10 64 0 42 10 64 0v16H0z"
        fill="#126c7d"
      />
    </svg>
  );
}
