'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import Image from 'next/image';
import firebase from '@/lib/firebase';
import {
  getDownloadURL,
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
} from 'firebase/storage';
import { InputsText } from '@/components/inputs/text';
import { InputsFile } from '@/components/inputs/file';
import { ButtonsQuoteSubmit } from '@/components/buttons/quote/submit';
import {
  initializeEmbed,
  sendCompletionEvent,
  sendMessageToParent,
} from '@/app/embed/utils';
import {
  DEFAULT_INTAKE_EMBED_SETTINGS,
  IntakeEmbedSettings,
  normalizeIntakeEmbedSettings,
} from '@/app/embed/intake/settings';
import uploadIcon from './upload-brand.png';
import callIcon from './call-brand.png';
import inPersonIcon from './in-person-brand.png';
import intakeHeroImage from './embed.png';

type Step =
  | 'contact'
  | 'estimateChoice'
  | 'videoCallSchedule'
  | 'videoUpload'
  | 'inPersonRequested'
  | 'thanks'
  | 'videoCallRequested';

type EstimateChoice =
  | 'uploadVideo'
  | 'requestLiveVideoEstimate'
  | 'requestInPersonEstimate'
  | null;

type ContactForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

type ContactErrors = ContactForm;
type LiveVideoCallPreference =
  | 'asap'
  | 'scheduled'
  | null;

const INITIAL_CONTACT: ContactForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
};

const INITIAL_ERRORS: ContactErrors = {
  name: '',
  email: '',
  phone: '',
  address: '',
};

const buildDefaultSchedule = () => {
  const now = new Date();
  const rounded = new Date(now);
  rounded.setSeconds(0, 0);

  const minutes = rounded.getMinutes();
  const remainder = minutes % 15;

  if (remainder !== 0) {
    rounded.setMinutes(minutes + (15 - remainder));
  }

  const date = `${rounded.getFullYear()}-${String(
    rounded.getMonth() + 1
  ).padStart(2, '0')}-${String(
    rounded.getDate()
  ).padStart(2, '0')}`;
  const time = `${String(rounded.getHours()).padStart(
    2,
    '0'
  )}:${String(rounded.getMinutes()).padStart(2, '0')}`;

  return { date, time };
};

const buildTimeOptions = () => {
  const options: Array<{ value: string; label: string }> = [];

  for (let hour = 0; hour < 24; hour += 1) {
    for (let minute = 0; minute < 60; minute += 15) {
      const value = `${String(hour).padStart(2, '0')}:${String(
        minute
      ).padStart(2, '0')}`;
      const period = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      const minuteLabel = String(minute).padStart(2, '0');
      const label = `${hour12}:${minuteLabel} ${period}`;
      options.push({ value, label });
    }
  }

  return options;
};

const formatPhoneNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, '');

  if (digits.length !== 10) return phone;

  return `(${digits.slice(0, 3)}) ${digits.slice(
    3,
    6
  )}-${digits.slice(6)}`;
};

const resolveCompletionMessage = ({
  template,
  phone,
}: {
  template: string;
  phone: string;
}) => {
  return template.replace(
    /\{phone\}/g,
    formatPhoneNumber(phone || '(555) 555-5555')
  );
};

const sanitizeStorageSegment = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

export default function EmbedIntakePage() {
  const [step, setStep] = useState<Step>('contact');
  const [contact, setContact] = useState<ContactForm>(INITIAL_CONTACT);
  const [errors, setErrors] = useState<ContactErrors>(INITIAL_ERRORS);
  const [estimateChoice, setEstimateChoice] =
    useState<EstimateChoice>(null);
  const [liveVideoCallPreference, setLiveVideoCallPreference] =
    useState<LiveVideoCallPreference>('asap');
  const [videoCallSchedule, setVideoCallSchedule] = useState(
    () => buildDefaultSchedule()
  );
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoFileName, setVideoFileName] = useState('');
  const [providerId, setProviderId] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [settings, setSettings] = useState<IntakeEmbedSettings>(
    DEFAULT_INTAKE_EMBED_SETTINGS
  );
  const jobDescription = '';
  const [videoSubmitPending, setVideoSubmitPending] =
    useState(false);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadError, setUploadError] = useState('');
  const sentNotificationStepRef = useRef<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const options = initializeEmbed();
    const params = new URLSearchParams(window.location.search);
    const queryProviderId = String(
      options.providerId || params.get('providerId') || ''
    ).trim();
    const isPreview =
      String(params.get('previewMode') || '').trim() === 'true';

    setPreviewMode(isPreview);
    if (queryProviderId) {
      setProviderId(queryProviderId);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadSettings = async () => {
      if (!providerId) {
        setSettings(DEFAULT_INTAKE_EMBED_SETTINGS);
        return;
      }

      try {
        const response = await fetch(
          `/api/embed/intake-settings?providerId=${encodeURIComponent(
            providerId
          )}`
        );

        if (!response.ok) return;

        const payload = await response.json();
        if (cancelled) return;

        setSettings(
          (payload.settings ||
            DEFAULT_INTAKE_EMBED_SETTINGS) as IntakeEmbedSettings
        );
      } catch (error) {
        if (!cancelled) {
          console.error(
            'Failed to load intake embed settings:',
            error
          );
        }
      }
    };

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, [providerId]);

  useEffect(() => {
    if (previewMode) return;
    if (
      step !== 'thanks' &&
      step !== 'inPersonRequested' &&
      step !== 'videoCallRequested'
    ) {
      return;
    }

    sendCompletionEvent({
      flow: 'contact-video-intake',
      providerId,
      estimateChoice,
      contact,
      liveVideoCallPreference,
      videoCallSchedule:
        liveVideoCallPreference === 'scheduled'
          ? videoCallSchedule
          : null,
      hasVideoUpload: Boolean(videoFile),
      jobDescription,
      completedAt: new Date().toISOString(),
    });
  }, [
    step,
    previewMode,
    estimateChoice,
    providerId,
    contact,
    liveVideoCallPreference,
    videoCallSchedule,
    videoFile,
    jobDescription,
  ]);

  useEffect(() => {
    if (previewMode) return;
    if (!providerId) return;
    if (!estimateChoice) return;
    if (
      estimateChoice === 'uploadVideo' &&
      step === 'thanks' &&
      !uploadedVideoUrl
    ) {
      return;
    }
    if (
      step !== 'thanks' &&
      step !== 'inPersonRequested' &&
      step !== 'videoCallRequested'
    ) {
      return;
    }

    const sentKey = `${step}:${estimateChoice}`;
    if (sentNotificationStepRef.current.has(sentKey)) {
      return;
    }
    sentNotificationStepRef.current.add(sentKey);

    const notify = async () => {
      try {
        const response = await fetch(
          '/api/embed/intake/notify-provider',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              providerId,
              estimateChoice,
              contact,
              liveVideoCallPreference,
              videoCallSchedule:
                liveVideoCallPreference === 'scheduled'
                  ? videoCallSchedule
                  : null,
              videoUrl: uploadedVideoUrl || null,
              videoFileName: videoFileName || null,
            }),
          }
        );

        if (!response.ok) {
          const payload = await response
            .json()
            .catch(() => null);
          console.error(
            'Failed to notify provider after intake completion',
            payload || response.status
          );
        }
      } catch (error) {
        console.error(
          'Failed to notify provider after intake completion:',
          error
        );
      }
    };

    void notify();
  }, [
    step,
    previewMode,
    providerId,
    estimateChoice,
    contact,
    liveVideoCallPreference,
    videoCallSchedule,
    uploadedVideoUrl,
    videoFileName,
  ]);

  useEffect(() => {
    sendMessageToParent('intake-step', { step });
  }, [step]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const payload = event.data;
      if (
        !payload ||
        payload.type !== 'takeshape-embed' ||
        payload.action !== 'intake-settings-update'
      ) {
        return;
      }
      const nextSettings = normalizeIntakeEmbedSettings(
        payload?.data?.settings || {}
      );
      setSettings(nextSettings);
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const canSubmitVideo = useMemo(() => {
    return previewMode ? true : Boolean(videoFile);
  }, [previewMode, videoFile]);

  const timeOptions = useMemo(() => buildTimeOptions(), []);

  const canRequestVideoCall = useMemo(() => {
    if (!liveVideoCallPreference) return false;
    if (liveVideoCallPreference === 'asap') return true;
    return Boolean(
      videoCallSchedule.date && videoCallSchedule.time
    );
  }, [liveVideoCallPreference, videoCallSchedule]);

  const handleContactChange = (
    key: keyof ContactForm,
    value: string
  ) => {
    setContact((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const validateContact = (): boolean => {
    const nextErrors: ContactErrors = {
      name: contact.name.trim() ? '' : 'Name is required',
      email: contact.email.trim() ? '' : 'Email is required',
      phone: contact.phone.trim()
        ? ''
        : 'Phone number is required',
      address: contact.address.trim()
        ? ''
        : 'Address is required',
    };

    setErrors(nextErrors);
    return Object.values(nextErrors).every((value) => !value);
  };

  const onContactSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!previewMode && !validateContact()) return;
    setStep('estimateChoice');
  };

  const onEstimateChoice = (choice: EstimateChoice) => {
    setEstimateChoice(choice);
    setUploadedVideoUrl('');

    if (choice === 'uploadVideo') {
      setStep('videoUpload');
      return;
    }

    if (choice === 'requestLiveVideoEstimate') {
      setLiveVideoCallPreference('asap');
      setVideoCallSchedule(buildDefaultSchedule());
      setStep('videoCallSchedule');
      return;
    }

    setStep('inPersonRequested');
  };

  const onPreviousToEstimateChoice = () => {
    setStep('estimateChoice');
  };

  const onLiveVideoPreferenceToggle = (
    preference: Exclude<LiveVideoCallPreference, null>
  ) => {
    setLiveVideoCallPreference((previous) =>
      previous === preference ? null : preference
    );
  };

  const onLiveVideoRequest = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canRequestVideoCall) return;
    setStep('videoCallRequested');
  };

  const onVideoFile = (file: File) => {
    if (previewMode) return;
    setVideoFile(file);
    setVideoFileName(file.name);
    setUploadProgress(0);
    setUploadStatus('');
    setUploadError('');
  };

  const uploadVideoResumable = ({
    file,
    providerId,
  }: {
    file: File;
    providerId: string;
  }) =>
    new Promise<string>((resolve, reject) => {
      const storage = getStorage(firebase);
      const safeProviderId =
        sanitizeStorageSegment(providerId) || 'provider';
      const extension =
        (file.name.split('.').pop() || 'mp4').toLowerCase();
      const timestamp = Date.now();
      const randomPart = Math.random()
        .toString(36)
        .slice(2, 10);
      const objectKey = `intake-videos/providers/${safeProviderId}/${timestamp}-${randomPart}.${extension}`;
      const fileRef = storageRef(storage, objectKey);
      const uploadTask = uploadBytesResumable(fileRef, file, {
        contentType: file.type || 'video/mp4',
      });

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const percent = Math.min(
            100,
            Math.round(
              (snapshot.bytesTransferred /
                snapshot.totalBytes) *
                100
            )
          );
          setUploadProgress(percent);
        },
        (error) => {
          reject(error);
        },
        async () => {
          try {
            const url = await getDownloadURL(
              uploadTask.snapshot.ref
            );
            resolve(url);
          } catch (error) {
            reject(error);
          }
        }
      );
    });

  const onVideoSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmitVideo) return;

    try {
      setVideoSubmitPending(true);
      setUploadError('');

      if (!previewMode && videoFile && providerId) {
        setUploadStatus('Starting upload...');
        setUploadProgress(0);
        setUploadStatus('Uploading video...');
        const downloadUrl = await uploadVideoResumable({
          file: videoFile,
          providerId,
        });
        if (!downloadUrl) {
          throw new Error(
            'Upload succeeded but no download URL was returned.'
          );
        }
        setUploadProgress(100);
        setUploadedVideoUrl(downloadUrl);
        setUploadStatus('Upload complete.');
      }

      setStep('thanks');
    } catch (error) {
      console.error('Intake video upload failed:', error);
      setUploadStatus('');
      const maybeCode = String(
        (error as { code?: string })?.code || ''
      ).trim();
      const maybeMessage = String(
        (error as { message?: string })?.message || ''
      ).trim();
      const resolvedError =
        maybeCode === 'storage/unauthorized'
          ? 'Upload is blocked by Firebase Storage rules for unauthenticated users.'
          : maybeCode === 'storage/canceled'
            ? 'Upload was canceled.'
            : maybeMessage ||
              'Upload failed. Please try again.';
      setUploadError(
        resolvedError
      );
      setUploadedVideoUrl('');
    } finally {
      setVideoSubmitPending(false);
    }
  };

  const videoCallCompletionMessage = resolveCompletionMessage({
    template: settings.completion.videoCallRequestedMessage,
    phone: contact.phone,
  });

  return (
    <div className="w-full px-3 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-6xl">
        {step === 'contact' && (
          <div className="fill-column-white-sm sm:fill-column-white min-h-[620px]">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
              <section className="flex flex-col gap-5">
                <h1 className="text-3xl font-montserrat font-bold text-black leading-tight">
                  Get Started Today!
                </h1>
                <p className="text-[17px] leading-8 text-black-6 font-open-sans max-w-[34rem] whitespace-pre-line">
                  {settings.contactIntroText}
                </p>
                <div className="relative w-full overflow-hidden rounded-2xl border border-black-08 bg-white-pink-1 h-[240px] sm:h-[300px]">
                  <Image
                    src={intakeHeroImage}
                    alt="Video estimate preview"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                </div>
              </section>

              <section>
                <form
                  className="flex flex-col gap-3"
                  onSubmit={onContactSubmit}
                >
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-black-4">
                      Name
                    </label>
                    <InputsText
                      value={contact.name}
                      onChange={(event) =>
                        handleContactChange(
                          'name',
                          event.target.value
                        )
                      }
                      placeholder="John Smith"
                      required={!previewMode}
                    />
                    {errors.name && (
                      <p className="text-sm text-red">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-black-4">
                      Email
                    </label>
                    <InputsText
                      type="email"
                      value={contact.email}
                      onChange={(event) =>
                        handleContactChange(
                          'email',
                          event.target.value
                        )
                      }
                      placeholder="you@example.com"
                      required={!previewMode}
                    />
                    {errors.email && (
                      <p className="text-sm text-red">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-black-4">
                      Phone Number
                    </label>
                    <InputsText
                      type="tel"
                      value={contact.phone}
                      onChange={(event) =>
                        handleContactChange(
                          'phone',
                          event.target.value
                        )
                      }
                      placeholder="(123) 456-7890"
                      required={!previewMode}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-black-4">
                      Address
                    </label>
                    <InputsText
                      value={contact.address}
                      onChange={(event) =>
                        handleContactChange(
                          'address',
                          event.target.value
                        )
                      }
                      placeholder="123 Main St, City, State, ZIP"
                      required={!previewMode}
                    />
                    {errors.address && (
                      <p className="text-sm text-red">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div className="mt-2">
                    <ButtonsQuoteSubmit title="Get Started" />
                  </div>
                </form>
              </section>
            </div>
          </div>
        )}

        {step === 'estimateChoice' && (
          <div className="fill-column-white-sm sm:fill-column-white min-h-[620px]">
            <div className="mb-6 text-center">
              <h2 className="typography-page-title">
                Choose Your Estimate Type
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <EstimateChoiceCard
                title="Upload a Video"
                subtitle={
                  settings.estimateChoiceSubtitles.uploadVideo
                }
                icon={uploadIcon}
                onClick={() => onEstimateChoice('uploadVideo')}
              />
              <EstimateChoiceCard
                title="Schedule Live Video Call"
                subtitle={
                  settings.estimateChoiceSubtitles
                    .requestLiveVideoEstimate
                }
                icon={callIcon}
                onClick={() =>
                  onEstimateChoice('requestLiveVideoEstimate')
                }
              />
              <EstimateChoiceCard
                title="Request In-Person Estimate"
                subtitle={
                  settings.estimateChoiceSubtitles
                    .requestInPersonEstimate
                }
                icon={inPersonIcon}
                onClick={() =>
                  onEstimateChoice('requestInPersonEstimate')
                }
              />
            </div>
          </div>
        )}

        {step === 'videoUpload' && (
          <div className="fill-column-white-sm sm:fill-column-white min-h-[620px]">
            <div className="mx-auto w-full max-w-xl">
              <div className="mb-8 text-center">
                <h2 className="typography-page-title">
                  Show Us Your Job!
                </h2>
              </div>

              <form
                className="flex min-h-[470px] flex-col"
                onSubmit={onVideoSubmit}
              >
                <div className="w-full space-y-5">
                  <div className="relative h-[8.75rem] text-pink">
                    <InputsFile
                      title="Upload Job Video"
                      onFile={onVideoFile}
                      isRequired={!previewMode}
                    >
                      {videoFileName ? (
                        <div className="absolute right-0 bottom-0 w-full truncate font-open-sans text-xs p-2 text-gray text-left">
                          <span>{videoFileName}</span>
                        </div>
                      ) : null}
                    </InputsFile>
                  </div>

                  <div className="min-h-[170px] w-full rounded-xl border border-black-08 bg-white p-6 sm:p-7 flex items-center">
                    <p className="w-full text-center text-base font-open-sans text-black-6 leading-7 whitespace-pre-line">
                      {settings.uploadInstructionsText}
                    </p>
                  </div>

                  {videoSubmitPending ? (
                    <div className="w-full rounded-xl border border-black-08 bg-white px-4 py-3">
                      <div className="flex items-center justify-between text-sm font-open-sans text-black-7">
                        <span>{uploadStatus || 'Uploading...'}</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black-08">
                        <div
                          className="h-full bg-pink transition-all duration-200"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : null}

                  {uploadError ? (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-open-sans text-red-700">
                      {uploadError}
                    </p>
                  ) : null}
                </div>

                <div className="mt-auto w-full flex flex-col sm:flex-row items-center justify-center gap-3 pb-3 sm:pb-4">
                  <ButtonsQuoteSubmit
                    type="button"
                    title="Go Back"
                    size="md"
                    classValue="font-bold min-h-[56px] px-12"
                    onTap={onPreviousToEstimateChoice}
                  />
                  <ButtonsQuoteSubmit
                    title={
                      videoSubmitPending
                        ? 'Submitting Video'
                        : 'Submit Video'
                    }
                    isDisabled={
                      !canSubmitVideo || videoSubmitPending
                    }
                    size="md"
                    classValue="font-bold min-h-[56px] px-12"
                  />
                </div>
              </form>
            </div>
          </div>
        )}

        {step === 'videoCallSchedule' && (
          <div className="fill-column-white-sm sm:fill-column-white min-h-[620px]">
            <div className="mx-auto w-full max-w-2xl">
              <div className="mb-8 text-center">
                <h2 className="typography-page-title">
                  Schedule Your Live Video Estimate
                </h2>
              </div>

              <form
                className="rounded-2xl border border-black-08 bg-white p-5 sm:p-7"
                onSubmit={onLiveVideoRequest}
              >
                <div className="space-y-4">
                  <label className="flex items-start gap-3 rounded-lg border border-black-08 p-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={
                        liveVideoCallPreference === 'asap'
                      }
                      onChange={() =>
                        onLiveVideoPreferenceToggle('asap')
                      }
                      className="mt-1 h-4 w-4 appearance-auto accent-pink bg-transparent hover:bg-transparent"
                      style={{
                        WebkitAppearance: 'checkbox',
                        appearance: 'auto',
                      }}
                    />
                    <span className="text-base font-open-sans text-black-7">
                      I want to do my live video estimate as soon as
                      possible.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 rounded-lg border border-black-08 p-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={
                        liveVideoCallPreference ===
                        'scheduled'
                      }
                      onChange={() =>
                        onLiveVideoPreferenceToggle(
                          'scheduled'
                        )
                      }
                      className="mt-1 h-4 w-4 appearance-auto accent-pink bg-transparent hover:bg-transparent"
                      style={{
                        WebkitAppearance: 'checkbox',
                        appearance: 'auto',
                      }}
                    />
                    <span className="text-base font-open-sans text-black-7">
                      The soonest I can do my live video estimate is:
                    </span>
                  </label>

                  {liveVideoCallPreference === 'scheduled' && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-black-4">
                          Date
                        </label>
                        <input
                          type="date"
                          value={videoCallSchedule.date}
                          onChange={(event) =>
                            setVideoCallSchedule((prev) => ({
                              ...prev,
                              date: event.target.value,
                            }))
                          }
                          className="w-full h-12 rounded border border-black-08 px-3 text-base text-black-7"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-black-4">
                          Time
                        </label>
                        <select
                          value={videoCallSchedule.time}
                          onChange={(event) =>
                            setVideoCallSchedule((prev) => ({
                              ...prev,
                              time: event.target.value,
                            }))
                          }
                          className="w-full h-12 rounded border border-black-08 px-3 text-base text-black-7"
                          required
                        >
                          {timeOptions.map((time) => (
                            <option
                              key={time.value}
                              value={time.value}
                            >
                              {time.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <ButtonsQuoteSubmit
                    type="button"
                    title="Go Back"
                    size="md"
                    classValue="font-bold min-h-[56px] px-12"
                    onTap={onPreviousToEstimateChoice}
                  />
                  <ButtonsQuoteSubmit
                    title="Confirm Call Time!"
                    isDisabled={!canRequestVideoCall}
                    size="md"
                    classValue="font-bold min-h-[56px] px-12"
                  />
                </div>
              </form>
            </div>
          </div>
        )}

        {step === 'inPersonRequested' && (
          <CompletionScreen
            message={settings.completion.inPersonRequestedMessage}
            showConfetti={
              settings.completion.confetti.inPersonRequested
            }
          />
        )}

        {step === 'thanks' && (
          <CompletionScreen
            message={settings.completion.uploadVideoMessage}
            showConfetti={
              settings.completion.confetti.uploadVideo
            }
          />
        )}

        {step === 'videoCallRequested' && (
          <CompletionScreen
            message={videoCallCompletionMessage}
            showConfetti={
              settings.completion.confetti.videoCallRequested
            }
          />
        )}
      </div>
    </div>
  );
}

type EstimateChoiceCardProps = {
  title: string;
  subtitle: string;
  icon: Parameters<typeof Image>[0]['src'];
  onClick: () => void;
};

function EstimateChoiceCard({
  title,
  subtitle,
  icon,
  onClick,
}: EstimateChoiceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-xl border border-black-08 bg-white p-4 transition hover:border-pink hover:shadow-08"
    >
      <h3 className="text-center text-lg font-semibold text-black">
        {title}
      </h3>
      <p className="mt-1 text-center text-base font-open-sans text-black-6 min-h-[24px] whitespace-pre-line">
        {subtitle}
      </p>
      <div className="mt-4 w-full overflow-hidden rounded-lg bg-white">
        <Image
          src={icon}
          alt={title}
          width={1053}
          height={1024}
          className="h-auto w-full object-contain"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
    </button>
  );
}

const completionConfettiPalette = [
  '#f97316',
  '#f43f5e',
  '#22c55e',
  '#3b82f6',
  '#eab308',
  '#14b8a6',
];

const completionConfettiStyle = (
  index: number
): CSSProperties => ({
  position: 'absolute',
  left: `${5 + ((index * 4.9) % 90)}%`,
  top: -28 - (index % 4) * 16,
  width: 8 + (index % 4) * 3,
  height: 14 + (index % 3) * 4,
  borderRadius: 2,
  background:
    completionConfettiPalette[
      index % completionConfettiPalette.length
    ],
  opacity: 0.9,
  transform: `rotate(${(index * 37) % 360}deg)`,
  animation: `intake-confetti-fall ${
    2.8 + (index % 4) * 0.42
  }s linear infinite`,
});

type CompletionScreenProps = {
  message: string;
  showConfetti: boolean;
  footer?: ReactNode;
};

function CompletionScreen({
  message,
  showConfetti,
  footer,
}: CompletionScreenProps) {
  return (
    <div className="fill-column-white-sm sm:fill-column-white">
      <div className="mx-auto w-full max-w-3xl px-3 py-4 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl border border-black-08 bg-white p-6 sm:p-8">
          {showConfetti
            ? [...Array(20)].map((_, index) => (
                <span
                  key={`intake-confetti-${index}`}
                  style={{
                    ...completionConfettiStyle(index),
                    animationDelay: `${(index % 6) * 0.18}s`,
                  }}
                />
              ))
            : null}

          <div className="relative z-[1] flex min-h-[280px] flex-col items-center justify-center gap-5 text-center">
            <h2 className="typography-page-title whitespace-pre-line">
              {message}
            </h2>
            {footer ? (
              <div className="pt-1">{footer}</div>
            ) : null}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes intake-confetti-fall {
          0% {
            transform: translate3d(0, -30px, 0) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 0.92;
          }
          100% {
            transform: translate3d(0, 540px, 0) rotate(340deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
