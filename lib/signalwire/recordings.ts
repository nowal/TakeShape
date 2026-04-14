import { getSignalWireConfig } from '@/app/api/signalwire/_lib';

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const isApiRoomRecordingUrl = (value: string) =>
  /\/api\/video\/room_recordings\//i.test(value);

const isLikelyPlayableMediaUrl = (value: string) =>
  /\.(mp4|webm|mov|m3u8)(\?|$)/i.test(value) ||
  /\/playback\//i.test(value) ||
  /\/download\//i.test(value);

export const extractPlaybackUrl = (payload: any): string | null => {
  if (!payload || typeof payload !== 'object') return null;

  const pickFirstValid = (values: any[]) =>
    values
      .filter(
        (value) =>
          typeof value === 'string' && /^https?:\/\//.test(value)
      )
      .find((value) => !isApiRoomRecordingUrl(value)) || null;

  const candidates = [
    payload.mp4_url,
    payload.download_url,
    payload.playback_url,
    payload.recording_url,
    payload.media_url,
    payload.video_url,
    payload?.links?.download,
    payload?.links?.playback,
    payload.url,
    payload.uri,
    payload?.links?.self,
  ];

  const directPlayable = candidates
    .filter(
      (value) =>
        typeof value === 'string' && /^https?:\/\//.test(value)
    )
    .find(
      (value) =>
        !isApiRoomRecordingUrl(value) &&
        isLikelyPlayableMediaUrl(value)
    );
  if (directPlayable) return directPlayable;

  return pickFirstValid(candidates);
};

export const fetchRecordingUntilReady = async ({
  recordingId,
  waitMs,
}: {
  recordingId: string;
  waitMs: number;
}) => {
  const config = getSignalWireConfig();
  if (!config) {
    throw new Error('SignalWire credentials not configured');
  }

  const deadline = Date.now() + Math.max(0, waitMs);
  let lastPayload: any = null;

  while (true) {
    const response = await fetch(
      `https://${config.spaceUrl}/api/video/room_recordings/${recordingId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Basic ${config.authHeader}`,
          Accept: 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const details = await response.text();
      throw new Error(
        `SignalWire room_recordings fetch failed (${response.status}): ${details}`
      );
    }

    const payload = await response.json();
    lastPayload = payload?.data || payload;
    const state = String(
      lastPayload?.state || lastPayload?.status || ''
    ).toLowerCase();
    const url = extractPlaybackUrl(lastPayload);
    const isReady =
      state === 'completed' ||
      state === 'finished' ||
      state === 'available';

    if (url && isReady) {
      return { ready: true, url, payload: lastPayload };
    }

    if (Date.now() >= deadline) {
      return { ready: false, url: url || null, payload: lastPayload };
    }

    await sleep(1000);
  }
};

