
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { UNIVERSITIES } from "@/types";
import { MatchFilters } from "@/types";
import { X, Filter } from "lucide-react";

interface FilterOptionsProps {
  onApplyFilters: (filters: MatchFilters) => void;
  defaultFilters?: MatchFilters;
}

// Majors options
const MAJORS = [
  "Computer Science",
  "Engineering",
  "Business",
  "Medicine",
  "Law",
  "Arts",
  "Humanities",
  "Sciences",
  "Math",
  "Other"
];

// Generate an array of graduation years from current year - 4 to current year + 4
const currentYear = new Date().getFullYear();
const GRADUATION_YEARS = Array.from(
  { length: 9 },
  (_, i) => (currentYear - 4 + i).toString()
);

export default function FilterOptions({ onApplyFilters, defaultFilters }: FilterOptionsProps) {
  const [filters, setFilters] = useState<MatchFilters>(
    defaultFilters || {
      university: "",
      gender: "",
      major: "",
      graduationYear: "",
      maxDistance: 100,
    }
  );

  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (field: keyof MatchFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    setIsOpen(false);
  };

  const handleReset = () => {
    const resetFilters: MatchFilters = {
      university: "",
      gender: "",
      major: "",
      graduationYear: "",
      maxDistance: 100,
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  return (
    <div className="relative">
      <Button
        variant="outline" 
        className="flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Filter size={16} />
        <span>Filters</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-md shadow-lg z-50 p-4 border animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Filter Settings</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </Button>
          </div>

          <Accordion type="multiple" className="w-full">
            <AccordionItem value="university">
              <AccordionTrigger className="py-3 text-sm">
                University
              </AccordionTrigger>
              <AccordionContent>
                <RadioGroup
                  value={filters.university}
                  onValueChange={(value) => handleChange("university", value)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="" id="univ-any" />
                    <Label htmlFor="univ-any">Any</Label>
                  </div>
                  {UNIVERSITIES.map((university) => (
                    <div key={university} className="flex items-center space-x-2">
                      <RadioGroupItem value={university} id={`univ-${university}`} />
                      <Label htmlFor={`univ-${university}`}>{university}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="gender">
              <AccordionTrigger className="py-3 text-sm">Gender</AccordionTrigger>
              <AccordionContent>
                <RadioGroup
                  value={filters.gender}
                  onValueChange={(value) => handleChange("gender", value)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="" id="gender-any" />
                    <Label htmlFor="gender-any">Any</Label>
                  </div>
                  {["Male", "Female", "Non-binary", "Prefer not to say"].map((gender) => (
                    <div key={gender} className="flex items-center space-x-2">
                      <RadioGroupItem value={gender} id={`gender-${gender}`} />
                      <Label htmlFor={`gender-${gender}`}>{gender}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="major">
              <AccordionTrigger className="py-3 text-sm">Major</AccordionTrigger>
              <AccordionContent>
                <RadioGroup
                  value={filters.major}
                  onValueChange={(value) => handleChange("major", value)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="" id="major-any" />
                    <Label htmlFor="major-any">Any</Label>
                  </div>
                  {MAJORS.map((major) => (
                    <div key={major} className="flex items-center space-x-2">
                      <RadioGroupItem value={major} id={`major-${major}`} />
                      <Label htmlFor={`major-${major}`}>{major}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="graduationYear">
              <AccordionTrigger className="py-3 text-sm">
                Graduation Year
              </AccordionTrigger>
              <AccordionContent>
                <RadioGroup
                  value={filters.graduationYear}
                  onValueChange={(value) => handleChange("graduationYear", value)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="" id="year-any" />
                    <Label htmlFor="year-any">Any</Label>
                  </div>
                  {GRADUATION_YEARS.map((year) => (
                    <div key={year} className="flex items-center space-x-2">
                      <RadioGroupItem value={year} id={`year-${year}`} />
                      <Label htmlFor={`year-${year}`}>{year}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex justify-between mt-6 pt-4 border-t">
            <Button variant="outline" size="sm" onClick={handleReset}>
              Reset All
            </Button>
            <Button size="sm" onClick={handleApply} className="bg-ivy hover:bg-ivy-dark">
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
