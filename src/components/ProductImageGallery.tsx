'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  images: string[];
  productName: string;
}

export const ProductImageGallery = ({ images, productName }: Props) => {
  const [selected, setSelected] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const resolvedImages = images;
  const hasResolved = resolvedImages.some(Boolean);
  const activeImages = hasResolved ? resolvedImages : images;

  const next = useCallback(
    () => setSelected(p => (p + 1) % activeImages.length),
    [activeImages.length]
  );
  const prev = useCallback(
    () => setSelected(p => (p - 1 + activeImages.length) % activeImages.length),
    [activeImages.length]
  );

  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [isOpen, next, prev]);

  if (!activeImages.length) return null;

  return (
    <>
      <div className="flex flex-col-reverse lg:flex-row gap-4">
        <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:w-24 scrollbar-hide">
          {activeImages.map((img, i) => (
            <button
              key={`${img}-${i}`}
              onClick={() => setSelected(i)}
              className={`relative w-20 h-20 lg:w-24 lg:h-24 flex-shrink-0 rounded-xl overflow-hidden border transition-all ${
                selected === i
                  ? 'border-foreground/60 shadow-[0_12px_24px_rgba(0,0,0,0.12)]'
                  : 'border-border'
              }`}
            >
              <Image src={img} alt="" fill className="object-cover" sizes="96px" />
            </button>
          ))}
        </div>

        <div
          className="relative flex-1 bg-muted/50 rounded-3xl overflow-hidden cursor-zoom-in group"
          onClick={() => setIsOpen(true)}
        >
          <div className="relative w-full h-[420px] lg:h-[620px]">
            <Image
              src={activeImages[selected]}
              alt={productName}
              fill
              priority={selected === 0}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 60vw"
              quality={90}
            />
          </div>
          <div className="absolute bottom-4 right-4 bg-white/90 border border-border px-3 py-1 text-xs rounded-full">
            {selected + 1} / {activeImages.length}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={() => setIsOpen(false)}
          >
            <button
              onClick={e => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-4 p-3 bg-white/90 border border-border rounded-full hidden lg:block"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={e => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-4 p-3 bg-white/90 border border-border rounded-full hidden lg:block"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 bg-white/90 border border-border rounded-full"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              className="relative w-full h-full max-w-6xl max-h-[90vh] m-4"
              onClick={e => e.stopPropagation()}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.1}
              onDragEnd={(e, info) => {
                if (info.offset.x > 100) prev();
                if (info.offset.x < -100) next();
              }}
            >
              <Image
                src={activeImages[selected]}
                alt={productName}
                fill
                className="object-contain"
                sizes="100vw"
                quality={95}
              />
            </motion.div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 border border-border px-4 py-2 text-sm rounded-full lg:hidden">
              Swipe left/right to view
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
