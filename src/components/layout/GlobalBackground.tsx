export const GlobalBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
    <div className="absolute inset-0 bg-white" />
    <div
      className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full border sm:-top-48 sm:-right-48 sm:w-[720px] sm:h-[720px]"
      style={{
        borderColor: 'rgba(0,0,0,0.08)',
        boxShadow: '0 0 80px rgba(0,0,0,0.04), inset 0 0 60px rgba(0,0,0,0.03)',
      }}
    />
    <div
      className="absolute -top-20 -right-20 w-[300px] h-[300px] rounded-full border hidden sm:block sm:-top-28 sm:-right-28 sm:w-[520px] sm:h-[520px]"
      style={{
        borderColor: 'rgba(0,0,0,0.06)',
        boxShadow: '0 0 50px rgba(0,0,0,0.03)',
      }}
    />
    <div
      className="absolute top-[55%] -left-40 w-[320px] h-[320px] rounded-full border sm:top-1/4 sm:-left-32 sm:w-[420px] sm:h-[420px]"
      style={{
        borderColor: 'rgba(0,0,0,0.08)',
        boxShadow: '0 0 70px rgba(0,0,0,0.04), inset 0 0 40px rgba(0,0,0,0.02)',
      }}
    />
  </div>
);
