import Anthropic from '@anthropic-ai/sdk';

const REQUEST_TIMEOUT_MS = 4500;
const LOGO_DISCOVERY_MODEL =
  process.env.ANTHROPIC_LOGO_DISCOVERY_MODEL ||
  process.env.ANTHROPIC_PROVIDER_IMPORT_MODEL ||
  process.env.ANTHROPIC_COACHING_MODEL ||
  'claude-sonnet-4-6';

const clean = (value: string | null | undefined) => (value || '').trim();

type LogoCandidate = {
  descriptor?: string;
  score: number;
  source: string;
  url: string;
};

const ensureUrl = (value: string) => {
  const trimmed = clean(value);
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const getHost = (value: string) => {
  try {
    return new URL(ensureUrl(value)).hostname.replace(/^www\./i, '');
  } catch {
    return '';
  }
};

const getWebsiteUrlsToTry = (website: string) => {
  const primaryUrl = ensureUrl(website);
  if (!primaryUrl) return [];

  let parsed: URL;
  try {
    parsed = new URL(primaryUrl);
  } catch {
    return [];
  }

  const host = parsed.hostname.replace(/^www\./i, '');
  const paths = parsed.pathname && parsed.pathname !== '/' ? [parsed.pathname] : ['/'];
  const urls = [
    primaryUrl,
    `https://${host}${paths[0]}`,
    `https://www.${host}${paths[0]}`,
    `http://${host}${paths[0]}`,
    `http://www.${host}${paths[0]}`,
  ];

  return [...new Set(urls)];
};

const readAttributes = (tag: string) => {
  const attrs: Record<string, string> = {};
  const pattern = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*["']([^"']*)["']/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(tag))) {
    attrs[match[1].toLowerCase()] = match[2];
  }

  return attrs;
};

const resolveAssetUrl = (candidate: string, pageUrl: string) => {
  try {
    const resolved = new URL(candidate, pageUrl);
    return ['http:', 'https:'].includes(resolved.protocol)
      ? resolved.toString()
      : '';
  } catch {
    return '';
  }
};

const firstUsable = (values: Array<string | null | undefined>) =>
  values.map(clean).find(Boolean) || '';

const hasImageExtension = (url: string) =>
  /\.(avif|gif|jpe?g|png|svg|webp)(\?.*)?$/i.test(url);

const parseSrcSet = (value: string) =>
  clean(value)
    .split(',')
    .map((item) => clean(item).split(/\s+/)[0])
    .filter(Boolean);

const isUsableImageUrl = async (url: string) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        Accept: 'image/*,*/*;q=0.8',
        Range: 'bytes=0-0',
        'User-Agent':
          'TakeShape provider dashboard enrichment (+https://takeshapehome.com)',
      },
      signal: controller.signal,
    });

    if (!response.ok && response.status !== 206) return false;

    const contentType = response.headers.get('content-type') || '';
    return (
      contentType.toLowerCase().startsWith('image/') || hasImageExtension(url)
    );
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
};

const pushCandidate = (
  candidates: LogoCandidate[],
  value: string | null | undefined,
  pageUrl: string,
  source: string,
  score: number,
  descriptor?: string
) => {
  const resolved = resolveAssetUrl(clean(value), pageUrl);
  if (!resolved) return;
  candidates.push({ descriptor: clean(descriptor), score, source, url: resolved });
};

const collectJsonLogoCandidates = (
  value: unknown,
  candidates: LogoCandidate[],
  pageUrl: string
) => {
  if (!value || typeof value !== 'object') return;

  if (Array.isArray(value)) {
    value.forEach((item) =>
      collectJsonLogoCandidates(item, candidates, pageUrl)
    );
    return;
  }

  const record = value as Record<string, unknown>;
  const logo = record.logo;

  if (typeof logo === 'string') {
    pushCandidate(candidates, logo, pageUrl, 'json-ld-logo', 100);
  } else if (logo && typeof logo === 'object') {
    const logoRecord = logo as Record<string, unknown>;
    pushCandidate(
      candidates,
      typeof logoRecord.url === 'string' ? logoRecord.url : null,
      pageUrl,
      'json-ld-logo',
      100
    );
  }

  Object.values(record).forEach((item) =>
    collectJsonLogoCandidates(item, candidates, pageUrl)
  );
};

const extractLogoCandidates = (html: string, pageUrl: string) => {
  const candidates: LogoCandidate[] = [];

  for (const tag of html.match(/<script\b[^>]*>[\s\S]*?<\/script>/gi) || []) {
    const attrs = readAttributes(tag);
    if (!clean(attrs.type).toLowerCase().includes('ld+json')) continue;

    const json = tag
      .replace(/^<script\b[^>]*>/i, '')
      .replace(/<\/script>$/i, '')
      .trim();
    if (!json) continue;

    try {
      collectJsonLogoCandidates(JSON.parse(json), candidates, pageUrl);
    } catch {
      // Malformed JSON-LD is common enough that we simply skip it.
    }
  }

  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const attrs = readAttributes(tag);
    const key = firstUsable([attrs.property, attrs.name]).toLowerCase();
    if (key === 'og:logo' || key === 'logo' || key === 'image') {
      pushCandidate(candidates, attrs.content, pageUrl, key, 95, key);
    } else if (key === 'og:image') {
      pushCandidate(candidates, attrs.content, pageUrl, key, 70, key);
    } else if (key === 'twitter:image') {
      pushCandidate(candidates, attrs.content, pageUrl, key, 65, key);
    }
  }

  for (const tag of html.match(/<link\b[^>]*>/gi) || []) {
    const attrs = readAttributes(tag);
    const rel = clean(attrs.rel).toLowerCase();
    if (rel.includes('apple-touch-icon')) {
      pushCandidate(candidates, attrs.href, pageUrl, rel, 50, rel);
    } else if (rel.includes('icon') || rel.includes('mask-icon')) {
      pushCandidate(candidates, attrs.href, pageUrl, rel, 40, rel);
    }
  }

  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    const attrs = readAttributes(tag);
    const descriptor = [
      attrs.alt,
      attrs.class,
      attrs.id,
      attrs.src,
      attrs.title,
      attrs['aria-label'],
    ]
      .map(clean)
      .join(' ')
      .toLowerCase();
    if (descriptor.includes('logo') || descriptor.includes('brand')) {
      const imageUrl = firstUsable([
        attrs.src,
        attrs['data-src'],
        attrs['data-lazy-src'],
        attrs['data-original'],
        ...parseSrcSet(attrs.srcset),
        ...parseSrcSet(attrs['data-srcset']),
      ]);
      pushCandidate(candidates, imageUrl, pageUrl, 'img-logo', 90, descriptor);
    }
  }

  for (const path of [
    '/logo.svg',
    '/logo.png',
    '/assets/logo.svg',
    '/assets/logo.png',
    '/images/logo.svg',
    '/images/logo.png',
  ]) {
    pushCandidate(candidates, path, pageUrl, 'common-logo-path', 30);
  }

  const byUrl = new Map<string, LogoCandidate>();
  candidates.forEach((candidate) => {
    const existing = byUrl.get(candidate.url);
    if (!existing || candidate.score > existing.score) {
      byUrl.set(candidate.url, candidate);
    }
  });

  return [...byUrl.values()].sort((left, right) => right.score - left.score);
};

const extractJsonPayload = (text: string) => {
  const fencedMatch = text.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) return fencedMatch[1].trim();

  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start >= 0 && end > start) return text.slice(start, end + 1);
  return text.trim();
};

const getTextBlocks = (content: Anthropic.Messages.Message['content']) =>
  content
    .filter((block) => block.type === 'text')
    .map((block) => (block.type === 'text' ? block.text : ''))
    .join('\n\n')
    .trim();

const rankCandidatesWithAi = async (
  website: string,
  candidates: LogoCandidate[]
) => {
  if (!process.env.ANTHROPIC_API_KEY || candidates.length < 2) {
    return candidates;
  }

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const response = await anthropic.messages.create({
    max_tokens: 700,
    model: LOGO_DISCOVERY_MODEL,
    system:
      'Return strict JSON only. Rank website image candidates by which is most likely the official company logo or brand mark.',
    messages: [
      {
        role: 'user',
        content: JSON.stringify({
          candidates: candidates.slice(0, 60).map((candidate) => ({
            descriptor: candidate.descriptor || null,
            fileName: candidate.url.split('?')[0].split('/').pop() || null,
            score: candidate.score,
            source: candidate.source,
            url: candidate.url,
          })),
          responseShape: {
            rankedUrls:
              'array of exact candidate urls from most likely official logo to least likely',
          },
          task:
            'Prefer transparent/logo image assets over social preview photos, hero images, stock photos, or generic favicons. Use favicons only when no better logo asset is present.',
          website,
        }),
      },
    ],
  });

  const parsed = JSON.parse(extractJsonPayload(getTextBlocks(response.content)));
  const rankedUrls = Array.isArray(parsed?.rankedUrls)
    ? parsed.rankedUrls.map((url: unknown) => clean(String(url)))
    : [];
  const byUrl = new Map(candidates.map((candidate) => [candidate.url, candidate]));
  const rankedCandidates = rankedUrls
    .map((url: string) => byUrl.get(url))
    .filter(Boolean) as LogoCandidate[];
  const rankedSet = new Set(rankedCandidates.map((candidate) => candidate.url));

  return [
    ...rankedCandidates,
    ...candidates.filter((candidate) => !rankedSet.has(candidate.url)),
  ];
};

const maybeRankCandidatesWithAi = async (
  website: string,
  candidates: LogoCandidate[]
) => {
  try {
    return await rankCandidatesWithAi(website, candidates);
  } catch (error) {
    console.warn('AI provider logo ranking failed:', error);
    return candidates;
  }
};

const getFallbackIconCandidates = (website: string): LogoCandidate[] => {
  const host = getHost(website);
  if (!host) return [];

  return [
    {
      score: 20,
      source: 'google-favicon',
      url: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
        host
      )}&sz=256`,
    },
    {
      score: 10,
      source: 'duckduckgo-favicon',
      url: `https://icons.duckduckgo.com/ip3/${encodeURIComponent(host)}.ico`,
    },
  ];
};

const findFirstUsableCandidate = async (candidates: LogoCandidate[]) => {
  for (const candidate of candidates) {
    if (await isUsableImageUrl(candidate.url)) {
      return candidate;
    }
  }

  return null;
};

export const discoverWebsiteLogo = async (website: string) => {
  const urls = getWebsiteUrlsToTry(website);
  if (!urls.length) return null;

  for (const url of urls) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        cache: 'no-store',
        headers: {
          Accept: 'text/html,application/xhtml+xml',
          'User-Agent':
            'TakeShape provider dashboard enrichment (+https://takeshapehome.com)',
        },
        signal: controller.signal,
      });

      if (!response.ok) continue;

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.toLowerCase().includes('text/html')) continue;

      const html = await response.text();
      const candidates = extractLogoCandidates(html, response.url || url);
      const candidate = await findFirstUsableCandidate(
        await maybeRankCandidatesWithAi(website, candidates)
      );
      if (candidate) return candidate.url;
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.warn('Provider website logo discovery failed:', error.message);
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  const fallback = await findFirstUsableCandidate(
    getFallbackIconCandidates(website)
  );
  return fallback?.url || null;
};
