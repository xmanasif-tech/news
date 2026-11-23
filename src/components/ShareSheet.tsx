import { useEffect, useState } from 'react';
import { Check, Copy, MessageCircle, Share2, X } from 'lucide-react';
import type { NewsItem } from '../types/news';
import { formatBilingualShareText } from '../utils/dateUtils';

interface ShareSheetProps {
  item: NewsItem | null;
  onClose: () => void;
}

export function ShareSheet({ item, onClose }: ShareSheetProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [item]);

  if (!item) return null;

  const shareText = formatBilingualShareText(item);
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = shareText;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleNativeShare = async () => {
    if (!canNativeShare) return;
    try {
      await navigator.share({
        title: item.english_headline,
        text: shareText,
        url: item.source_url || undefined,
      });
      onClose();
    } catch {
      // user cancelled native share sheet
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Share bilingual news summary"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#161D1B] border border-black/[0.08] dark:border-white/[0.10] p-5 pb-7 sm:pb-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-black/15 dark:bg-white/20 mx-auto mb-4 sm:hidden" />

        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-display text-base font-bold text-[#0E1715] dark:text-[#F1F6F4]">
              Share Bilingual Brief
            </h2>
            <p className="text-xs text-[#5A6C66] dark:text-[#8A9D97] mt-0.5">
              Includes both English summary and বাংলা subtitle
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close share sheet"
            className="min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center text-[#4C5C57] dark:text-[#98ABA5] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bilingual Message Preview */}
        <div className="rounded-2xl bg-[#F3F7F5] dark:bg-[#1D2824] border border-black/[0.06] dark:border-white/[0.08] p-4 max-h-52 overflow-y-auto text-[13px] leading-relaxed text-[#25332F] dark:text-[#D4E2DD] space-y-2 mb-4">
          <p className="font-display font-bold text-[#0E1715] dark:text-[#F2F7F5]">
            {item.english_headline}
          </p>
          <p>{item.english_summary}</p>
          <p className="font-bengali text-[14px] text-[#0B6E4F] dark:text-[#7ADCB7] font-medium">
            বাংলা সারসংক্ষেপ: {item.bengali_subtitle}
          </p>
          <p className="text-[11.5px] text-[#5A6C66] dark:text-[#8A9D97]">
            {item.source_name} · {item.category} · {item.date}
          </p>
        </div>

        {/* Share Action Buttons */}
        <div className="grid grid-cols-1 gap-2.5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[48px] px-4 rounded-2xl bg-[#0B6E4F] hover:bg-[#095C42] dark:bg-[#5FD4A8] dark:hover:bg-[#4EC598] text-white dark:text-[#072118] font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <MessageCircle className="w-[18px] h-[18px]" />
            <span>Share on WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full min-h-[48px] px-4 rounded-2xl bg-[#EEF4F1] hover:bg-[#E1ECE6] dark:bg-[#1E2A26] dark:hover:bg-[#273832] text-[#0E1715] dark:text-[#F1F6F4] font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-[18px] h-[18px] text-[#0B6E4F] dark:text-[#5FD4A8]" />
                <span>Copied for Messenger &amp; Chats</span>
              </>
            ) : (
              <>
                <Copy className="w-[18px] h-[18px]" />
                <span>Copy Text for Messenger</span>
              </>
            )}
          </button>

          {canNativeShare && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full min-h-[48px] px-4 rounded-2xl border border-black/[0.10] dark:border-white/[0.12] text-[#2A3834] dark:text-[#D9E5E0] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Share2 className="w-[18px] h-[18px]" />
              <span>More Android Share Apps</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
