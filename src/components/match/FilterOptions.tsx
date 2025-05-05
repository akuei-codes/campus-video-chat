
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MatchFilters, UNIVERSITIES } from "@/types";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export interface FilterOptionsProps {
  onFilterChange: (newFilters: MatchFilters) => void;
  onResetFilters: () => void;
  filters: MatchFilters;
}

const FilterOptions = ({ onFilterChange, onResetFilters, filters }: FilterOptionsProps) => {
  const graduationYears = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() + i - 4).map(String);
  
  const handleUniversityChange = (value: string) => {
    onFilterChange({ ...filters, university: value });
  };

  const handleGenderChange = (value: string) => {
    onFilterChange({ ...filters, gender: value });
  };

  const handleGraduationYearChange = (value: string) => {
    onFilterChange({ ...filters, graduationYear: value });
  };

  const handleMajorChange = (value: string) => {
    onFilterChange({ ...filters, major: value });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">University</h3>
          <Select 
            value={filters.university || ""} 
            onValueChange={handleUniversityChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select university" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any University</SelectItem>
              {UNIVERSITIES.map(uni => (
                <SelectItem key={uni} value={uni}>
                  {uni}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Gender</h3>
          <RadioGroup 
            value={filters.gender || ""} 
            onValueChange={handleGenderChange} 
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="" id="gender-any" />
              <Label htmlFor="gender-any">Any</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Male" id="gender-male" />
              <Label htmlFor="gender-male">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Female" id="gender-female" />
              <Label htmlFor="gender-female">Female</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Non-binary" id="gender-nonbinary" />
              <Label htmlFor="gender-nonbinary">Non-binary</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Graduation Year</h3>
          <Select 
            value={filters.graduationYear || ""} 
            onValueChange={handleGraduationYearChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Year</SelectItem>
              {graduationYears.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Major</h3>
          <Select 
            value={filters.major || ""} 
            onValueChange={handleMajorChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select major" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Major</SelectItem>
              <SelectItem value="Computer Science">Computer Science</SelectItem>
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="Business">Business</SelectItem>
              <SelectItem value="Liberal Arts">Liberal Arts</SelectItem>
              <SelectItem value="Medicine">Medicine</SelectItem>
              <SelectItem value="Law">Law</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        onClick={onResetFilters} 
        className="w-full"
      >
        Reset All Filters
      </Button>
    </div>
  );
};

export default FilterOptions;
