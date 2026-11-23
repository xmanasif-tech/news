import { NEWS_CATEGORIES, type NewsCategory, type NewsRegion } from '../types/news';

interface CategoryFilterBarProps {
  region: NewsRegion;
  onRegionChange: (region: NewsRegion) => void;
  selectedCategory: NewsCategory;
  onCategoryChange: (category: NewsCategory) => void;
  showMobileRegionTabs?: boolean;
}

export function CategoryFilterBar({
  region,
  onRegionChange,
  selectedCategory,
  onCategoryChange,
  showMobileRegionTabs = true,
}: CategoryFilterBarProps) {
  return (
    <div className="space-y-3">
      {/* Mobile Segmented Region Tabs */}
      {showMobileRegionTabs && (
        <div
          role="tablist"
          aria-label="News region"
          className="md:hidden grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-[#E8EFEC] dark:bg-[#17201D]"
        >
          <button
            type="button"
            role="tab"
            aria-selected={region === 'Bangladesh'}
            onClick={() => onRegionChange('Bangladesh')}
            className={`min-h-[44px] px-3 rounded-xl text-[13px] font-bold transition-all duration-150 cursor-pointer whitespace-nowrap truncate ${
              region === 'Bangladesh'
                ? 'bg-white dark:bg-[#23312C] text-[#0B6E4F] dark:text-[#5FD4A8] shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                : 'text-[#4C5C57] dark:text-[#98ABA5]'
            }`}
          >
            🇧🇩 Bangladesh News
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={region === 'World'}
            onClick={() => onRegionChange('World')}
            className={`min-h-[44px] px-3 rounded-xl text-[13px] font-bold transition-all duration-150 cursor-pointer whitespace-nowrap truncate ${
              region === 'World'
                ? 'bg-white dark:bg-[#23312C] text-[#0B6E4F] dark:text-[#5FD4A8] shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                : 'text-[#4C5C57] dark:text-[#98ABA5]'
            }`}
          >
            🌍 World News
          </button>
        </div>
      )}

      {/* Interactive Category Filter Chips */}
      <div
        role="group"
        aria-label="Filter by category"
        className="overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        <div className="flex items-center gap-2 min-w-max py-0.5">
          {NEWS_CATEGORIES.map((category) => {
            const isActive = selectedCategory === category;
            const displayLabel =
              category === 'Economy & RMG' ? 'Economy & RMG' : category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => onCategoryChange(category)}
                aria-pressed={isActive}
                className={`min-h-[40px] px-4 rounded-xl text-[13px] font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B6E4F] dark:focus-visible:outline-[#5FD4A8] ${
                  isActive
                    ? 'bg-[#0E1715] text-white dark:bg-[#ECF2F0] dark:text-[#0D1211]'
                    : 'bg-white dark:bg-[#161D1B] text-[#3B4A46] dark:text-[#B4C4BF] border border-black/[0.08] dark:border-white/[0.09] hover:border-black/20 dark:hover:border-white/25'
                }`}
              >
                {displayLabel}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
