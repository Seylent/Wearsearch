/**
 * Virtual List Component
 * Renders only visible items for better performance with large lists
 */

'use client';

import { useRef, useState, useEffect, ReactNode } from 'react';
import { usePassiveScroll } from '@/hooks/usePassiveEvent';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  overscan?: number;
  className?: string;
}

export function VirtualList<T>({
  items,
  itemHeight,
  renderItem,
  overscan = 3,
  className = '',
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Update container height on mount and resize
  useEffect(() => {
    if (!containerRef.current) return;

    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight, { passive: true });
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Track scroll position with passive listener
  usePassiveScroll(
    () => {
      if (containerRef.current) {
        setScrollTop(containerRef.current.scrollTop);
      }
    },
    50, // throttle 50ms
    containerRef.current
  );

  // Calculate visible range
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);

  return (
    <div
      ref={containerRef}
      className={`${className} overflow-y-auto`}
      style={{
        contain: 'strict',
        overflowAnchor: 'none',
      }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item, i) => {
          const index = startIndex + i;
          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: index * itemHeight,
                height: itemHeight,
                width: '100%',
                contain: 'layout style paint',
              }}
            >
              {renderItem(item, index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Virtual Grid Component
 * Renders only visible items in a grid layout
 */
interface VirtualGridProps<T> {
  items: T[];
  itemHeight: number;
  columns: number;
  renderItem: (item: T, index: number) => ReactNode;
  gap?: number;
  overscan?: number;
  className?: string;
}

export function VirtualGrid<T>({
  items,
  itemHeight,
  columns,
  renderItem,
  gap = 16,
  overscan = 2,
  className = '',
}: VirtualGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight, { passive: true });
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  usePassiveScroll(
    () => {
      if (containerRef.current) {
        setScrollTop(containerRef.current.scrollTop);
      }
    },
    50,
    containerRef.current
  );

  const rowHeight = itemHeight + gap;
  const totalRows = Math.ceil(items.length / columns);
  const totalHeight = totalRows * rowHeight;

  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endRow = Math.min(
    totalRows - 1,
    Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
  );

  const visibleRows = [];
  for (let row = startRow; row <= endRow; row++) {
    const startIdx = row * columns;
    const endIdx = Math.min(startIdx + columns, items.length);
    visibleRows.push({ row, items: items.slice(startIdx, endIdx), startIdx });
  }

  return (
    <div
      ref={containerRef}
      className={`${className} overflow-y-auto`}
      style={{
        contain: 'strict',
        overflowAnchor: 'none',
      }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleRows.map(({ row, items: rowItems, startIdx }) => (
          <div
            key={row}
            style={{
              position: 'absolute',
              top: row * rowHeight,
              height: itemHeight,
              width: '100%',
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: `${gap}px`,
              contain: 'layout style paint',
            }}
          >
            {rowItems.map((item, i) => (
              <div key={startIdx + i}>{renderItem(item, startIdx + i)}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
