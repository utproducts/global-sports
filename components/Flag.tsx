// Flat flag icon (flag-icons). Replaces waving emoji flags.
const ALIAS: Record<string, string> = { XI: "gb-nir", EU: "eu" };

export default function Flag({ code, className = "", style }: { code: string; className?: string; style?: React.CSSProperties }) {
  const cc = (ALIAS[code.toUpperCase()] || code).toLowerCase();
  return <span className={`fi fi-${cc} gs-flag ${className}`} style={style} aria-hidden />;
}
