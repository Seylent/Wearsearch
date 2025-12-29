/**
 * Grid Layout Hook
 * Manages grid layout state (columns, mobile menu, etc.)
 */

import { useState, useCallback } from 'react';

export const useGridLayout = (defaultColumns: number = 6) => {
  const [columns, setColumns] = useState(defaultColumns);
  const [filterOpen, setFilterOpen] = useState(false);

  const changeColumns = useCallback((newColumns: number) => {
    setColumns(newColumns);
  }, []);

  const toggleFilterMenu = useCallback(() => {
    setFilterOpen(prev => !prev);
  }, []);

  const closeFilterMenu = useCallback(() => {
    setFilterOpen(false);
  }, []);

  const openFilterMenu = useCallback(() => {
    setFilterOpen(true);
  }, []);

  return {
    columns,
    filterOpen,
    setColumns,
    changeColumns,
    setFilterOpen,
    toggleFilterMenu,
    closeFilterMenu,
    openFilterMenu,
  };
};
