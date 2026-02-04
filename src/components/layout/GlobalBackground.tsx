export const GlobalBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
    <div className="absolute inset-0 bg-white" />
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
  </div>
);
