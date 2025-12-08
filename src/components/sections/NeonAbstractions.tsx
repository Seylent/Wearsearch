export const NeonAbstractions = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large glowing arc - top right */}
      <div 
        className="absolute -top-60 -right-60 w-[800px] h-[800px] rounded-full border-2 border-foreground/[0.08]"
        style={{
          boxShadow: '0 0 120px rgba(255,255,255,0.08), 0 0 60px rgba(255,255,255,0.05), inset 0 0 80px rgba(255,255,255,0.03)'
        }}
      />
      
      {/* Secondary arc - top right inner */}
      <div 
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full border border-foreground/[0.06] animate-pulse-slow"
        style={{
          boxShadow: '0 0 80px rgba(255,255,255,0.06)'
        }}
      />
      
      {/* Medium arc - left side */}
      <div 
        className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full border border-foreground/[0.08] animate-float"
        style={{
          boxShadow: '0 0 100px rgba(255,255,255,0.06), inset 0 0 60px rgba(255,255,255,0.02)',
          animationDelay: '1s'
        }}
      />

      {/* Smaller decorative arc - bottom left */}
      <div 
        className="absolute bottom-20 left-10 w-[300px] h-[300px] rounded-full border border-foreground/[0.05]"
        style={{
          boxShadow: '0 0 60px rgba(255,255,255,0.04)'
        }}
      />

      {/* Glowing orb - center right */}
      <div 
        className="absolute top-1/2 right-1/4 w-40 h-40 rounded-full animate-glow"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 40%, transparent 70%)'
        }}
      />

      {/* Glowing orb - left side */}
      <div 
        className="absolute top-1/3 left-1/4 w-24 h-24 rounded-full animate-glow"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
          animationDelay: '1.5s'
        }}
      />

      {/* Curved neon line - top */}
      <svg className="absolute top-20 left-1/4 w-[500px] h-[200px] opacity-20" viewBox="0 0 500 200">
        <path
          d="M0,100 Q125,20 250,100 T500,100"
          fill="none"
          stroke="white"
          strokeWidth="1"
          className="animate-pulse-slow"
          style={{ filter: 'blur(1px)' }}
        />
      </svg>

      {/* Horizontal glow line */}
      <div 
        className="absolute top-2/3 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 30%, rgba(255,255,255,0.15) 70%, transparent 100%)'
        }}
      />

      {/* Diagonal light streak */}
      <div 
        className="absolute top-1/4 right-1/3 w-[400px] h-px rotate-45 animate-pulse-slow"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
          animationDelay: '2s'
        }}
      />

      {/* Sparkles / Stars */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="sparkle"
          style={{
            top: `${10 + Math.random() * 80}%`,
            left: `${5 + Math.random() * 90}%`,
            animationDelay: `${Math.random() * 4}s`,
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            boxShadow: `0 0 ${4 + Math.random() * 8}px rgba(255,255,255,0.5)`
          }}
        />
      ))}

      {/* Subtle grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }}
      />

      {/* Radial gradient center */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 50%)'
        }}
      />

      {/* Gradient fade at bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-60"
        style={{
          background: 'linear-gradient(to top, hsl(0 0% 4%), transparent)'
        }}
      />
    </div>
  );
};
