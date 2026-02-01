'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        transition={transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
