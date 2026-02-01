'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { PropsWithChildren } from 'react';

interface ScrollRevealProps {
  className?: string;
}

export function ScrollReveal({ children, className }: PropsWithChildren<ScrollRevealProps>) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
