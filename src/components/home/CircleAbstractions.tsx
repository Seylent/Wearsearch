export const CircleAbstractions = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
    <div
      className="absolute -bottom-[45%] left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full"
      style={{
        background:
          'radial-gradient(circle at center top, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.04) 30%, rgba(0,0,0,0.02) 50%, transparent 70%)',
        filter: 'blur(50px)',
      }}
    />
    <div
      className="absolute -top-48 -right-48 w-[720px] h-[720px] rounded-full border"
      style={{
        borderColor: 'rgba(0,0,0,0.08)',
        boxShadow: '0 0 80px rgba(0,0,0,0.04), inset 0 0 60px rgba(0,0,0,0.03)',
      }}
    />
    <div
      className="absolute -top-28 -right-28 w-[520px] h-[520px] rounded-full border"
      style={{
        borderColor: 'rgba(0,0,0,0.06)',
        boxShadow: '0 0 50px rgba(0,0,0,0.03)',
      }}
    />
    <div
      className="absolute top-1/4 -left-32 w-[420px] h-[420px] rounded-full border"
      style={{
        borderColor: 'rgba(0,0,0,0.08)',
        boxShadow: '0 0 70px rgba(0,0,0,0.04), inset 0 0 40px rgba(0,0,0,0.02)',
      }}
    />
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full"
      style={{
        background: 'radial-gradient(circle, rgba(0,0,0,0.04) 0%, transparent 55%)',
      }}
    />
  </div>
);
