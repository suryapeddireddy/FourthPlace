"use client";

import { Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  "All",
  "Engineering",
  "Product & Design",
  "Career Switch",
  "System Design",
] as const;

interface FilterBarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function FilterBar({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
}: FilterBarProps) {
  return (
    <div className="rounded-2xl bg-sand-surface p-4 sm:p-5">
      <label className="relative block">
        <span className="sr-only">Search topics, venues, or host names</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-cocoa"
        />
        <input
          className="w-full rounded-xl border border-espresso/10 bg-warm-cream py-3 pr-4 pl-10 text-sm text-espresso outline-none transition placeholder:text-muted-cocoa/75 focus:border-terracotta focus:ring-2 focus:ring-terracotta/15"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by topic, venue, or host..."
          type="search"
          value={searchQuery}
        />
      </label>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-espresso">
          <Filter aria-hidden="true" className="size-4 text-muted-cocoa" />
          <span>Category</span>
        </div>
        <div
          aria-label="Filter by category"
          className="flex min-w-0 gap-2 overflow-x-auto py-1"
          role="group"
        >
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;

            return (
              <Button
                key={category}
                aria-pressed={isSelected}
                className={
                  isSelected
                    ? "shrink-0 rounded-full bg-espresso px-4 py-2 text-xs text-warm-cream transition-all duration-200 hover:-translate-y-0.5 hover:bg-espresso/90 focus-visible:outline-espresso"
                    : "shrink-0 rounded-full border border-espresso/10 bg-warm-cream px-4 py-2 text-xs text-espresso transition-all duration-200 hover:-translate-y-0.5 hover:border-terracotta/40 hover:bg-terracotta/10 hover:text-espresso"
                }
                onClick={() => onSelectCategory(category)}
                type="button"
              >
                {category}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
