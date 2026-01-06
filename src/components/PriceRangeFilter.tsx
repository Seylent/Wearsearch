/**
 * Price Range Slider Component
 * Dual-handle slider for min/max price filtering
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PriceRangeFilterProps {
  min?: number;
  max?: number;
  minValue?: number;
  maxValue?: number;
  onChange?: (min: number, max: number) => void;
  onApply?: (min: number, max: number) => void;
  currency?: string;
  className?: string;
  showApplyButton?: boolean;
  step?: number;
}

const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
  min = 0,
  max = 10000,
  minValue,
  maxValue,
  onChange,
  onApply,
  currency = '$',
  className,
  showApplyButton = true,
  step = 10,
}) => {
  const { t } = useTranslation();
  const [range, setRange] = useState<[number, number]>([minValue ?? min, maxValue ?? max]);
  const [inputMin, setInputMin] = useState<string>(String(minValue ?? min));
  const [inputMax, setInputMax] = useState<string>(String(maxValue ?? max));

  // Sync with external values
  useEffect(() => {
    if (minValue !== undefined && maxValue !== undefined) {
      setRange([minValue, maxValue]);
      setInputMin(String(minValue));
      setInputMax(String(maxValue));
    }
  }, [minValue, maxValue]);

  const handleSliderChange = useCallback(
    (values: number[]) => {
      const newRange: [number, number] = [values[0], values[1]];
      setRange(newRange);
      setInputMin(String(values[0]));
      setInputMax(String(values[1]));
      
      if (!showApplyButton && onChange) {
        onChange(values[0], values[1]);
      }
    },
    [onChange, showApplyButton]
  );

  const handleInputChange = useCallback(
    (type: 'min' | 'max', value: string) => {
      // Allow empty string for typing
      if (type === 'min') {
        setInputMin(value);
      } else {
        setInputMax(value);
      }

      const numValue = parseFloat(value);
      if (isNaN(numValue)) return;

      setRange((prev) => {
        const newRange: [number, number] =
          type === 'min'
            ? [Math.max(min, Math.min(numValue, prev[1])), prev[1]]
            : [prev[0], Math.min(max, Math.max(numValue, prev[0]))];
        return newRange;
      });
    },
    [min, max]
  );

  const handleInputBlur = useCallback(
    (type: 'min' | 'max') => {
      const value = type === 'min' ? inputMin : inputMax;
      let numValue = parseFloat(value);

      if (isNaN(numValue)) {
        numValue = type === 'min' ? min : max;
      }

      // Clamp values
      if (type === 'min') {
        numValue = Math.max(min, Math.min(numValue, range[1]));
        setInputMin(String(numValue));
        setRange([numValue, range[1]]);
      } else {
        numValue = Math.min(max, Math.max(numValue, range[0]));
        setInputMax(String(numValue));
        setRange([range[0], numValue]);
      }
    },
    [inputMin, inputMax, min, max, range]
  );

  const handleApply = useCallback(() => {
    if (onApply) {
      onApply(range[0], range[1]);
    } else if (onChange) {
      onChange(range[0], range[1]);
    }
  }, [range, onApply, onChange]);

  const handleReset = useCallback(() => {
    setRange([min, max]);
    setInputMin(String(min));
    setInputMax(String(max));
    
    if (onChange) {
      onChange(min, max);
    }
    if (onApply) {
      onApply(min, max);
    }
  }, [min, max, onChange, onApply]);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-white/60" aria-hidden="true" />
        <Label className="text-sm font-medium text-white">
          {t('filters.priceRange', 'Price Range')}
        </Label>
      </div>

      {/* Slider */}
      <div className="px-2">
        <Slider
          value={range}
          min={min}
          max={max}
          step={step}
          onValueChange={handleSliderChange}
          className="w-full"
        />
      </div>

      {/* Min/Max inputs */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Label htmlFor="price-min" className="text-xs text-white/60 mb-1 block">
            {t('filters.min', 'Min')}
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">
              {currency}
            </span>
            <Input
              id="price-min"
              type="number"
              value={inputMin}
              onChange={(e) => handleInputChange('min', e.target.value)}
              onBlur={() => handleInputBlur('min')}
              className="pl-7 bg-white/5 border-white/10 text-white text-sm h-9"
              min={min}
              max={range[1]}
            />
          </div>
        </div>

        <span className="text-white/40 mt-5">—</span>

        <div className="flex-1">
          <Label htmlFor="price-max" className="text-xs text-white/60 mb-1 block">
            {t('filters.max', 'Max')}
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">
              {currency}
            </span>
            <Input
              id="price-max"
              type="number"
              value={inputMax}
              onChange={(e) => handleInputChange('max', e.target.value)}
              onBlur={() => handleInputBlur('max')}
              className="pl-7 bg-white/5 border-white/10 text-white text-sm h-9"
              min={range[0]}
              max={max}
            />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {showApplyButton && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="flex-1 bg-transparent border-white/10 text-white/60 hover:text-white hover:bg-white/5"
          >
            {t('filters.reset', 'Reset')}
          </Button>
          <Button
            size="sm"
            onClick={handleApply}
            className="flex-1 bg-white text-black hover:bg-white/90"
          >
            {t('filters.apply', 'Apply')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PriceRangeFilter;
