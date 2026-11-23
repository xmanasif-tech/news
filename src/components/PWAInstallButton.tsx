import { useState } from 'react';
import { Check, Copy, Download, ExternalLink, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

const APP_SHARE_URL =
  'https://ais-pre-2iled3ajarj2xqan7da4hx-642243976702.asia-east1.run.app';

export function PWAInstallButton() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleAction = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (!accepted) {
        setShowGuide(true);
      }
      return;
    }
    setShowGuide(true);
  };

  const handleCopyUrl = async () => {
    const targetUrl = APP_SHARE_URL;
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2200);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = targetUrl;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2200);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => void handleAction()}
        className="min-h-[42px] px-4 rounded-xl bg-[#0B6E4F] hover:bg-[#095C42] dark:bg-[#5FD4A8] dark:hover:bg-[#4EC598] text-white dark:text-[#072118] text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B6E4F] dark:focus-visible:outline-[#5FD4A8]"
      >
        <Download className="w-3.5 h-3.5" />
        <span>{isInstallable ? 'Install App' : isIOS ? 'Install on iOS' : 'Install Android App'}</span>
      </button>

      {showGuide && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Install BD & World News on your phone"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4"
          onClick={() => setShowGuide(false)}
        >
          <div
            className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#161D1B] border border-black/[0.08] dark:border-white/[0.10] p-5 pb-7 sm:pb-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-black/15 dark:bg-white/20 mx-auto sm:hidden" />

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EEF4F1] dark:bg-[#1E2A26] text-[#0B6E4F] dark:text-[#5FD4A8] flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-[#0E1715] dark:text-[#F1F6F4]">
                    {isIOS ? 'Install on iPhone / iPad' : 'Install on Android (OnePlus Nord CE 5)'}
                  </h2>
                  <p className="text-xs text-[#5A6C66] dark:text-[#8A9D97] mt-0.5">
                    Full-screen standalone app with offline bookmarks
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="Close install instructions"
                className="min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center text-[#4C5C57] dark:text-[#98ABA5] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isIOS ? (
              <div className="rounded-2xl bg-[#F3F7F5] dark:bg-[#1D2824] p-4 text-sm text-[#2A3834] dark:text-[#D9E5E0] space-y-2 leading-relaxed">
                <p>
                  <strong>1.</strong> Tap the <strong>Share</strong> icon in Safari&apos;s bottom bar.
                </p>
                <p>
                  <strong>2.</strong> Scroll down and tap <strong>Add to Home Screen</strong>.
                </p>
                <p>
                  <strong>3.</strong> Launch <strong>BD News</strong> full-screen from your home screen.
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-sm text-[#2A3834] dark:text-[#D9E5E0]">
                <div className="rounded-2xl bg-[#F3F7F5] dark:bg-[#1D2824] p-4 space-y-1.5 leading-relaxed">
                  <p className="font-display font-bold text-[#0E1715] dark:text-[#F1F6F4] text-xs">
                    Method 1: Instant Android WebAPK (Recommended)
                  </p>
                  <p className="text-xs text-[#44544F] dark:text-[#B4C4BF]">
                    1. Open the app URL below in <strong>Google Chrome</strong> on your OnePlus Nord CE 5.
                  </p>
                  <p className="text-xs text-[#44544F] dark:text-[#B4C4BF]">
                    2. Tap the top-right menu (<strong>⋮</strong>) → <strong>Install app</strong> (or tap <strong>Install App</strong> when prompted). Chrome installs a native WebAPK onto your home screen &amp; app drawer.
                  </p>
                </div>

                <div className="rounded-2xl bg-[#F3F7F5] dark:bg-[#1D2824] p-4 space-y-2 leading-relaxed">
                  <p className="font-display font-bold text-[#0E1715] dark:text-[#F1F6F4] text-xs">
                    Method 2: Download a Sideloadable .APK File
                  </p>
                  <p className="text-xs text-[#44544F] dark:text-[#B4C4BF]">
                    Copy the app URL below, paste it into <strong>PWABuilder</strong>, select <strong>Android Package</strong>, and download a signed <strong>.apk</strong> file for your Nord CE 5.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => void handleCopyUrl()}
                      className="flex-1 min-h-[42px] px-3 rounded-xl bg-white dark:bg-[#161D1B] border border-black/[0.08] dark:border-white/[0.10] text-xs font-semibold text-[#0E1715] dark:text-[#F1F6F4] inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {copiedUrl ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#0B6E4F] dark:text-[#5FD4A8]" />
                          <span>URL Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy App URL</span>
                        </>
                      )}
                    </button>
                    <a
                      href={`https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(APP_SHARE_URL)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-h-[42px] px-3 rounded-xl bg-[#0B6E4F] hover:bg-[#095C42] dark:bg-[#5FD4A8] dark:hover:bg-[#4EC598] text-white dark:text-[#072118] text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Open PWABuilder</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
