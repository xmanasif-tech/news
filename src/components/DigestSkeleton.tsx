export function DigestSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading daily bilingual news"
      className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl bg-white dark:bg-[#161D1B] border border-black/[0.06] dark:border-white/[0.08] p-5 sm:p-6 animate-pulse"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="h-3 w-20 rounded bg-black/[0.07] dark:bg-white/[0.09]" />
            <div className="h-3 w-24 rounded bg-black/[0.05] dark:bg-white/[0.07]" />
          </div>
          <div className="space-y-2">
            <div className="h-5 w-11/12 rounded bg-black/[0.09] dark:bg-white/[0.11]" />
            <div className="h-5 w-3/4 rounded bg-black/[0.09] dark:bg-white/[0.11]" />
          </div>
          <div className="mt-3.5 space-y-2">
            <div className="h-3.5 w-full rounded bg-black/[0.06] dark:bg-white/[0.08]" />
            <div className="h-3.5 w-full rounded bg-black/[0.06] dark:bg-white/[0.08]" />
            <div className="h-3.5 w-4/5 rounded bg-black/[0.06] dark:bg-white/[0.08]" />
          </div>
          <div className="mt-4 rounded-xl bg-[#EEF4F1] dark:bg-[#1D2824] p-3.5 space-y-2">
            <div className="h-2.5 w-24 rounded bg-[#0B6E4F]/15 dark:bg-[#5FD4A8]/20" />
            <div className="h-4 w-full rounded bg-black/[0.07] dark:bg-white/[0.09]" />
            <div className="h-4 w-4/5 rounded bg-black/[0.07] dark:bg-white/[0.09]" />
          </div>
          <div className="mt-4 pt-3 border-t border-black/[0.05] dark:border-white/[0.07] flex justify-between items-center">
            <div className="h-3 w-24 rounded bg-black/[0.06] dark:bg-white/[0.08]" />
            <div className="flex gap-2">
              <div className="h-8 w-16 rounded-lg bg-black/[0.06] dark:bg-white/[0.08]" />
              <div className="h-8 w-16 rounded-lg bg-black/[0.06] dark:bg-white/[0.08]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
