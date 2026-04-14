'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import firebase from '@/lib/firebase';
import { getPainterByUserId } from '@/utils/firestore/painter';
import {
  DEFAULT_INTAKE_EMBED_SETTINGS,
  IntakeEmbedSettings,
} from '@/app/embed/intake/settings';
import { ButtonsQuoteSubmit } from '@/components/buttons/quote/submit';

type IntakeStep =
  | 'contact'
  | 'estimateChoice'
  | 'videoUpload'
  | 'videoCallSchedule'
  | 'thanks'
  | 'videoCallRequested'
  | 'inPersonRequested';

const sectionClassName =
  'rounded-xl border border-black-08 bg-white p-4 sm:p-5';

export default function CustomizePage() {
  const [providerId, setProviderId] = useState('');
  const [draft, setDraft] = useState<IntakeEmbedSettings>(
    DEFAULT_INTAKE_EMBED_SETTINGS
  );
  const [isResolvingProvider, setIsResolvingProvider] =
    useState(true);
  const [isLoadingSettings, setIsLoadingSettings] =
    useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [previewRevision, setPreviewRevision] = useState(0);
  const [currentStep, setCurrentStep] =
    useState<IntakeStep>('contact');
  const previewIframeRef =
    useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const auth = getAuth(firebase);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setIsResolvingProvider(true);
        setStatus('');

        if (!user) {
          setProviderId('');
          setStatus('Sign in as a provider to customize embed.');
          return;
        }

        const painter = await getPainterByUserId(user.uid);
        const resolvedProviderId = String(painter?.id || '').trim();

        if (!resolvedProviderId) {
          setProviderId('');
          setStatus(
            'No provider profile found for this account.'
          );
          return;
        }

        setProviderId(resolvedProviderId);
      } catch (error) {
        console.error(error);
        setProviderId('');
        setStatus('Unable to resolve provider profile.');
      } finally {
        setIsResolvingProvider(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadSettings = async () => {
      if (!providerId) return;
      try {
        setIsLoadingSettings(true);
        const response = await fetch(
          `/api/embed/intake-settings?providerId=${encodeURIComponent(
            providerId
          )}`
        );
        if (!response.ok) {
          throw new Error(
            `Failed to load settings: ${response.status}`
          );
        }
        const payload = await response.json();
        if (cancelled) return;
        setDraft(
          (payload.settings ||
            DEFAULT_INTAKE_EMBED_SETTINGS) as IntakeEmbedSettings
        );
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          setStatus(
            'Unable to load provider settings. Showing defaults.'
          );
          setDraft(DEFAULT_INTAKE_EMBED_SETTINGS);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSettings(false);
        }
      }
    };

    loadSettings();
    return () => {
      cancelled = true;
    };
  }, [providerId]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const payload = event.data;
      if (
        !payload ||
        payload.type !== 'takeshape-embed' ||
        payload.action !== 'intake-step'
      ) {
        return;
      }
      const stepValue = String(payload?.data?.step || '').trim();
      if (!stepValue) return;
      setCurrentStep(stepValue as IntakeStep);
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const previewUrl = useMemo(() => {
    if (!providerId) return '';
    const params = new URLSearchParams({
      providerId,
      previewMode: 'true',
      rev: String(previewRevision),
    });
    return `/embed/intake?${params.toString()}`;
  }, [providerId, previewRevision]);

  const saveSettings = async () => {
    if (!providerId) return;
    try {
      setIsSaving(true);
      setStatus('');

      const response = await fetch('/api/embed/intake-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          settings: draft,
        }),
      });

      if (!response.ok) {
        throw new Error(`Save failed: ${response.status}`);
      }

      previewIframeRef.current?.contentWindow?.postMessage(
        {
          type: 'takeshape-embed',
          action: 'intake-settings-update',
          data: { settings: draft },
        },
        '*'
      );

      setStatus('Updated.');
    } catch (error) {
      console.error(error);
      setStatus('Failed to update settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderEditorForStep = () => {
    if (currentStep === 'contact') {
      return (
        <div className={sectionClassName}>
          <h2 className="text-base font-semibold text-black">
            Page 1: Intro (Left Side Text)
          </h2>
          <textarea
            rows={6}
            value={draft.contactIntroText}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                contactIntroText: event.target.value,
              }))
            }
            className="mt-3 w-full rounded border border-black-08 p-3 text-sm text-black-7"
          />
          <div className="mt-4">
            <ButtonsQuoteSubmit
              type="button"
              title={isSaving ? 'Updating' : 'Update'}
              isDisabled={isSaving || isLoadingSettings}
              size="md"
              classValue="font-bold min-h-[56px] px-12 w-full justify-center"
              onTap={saveSettings}
            />
          </div>
        </div>
      );
    }

    if (currentStep === 'estimateChoice') {
      return (
        <div className={sectionClassName}>
          <h2 className="text-base font-semibold text-black">
            Page 2: Option Subtitles
          </h2>
          <div className="mt-3 space-y-2">
            <label className="text-sm font-semibold text-black-4">
              Upload a Video subtitle
            </label>
            <input
              value={draft.estimateChoiceSubtitles.uploadVideo}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  estimateChoiceSubtitles: {
                    ...prev.estimateChoiceSubtitles,
                    uploadVideo: event.target.value,
                  },
                }))
              }
              className="w-full h-11 rounded border border-black-08 px-3 text-sm text-black-7"
            />
            <label className="text-sm font-semibold text-black-4 mt-2 block">
              Schedule Live Video Call subtitle
            </label>
            <input
              value={
                draft.estimateChoiceSubtitles
                  .requestLiveVideoEstimate
              }
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  estimateChoiceSubtitles: {
                    ...prev.estimateChoiceSubtitles,
                    requestLiveVideoEstimate:
                      event.target.value,
                  },
                }))
              }
              className="w-full h-11 rounded border border-black-08 px-3 text-sm text-black-7"
            />
            <label className="text-sm font-semibold text-black-4 mt-2 block">
              Request In-Person Estimate subtitle
            </label>
            <input
              value={
                draft.estimateChoiceSubtitles
                  .requestInPersonEstimate
              }
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  estimateChoiceSubtitles: {
                    ...prev.estimateChoiceSubtitles,
                    requestInPersonEstimate:
                      event.target.value,
                  },
                }))
              }
              className="w-full h-11 rounded border border-black-08 px-3 text-sm text-black-7"
            />
          </div>
          <div className="mt-4">
            <ButtonsQuoteSubmit
              type="button"
              title={isSaving ? 'Updating' : 'Update'}
              isDisabled={isSaving || isLoadingSettings}
              size="md"
              classValue="font-bold min-h-[56px] px-12 w-full justify-center"
              onTap={saveSettings}
            />
          </div>
        </div>
      );
    }

    if (currentStep === 'videoUpload') {
      return (
        <div className={sectionClassName}>
          <h2 className="text-base font-semibold text-black">
            Upload Screen: Text Under Upload Box
          </h2>
          <textarea
            rows={5}
            value={draft.uploadInstructionsText}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                uploadInstructionsText: event.target.value,
              }))
            }
            className="mt-3 w-full rounded border border-black-08 p-3 text-sm text-black-7"
          />
          <div className="mt-4">
            <ButtonsQuoteSubmit
              type="button"
              title={isSaving ? 'Updating' : 'Update'}
              isDisabled={isSaving || isLoadingSettings}
              size="md"
              classValue="font-bold min-h-[56px] px-12 w-full justify-center"
              onTap={saveSettings}
            />
          </div>
        </div>
      );
    }

    if (currentStep === 'thanks') {
      return (
        <div className={sectionClassName}>
          <h2 className="text-base font-semibold text-black">
            Completion: Upload Video
          </h2>
          <textarea
            rows={4}
            value={draft.completion.uploadVideoMessage}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                completion: {
                  ...prev.completion,
                  uploadVideoMessage: event.target.value,
                },
              }))
            }
            className="mt-3 w-full rounded border border-black-08 p-3 text-sm text-black-7"
          />
          <label className="mt-3 inline-flex items-center gap-2 text-sm text-black-6">
            <input
              type="checkbox"
              checked={draft.completion.confetti.uploadVideo}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  completion: {
                    ...prev.completion,
                    confetti: {
                      ...prev.completion.confetti,
                      uploadVideo: event.target.checked,
                    },
                  },
                }))
              }
              className="h-4 w-4 accent-pink"
            />
            Confetti on this page
          </label>
          <div className="mt-4">
            <ButtonsQuoteSubmit
              type="button"
              title={isSaving ? 'Updating' : 'Update'}
              isDisabled={isSaving || isLoadingSettings}
              size="md"
              classValue="font-bold min-h-[56px] px-12 w-full justify-center"
              onTap={saveSettings}
            />
          </div>
        </div>
      );
    }

    if (currentStep === 'videoCallRequested') {
      return (
        <div className={sectionClassName}>
          <h2 className="text-base font-semibold text-black">
            Completion: Live Video Call
          </h2>
          <p className="text-xs text-black-5 mt-1">
            Use {'{phone}'} to insert the customer phone.
          </p>
          <textarea
            rows={4}
            value={draft.completion.videoCallRequestedMessage}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                completion: {
                  ...prev.completion,
                  videoCallRequestedMessage:
                    event.target.value,
                },
              }))
            }
            className="mt-2 w-full rounded border border-black-08 p-3 text-sm text-black-7"
          />
          <label className="mt-3 inline-flex items-center gap-2 text-sm text-black-6">
            <input
              type="checkbox"
              checked={
                draft.completion.confetti.videoCallRequested
              }
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  completion: {
                    ...prev.completion,
                    confetti: {
                      ...prev.completion.confetti,
                      videoCallRequested: event.target.checked,
                    },
                  },
                }))
              }
              className="h-4 w-4 accent-pink"
            />
            Confetti on this page
          </label>
          <div className="mt-4">
            <ButtonsQuoteSubmit
              type="button"
              title={isSaving ? 'Updating' : 'Update'}
              isDisabled={isSaving || isLoadingSettings}
              size="md"
              classValue="font-bold min-h-[56px] px-12 w-full justify-center"
              onTap={saveSettings}
            />
          </div>
        </div>
      );
    }

    if (currentStep === 'inPersonRequested') {
      return (
        <div className={sectionClassName}>
          <h2 className="text-base font-semibold text-black">
            Completion: In-Person Estimate
          </h2>
          <textarea
            rows={4}
            value={draft.completion.inPersonRequestedMessage}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                completion: {
                  ...prev.completion,
                  inPersonRequestedMessage:
                    event.target.value,
                },
              }))
            }
            className="mt-3 w-full rounded border border-black-08 p-3 text-sm text-black-7"
          />
          <label className="mt-3 inline-flex items-center gap-2 text-sm text-black-6">
            <input
              type="checkbox"
              checked={
                draft.completion.confetti.inPersonRequested
              }
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  completion: {
                    ...prev.completion,
                    confetti: {
                      ...prev.completion.confetti,
                      inPersonRequested: event.target.checked,
                    },
                  },
                }))
              }
              className="h-4 w-4 accent-pink"
            />
            Confetti on this page
          </label>
          <div className="mt-4">
            <ButtonsQuoteSubmit
              type="button"
              title={isSaving ? 'Updating' : 'Update'}
              isDisabled={isSaving || isLoadingSettings}
              size="md"
              classValue="font-bold min-h-[56px] px-12 w-full justify-center"
              onTap={saveSettings}
            />
          </div>
        </div>
      );
    }

    return (
      <div className={sectionClassName}>
        <h2 className="text-base font-semibold text-black">
          No Editable Fields On This Screen
        </h2>
        <p className="mt-2 text-sm text-black-6">
          The current preview screen has no custom text fields.
          Navigate to another screen in the preview to edit it.
        </p>
      </div>
    );
  };

  if (isResolvingProvider) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--app-bg)',
          color: '#0f172a',
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 540,
            width: '100%',
            background: 'var(--app-surface-card)',
            border: '1px solid #dbe3ef',
            borderRadius: 16,
            padding: 24,
            textAlign: 'center',
          }}
        >
          <h2 style={{ margin: '0 0 8px 0' }}>Checking account...</h2>
          <p style={{ margin: 0, color: '#475569' }}>
            Verifying provider access.
          </p>
        </div>
      </div>
    );
  }

  if (!providerId) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--app-bg)',
          color: '#0f172a',
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 540,
            width: '100%',
            background: 'var(--app-surface-card)',
            border: '1px solid #dbe3ef',
            borderRadius: 16,
            padding: 24,
            textAlign: 'center',
          }}
        >
          <h2 style={{ margin: '0 0 8px 0' }}>Provider Login Required</h2>
          <p style={{ margin: 0, color: '#475569' }}>
            This customize screen is restricted to signed-in provider
            accounts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-3 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-[1500px] space-y-4">
        <div>
          <h1 className="typography-page-title text-left">
            Customize Your Embed
          </h1>
          {status ? (
            <p className="mt-2 text-sm text-black-6">{status}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_430px]">
          <section className="fill-column-white-sm sm:fill-column-white p-2 sm:p-3">
            <iframe
              ref={previewIframeRef}
              key={previewUrl}
              src={previewUrl}
              title="Intake embed preview"
              className="w-full h-[820px] rounded-xl border border-black-08 bg-white"
            />
          </section>

          <section className="space-y-3">{renderEditorForStep()}</section>
        </div>
      </div>
    </div>
  );
}
