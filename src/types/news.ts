export type NewsRegion = 'Bangladesh' | 'World';

export type NewsCategory =
  | 'All'
  | 'Politics'
  | 'Economy & RMG'
  | 'Tech'
  | 'Sports'
  | 'Law & Order';

export type ArticleCategory = Exclude<NewsCategory, 'All'>;

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface NewsItem {
  id: string;
  date: string; // YYYY-MM-DD
  region: NewsRegion;
  category: ArticleCategory;
  english_headline: string;
  english_summary: string;
  bengali_subtitle: string;
  source_name: string;
  source_url?: string;
  published_time?: string;
}

export interface DayDigest {
  date: string; // YYYY-MM-DD
  region: NewsRegion;
  items: NewsItem[];
  sources: GroundingSource[];
  fetchedAt: string;
}

export interface NewsApiResponse {
  date: string;
  region: NewsRegion;
  items: NewsItem[];
  sources: GroundingSource[];
  fetchedAt: string;
  cached?: boolean;
}

export const NEWS_CATEGORIES: NewsCategory[] = [
  'All',
  'Politics',
  'Economy & RMG',
  'Tech',
  'Sports',
  'Law & Order',
];
