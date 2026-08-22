"use client"

import * as Tabs from "@radix-ui/react-tabs"
import { CategoryInfo, ExampleCategory } from "@/types/examples"
import { cn } from "@/lib/utils"

interface CategoryTabsProps {
  categories: CategoryInfo[]
  activeCategory: ExampleCategory | 'all'
  onCategoryChange: (category: ExampleCategory | 'all') => void
}

export function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
  const allCategories = [
    { id: 'all' as const, label: 'All Examples', icon: '✨', description: 'View all examples' },
    ...categories
  ];

  return (
    <Tabs.Root 
      value={activeCategory} 
      onValueChange={(value) => onCategoryChange(value as ExampleCategory | 'all')}
      className="w-full"
    >
      <Tabs.List className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8 md:mb-12">
        {allCategories.map((category) => (
          <Tabs.Trigger
            key={category.id}
            value={category.id}
            className={cn(
              "px-4 py-3 md:px-6 md:py-3 rounded-full border-2 font-medium text-sm md:text-base",
              "transition-all duration-300 hover:shadow-md",
              "focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2",
              "data-[state=active]:bg-yellow-500 data-[state=active]:text-white data-[state=active]:border-yellow-500",
              "data-[state=inactive]:bg-white data-[state=inactive]:text-yellow-700 data-[state=inactive]:border-yellow-200 data-[state=inactive]:hover:bg-yellow-50"
            )}
          >
            <span className="mr-2 text-lg">{category.icon}</span>
            <span className="hidden sm:inline">{category.label}</span>
            <span className="sm:hidden">{category.label.split(' ')[0]}</span>
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs.Root>
  )
}