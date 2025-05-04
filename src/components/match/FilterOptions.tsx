
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
          <Accordion type="multiple" collapsible className="w-full">
            <AccordionItem value="university">
              <AccordionTrigger className="text-sm font-medium">University</AccordionTrigger>
              <AccordionContent className="pt-2">
                <div className="space-y-2">
                  <RadioGroup 
                    value={filters.university || ""} 
                    onValueChange={handleUniversityChange}
                    className="flex flex-col gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="" id="university-any" />
                      <Label htmlFor="university-any">Any University</Label>
                    </div>
                    {UNIVERSITIES.map((university) => (
                      <div key={university} className="flex items-center space-x-2">
                        <RadioGroupItem value={university} id={`university-${university}`} />
                        <Label htmlFor={`university-${university}`}>{university}</Label>
                      </div>
                    ))}
                  </RadioGroup>
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
              <AccordionContent className="pt-2">
                <div className="space-y-2">
                  <RadioGroup 
                    value={filters.major || ""} 
                    onValueChange={handleMajorChange}
                    className="flex flex-col gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="" id="major-any" />
                      <Label htmlFor="major-any">Any Major</Label>
                    </div>
                    {INTERESTS.map((major) => (
                      <div key={major} className="flex items-center space-x-2">
                        <RadioGroupItem value={major} id={`major-${major}`} />
                        <Label htmlFor={`major-${major}`}>{major}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="year">
              <AccordionTrigger className="text-sm font-medium">Graduation Year</AccordionTrigger>
              <AccordionContent className="pt-2">
                <div className="space-y-2">
                  <RadioGroup 
                    value={filters.graduationYear || ""} 
                    onValueChange={handleGraduationYearChange}
                    className="flex flex-col gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="" id="year-any" />
                      <Label htmlFor="year-any">Any Year</Label>
                    </div>
                    {Array.from({ length: 6 }, (_, i) => {
                      const year = `${new Date().getFullYear() + i}`;
                      return (
                        <div key={year} className="flex items-center space-x-2">
                          <RadioGroupItem value={year} id={`year-${year}`} />
                          <Label htmlFor={`year-${year}`}>{year}</Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
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
