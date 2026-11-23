import { Bookmark, ExternalLink, Share2 } from 'lucide-react';
import type { NewsItem } from '../types/news';

interface NewsCardProps {
  item: NewsItem;
  isSaved: boolean;
  onToggleSave: (item: NewsItem) => void;
  onShare: (item: NewsItem) => void;
  showDateFooter?: boolean;
}

export function NewsCard({
  item,
  isSaved,
  onToggleSave,
  onShare,
  showDateFooter = false,
}: NewsCardProps) {
  return (
    <article className="flex flex-col justify-between rounded-2xl bg-white dark:bg-[#161D1B] border border-black/[0.07] dark:border-white/[0.08] p-5 sm:p-6 shadow-[0_1px_2px_rgba(14,23,21,0.04)] dark:shadow-none transition-colors duration-150 hover:border-[#0B6E4F]/25 dark:hover:border-[#5FD4A8]/25">
      <div>
        {/* Clean Unboxed Metadata Row (Zero-Pill Discipline) */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] leading-snug mb-2.5">
          <span className="font-semibold text-[#0B6E4F] dark:text-[#5FD4A8]">
            {item.category}
          </span>
          <span aria-hidden="true" className="text-[#8FA09A] dark:text-[#657771]">
            ·
          </span>
          {item.source_url ? (
            <a
              href={item.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#3D4D48] dark:text-[#BCCAC5] hover:text-[#0B6E4F] dark:hover:text-[#5FD4A8] inline-flex items-center gap-1 transition-colors"
            >
              <span>{item.source_name}</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          ) : (
            <span className="font-medium text-[#3D4D48] dark:text-[#BCCAC5]">
              {item.source_name}
            </span>
          )}
          {item.published_time && (
            <>
              <span aria-hidden="true" className="text-[#8FA09A] dark:text-[#657771]">
                ·
              </span>
              <span className="text-[#62736D] dark:text-[#869993]">
                {item.published_time}
              </span>
            </>
          )}
        </div>

        {/* 1. English Headline (Bold) */}
        <h3 className="font-display text-[18px] sm:text-[19px] font-bold leading-[1.35] tracking-[-0.015em] text-[#0E1715] dark:text-[#F2F7F5] headline-balance">
          {item.english_headline}
        </h3>

        {/* 1. English Summary (2-3 concise sentences) */}
        <p className="mt-2.5 text-[15px] leading-[1.62] text-[#364440] dark:text-[#C2D0CB] dark:tracking-[0.005em]">
          {item.english_summary}
        </p>

        {/* 2. Bengali (বাংলা) Subtitle Box directly underneath */}
        <div className="mt-4 rounded-xl bg-[#EEF4F1] dark:bg-[#1D2824] border border-[#0B6E4F]/[0.09] dark:border-[#5FD4A8]/[0.11] px-4 py-3">
          <div className="text-[11px] font-medium text-[#0B6E4F] dark:text-[#7ADCB7] font-bengali leading-normal mb-0.5">
            বাংলা সারসংক্ষেপ
          </div>
          <p className="font-bengali text-[15px] font-medium text-[#13241F] dark:text-[#E1EEE9]">
            {item.bengali_subtitle}
          </p>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.07] flex items-center justify-between gap-3">
        <div className="text-xs text-[#62736D] dark:text-[#869993] tabular-nums truncate">
          {showDateFooter ? (
            <span>
              {item.region === 'Bangladesh' ? '🇧🇩 Bangladesh' : '🌍 World'} · {item.date}
            </span>
          ) : item.source_url ? (
            <a
              href={item.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-[#4C5C57] dark:text-[#9CB0AA] hover:text-[#0B6E4F] dark:hover:text-[#5FD4A8] transition-colors"
            >
              <span>Read full coverage</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span>{item.date}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onToggleSave(item)}
            aria-pressed={isSaved}
            aria-label={isSaved ? 'Remove from saved' : 'Save article'}
            className={`min-h-[44px] px-3 rounded-xl inline-flex items-center gap-1.5 text-xs font-semibold transition-all duration-150 active:scale-[0.97] cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B6E4F] dark:focus-visible:outline-[#5FD4A8] ${
              isSaved
                ? 'bg-[#0B6E4F]/12 text-[#0B6E4F] dark:bg-[#5FD4A8]/18 dark:text-[#5FD4A8]'
                : 'text-[#44544F] dark:text-[#A4B7B1] hover:bg-black/[0.05] dark:hover:bg-white/[0.08]'
            }`}
          >
            <Bookmark
              className={`w-[17px] h-[17px] ${isSaved ? 'fill-current' : ''}`}
            />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            type="button"
            onClick={() => onShare(item)}
            aria-label="Share bilingual summary"
            className="min-h-[44px] px-3 rounded-xl inline-flex items-center gap-1.5 text-xs font-semibold text-[#44544F] dark:text-[#A4B7B1] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-all duration-150 active:scale-[0.97] cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B6E4F] dark:focus-visible:outline-[#5FD4A8]"
          >
            <Share2 className="w-[17px] h-[17px]" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </article>
  );
}
