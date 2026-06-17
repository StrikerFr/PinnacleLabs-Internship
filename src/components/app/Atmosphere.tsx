export function Atmosphere() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "var(--ivory)" }} />
      <div
        className="absolute -top-40 -right-40 h-[700px] w-[700px] rounded-full opacity-40 blur-[140px]"
        style={{ background: "radial-gradient(circle, rgba(229,212,177,0.6), transparent 60%)" }}
      />
      <div
        className="absolute -bottom-60 -left-40 h-[700px] w-[700px] rounded-full opacity-30 blur-[160px]"
        style={{ background: "radial-gradient(circle, rgba(184,149,94,0.25), transparent 60%)" }}
      />
      <div className="tp-grain absolute inset-0 opacity-50" />
    </div>
  );
}
