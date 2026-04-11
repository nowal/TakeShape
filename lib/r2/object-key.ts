import { randomUUID } from 'crypto';

const sanitize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const extensionFromContentType = (contentType: string) => {
  const normalized = contentType.trim().toLowerCase();
  if (normalized === 'video/mp4') return 'mp4';
  if (normalized === 'video/webm') return 'webm';
  if (normalized === 'video/quicktime') return 'mov';
  return 'bin';
};

export const buildQuoteVideoObjectKey = ({
  providerId,
  quoteId,
  contentType,
  source,
}: {
  providerId: string;
  quoteId: string;
  contentType: string;
  source: 'upload' | 'signalwire';
}) => {
  const providerSegment = sanitize(providerId);
  const quoteSegment = sanitize(quoteId);
  const ext = extensionFromContentType(contentType);
  const id = randomUUID();
  return `providers/${providerSegment}/quotes/${quoteSegment}/${source}/${id}.${ext}`;
};

