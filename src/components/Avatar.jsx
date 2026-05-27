export default function Avatar({ src, username, size = 'md', className = '', rounded = 'md' }) {
  const sizes = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-[11px]',
    md: 'h-9 w-9 text-[12px]',
    lg: 'h-14 w-14 text-[15px]',
    xl: 'h-28 w-28 text-[28px]',
    '2xl': 'h-36 w-36 text-[36px]',
  };

  const radii = {
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  const initial = username?.[0]?.toUpperCase() || '?';
  const base = `${sizes[size]} ${radii[rounded]} shrink-0 ring-1 ring-white/[0.08] ${className}`;

  if (src) {
    return (
      <img
        src={src}
        alt={username}
        className={`${base} object-cover`}
        loading="lazy"
      />
    );
  }

  const palettes = [
    'from-[#3a3a40] to-[#1a1a1d]',
    'from-[#3d3a36] to-[#1a1815]',
    'from-[#36383d] to-[#15171a]',
    'from-[#3d3636] to-[#1a1414]',
    'from-[#363d3a] to-[#141a18]',
  ];
  const idx = (username?.charCodeAt(0) || 0) % palettes.length;

  return (
    <div
      className={`${base} flex items-center justify-center bg-gradient-to-br ${palettes[idx]} font-medium text-ink-50`}
    >
      {initial}
    </div>
  );
}
