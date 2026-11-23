import { useMemo, useState } from 'react';
import { Bookmark, Trash2 } from 'lucide-react';
import type { NewsItem, NewsRegion } from '../types/news';
import { NewsCard } from './NewsCard';

interface SavedViewProps {
  bookmarks: NewsItem[];
  onToggleSave: (item: NewsItem) => void;
  onShare: (item: NewsItem) => void;
  onClearAll: () => void;
  onBrowseRegion: (region: NewsRegion) => void;
}

export function SavedView({
  bookmarks,
  onToggleSave,
  onShare,
  onClearAll,
  onBrowseRegion,
}: SavedViewProps) {
  const [regionFilter, setRegionFilter] = useState<'All' | NewsRegion>('All');
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered = useMemo(() => {
    if (regionFilter === 'All') return bookmarks;
    return bookmarks.filter((item) => item.region === regionFilter);
  }, [bookmarks, regionFilter]);

  return (
    <section aria-label="Saved articles" className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-[28px] font-extrabold tracking-[-0.02em] text-[#0E1715] dark:text-[#F1F6F4] headline-balance">
            Saved Stories
          </h1>
          <p className="text-sm text-[#556660] dark:text-[#93A6A0] mt-1 tabular-nums">
            {bookmarks.length === 0
              ? 'Stored locally on your device for offline reading'
              : `${bookmarks.length} ${bookmarks.length === 1 ? 'article' : 'articles'} saved on this device`}
          </p>
        </div>

        {bookmarks.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {confirmClear ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClearAll();
                    setConfirmClear(false);
                  }}
                  className="min-h-[40px] px-3.5 rounded-xl bg-[#C81E32] text-white text-xs font-semibold hover:bg-[#AE1729] transition-colors cursor-pointer whitespace-nowrap"
                >
                  Confirm Clear
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="min-h-[40px] px-3 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] text-xs font-semibold text-[#2A3834] dark:text-[#D9E5E0] cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="min-h-[40px] px-3.5 rounded-xl inline-flex items-center gap-1.5 text-xs font-semibold text-[#5A6C66] dark:text-[#93A6A0] hover:text-[#C81E32] dark:hover:text-[#F87171] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer whitespace-nowrap"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear all</span>
              </button>
            )}
          </div>
        )}
      </div>

      {bookmarks.length > 0 && (
        <div className="flex items-center gap-2">
          {(['All', 'Bangladesh', 'World'] as const).map((tab) => {
            const active = regionFilter === tab;
            const label =
              tab === 'All'
                ? 'All Saved'
                : tab === 'Bangladesh'
                ? '🇧🇩 Bangladesh'
                : '🌍 World';
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setRegionFilter(tab)}
                aria-pressed={active}
                className={`min-h-[40px] px-4 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#0E1715] text-white dark:bg-[#ECF2F0] dark:text-[#0D1211]'
                    : 'bg-white dark:bg-[#161D1B] text-[#3B4A46] dark:text-[#B4C4BF] border border-black/[0.08] dark:border-white/[0.09]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {bookmarks.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-[#161D1B] border border-black/[0.07] dark:border-white/[0.08] px-6 py-14 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#EEF4F1] dark:bg-[#1E2A26] text-[#0B6E4F] dark:text-[#5FD4A8] flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-6 h-6" />
          </div>
          <h2 className="font-display text-lg font-bold text-[#0E1715] dark:text-[#F1F6F4]">
            No saved stories yet
          </h2>
          <p className="text-sm text-[#556660] dark:text-[#93A6A0] max-w-sm mx-auto mt-1.5 leading-relaxed">
            Tap Save on any English &amp; বাংলা news card to keep it stored locally on your device.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onBrowseRegion('Bangladesh')}
              className="min-h-[44px] px-5 rounded-xl bg-[#0B6E4F] hover:bg-[#095C42] dark:bg-[#5FD4A8] dark:hover:bg-[#4EC598] text-white dark:text-[#072118] text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              Read Bangladesh News
            </button>
            <button
              type="button"
              onClick={() => onBrowseRegion('World')}
              className="min-h-[44px] px-5 rounded-xl bg-[#EEF4F1] hover:bg-[#E1ECE6] dark:bg-[#1E2A26] dark:hover:bg-[#273832] text-[#0E1715] dark:text-[#F1F6F4] text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              Read World News
            </button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-[#161D1B] border border-black/[0.07] dark:border-white/[0.08] p-8 text-center">
          <p className="text-sm text-[#556660] dark:text-[#93A6A0]">
            No saved stories under {regionFilter}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {filtered.map((item) => (
            <NewsCard
              key={item.id}
              item={item}
              isSaved={true}
              onToggleSave={onToggleSave}
              onShare={onShare}
              showDateFooter={true}
            />
          ))}
        </div>
      )}
    </section>
  );
}
