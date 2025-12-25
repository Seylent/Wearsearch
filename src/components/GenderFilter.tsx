import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface GenderFilterProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  className?: string;
}

export const GenderFilter = ({ value = 'all', onChange, className = "" }: GenderFilterProps) => {
  const handleChange = (newValue: string) => {
    onChange(newValue === 'all' ? undefined : newValue);
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <Label>Gender</Label>
      <Select value={value || 'all'} onValueChange={handleChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select gender" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Products</SelectItem>
          <SelectItem value="men">Men's</SelectItem>
          <SelectItem value="women">Women's</SelectItem>
          <SelectItem value="unisex">Unisex</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
