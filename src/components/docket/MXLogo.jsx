export default function MXLogo({ size = "md", dark = false }) {
  const sizes = {
    sm: { wrapper: "w-12 h-10", text: "text-base", sub: "text-[8px]" },
    md: { wrapper: "w-16 h-12", text: "text-xl", sub: "text-[9px]" },
    lg: { wrapper: "w-24 h-16", text: "text-2xl", sub: "text-[10px]" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className={`${s.wrapper} flex flex-col items-start justify-center`}>
      <div className={`${s.text} font-black tracking-tight leading-none`} style={{ color: dark ? '#FFFFFF' : '#0D1A2E' }}>
        Metal <span style={{ color: '#1E4D99' }}>X</span>
      </div>
      <div className={`${s.sub} font-semibold tracking-widest uppercase mt-0.5`} style={{ color: dark ? '#90C4F9' : '#7A8898' }}>
        Renewables
      </div>
    </div>
  );
}