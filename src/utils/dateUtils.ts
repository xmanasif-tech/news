import type { NewsItem } from '../types/news';

export function formatLocalYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayDateString(): string {
  return formatLocalYYYYMMDD(new Date());
}

export function shiftDateString(dateStr: string, deltaDays: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const utcDate = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  utcDate.setUTCDate(utcDate.getUTCDate() + deltaDays);
  const ny = utcDate.getUTCFullYear();
  const nm = String(utcDate.getUTCMonth() + 1).padStart(2, '0');
  const nd = String(utcDate.getUTCDate()).padStart(2, '0');
  return `${ny}-${nm}-${nd}`;
}

export function getRecentDateList(todayStr: string, count = 14): string[] {
  const dates: string[] = [];
  for (let i = 0; i < count; i++) {
    dates.push(shiftDateString(todayStr, -i));
  }
  return dates;
}

export interface FormattedDateMeta {
  shortChipTop: string;
  shortChipBottom: string;
  relativeTitle: string;
  fullReadable: string;
  isToday: boolean;
  isYesterday: boolean;
}

export function getDateMeta(dateStr: string, todayStr: string): FormattedDateMeta {
  const yesterdayStr = shiftDateString(todayStr, -1);
  const isToday = dateStr === todayStr;
  const isYesterday = dateStr === yesterdayStr;

  const [y, m, d] = dateStr.split('-').map(Number);
  const utcDate = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));

  const weekdayShort = utcDate.toLocaleDateString('en-US', {
    weekday: 'short',
    timeZone: 'UTC',
  });
  const monthShort = utcDate.toLocaleDateString('en-US', {
    month: 'short',
    timeZone: 'UTC',
  });
  const fullReadable = utcDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

  let relativeTitle = `${weekdayShort}, ${monthShort} ${d}`;
  if (isToday) relativeTitle = `Today, ${monthShort} ${d}`;
  else if (isYesterday) relativeTitle = `Yesterday, ${monthShort} ${d}`;

  return {
    shortChipTop: isToday ? 'Today' : isYesterday ? 'Yest' : weekdayShort,
    shortChipBottom: `${d} ${monthShort}`,
    relativeTitle,
    fullReadable,
    isToday,
    isYesterday,
  };
}

export function formatBilingualShareText(item: NewsItem): string {
  const regionLabel = item.region === 'Bangladesh' ? '🇧🇩 Bangladesh News' : '🌍 World News';
  const lines = [
    `${item.english_headline}`,
    '',
    item.english_summary,
    '',
    `বাংলা সারসংক্ষেপ: ${item.bengali_subtitle}`,
    '',
    `Source: ${item.source_name} · ${item.category} · ${item.date}`,
    `Shared via BD & World News (${regionLabel})`,
  ];

  if (item.source_url) {
    lines.push(item.source_url);
  }

  return lines.join('\n');
}
