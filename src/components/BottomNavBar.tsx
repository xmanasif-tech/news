import { Bookmark, Globe, Newspaper } from 'lucide-react';
import type { ActiveTab } from './TopAppBar';

interface BottomNavBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  savedCount: number;
}

export function BottomNavBar({
  activeTab,
  onTabChange,
  savedCount,
}: BottomNavBarProps) {
  const items: Array<{
    id: ActiveTab;
    label: string;
    icon: typeof Newspaper;
    count?: number;
  }> = [
    { id: 'Bangladesh', label: 'Bangladesh', icon: Newspaper },
    { id: 'World', label: 'World', icon: Globe },
    { id: 'Saved', label: 'Saved', icon: Bookmark, count: savedCount },
  ];

  return (
    <nav
      aria-label="Bottom navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#111715]/95 backdrop-blur-md border-t border-black/[0.08] dark:border-white/[0.08] pb-safe"
    >
      <div className="grid grid-cols-3 items-center h-16 px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className="min-h-[48px] flex flex-col items-center justify-center gap-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0B6E4F] dark:focus-visible:outline-[#5FD4A8] rounded-xl"
            >
              <span
                className={`relative px-4 py-1 rounded-full transition-colors duration-150 flex items-center justify-center ${
                  isActive
                    ? 'bg-[#0B6E4F]/15 dark:bg-[#5FD4A8]/20 text-[#0B6E4F] dark:text-[#5FD4A8]'
                    : 'text-[#5A6C66] dark:text-[#8E9F99]'
                }`}
              >
                <Icon className={`w-[20px] h-[20px] ${isActive && item.id === 'Saved' ? 'fill-current' : ''}`} />
                {item.count !== undefined && item.count > 0 && (
                  <span className="ml-1 text-[11px] font-bold tabular-nums">
                    {item.count}
                  </span>
                )}
              </span>
              <span
                className={`text-[11px] leading-none tracking-tight ${
                  isActive
                    ? 'font-bold text-[#0B6E4F] dark:text-[#5FD4A8]'
                    : 'font-medium text-[#5A6C66] dark:text-[#8E9F99]'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
