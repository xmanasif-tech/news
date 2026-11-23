import { Moon, Sun } from 'lucide-react';

export type ActiveTab = 'Bangladesh' | 'World' | 'Saved';

interface TopAppBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  savedCount: number;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function TopAppBar({
  activeTab,
  onTabChange,
  savedCount,
  isDark,
  onToggleTheme,
}: TopAppBarProps) {
  return (
    <header className="sticky top-0 z-30 h-[52px] md:h-16 bg-[#F6F8F7]/92 dark:bg-[#0D1211]/92 backdrop-blur-md border-b border-black/[0.07] dark:border-white/[0.08]">
      <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Title */}
        <button
          type="button"
          onClick={() => onTabChange('Bangladesh')}
          className="font-display text-[17px] md:text-[19px] font-extrabold tracking-[-0.02em] text-[#0E1715] dark:text-[#F1F6F4] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0B6E4F] dark:focus-visible:outline-[#5FD4A8] rounded-md"
        >
          BD &amp; World News
        </button>

        {/* Zone 2: Desktop Navigation Links */}
        <nav
          aria-label="Primary sections"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          <button
            type="button"
            onClick={() => onTabChange('Bangladesh')}
            className={`relative py-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'Bangladesh'
                ? 'text-[#0B6E4F] dark:text-[#5FD4A8] font-semibold'
                : 'text-[#4C5C57] dark:text-[#98ABA5] hover:text-[#0E1715] dark:hover:text-[#F1F6F4]'
            }`}
          >
            🇧🇩 Bangladesh News
            {activeTab === 'Bangladesh' && (
              <span className="absolute left-0 right-0 -bottom-[13px] h-[2.5px] rounded-full bg-[#0B6E4F] dark:bg-[#5FD4A8]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onTabChange('World')}
            className={`relative py-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'World'
                ? 'text-[#0B6E4F] dark:text-[#5FD4A8] font-semibold'
                : 'text-[#4C5C57] dark:text-[#98ABA5] hover:text-[#0E1715] dark:hover:text-[#F1F6F4]'
            }`}
          >
            🌍 World News
            {activeTab === 'World' && (
              <span className="absolute left-0 right-0 -bottom-[13px] h-[2.5px] rounded-full bg-[#0B6E4F] dark:bg-[#5FD4A8]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onTabChange('Saved')}
            className={`relative py-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer tabular-nums ${
              activeTab === 'Saved'
                ? 'text-[#0B6E4F] dark:text-[#5FD4A8] font-semibold'
                : 'text-[#4C5C57] dark:text-[#98ABA5] hover:text-[#0E1715] dark:hover:text-[#F1F6F4]'
            }`}
          >
            {savedCount > 0 ? `Saved (${savedCount})` : 'Saved'}
            {activeTab === 'Saved' && (
              <span className="absolute left-0 right-0 -bottom-[13px] h-[2.5px] rounded-full bg-[#0B6E4F] dark:bg-[#5FD4A8]" />
            )}
          </button>
        </nav>

        {/* Zone 3: Single Primary Action (Theme Toggle) */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="min-h-[44px] min-w-[44px] md:min-w-0 md:px-3.5 md:py-2 rounded-full flex items-center justify-center gap-2 text-sm font-medium text-[#2A3834] dark:text-[#D9E5E0] bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.07] dark:hover:bg-white/[0.12] transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B6E4F] dark:focus-visible:outline-[#5FD4A8]"
          >
            {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            <span className="hidden md:inline text-xs font-semibold">
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
