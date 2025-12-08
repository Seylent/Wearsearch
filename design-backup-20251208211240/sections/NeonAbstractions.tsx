import React from 'react';

export const NeonAbstractions = () => {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-30">
      {/* Simple decorative neon gradient placeholder */}
      <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-pink-400 via-violet-400 to-blue-400 blur-3xl opacity-40" />
    </div>
  );
};

export default NeonAbstractions;
