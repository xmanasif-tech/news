import { useCallback, useEffect, useMemo, useState } from 'react';
import type { NewsItem } from '../types/news';

const BOOKMARKS_KEY = 'bd_world_news_bookmarks_v1';

function loadSavedBookmarks(): NewsItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(BOOKMARKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<NewsItem[]>(loadSavedBookmarks);

  useEffect(() => {
    try {
      window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    } catch {
      // ignore quota/storage errors
    }
  }, [bookmarks]);

  const bookmarkIds = useMemo(
    () => new Set(bookmarks.map((item) => item.id)),
    [bookmarks]
  );

  const isBookmarked = useCallback(
    (id: string) => bookmarkIds.has(id),
    [bookmarkIds]
  );

  const toggleBookmark = useCallback((item: NewsItem) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.id === item.id);
      if (exists) {
        return prev.filter((b) => b.id !== item.id);
      }
      return [item, ...prev];
    });
  }, []);

  const clearAllBookmarks = useCallback(() => {
    setBookmarks([]);
  }, []);

  return {
    bookmarks,
    bookmarkCount: bookmarks.length,
    isBookmarked,
    toggleBookmark,
    clearAllBookmarks,
  };
}
