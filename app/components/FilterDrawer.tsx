import {SlidersHorizontalIcon, XIcon} from 'lucide-react';
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
  label: string;
  count: number;
}

export interface Filter {
  id: string;
  label: string;
  values: FilterValue[];
}

interface FilterDrawerProps {
  filters: Filter[];
}

export function FilterDrawer({filters}: FilterDrawerProps) {
  return (
    <Drawer direction="left">
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <SlidersHorizontalIcon className="h-4 w-4" />
          Filter
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="flex flex-row items-center justify-between">
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <XIcon className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <Accordion type="multiple" className="px-4">
          {filters.map((filter) => (
            <AccordionItem key={filter.id} value={filter.id}>
              <AccordionTrigger>{filter.label.toUpperCase()}</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-wrap gap-2 pb-2">
                  {filter.values.map((value) => (
                    <button
                      key={value.label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm transition-colors hover:border-foreground"
                    >
                      {value.label}
                      {value.count > 0 && (
                        <span className="text-[10px] opacity-60">
                          ({value.count})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </DrawerContent>
    </Drawer>
  );
}
