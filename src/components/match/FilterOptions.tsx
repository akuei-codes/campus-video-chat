
import { useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  RadioGroup,
  RadioGroupItem 
} from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { UNIVERSITIES, INTERESTS, MatchFilters } from "@/types";
import { Badge } from "@/components/ui/badge";

interface FilterOptionsProps {
  filters: MatchFilters;
  onFilterChange: (filters: MatchFilters) => void;
  onResetFilters: () => void;
}

const FilterOptions = ({ 
  filters, 
  onFilterChange,
  onResetFilters 
}: FilterOptionsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleUniversityChange = (value: string) => {
    onFilterChange({
      ...filters,
      university: value
    });
  };

  const handleGenderChange = (value: string) => {
    onFilterChange({
      ...filters,
      gender: value
    });
  };

  const handleMajorChange = (value: string) => {
    onFilterChange({
      ...filters,
      major: value
    });
  };

  const handleGraduationYearChange = (value: string) => {
    onFilterChange({
      ...filters,
      graduationYear: value
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value).length;
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 hover-scale"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full">
              {getActiveFiltersCount()}
            </Badge>
          )}
        </Button>
        
        {getActiveFiltersCount() > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="text-muted-foreground text-xs hover-scale"
          >
            <X className="h-3 w-3 mr-1" />
            Reset filters
          </Button>
        )}
      </div>
      
      {isOpen && (
        <div className="bg-white rounded-md shadow-sm border p-4 space-y-4 animate-fade-in">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="university">
              <AccordionTrigger className="text-sm font-medium">University</AccordionTrigger>
              <AccordionContent>
                <div className="pt-2">
                  <Select
                    value={filters.university || ""}
                    onValueChange={handleUniversityChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Any university" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any university</SelectItem>
                      {UNIVERSITIES.map((uni) => (
                        <SelectItem key={uni} value={uni}>
                          {uni}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="gender">
              <AccordionTrigger className="text-sm font-medium">Gender</AccordionTrigger>
              <AccordionContent>
                <RadioGroup 
                  value={filters.gender || ""} 
                  onValueChange={handleGenderChange}
                  className="flex flex-col gap-2 pt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="" id="gender-any" />
                    <Label htmlFor="gender-any">Any gender</Label>
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
                    <RadioGroupItem value="Other" id="gender-other" />
                    <Label htmlFor="gender-other">Other</Label>
                  </div>
                </RadioGroup>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="major">
              <AccordionTrigger className="text-sm font-medium">Major</AccordionTrigger>
              <AccordionContent>
                <div className="pt-2">
                  <Select
                    value={filters.major || ""}
                    onValueChange={handleMajorChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Any major" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any major</SelectItem>
                      {INTERESTS.map((major) => (
                        <SelectItem key={major} value={major}>
                          {major}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="year">
              <AccordionTrigger className="text-sm font-medium">Graduation Year</AccordionTrigger>
              <AccordionContent>
                <div className="pt-2">
                  <Select
                    value={filters.graduationYear || ""}
                    onValueChange={handleGraduationYearChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Any year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any year</SelectItem>
                      {Array.from({ length: 6 }, (_, i) => (
                        <SelectItem key={i} value={`${new Date().getFullYear() + i}`}>
                          {new Date().getFullYear() + i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  );
};

export default FilterOptions;
