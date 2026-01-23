'use client';

import { memo, useState, useEffect } from 'react';

export const NeonAbstractions = memo(() => {
  const [stars, setStars] = useState<
    Array<{ left: string; top: string; opacity: number; animation: string; delay: string }>
  >([]);
  const [sparkles, setSparkles] = useState<
    Array<{
      top: string;
      left: string;
      width: number;
      height: number;
      opacity: number;
      animation: string;
      delay: string;
      boxShadow: string;
    }>
  >([]);
  const [crosses, setCrosses] = useState<
    Array<{ top: string; left: string; animation: string; delay: string }>
  >([]);

  // Generate stars only on client to avoid hydration mismatch
  useEffect(() => {
    const generatedStars = [...Array(15)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 80}%`,
      opacity: Math.random() * 0.5 + 0.1,
      animation: `twinkle ${Math.random() * 4 + 3}s ease-in-out infinite`,
      delay: `${Math.random() * 3}s`,
    }));
    setStars(generatedStars);

    const generatedSparkles = [...Array(10)].map(() => {
      const width = 1 + Math.random() * 3;
      const height = 1 + Math.random() * 3;
      const opacity = 0.3 + Math.random() * 0.5;
      const animDuration = 2 + Math.random() * 3;
      const delay = Math.random() * 4;
      const shadowSize = 4 + Math.random() * 10;
      const shadowOpacity = 0.3 + Math.random() * 0.4;

      return {
        top: `${5 + Math.random() * 90}%`,
        left: `${5 + Math.random() * 90}%`,
        width,
        height,
        opacity,
        animation: `sparkle ${animDuration}s ease-in-out infinite`,
        delay: `${delay}s`,
        boxShadow: `0 0 ${shadowSize}px hsl(var(--neon-fg) / ${shadowOpacity})`,
      };
    });
    setSparkles(generatedSparkles);

    const generatedCrosses = [...Array(4)].map(() => {
      const animDuration = 3 + Math.random() * 2;
      const delay = Math.random() * 5;

      return {
        top: `${15 + Math.random() * 70}%`,
        left: `${10 + Math.random() * 80}%`,
        animation: `sparkle ${animDuration}s ease-in-out infinite`,
        delay: `${delay}s`,
      };
    });
    setCrosses(generatedCrosses);
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{
        transform: 'translateZ(0)',
        contain: 'strict',
        contentVisibility: 'auto',
      }}
    >
      {/* Large hemisphere at bottom - like planet horizon */}
      <div
        className="absolute -bottom-[50%] left-1/2 -translate-x-1/2 w-[1400px] h-[1400px] rounded-full"
        style={{
          background:
            'radial-gradient(circle at center top, hsl(var(--neon-fg) / 0.08) 0%, hsl(var(--neon-fg) / 0.04) 25%, hsl(var(--neon-fg) / 0.02) 45%, transparent 65%)',
          filter: 'blur(60px)',
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
      />

      {/* Smooth curved horizon line */}
      <svg
        className="absolute bottom-0 left-0 w-full h-full"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="horizonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--neon-fg) / 0)" />
            <stop offset="15%" stopColor="hsl(var(--neon-fg) / 0.35)" />
            <stop offset="50%" stopColor="hsl(var(--neon-fg) / 0.5)" />
            <stop offset="85%" stopColor="hsl(var(--neon-fg) / 0.35)" />
            <stop offset="100%" stopColor="hsl(var(--neon-fg) / 0)" />
          </linearGradient>
        </defs>
        <path
          d="M 0 920 Q 960 860, 1920 920"
          fill="none"
          stroke="url(#horizonGradient)"
          strokeWidth="3"
          style={{
            filter:
              'blur(2px) drop-shadow(0 0 20px hsl(var(--neon-fg) / 0.35)) drop-shadow(0 0 10px hsl(var(--neon-fg) / 0.55))',
          }}
        />
      </svg>

      {/* Atmospheric glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1200px] h-[300px]"
        style={{
          background:
            'radial-gradient(ellipse at center top, hsl(var(--neon-fg) / 0.1) 0%, hsl(var(--neon-fg) / 0.05) 50%, transparent 80%)',
          filter: 'blur(80px)',
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
      />

      {/* Scattered dots/stars effect */}
      <div
        className="absolute inset-0"
        style={{ willChange: 'opacity', transform: 'translateZ(0)' }}
      >
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute w-[1px] h-[1px] rounded-full"
            style={{
              left: star.left,
              top: star.top,
              opacity: star.opacity,
              backgroundColor: 'hsl(var(--neon-fg) / 0.9)',
              boxShadow: '0 0 1px hsl(var(--neon-fg) / 0.6)',
              animation: star.animation,
              animationDelay: star.delay,
              willChange: 'opacity',
            }}
          />
        ))}
      </div>

      {/* Large arc - top right */}
      <div
        className="absolute -top-60 -right-60 w-[800px] h-[800px] rounded-full border-2"
        style={{
          borderColor: 'hsl(var(--neon-fg) / 0.08)',
          boxShadow:
            '0 0 80px hsl(var(--neon-fg) / 0.06), inset 0 0 60px hsl(var(--neon-fg) / 0.03)',
        }}
      />

      {/* Secondary arc - animated */}
      <div
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full border animate-pulse-slow"
        style={{
          borderColor: 'hsl(var(--neon-fg) / 0.06)',
          boxShadow: '0 0 60px hsl(var(--neon-fg) / 0.05)',
        }}
      />

      {/* Floating arc - left side */}
      <div
        className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full border"
        style={{
          borderColor: 'hsl(var(--neon-fg) / 0.08)',
          boxShadow:
            '0 0 80px hsl(var(--neon-fg) / 0.04), inset 0 0 40px hsl(var(--neon-fg) / 0.02)',
        }}
      />

      {/* Diagonal light streaks */}
      <div
        className="absolute top-0 right-1/4 w-[600px] h-px rotate-[30deg] origin-top-right"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, hsl(var(--neon-fg) / 0.08) 50%, transparent 100%)',
        }}
      />
      <div
        className="absolute top-20 right-1/3 w-[400px] h-px rotate-[35deg] origin-top-right animate-pulse-slow"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, hsl(var(--neon-fg) / 0.06) 50%, transparent 100%)',
          animationDelay: '2s',
        }}
      />

      {/* Sparkles / Stars - increased count and variety */}
      {sparkles.map((sparkle, i) => (
        <div
          key={`sparkle-${i}`}
          className="absolute rounded-full"
          style={{
            top: sparkle.top,
            left: sparkle.left,
            width: `${sparkle.width}px`,
            height: `${sparkle.height}px`,
            opacity: sparkle.opacity,
            backgroundColor: 'hsl(var(--neon-fg) / 0.8)',
            animation: sparkle.animation,
            animationDelay: sparkle.delay,
            boxShadow: sparkle.boxShadow,
            willChange: 'opacity, transform',
            transform: 'translateZ(0)',
          }}
        />
      ))}

      {/* Cross sparkles - brighter accent points */}
      {crosses.map((cross, i) => (
        <div
          key={`cross-${i}`}
          className="absolute"
          style={{
            top: cross.top,
            left: cross.left,
          }}
        >
          <div
            className="absolute w-4 h-px"
            style={{
              transform: 'translateX(-50%)',
              backgroundColor: 'hsl(var(--neon-fg) / 0.55)',
              boxShadow: '0 0 10px hsl(var(--neon-fg) / 0.45)',
              animation: cross.animation,
              animationDelay: cross.delay,
            }}
          />
          <div
            className="absolute w-px h-4"
            style={{
              transform: 'translateY(-50%)',
              backgroundColor: 'hsl(var(--neon-fg) / 0.55)',
              boxShadow: '0 0 10px hsl(var(--neon-fg) / 0.45)',
              animation: cross.animation,
              animationDelay: cross.delay,
            }}
          />
        </div>
      ))}

      {/* Radial gradient center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(var(--neon-fg) / 0.05) 0%, transparent 50%)',
        }}
      />

      {/* Gradient fade at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-80"
        style={{
          background: 'linear-gradient(to top, hsl(var(--background)) 0%, transparent)',
        }}
      />

      {/* Gradient fade at top */}
      <div
        className="absolute top-0 left-0 right-0 h-40"
        style={{
          background: 'linear-gradient(to bottom, hsl(var(--background)) 0%, transparent 100%)',
        }}
      />
    </div>
  );
});

NeonAbstractions.displayName = 'NeonAbstractions';
