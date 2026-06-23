import {SlidersHorizontalIcon} from 'lucide-react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '~/components/ui/drawer';
import {Button} from '~/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion';

export interface FilterValue {
  id: string;
  label: string;
  count: number;
  input: string;
}

export interface Filter {
  id: string;
  label: string;
  values: FilterValue[];
}

export interface ActiveFilter {
  input: string;
  label: string;
}

interface FilterDrawerProps {
  filters: Filter[];
  selectedFilters: string[];
  onFilterChange: (filterInput: string) => void;
}

export function FilterDrawer({
  filters,
  selectedFilters,
  onFilterChange,
}: FilterDrawerProps) {
  return (
    <Drawer direction="left">
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <SlidersHorizontalIcon className="h-4 w-4" />
          Filter
          {selectedFilters.length > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-xs text-background">
              {selectedFilters.length}
            </span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="flex flex-row items-center justify-between">
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <span className="sr-only">Close</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <Accordion type="multiple" className="px-4">
          {filters.map((filter) => (
            <AccordionItem key={filter.id} value={filter.id}>
              <AccordionTrigger>
                {filter.label.toUpperCase()}
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-wrap gap-2 pb-2">
                  {filter.values.map((value) => {
                    const isSelected = selectedFilters.includes(value.input);
                    return (
                      <button
                        key={value.id}
                        onClick={() => onFilterChange(value.input)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                          isSelected
                            ? 'border-foreground bg-foreground text-background'
                            : 'border-border bg-background hover:border-foreground'
                        }`}
                      >
                        {value.label}
                        {value.count > 0 && (
                          <span className="text-[10px] opacity-60">
                            ({value.count})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </DrawerContent>
    </Drawer>
  );
}
