'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { InputsText } from '@/components/inputs/text';
import { InputsFile } from '@/components/inputs/file';
import { ButtonsQuoteSubmit } from '@/components/buttons/quote/submit';
import { initializeEmbed, sendCompletionEvent } from '@/app/embed/utils';
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

const THANK_YOU_MESSAGE =
  'Thanks for contacting us! Someone will reach out shortly to handle your estimate!';

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
  const jobDescription = '';
  const [videoSubmitPending, setVideoSubmitPending] =
    useState(false);

  useEffect(() => {
    initializeEmbed();
  }, []);

  useEffect(() => {
    if (
      step !== 'thanks' &&
      step !== 'inPersonRequested' &&
      step !== 'videoCallRequested'
    ) {
      return;
    }

    sendCompletionEvent({
      flow: 'contact-video-intake',
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
    estimateChoice,
    contact,
    liveVideoCallPreference,
    videoCallSchedule,
    videoFile,
    jobDescription,
  ]);

  const canSubmitVideo = useMemo(() => {
    return Boolean(videoFile);
  }, [videoFile]);
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
    if (!validateContact()) return;

    setStep('estimateChoice');
  };

  const onEstimateChoice = (choice: EstimateChoice) => {
    setEstimateChoice(choice);

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
    setVideoFile(file);
    setVideoFileName(file.name);
  };

  const onVideoSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!canSubmitVideo) return;

    try {
      setVideoSubmitPending(true);
      setStep('thanks');
    } finally {
      setVideoSubmitPending(false);
    }
  };

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
                <p className="text-[17px] leading-8 text-black-6 font-open-sans max-w-[34rem]">
                  We offer quick, video-based estimates.
                  Upload a video of your job, hop on a live video call,
                  or schedule an on-site appointment
                  with a member of our team today!
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
                      required
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
                      required
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
                      required
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
                      required
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
                subtitle="At Your Convenience"
                icon={uploadIcon}
                onClick={() => onEstimateChoice('uploadVideo')}
              />
              <EstimateChoiceCard
                title="Schedule Live Video Call"
                subtitle="Talk to us"
                icon={callIcon}
                onClick={() =>
                  onEstimateChoice('requestLiveVideoEstimate')
                }
              />
              <EstimateChoiceCard
                title="Request In-Person Estimate"
                subtitle="For more complex jobs"
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
                      isRequired
                    >
                      {videoFileName ? (
                        <div className="absolute right-0 bottom-0 w-full truncate font-open-sans text-xs p-2 text-gray text-left">
                          <span>{videoFileName}</span>
                        </div>
                      ) : null}
                    </InputsFile>
                  </div>

                  <div className="min-h-[170px] w-full rounded-xl border border-black-08 bg-white p-6 sm:p-7 flex items-center">
                    <p className="w-full text-center text-base font-open-sans text-black-6 leading-7">
                      As you record, verbally tell us any relevant
                      details about your job.
                      <br />
                      ...
                      <br />
                      You can specify any other information you want
                      your customers to provide here.
                    </p>
                  </div>
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
          <div className="fill-column-white-sm sm:fill-column-white">
            <div className="mx-auto flex min-h-[320px] max-w-2xl flex-col items-center justify-center gap-6 text-center px-4">
              <h2 className="typography-page-title">
                Thanks for contacting us! We&apos;ll reach out shortly
                to schedule your in-person estimate.
              </h2>
              <ButtonsQuoteSubmit
                type="button"
                title="Go Back"
                size="md"
                classValue="font-bold min-h-[56px] px-12"
                onTap={onPreviousToEstimateChoice}
              />
            </div>
          </div>
        )}

        {step === 'thanks' && (
          <div className="fill-column-white-sm sm:fill-column-white">
            <div className="mx-auto flex min-h-[320px] max-w-2xl flex-col items-center justify-center gap-4 text-center px-4">
              <h2 className="typography-page-title">
                {THANK_YOU_MESSAGE}
              </h2>
            </div>
          </div>
        )}

        {step === 'videoCallRequested' && (
          <div className="fill-column-white-sm sm:fill-column-white">
            <div className="mx-auto flex min-h-[320px] max-w-2xl flex-col items-center justify-center gap-4 text-center px-4">
              <h2 className="typography-page-title">
                We can&apos;t wait to talk with you! We&apos;ll call
                you at your requested time from{' '}
                {formatPhoneNumber(contact.phone)}. Talk soon!
              </h2>
            </div>
          </div>
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
      <p className="mt-1 text-center text-base font-open-sans text-black-6 min-h-[24px]">
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
