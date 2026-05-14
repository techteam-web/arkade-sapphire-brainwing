export default function PlaceholderMedia({
  label = "",
  aspect,
  className = "",
  children,
}) {
  const aspectStyle = aspect ? { aspectRatio: aspect } : undefined;

  return (
    <div
      className={`relative w-full h-full bg-cocoa border border-platinum/10 ${className}`}
      style={aspectStyle}
    >
      {label && (
        <span className="absolute bottom-4 left-5 text-[0.6rem] tracking-[0.32em] uppercase text-silver/60">
          {label}
        </span>
      )}
      {children}
    </div>
  );
}
