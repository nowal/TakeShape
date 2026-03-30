'use client';

import React, { useMemo, useState } from 'react';
import { PRIMARY_COLOR_HEX } from '@/constants/brand-color';
import Image from 'next/image';

type StructuredAnalysis = Record<string, unknown>;

type AnalyzeResponse = {
  notes: string;
  imageCount: number;
  structured: StructuredAnalysis;
};

type CandidateFrame = {
  timeInSeconds: number;
  minuteBucket: number;
  dataUrl: string;
  score: number;
};

type ExtractedFrames = {
  frames: string[];
  scannedFrames: number;
  selectedFrames: number;
};

const DEFAULT_SERVICE_FOCUS = 'Window cleaning and power washing';
const MAX_ANALYSIS_FRAMES = 40;
const MAX_VIDEO_SECONDS_TO_SCAN = 10 * 60;
const MAX_FRAME_WIDTH = 960;

const waitForLoadedMetadata = (video: HTMLVideoElement) =>
  new Promise<void>((resolve, reject) => {
    const onLoaded = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error('Could not load video metadata.'));
    };
    const cleanup = () => {
      video.removeEventListener('loadedmetadata', onLoaded);
      video.removeEventListener('error', onError);
    };

    video.addEventListener('loadedmetadata', onLoaded, { once: true });
    video.addEventListener('error', onError, { once: true });
  });

const seekVideo = (video: HTMLVideoElement, timeInSeconds: number) =>
  new Promise<void>((resolve, reject) => {
    const onSeeked = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error('Failed to seek video while extracting frames.'));
    };
    const cleanup = () => {
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
    };

    video.addEventListener('seeked', onSeeked, { once: true });
    video.addEventListener('error', onError, { once: true });
    video.currentTime = timeInSeconds;
  });

const calculateFrameQualityScore = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  const imageData = context.getImageData(0, 0, width, height).data;

  let brightnessSum = 0;
  let brightnessSquaredSum = 0;
  let edgeSum = 0;
  let pixels = 0;

  const stride = 4;

  for (let y = 0; y < height - stride; y += stride) {
    for (let x = 0; x < width - stride; x += stride) {
      const index = (y * width + x) * 4;
      const rightIndex = (y * width + (x + stride)) * 4;
      const downIndex = ((y + stride) * width + x) * 4;

      const brightness =
        0.299 * imageData[index] +
        0.587 * imageData[index + 1] +
        0.114 * imageData[index + 2];

      const brightnessRight =
        0.299 * imageData[rightIndex] +
        0.587 * imageData[rightIndex + 1] +
        0.114 * imageData[rightIndex + 2];

      const brightnessDown =
        0.299 * imageData[downIndex] +
        0.587 * imageData[downIndex + 1] +
        0.114 * imageData[downIndex + 2];

      const dx = Math.abs(brightness - brightnessRight);
      const dy = Math.abs(brightness - brightnessDown);

      brightnessSum += brightness;
      brightnessSquaredSum += brightness * brightness;
      edgeSum += dx + dy;
      pixels += 1;
    }
  }

  if (!pixels) return 0;

  const mean = brightnessSum / pixels;
  const variance = Math.max(0, brightnessSquaredSum / pixels - mean * mean);
  const contrastScore = Math.sqrt(variance);
  const edgeScore = edgeSum / pixels;

  const exposurePenalty = mean < 25 || mean > 230 ? 20 : 0;

  return edgeScore * 0.7 + contrastScore * 0.3 - exposurePenalty;
};

const pickBestFramesPerMinute = (candidates: CandidateFrame[]) => {
  const grouped = new Map<number, CandidateFrame[]>();

  for (const frame of candidates) {
    const bucketFrames = grouped.get(frame.minuteBucket) || [];
    bucketFrames.push(frame);
    grouped.set(frame.minuteBucket, bucketFrames);
  }

  const selected: CandidateFrame[] = [];

  for (const frames of grouped.values()) {
    const sorted = [...frames].sort((a, b) => b.score - a.score);
    const minutePicks: CandidateFrame[] = [];
    const pickLimit = Math.max(1, Math.min(12, Math.floor(sorted.length / 2)));
    const minSpacingSeconds = sorted.length < 30 ? 2 : 4;

    for (const frame of sorted) {
      if (minutePicks.length >= pickLimit) break;

      const tooCloseToExisting = minutePicks.some(
        (picked) => Math.abs(picked.timeInSeconds - frame.timeInSeconds) < minSpacingSeconds
      );

      if (!tooCloseToExisting) {
        minutePicks.push(frame);
      }
    }

    if (!minutePicks.length && sorted.length) {
      minutePicks.push(sorted[0]);
    }

    selected.push(...minutePicks);
  }

  return selected.sort((a, b) => a.timeInSeconds - b.timeInSeconds);
};

const limitFramesForPayload = (frames: CandidateFrame[], maxFrames: number) => {
  if (frames.length <= maxFrames) return frames;

  const step = (frames.length - 1) / (maxFrames - 1);
  const reduced: CandidateFrame[] = [];

  for (let i = 0; i < maxFrames; i += 1) {
    reduced.push(frames[Math.round(i * step)]);
  }

  return reduced;
};

const extractKeyFrames = async (file: File): Promise<ExtractedFrames> => {
  const video = document.createElement('video');
  video.preload = 'metadata';
  video.muted = true;
  video.playsInline = true;

  const objectUrl = URL.createObjectURL(file);
  video.src = objectUrl;

  try {
    await waitForLoadedMetadata(video);

    const duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error('Video duration could not be read.');
    }

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
      throw new Error('Video resolution is invalid.');
    }

    const scale = Math.min(1, MAX_FRAME_WIDTH / width);
    const targetWidth = Math.round(width * scale);
    const targetHeight = Math.round(height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Could not create frame extraction canvas.');
    }

    const effectiveDuration = Math.min(duration, MAX_VIDEO_SECONDS_TO_SCAN);
    const candidateFrames: CandidateFrame[] = [];

    for (let second = 0; second < Math.floor(effectiveDuration); second += 1) {
      const timestamp = Math.min(second + 0.05, Math.max(effectiveDuration - 0.05, 0));
      await seekVideo(video, timestamp);
      context.drawImage(video, 0, 0, targetWidth, targetHeight);

      const score = calculateFrameQualityScore(context, targetWidth, targetHeight);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

      candidateFrames.push({
        timeInSeconds: timestamp,
        minuteBucket: Math.floor(timestamp / 60),
        dataUrl,
        score
      });
    }

    if (!candidateFrames.length) {
      throw new Error('No frames could be extracted from the video.');
    }

    const selectedByMinute = pickBestFramesPerMinute(candidateFrames);
    const finalSelection = limitFramesForPayload(selectedByMinute, MAX_ANALYSIS_FRAMES);

    return {
      frames: finalSelection.map((frame) => frame.dataUrl),
      scannedFrames: candidateFrames.length,
      selectedFrames: finalSelection.length
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

export default function CoachingPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [rules, setRules] = useState('');
  const [serviceFocus, setServiceFocus] = useState(DEFAULT_SERVICE_FOCUS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [notes, setNotes] = useState('');
  const [frameCount, setFrameCount] = useState(0);
  const [structured, setStructured] = useState<StructuredAnalysis | null>(null);
  const [selectedFramePreviews, setSelectedFramePreviews] = useState<string[]>([]);

  const canSubmit = useMemo(() => Boolean(videoFile) && !isSubmitting, [videoFile, isSubmitting]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!videoFile) {
      setStatusMessage('Please upload a video first.');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('Scanning video at 1 frame/second and selecting best frames per minute...');
    setNotes('');
    setStructured(null);
    setSelectedFramePreviews([]);

    try {
      const extracted = await extractKeyFrames(videoFile);
      setFrameCount(extracted.selectedFrames);
      setSelectedFramePreviews(extracted.frames);

      setStatusMessage(
        `Scanned ${extracted.scannedFrames} frames. Sending ${extracted.selectedFrames} high-quality frames to AI...`
      );

      const response = await fetch('/api/coaching/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          images: extracted.frames,
          rules,
          serviceFocus
        })
      });

      const data = (await response.json()) as AnalyzeResponse | { error: string };

      if (!response.ok || 'error' in data) {
        throw new Error('error' in data ? data.error : 'Analysis failed.');
      }

      setNotes(data.notes);
      setStructured(data.structured || {});
      setStatusMessage(`Analysis complete. ${data.imageCount} selected frames reviewed.`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Failed to analyze video.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Coaching Analysis</h1>
      <p className="mt-2 text-sm text-slate-600">
        Upload a walkthrough video, add any provider-specific rules, and generate coaching notes.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div>
          <label htmlFor="coaching-video" className="mb-2 block text-sm font-medium text-slate-900">
            Video Upload
          </label>
          <input
            id="coaching-video"
            type="file"
            accept="video/*"
            onChange={(event) => setVideoFile(event.target.files?.[0] || null)}
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium"
          />
          {videoFile ? (
            <p className="mt-2 text-xs text-slate-600">
              Selected: {videoFile.name} ({Math.round(videoFile.size / 1024 / 1024)} MB)
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="service-focus" className="mb-2 block text-sm font-medium text-slate-900">
            Service Focus
          </label>
          <input
            id="service-focus"
            type="text"
            value={serviceFocus}
            onChange={(event) => setServiceFocus(event.target.value)}
            placeholder="Window cleaning and power washing"
            className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="provider-rules" className="mb-2 block text-sm font-medium text-slate-900">
            Additional Rules
          </label>
          <textarea
            id="provider-rules"
            value={rules}
            onChange={(event) => setRules(event.target.value)}
            rows={6}
            placeholder="Example: Always note screen condition, count panes per window, and call out oxidation on painted surfaces."
            className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          style={{ backgroundColor: PRIMARY_COLOR_HEX }}
        >
          {isSubmitting ? 'Analyzing...' : 'Generate Coaching Notes'}
        </button>
      </form>

      {statusMessage ? (
        <p className="mt-4 text-sm text-slate-700">{statusMessage}</p>
      ) : null}

      {notes ? (
        <section className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">Coaching Output</h2>
          <p className="mt-1 text-xs text-slate-500">Frames analyzed: {frameCount}</p>
          <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-800">{notes}</pre>
        </section>
      ) : null}

      {selectedFramePreviews.length ? (
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">Selected Frames Sent To AI</h2>
          <p className="mt-1 text-xs text-slate-500">
            Showing {selectedFramePreviews.length} extracted frames used for analysis.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {selectedFramePreviews.map((frame, index) => (
              <div key={`${index}-${frame.slice(0, 24)}`} className="overflow-hidden rounded-lg border border-slate-200">
                <Image
                  src={frame}
                  alt={`Selected frame ${index + 1}`}
                  width={640}
                  height={360}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {structured ? (
        <details className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <summary className="cursor-pointer text-sm font-medium text-slate-900">Structured Analysis (debug)</summary>
          <pre className="mt-3 whitespace-pre-wrap text-xs leading-5 text-slate-700">
            {JSON.stringify(structured, null, 2)}
          </pre>
        </details>
      ) : null}
    </main>
  );
}
