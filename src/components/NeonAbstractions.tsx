export const NeonAbstractions = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large hemisphere at bottom - like planet horizon */}
      <div
        className="absolute -bottom-[50%] left-1/2 -translate-x-1/2 w-[1400px] h-[1400px] rounded-full"
        style={{
          background: 'radial-gradient(circle at center top, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 25%, rgba(255, 255, 255, 0.01) 45%, transparent 65%)',
          filter: 'blur(80px)'
        }}
      />
      
      {/* Smooth curved horizon line */}
      <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 1920 1080" preserveAspectRatio="none">
        <defs>
          <linearGradient id="horizonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
            <stop offset="15%" stopColor="rgba(255, 255, 255, 0.6)" />
            <stop offset="50%" stopColor="rgba(255, 255, 255, 0.85)" />
            <stop offset="85%" stopColor="rgba(255, 255, 255, 0.6)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
          </linearGradient>
        </defs>
        <path
          d="M 0 920 Q 960 860, 1920 920"
          fill="none"
          stroke="url(#horizonGradient)"
          strokeWidth="3"
          style={{
            filter: 'blur(2px) drop-shadow(0 0 20px rgba(255, 255, 255, 0.4)) drop-shadow(0 0 10px rgba(255, 255, 255, 0.6))'
          }}
        />
      </svg>
      
      {/* Atmospheric glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1200px] h-[300px]"
        style={{
          background: 'radial-gradient(ellipse at center top, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.03) 50%, transparent 80%)',
          filter: 'blur(100px)'
        }}
      />
      
      {/* Scattered dots/stars effect */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-[1px] h-[1px] bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 80}%`,
              opacity: Math.random() * 0.5 + 0.1,
              boxShadow: '0 0 1px rgba(255, 255, 255, 0.8)',
              animation: `twinkle ${Math.random() * 4 + 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Large arc - top right */}
      <div
        className="absolute -top-60 -right-60 w-[800px] h-[800px] rounded-full border-2 border-white/[0.08]"
        style={{
          boxShadow: '0 0 80px rgba(255,255,255,0.05), inset 0 0 60px rgba(255,255,255,0.02)'
        }}
      />

      {/* Secondary arc - animated */}
      <div
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full border border-white/[0.06] animate-pulse-slow"
        style={{
          boxShadow: '0 0 60px rgba(255,255,255,0.04)'
        }}
      />

      {/* Floating arc - left side */}
      <div
        className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full border border-white/[0.08]"
        style={{
          boxShadow: '0 0 80px rgba(255,255,255,0.04), inset 0 0 40px rgba(255,255,255,0.02)'
        }}
      />

      {/* Diagonal light streaks */}
      <div
        className="absolute top-0 right-1/4 w-[600px] h-px rotate-[30deg] origin-top-right"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)'
        }}
      />
      <div
        className="absolute top-20 right-1/3 w-[400px] h-px rotate-[35deg] origin-top-right animate-pulse-slow"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
          animationDelay: '2s'
        }}
      />

      {/* Sparkles / Stars - increased count and variety */}
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-foreground"
          style={{
            top: `${5 + Math.random() * 90}%`,
            left: `${5 + Math.random() * 90}%`,
            width: `${1 + Math.random() * 3}px`,
            height: `${1 + Math.random() * 3}px`,
            opacity: 0.3 + Math.random() * 0.5,
            animation: `sparkle ${2 + Math.random() * 3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 4}s`,
            boxShadow: `0 0 ${4 + Math.random() * 10}px rgba(255,255,255,${0.3 + Math.random() * 0.4})`
          }}
        />
      ))}

      {/* Cross sparkles - brighter accent points */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`cross-${i}`}
          className="absolute"
          style={{
            top: `${15 + Math.random() * 70}%`,
            left: `${10 + Math.random() * 80}%`,
          }}
        >
          <div
            className="absolute w-4 h-px bg-foreground/60"
            style={{
              transform: 'translateX(-50%)',
              boxShadow: '0 0 10px rgba(255,255,255,0.5)',
              animation: `sparkle ${3 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
          <div
            className="absolute w-px h-4 bg-foreground/60"
            style={{
              transform: 'translateY(-50%)',
              boxShadow: '0 0 10px rgba(255,255,255,0.5)',
              animation: `sparkle ${3 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        </div>
      ))}

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Radial gradient center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 50%)'
        }}
      />

      {/* Gradient fade at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-80"
        style={{
          background: 'linear-gradient(to top, hsl(0 0% 4%), transparent)'
        }}
      />

      {/* Gradient fade at top */}
      <div
        className="absolute top-0 left-0 right-0 h-40"
        style={{
          background: 'linear-gradient(to bottom, hsl(0 0% 4%) 0%, transparent 100%)'
        }}
      />
    </div>
  );
};
