
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Filter, X } from "lucide-react";
import { MatchFilters } from "@/types";

export interface FilterOptionsProps {
  onFilterChange: (filters: MatchFilters) => void;
  onResetFilters: () => void;
  currentFilters?: MatchFilters;
}

const FilterOptions = ({ 
  onFilterChange, 
  onResetFilters,
  currentFilters = {} 
}: FilterOptionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [university, setUniversity] = useState(currentFilters.university || "");
  const [gender, setGender] = useState(currentFilters.gender || "");
  const [major, setMajor] = useState(currentFilters.major || "");
  const [graduationYear, setGraduationYear] = useState(currentFilters.graduationYear || "");

  const universities = [
    "Harvard University",
    "Yale University",
    "Princeton University",
    "Columbia University",
    "Brown University",
    "Dartmouth College",
    "University of Pennsylvania",
    "Cornell University",
  ];

  const majors = [
    "Computer Science",
    "Economics",
    "Biology",
    "Engineering",
    "Political Science",
    "Psychology",
    "History",
    "Mathematics",
    "English",
    "Chemistry",
  ];

  const graduationYears = Array.from({ length: 6 }, (_, i) => 
    (new Date().getFullYear() + i).toString()
  );

  const applyFilters = () => {
    const filters: MatchFilters = {};
    
    if (university) filters.university = university;
    if (gender) filters.gender = gender;
    if (major) filters.major = major;
    if (graduationYear) filters.graduationYear = graduationYear;
    
    onFilterChange(filters);
    setIsOpen(false);
  };

  const resetFilters = () => {
    setUniversity("");
    setGender("");
    setMajor("");
    setGraduationYear("");
    onResetFilters();
    setIsOpen(false);
  };

  const hasActiveFilters = Object.values(currentFilters || {}).some(Boolean);

  return (
    <div className="mb-6">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={`gap-2 ${hasActiveFilters ? 'bg-ivy/10 border-ivy text-ivy' : ''}`}
          >
            <Filter className="h-4 w-4" />
            {hasActiveFilters ? "Filters Active" : "Filter Options"}
            {hasActiveFilters && (
              <span className="rounded-full bg-ivy text-white w-5 h-5 flex items-center justify-center text-xs">
                {Object.values(currentFilters || {}).filter(Boolean).length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Filter Students</h3>
              {hasActiveFilters && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetFilters}
                  className="h-8 px-2 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm">University</label>
                <Select value={university} onValueChange={setUniversity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any university" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any university</SelectItem>
                    {universities.map((uni) => (
                      <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm">Gender</label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any gender</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Non-binary">Non-binary</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm">Major</label>
                <Select value={major} onValueChange={setMajor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any major" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any major</SelectItem>
                    {majors.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm">Class of</label>
                <Select value={graduationYear} onValueChange={setGraduationYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any year</SelectItem>
                    {graduationYears.map((year) => (
                      <SelectItem key={year} value={year}>Class of {year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <Button onClick={applyFilters} className="bg-ivy hover:bg-ivy-dark">
                Apply Filters
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FilterOptions;
