import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ExternalLink,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { BottomNavBar } from './components/BottomNavBar';
import { CategoryFilterBar } from './components/CategoryFilterBar';
import { DateCalendarStrip } from './components/DateCalendarStrip';
import { DigestSkeleton } from './components/DigestSkeleton';
import { NewsCard } from './components/NewsCard';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { SavedView } from './components/SavedView';
import { ShareSheet } from './components/ShareSheet';
import { TopAppBar, type ActiveTab } from './components/TopAppBar';
import { useBookmarks } from './hooks/useBookmarks';
import { useTheme } from './hooks/useTheme';
import type {
  DayDigest,
  NewsApiResponse,
  NewsCategory,
  NewsItem,
  NewsRegion,
} from './types/news';
import {
  getDateMeta,
  getTodayDateString,
  shiftDateString,
} from './utils/dateUtils';

const AUTO_SCROLL_DAY_CAP = 5;
const PULL_THRESHOLD = 68;

export default function App() {
  const { isDark, toggleTheme } = useTheme();
  const {
    bookmarks,
    bookmarkCount,
    isBookmarked,
    toggleBookmark,
    clearAllBookmarks,
  } = useBookmarks();

  const todayStr = useMemo(() => getTodayDateString(), []);

  const [activeTab, setActiveTab] = useState<ActiveTab>('Bangladesh');
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('All');
  const [loadedDates, setLoadedDates] = useState<string[]>([todayStr]);

  const [digestsByKey, setDigestsByKey] = useState<Record<string, DayDigest>>({});
  const [loadingKeys, setLoadingKeys] = useState<Record<string, boolean>>({});
  const [errorsByKey, setErrorsByKey] = useState<Record<string, string>>({});

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [shareItem, setShareItem] = useState<NewsItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Touch Pull-to-Refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartYRef = useRef<number | null>(null);
  const isPullingRef = useRef(false);
  const inFlightKeysRef = useRef<Set<string>>(new Set());
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const activeRegion: NewsRegion = activeTab === 'World' ? 'World' : 'Bangladesh';

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  }, []);

  const fetchDigest = useCallback(
    async (date: string, region: NewsRegion, options?: { forceRefresh?: boolean }) => {
      const key = `${date}_${region}`;
      const forceRefresh = Boolean(options?.forceRefresh);

      if (!forceRefresh && inFlightKeysRef.current.has(key)) {
        return;
      }

      inFlightKeysRef.current.add(key);
      setLoadingKeys((prev) => ({ ...prev, [key]: true }));
      setErrorsByKey((prev) => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });

      try {
        const res = await fetch('/api/news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date, region, forceRefresh }),
        });

        const data = (await res.json()) as NewsApiResponse & { error?: string };
        if (!res.ok) {
          throw new Error(data.error || `Failed to load ${region} news for ${date}.`);
        }

        const digest: DayDigest = {
          date: data.date,
          region: data.region,
          items: data.items,
          sources: data.sources ?? [],
          fetchedAt: data.fetchedAt,
        };

        setDigestsByKey((prev) => ({ ...prev, [key]: digest }));
        if (forceRefresh) {
          showToast('Updated with latest headlines');
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to fetch grounded news right now.';
        setErrorsByKey((prev) => ({ ...prev, [key]: message }));
      } finally {
        inFlightKeysRef.current.delete(key);
        setLoadingKeys((prev) => ({ ...prev, [key]: false }));
      }
    },
    [showToast]
  );

  // Fetch digests for all currently expanded dates whenever region or loadedDates changes
  useEffect(() => {
    if (activeTab === 'Saved') return;
    for (const date of loadedDates) {
      const key = `${date}_${activeRegion}`;
      if (!digestsByKey[key] && !loadingKeys[key] && !errorsByKey[key]) {
        void fetchDigest(date, activeRegion);
      }
    }
  }, [activeTab, activeRegion, loadedDates, digestsByKey, loadingKeys, errorsByKey, fetchDigest]);

  const handleSelectDate = useCallback((date: string) => {
    setSelectedDate(date);
    setLoadedDates([date]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleTabChange = useCallback((tab: ActiveTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleRegionSwitch = useCallback((region: NewsRegion) => {
    setActiveTab(region);
    setLoadedDates([selectedDate]);
  }, [selectedDate]);

  const handleRefreshBreaking = useCallback(async () => {
    if (activeTab === 'Saved' || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await fetchDigest(selectedDate, activeRegion, { forceRefresh: true });
    } finally {
      setIsRefreshing(false);
    }
  }, [activeTab, isRefreshing, fetchDigest, selectedDate, activeRegion]);

  const handleLoadPreviousDay = useCallback(() => {
    if (activeTab === 'Saved') return;
    setLoadedDates((prev) => {
      const oldest = prev[prev.length - 1] ?? selectedDate;
      const nextDate = shiftDateString(oldest, -1);
      if (prev.includes(nextDate)) return prev;
      return [...prev, nextDate];
    });
  }, [activeTab, selectedDate]);

  const isAnyDateLoading = useMemo(() => {
    return loadedDates.some((d) => loadingKeys[`${d}_${activeRegion}`]);
  }, [loadedDates, loadingKeys, activeRegion]);

  // Automatic Infinite Scroll across dates
  useEffect(() => {
    if (activeTab === 'Saved') return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting) return;
        if (isAnyDateLoading) return;
        if (loadedDates.length >= AUTO_SCROLL_DAY_CAP) return;

        // Only auto-load next day once the latest visible day actually finished loading successfully
        const lastDate = loadedDates[loadedDates.length - 1];
        const lastKey = `${lastDate}_${activeRegion}`;
        if (digestsByKey[lastKey] && !errorsByKey[lastKey]) {
          handleLoadPreviousDay();
        }
      },
      { rootMargin: '260px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [
    activeTab,
    activeRegion,
    loadedDates,
    digestsByKey,
    errorsByKey,
    isAnyDateLoading,
    handleLoadPreviousDay,
  ]);

  // Touch Pull-to-Refresh handlers for Android smartphones
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (activeTab === 'Saved' || isRefreshing) return;
    if (window.scrollY <= 2 && e.touches.length === 1) {
      touchStartYRef.current = e.touches[0].clientY;
      isPullingRef.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isPullingRef.current || touchStartYRef.current === null) return;
    const delta = e.touches[0].clientY - touchStartYRef.current;
    if (delta > 0 && window.scrollY <= 2) {
      // Rubber-band resistance
      const damped = Math.min(96, Math.round(delta * 0.45));
      setPullDistance(damped);
    } else {
      isPullingRef.current = false;
      setPullDistance(0);
    }
  };

  const handleTouchEnd = () => {
    if (!isPullingRef.current) return;
    isPullingRef.current = false;
    touchStartYRef.current = null;
    if (pullDistance >= PULL_THRESHOLD) {
      setPullDistance(0);
      void handleRefreshBreaking();
    } else {
      setPullDistance(0);
    }
  };

  const handleToggleSaveWithFeedback = useCallback(
    (item: NewsItem) => {
      const wasSaved = isBookmarked(item.id);
      toggleBookmark(item);
      showToast(wasSaved ? 'Removed from Saved' : 'Saved on device');
    },
    [isBookmarked, toggleBookmark, showToast]
  );

  const selectedDateMeta = useMemo(
    () => getDateMeta(selectedDate, todayStr),
    [selectedDate, todayStr]
  );

  return (
    <div
      className="min-h-screen flex flex-col bg-[#F6F8F7] dark:bg-[#0D1211] text-[#0E1715] dark:text-[#ECF2F0] transition-colors duration-150"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top App Bar */}
      <TopAppBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        savedCount={bookmarkCount}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      {/* Pull-to-Refresh Indicator (Compositor-only transform/opacity) */}
      {(pullDistance > 8 || isRefreshing) && activeTab !== 'Saved' && (
        <div
          aria-live="polite"
          className="fixed left-1/2 top-[60px] md:top-[72px] z-30 -translate-x-1/2 pointer-events-none transition-opacity duration-150"
          style={{
            transform: `translate(-50%, ${isRefreshing ? 12 : Math.max(0, pullDistance - 24)}px)`,
          }}
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#1B2421] border border-black/[0.08] dark:border-white/[0.12] shadow-lg text-xs font-semibold text-[#0B6E4F] dark:text-[#5FD4A8]">
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
              style={
                !isRefreshing
                  ? { transform: `rotate(${Math.min(270, pullDistance * 3.5)}deg)` }
                  : undefined
              }
            />
            <span>
              {isRefreshing
                ? 'Fetching breaking updates...'
                : pullDistance >= PULL_THRESHOLD
                ? 'Release to refresh'
                : 'Pull down for breaking news'}
            </span>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-24 md:pb-14">
        {activeTab === 'Saved' ? (
          <SavedView
            bookmarks={bookmarks}
            onToggleSave={handleToggleSaveWithFeedback}
            onShare={setShareItem}
            onClearAll={() => {
              clearAllBookmarks();
              showToast('Cleared all saved articles');
            }}
            onBrowseRegion={(region) => handleTabChange(region)}
          />
        ) : (
          <div className="space-y-5 sm:space-y-6">
            {/* Editorial Digest Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <h1 className="font-display text-2xl sm:text-[30px] font-extrabold tracking-[-0.025em] text-[#0E1715] dark:text-[#F1F6F4] headline-balance">
                  {activeRegion === 'Bangladesh' ? '🇧🇩 Bangladesh News' : '🌍 World News'}
                </h1>
                <p className="text-sm text-[#52635D] dark:text-[#93A6A0] mt-1">
                  {selectedDateMeta.fullReadable} · English &amp; বাংলা Bilingual Digest
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <PWAInstallButton />
                <button
                  type="button"
                  onClick={handleRefreshBreaking}
                  disabled={isRefreshing || loadingKeys[`${selectedDate}_${activeRegion}`]}
                  className="min-h-[42px] px-4 rounded-xl bg-white dark:bg-[#161D1B] border border-black/[0.08] dark:border-white/[0.10] hover:border-[#0B6E4F]/40 dark:hover:border-[#5FD4A8]/40 text-xs font-semibold text-[#1B2A25] dark:text-[#D9E5E0] inline-flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 text-[#0B6E4F] dark:text-[#5FD4A8] ${
                      isRefreshing ? 'animate-spin' : ''
                    }`}
                  />
                  <span>{isRefreshing ? 'Refreshing...' : 'Refresh Updates'}</span>
                </button>
              </div>
            </div>

            {/* Top Date Selector & Calendar Strip (Non-sticky to preserve mobile reading viewport) */}
            <DateCalendarStrip
              selectedDate={selectedDate}
              todayStr={todayStr}
              onSelectDate={handleSelectDate}
            />

            {/* Main Region Tabs (Mobile) + Category Filter Chips */}
            <CategoryFilterBar
              region={activeRegion}
              onRegionChange={handleRegionSwitch}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />

            {/* Date-wise News Feed Sections (Infinite Scroll Ready) */}
            <div className="space-y-9 sm:space-y-11 pt-1">
              {loadedDates.map((dateStr, index) => {
                const key = `${dateStr}_${activeRegion}`;
                const digest = digestsByKey[key];
                const isLoading = Boolean(loadingKeys[key]);
                const error = errorsByKey[key];
                const meta = getDateMeta(dateStr, todayStr);

                const filteredItems = digest
                  ? selectedCategory === 'All'
                    ? digest.items
                    : digest.items.filter((item) => item.category === selectedCategory)
                  : [];

                return (
                  <section
                    key={key}
                    aria-label={`${meta.relativeTitle} ${activeRegion} news`}
                    className="space-y-4"
                  >
                    {/* Date Section Divider Header */}
                    <div className="flex flex-wrap items-baseline justify-between gap-2 pb-2.5 border-b border-black/[0.07] dark:border-white/[0.08]">
                      <div className="flex items-baseline gap-2.5">
                        <h2 className="font-display text-lg sm:text-xl font-bold tracking-[-0.015em] text-[#0E1715] dark:text-[#F1F6F4]">
                          {meta.relativeTitle}
                        </h2>
                        <span className="text-xs font-medium text-[#5A6C66] dark:text-[#8E9F99] tabular-nums">
                          {dateStr}
                        </span>
                      </div>

                      {digest && (
                        <span className="text-xs text-[#5A6C66] dark:text-[#8E9F99] tabular-nums">
                          {filteredItems.length}{' '}
                          {filteredItems.length === 1 ? 'story' : 'stories'}
                          {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
                        </span>
                      )}
                    </div>

                    {/* Loading State */}
                    {isLoading && !digest && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-medium text-[#0B6E4F] dark:text-[#5FD4A8]">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>
                            Gathering live {activeRegion} reports for {meta.relativeTitle} via Google Search...
                          </span>
                        </div>
                        <DigestSkeleton count={index === 0 ? 4 : 2} />
                      </div>
                    )}

                    {/* Error State */}
                    {error && !isLoading && (
                      <div className="rounded-2xl bg-white dark:bg-[#161D1B] border border-[#C81E32]/25 dark:border-[#F87171]/30 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-[#C81E32] dark:text-[#F87171] shrink-0 mt-0.5" />
                          <div>
                            <h3 className="font-display text-sm font-bold text-[#0E1715] dark:text-[#F1F6F4]">
                              Could not load {meta.relativeTitle} digest
                            </h3>
                            <p className="text-xs sm:text-sm text-[#52635D] dark:text-[#9EB1AB] mt-1 leading-relaxed">
                              {error}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => void fetchDigest(dateStr, activeRegion, { forceRefresh: true })}
                          className="min-h-[42px] px-4 rounded-xl bg-[#0B6E4F] hover:bg-[#095C42] dark:bg-[#5FD4A8] dark:hover:bg-[#4EC598] text-white dark:text-[#072118] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-center"
                        >
                          Try Again
                        </button>
                      </div>
                    )}

                    {/* Bilingual News Cards Grid */}
                    {digest && filteredItems.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                        {filteredItems.map((item) => (
                          <NewsCard
                            key={item.id}
                            item={item}
                            isSaved={isBookmarked(item.id)}
                            onToggleSave={handleToggleSaveWithFeedback}
                            onShare={setShareItem}
                          />
                        ))}
                      </div>
                    )}

                    {/* Empty Filter State for This Day */}
                    {digest && filteredItems.length === 0 && (
                      <div className="rounded-2xl bg-white dark:bg-[#161D1B] border border-black/[0.06] dark:border-white/[0.08] p-6 text-center">
                        <p className="text-sm text-[#556660] dark:text-[#93A6A0]">
                          No <span className="font-semibold text-[#0E1715] dark:text-[#F1F6F4]">{selectedCategory}</span> stories in the {meta.relativeTitle} digest.
                        </p>
                        <button
                          type="button"
                          onClick={() => setSelectedCategory('All')}
                          className="mt-3 min-h-[40px] px-4 rounded-xl text-xs font-semibold text-[#0B6E4F] dark:text-[#5FD4A8] bg-[#EEF4F1] dark:bg-[#1E2A26] hover:bg-[#E1ECE6] dark:hover:bg-[#273832] transition-colors cursor-pointer"
                        >
                          Show All Categories
                        </button>
                      </div>
                    )}

                    {/* Grounded Web Sources Row (Google Search Grounding Attribution) */}
                    {digest && digest.sources.length > 0 && (
                      <div className="pt-1 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-[#5A6C66] dark:text-[#869993]">
                        <span className="font-semibold text-[#3B4A46] dark:text-[#A8BBB5]">
                          Verified sources:
                        </span>
                        {digest.sources.slice(0, 5).map((source) => (
                          <a
                            key={source.uri}
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 hover:text-[#0B6E4F] dark:hover:text-[#5FD4A8] underline decoration-black/15 dark:decoration-white/15 underline-offset-2 transition-colors max-w-[200px] truncate"
                          >
                            <span className="truncate">{source.title}</span>
                            <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                          </a>
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>

            {/* Infinite Scroll Sentinel + Manual Previous Day Loader */}
            <div ref={sentinelRef} className="pt-4 pb-2 flex flex-col items-center justify-center gap-3">
              {isAnyDateLoading ? (
                <div className="flex items-center gap-2 text-xs font-medium text-[#5A6C66] dark:text-[#8E9F99] py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#0B6E4F] dark:text-[#5FD4A8]" />
                  <span>Loading previous day&apos;s news...</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleLoadPreviousDay}
                  className="min-h-[46px] px-5 rounded-2xl bg-white dark:bg-[#161D1B] border border-black/[0.09] dark:border-white/[0.11] hover:border-[#0B6E4F]/45 dark:hover:border-[#5FD4A8]/45 text-sm font-semibold text-[#182521] dark:text-[#E2ECE8] inline-flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <ArrowDown className="w-4 h-4 text-[#0B6E4F] dark:text-[#5FD4A8]" />
                  <span>
                    Load Previous Day&apos;s News (
                    {getDateMeta(
                      shiftDateString(loadedDates[loadedDates.length - 1] ?? selectedDate, -1),
                      todayStr
                    ).relativeTitle}
                    )
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Fixed Mobile Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        savedCount={bookmarkCount}
      />

      {/* Bilingual Share Bottom Sheet / Modal */}
      <ShareSheet item={shareItem} onClose={() => setShareItem(null)} />

      {/* Offline Connectivity Banner */}
      <OfflineIndicator />

      {/* Subtle Transient Toast Feedback */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-[#0E1715] dark:bg-[#ECF2F0] text-white dark:text-[#0D1211] text-xs font-semibold shadow-xl whitespace-nowrap pointer-events-none"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
