/**
 * High Refresh Rate Examples
 * Приклади роботи з 120Hz/144Hz дисплеями
 */

import { useEffect, useRef, useState } from 'react';
import { 
  useDisplayCapabilities, 
  useAdaptiveFPS,
  usePerformanceSettings,
  useFPSMonitor,
  usePerformanceClass,
  type PerformanceClass
} from '@/hooks/performance';

// ============================================================================
// Example 1: FPS Monitor для дебагу
// ============================================================================

export const FPSMonitor = () => {
  const { fps, frameTime, refreshRate, isOptimal } = useFPSMonitor();

  return (
    <div className="fixed top-4 right-4 bg-black/90 text-white p-4 rounded-lg text-sm font-mono backdrop-blur-sm z-50">
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span>FPS:</span>
          <span className={isOptimal ? 'text-green-400' : 'text-yellow-400'}>
            {fps}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Frame Time:</span>
          <span>{frameTime.toFixed(2)}ms</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Display:</span>
          <span className="text-blue-400">{refreshRate}Hz</span>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          {isOptimal ? '✅ Optimal' : '⚠️ Performance Issue'}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Example 2: Адаптивна анімація на основі refresh rate
// ============================================================================

export const AdaptiveAnimation = () => {
  const { refreshRate, supportsHighRefreshRate } = useDisplayCapabilities();
  const [position, setPosition] = useState(0);

  useEffect(() => {
    let rafId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Швидкість адаптується до refresh rate
      const speed = supportsHighRefreshRate ? 200 : 100; // px/sec
      setPosition(prev => (prev + speed * deltaTime) % window.innerWidth);

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [supportsHighRefreshRate]);

  return (
    <div className="relative h-20 bg-muted/10">
      <div
        className="absolute top-1/2 -translate-y-1/2 w-12 h-12 bg-primary rounded-full"
        style={{ 
          transform: `translateX(${position}px) translateY(-50%)`,
          // На 120Hz+ використовуємо більш складні ефекти
          filter: supportsHighRefreshRate ? 'blur(0px) drop-shadow(0 0 20px currentColor)' : 'none'
        }}
      />
      <div className="absolute top-2 left-2 text-xs text-muted-foreground">
        {refreshRate}Hz Animation
      </div>
    </div>
  );
};

// ============================================================================
// Example 3: Адаптивні налаштування графіки
// ============================================================================

export const AdaptiveContent = ({ children }: { children: React.ReactNode }) => {
  const settings = usePerformanceSettings();

  return (
    <div 
      className="min-h-screen"
      style={{
        // Адаптуємо візуальні ефекти
        filter: settings.enableBlur ? 'none' : 'blur(0)',
        '--max-particles': settings.maxParticles,
      } as React.CSSProperties}
    >
      {/* Показуємо повідомлення про налаштування */}
      <div className="fixed bottom-4 left-4 bg-black/80 text-white p-3 rounded-lg text-xs">
        <div>Performance: {settings.performanceClass.toUpperCase()}</div>
        <div>Target FPS: {settings.targetFPS}</div>
        <div>Quality: {settings.imageQuality}</div>
      </div>

      {children}
    </div>
  );
};

// ============================================================================
// Example 4: Smooth Parallax з 120Hz підтримкою
// ============================================================================

export const HighRefreshParallax = ({ children }: { children: React.ReactNode }) => {
  const [scrollY, setScrollY] = useState(0);
  const { targetFPS } = useAdaptiveFPS();
  const lastUpdate = useRef(0);
  const rafId = useRef<number>();

  useEffect(() => {
    const frameTime = 1000 / targetFPS;

    const handleScroll = () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }

      rafId.current = requestAnimationFrame((time) => {
        if (time - lastUpdate.current >= frameTime) {
          setScrollY(window.scrollY);
          lastUpdate.current = time;
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [targetFPS]);

  return (
    <div
      style={{
        transform: `translateY(${scrollY * 0.5}px)`,
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
};

// ============================================================================
// Example 5: Particle System з адаптивною кількістю
// ============================================================================

export const AdaptiveParticles = () => {
  const settings = usePerformanceSettings();
  const particles = Array.from({ length: settings.maxParticles });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.5,
            animation: `float ${3 + Math.random() * 5}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
  );
};

// ============================================================================
// Example 6: Display Info Panel
// ============================================================================

export const DisplayInfoPanel = () => {
  const { refreshRate, supportsHighRefreshRate } = useDisplayCapabilities();
  const { targetFPS, isHighPerformanceMode } = useAdaptiveFPS();
  const perfClass = usePerformanceClass();

  return (
    <div className="bg-card p-6 rounded-lg border border-border space-y-4">
      <h3 className="text-lg font-bold">Display Capabilities</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-muted-foreground">Refresh Rate</div>
          <div className="text-2xl font-bold">
            {refreshRate}Hz
            {supportsHighRefreshRate && (
              <span className="text-sm text-green-400 ml-2">⚡ High</span>
            )}
          </div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground">Target FPS</div>
          <div className="text-2xl font-bold">{targetFPS}</div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground">Performance Class</div>
          <div className="text-xl font-bold capitalize">
            {perfClass}
            {perfClass === 'ultra' && ' 🚀'}
          </div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground">Mode</div>
          <div className="text-xl">
            {isHighPerformanceMode ? '💻 Desktop' : '📱 Mobile'}
          </div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground pt-2 border-t">
        {supportsHighRefreshRate ? (
          <p>✅ Your display supports high refresh rate. All animations will run at {refreshRate} FPS for ultra-smooth experience.</p>
        ) : (
          <p>ℹ️ Your display runs at {refreshRate}Hz. This is perfect for optimal battery life and smooth performance.</p>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Example 7: Performance Test Benchmark
// ============================================================================

export const PerformanceBenchmark = () => {
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const { refreshRate } = useDisplayCapabilities();

  const runBenchmark = async () => {
    setRunning(true);
    setScore(0);

    let frames = 0;
    const startTime = performance.now();
    const duration = 3000; // 3 seconds

    const benchmark = (currentTime: number) => {
      frames++;
      
      if (currentTime - startTime < duration) {
        // Симулюємо важку роботу
        for (let i = 0; i < 10000; i++) {
          Math.sqrt(Math.random());
        }
        requestAnimationFrame(benchmark);
      } else {
        const avgFPS = Math.round((frames / duration) * 1000);
        const scoreValue = Math.round((avgFPS / refreshRate) * 100);
        setScore(scoreValue);
        setRunning(false);
      }
    };

    requestAnimationFrame(benchmark);
  };

  return (
    <div className="bg-card p-6 rounded-lg border border-border">
      <h3 className="text-lg font-bold mb-4">Performance Benchmark</h3>
      
      <button
        onClick={runBenchmark}
        disabled={running}
        className="btn-glass mb-4"
      >
        {running ? 'Running...' : 'Start Benchmark'}
      </button>

      {score > 0 && (
        <div className="space-y-2">
          <div className="text-4xl font-bold">
            {score}%
            {score >= 95 && ' 🔥'}
            {score >= 90 && score < 95 && ' ✨'}
            {score >= 80 && score < 90 && ' ✅'}
          </div>
          <div className="text-sm text-muted-foreground">
            {score >= 95 && 'Exceptional! Your device handles high refresh rate perfectly.'}
            {score >= 90 && score < 95 && 'Excellent performance. Smooth experience guaranteed.'}
            {score >= 80 && score < 90 && 'Good performance. Most animations will be smooth.'}
            {score < 80 && 'Performance optimizations applied for your device.'}
          </div>
        </div>
      )}
    </div>
  );
};
