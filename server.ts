import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import type {
  ArticleCategory,
  GroundingSource,
  NewsItem,
  NewsRegion,
} from './src/types/news.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const VALID_CATEGORIES: ArticleCategory[] = [
  'Politics',
  'Economy & RMG',
  'Tech',
  'Sports',
  'Law & Order',
];

interface CachedDigest {
  date: string;
  region: NewsRegion;
  items: NewsItem[];
  sources: GroundingSource[];
  fetchedAt: string;
  expiresAt: number;
}

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const digestCache = new Map<string, CachedDigest>();

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw Object.assign(
      new Error('GEMINI_API_KEY is not configured in the server environment.'),
      { status: 500, code: 'MISSING_API_KEY' }
    );
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function normalizeCategory(raw: unknown): ArticleCategory {
  const value = String(raw ?? '').trim().toLowerCase();
  if (value.includes('politic') || value.includes('gov') || value.includes('diplom')) {
    return 'Politics';
  }
  if (
    value.includes('econ') ||
    value.includes('rmg') ||
    value.includes('garment') ||
    value.includes('business') ||
    value.includes('trade') ||
    value.includes('finance') ||
    value.includes('market')
  ) {
    return 'Economy & RMG';
  }
  if (value.includes('tech') || value.includes('ai') || value.includes('science') || value.includes('digital')) {
    return 'Tech';
  }
  if (value.includes('sport') || value.includes('cricket') || value.includes('football')) {
    return 'Sports';
  }
  if (
    value.includes('law') ||
    value.includes('order') ||
    value.includes('court') ||
    value.includes('crime') ||
    value.includes('police') ||
    value.includes('justice') ||
    value.includes('security')
  ) {
    return 'Law & Order';
  }
  return VALID_CATEGORIES[0];
}

function extractJsonArray(rawText: string): unknown[] {
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object' && Array.isArray((parsed as { articles?: unknown[] }).articles)) {
      return (parsed as { articles: unknown[] }).articles;
    }
    if (parsed && typeof parsed === 'object' && Array.isArray((parsed as { news?: unknown[] }).news)) {
      return (parsed as { news: unknown[] }).news;
    }
  } catch {
    // Try extracting the outermost JSON array substring
    const startIdx = cleaned.indexOf('[');
    const endIdx = cleaned.lastIndexOf(']');
    if (startIdx !== -1 && endIdx > startIdx) {
      const slice = cleaned.slice(startIdx, endIdx + 1);
      const parsed = JSON.parse(slice);
      if (Array.isArray(parsed)) return parsed;
    }
  }

  throw new Error('Could not parse structured news JSON from Gemini response.');
}

function matchSourceUrl(
  sourceName: string,
  headline: string,
  sources: GroundingSource[]
): string | undefined {
  if (!sources.length) return undefined;
  const normalizedSource = sourceName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const headlineWords = headline
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 4);

  for (const s of sources) {
    const titleNorm = s.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const uriNorm = s.uri.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (
      normalizedSource.length >= 3 &&
      (titleNorm.includes(normalizedSource) || uriNorm.includes(normalizedSource))
    ) {
      return s.uri;
    }
  }

  for (const s of sources) {
    const titleLower = s.title.toLowerCase();
    const matches = headlineWords.filter((w) => titleLower.includes(w));
    if (matches.length >= 2) {
      return s.uri;
    }
  }

  return undefined;
}

function buildNewsPrompt(date: string, region: NewsRegion): string {
  const formattedDate = new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

  const regionFocus =
    region === 'Bangladesh'
      ? `Bangladesh national news for ${formattedDate} (${date}). Prioritize major verified Bangladeshi news outlets such as The Daily Star, Prothom Alo, Dhaka Tribune, The Business Standard, bdnews24.com, The Financial Express, and New Age. Cover diverse angles including national politics & governance, Bangladesh economy & RMG/garments exports & banking, Bangladesh tech/telecom/startups, Bangladesh cricket & sports, and law & order / courts / Dhaka civic affairs.`
      : `Major international world news for ${formattedDate} (${date}). Prioritize major verified international outlets such as Reuters, BBC News, Associated Press, Al Jazeera, The Guardian, Bloomberg, and Financial Times. Cover diverse global angles including geopolitics & diplomacy, global economy & trade, technology & AI, international sports, and major international justice/law & order developments.`;

  return `Use Google Search to gather 7 real, verified, distinct news stories for ${regionFocus}

Return ONLY a valid JSON array of 7 objects. Every object MUST contain these exact fields:
- "date": "${date}"
- "region": "${region}"
- "category": strictly one of "Politics", "Economy & RMG", "Tech", "Sports", or "Law & Order" (distribute stories across at least 4 of these 5 categories)
- "english_headline": concise, factual, bold-ready English news headline (10-16 words)
- "english_summary": clear, objective 2-3 sentence English summary with specific facts, figures, or names from the actual news report
- "bengali_subtitle": accurate, natural Bengali (বাংলা) translation of the headline and core point in clean Unicode Bangla script (1-2 crisp sentences, no English transliteration)
- "source_name": the actual publisher/outlet name (e.g., "The Daily Star", "Prothom Alo", "Reuters", "BBC News")
- "published_time": short label like "Morning Update", "Afternoon Brief", or "Evening Edition"

Ensure every story is grounded in real search results for ${formattedDate} (or the closest verified reporting cycle if that exact day is still unfolding). Do not include markdown fences or any commentary outside the JSON array.`;
}

async function fetchGroundedNews(
  date: string,
  region: NewsRegion
): Promise<{ items: NewsItem[]; sources: GroundingSource[] }> {
  const ai = getGeminiClient();
  const prompt = buildNewsPrompt(date, region);

  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        date: { type: Type.STRING },
        region: { type: Type.STRING },
        category: { type: Type.STRING },
        english_headline: { type: Type.STRING },
        english_summary: { type: Type.STRING },
        bengali_subtitle: { type: Type.STRING },
        source_name: { type: Type.STRING },
        published_time: { type: Type.STRING },
      },
      required: [
        'date',
        'region',
        'category',
        'english_headline',
        'english_summary',
        'bengali_subtitle',
        'source_name',
      ],
    },
  };

  let response;
  try {
    response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction:
          'You are a bilingual senior news editor fluent in English and Bengali (বাংলা). You always verify news via Google Search grounding and return strictly structured JSON without fabrications.',
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
        responseSchema,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status;
    const message = err instanceof Error ? err.message : String(err);
    // Fallback if responseSchema + googleSearch returns a 400 config conflict
    if (status === 400 && /schema|mime|json/i.test(message)) {
      response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'You are a bilingual senior news editor fluent in English and Bengali (বাংলা). Always verify news via Google Search grounding and output ONLY raw valid JSON.',
          tools: [{ googleSearch: {} }],
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });
    } else {
      throw err;
    }
  }

  const rawText = response.text ?? '';
  if (!rawText.trim()) {
    throw new Error('Gemini returned an empty news digest.');
  }

  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  const sourceMap = new Map<string, GroundingSource>();
  for (const chunk of chunks) {
    const web = chunk.web;
    if (web?.uri) {
      sourceMap.set(web.uri, {
        uri: web.uri,
        title: web.title || new URL(web.uri).hostname.replace(/^www\./, ''),
      });
    }
  }
  const sources = Array.from(sourceMap.values());

  const parsedArray = extractJsonArray(rawText);
  const items: NewsItem[] = parsedArray
    .filter((entry): entry is Record<string, unknown> => Boolean(entry && typeof entry === 'object'))
    .map((entry, idx) => {
      const english_headline = String(entry.english_headline ?? '').trim();
      const english_summary = String(entry.english_summary ?? '').trim();
      const bengali_subtitle = String(entry.bengali_subtitle ?? '').trim();
      const source_name = String(entry.source_name ?? 'News Wire').trim();
      const category = normalizeCategory(entry.category);
      const published_time = String(entry.published_time ?? 'Daily Digest').trim();

      return {
        id: `${date}_${region.toLowerCase()}_${idx}_${Buffer.from(english_headline.slice(0, 24)).toString('base64url')}`,
        date,
        region,
        category,
        english_headline,
        english_summary,
        bengali_subtitle,
        source_name,
        source_url: matchSourceUrl(source_name, english_headline, sources),
        published_time,
      };
    })
    .filter((item) => item.english_headline.length > 0 && item.english_summary.length > 0);

  if (items.length === 0) {
    throw new Error('No valid news articles could be parsed for this date.');
  }

  return { items, sources };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/news', async (req, res) => {
    try {
      const { date, region, forceRefresh } = req.body ?? {};

      if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        res.status(400).json({
          error: 'Invalid date parameter. Expected YYYY-MM-DD.',
          code: 'INVALID_DATE',
        });
        return;
      }

      if (region !== 'Bangladesh' && region !== 'World') {
        res.status(400).json({
          error: 'Invalid region parameter. Expected "Bangladesh" or "World".',
          code: 'INVALID_REGION',
        });
        return;
      }

      const cacheKey = `${date}_${region}`;
      const existing = digestCache.get(cacheKey);
      if (!forceRefresh && existing && existing.expiresAt > Date.now()) {
        res.json({
          date: existing.date,
          region: existing.region,
          items: existing.items,
          sources: existing.sources,
          fetchedAt: existing.fetchedAt,
          cached: true,
        });
        return;
      }

      let lastErr: unknown;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const { items, sources } = await fetchGroundedNews(date, region);
          const fetchedAt = new Date().toISOString();
          digestCache.set(cacheKey, {
            date,
            region,
            items,
            sources,
            fetchedAt,
            expiresAt: Date.now() + CACHE_TTL_MS,
          });
          res.json({
            date,
            region,
            items,
            sources,
            fetchedAt,
            cached: false,
          });
          return;
        } catch (err: unknown) {
          lastErr = err;
          const status = (err as { status?: number })?.status ?? 500;
          if (status >= 500 && attempt === 0) {
            await new Promise((r) => setTimeout(r, 800));
            continue;
          }
          break;
        }
      }

      throw lastErr;
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      const message = err instanceof Error ? err.message : 'Failed to fetch grounded news.';
      console.error('[API /api/news error]', message);

      if (status === 403 || status === 401 || /API_KEY_INVALID|PERMISSION_DENIED/i.test(message)) {
        res.status(403).json({
          error:
            'Gemini API authentication failed. Please check your API key in Settings > Secrets.',
          code: 'API_KEY_ERROR',
        });
        return;
      }

      if (status === 429 || /RESOURCE_EXHAUSTED|quota/i.test(message)) {
        res.status(429).json({
          error:
            'Rate limit or quota reached for the Gemini API. Please retry shortly or check your quota in Settings > Secrets.',
          code: 'QUOTA_EXCEEDED',
        });
        return;
      }

      res.status(typeof status === 'number' && status >= 400 && status < 600 ? status : 500).json({
        error: message,
        code: 'NEWS_FETCH_FAILED',
      });
    }
  });

  if (!IS_PRODUCTION) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BD & World News server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
