'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { InputsText } from '@/components/inputs/text';
import { InputsFile } from '@/components/inputs/file';
import { ButtonsQuoteSubmit } from '@/components/buttons/quote/submit';
import { initializeEmbed, sendCompletionEvent } from '@/app/embed/utils';

type Step =
  | 'contact'
  | 'estimateChoice'
  | 'videoUpload'
  | 'thanks';

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

export default function EmbedIntakePage() {
  const [step, setStep] = useState<Step>('contact');
  const [contact, setContact] = useState<ContactForm>(INITIAL_CONTACT);
  const [errors, setErrors] = useState<ContactErrors>(INITIAL_ERRORS);
  const [estimateChoice, setEstimateChoice] =
    useState<EstimateChoice>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoFileName, setVideoFileName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [videoSubmitPending, setVideoSubmitPending] =
    useState(false);

  useEffect(() => {
    initializeEmbed();
  }, []);

  useEffect(() => {
    if (step !== 'thanks') return;

    sendCompletionEvent({
      flow: 'contact-video-intake',
      estimateChoice,
      contact,
      hasVideoUpload: Boolean(videoFile),
      jobDescription,
      completedAt: new Date().toISOString(),
    });
  }, [step, estimateChoice, contact, videoFile, jobDescription]);

  const canSubmitVideo = useMemo(() => {
    return Boolean(videoFile && jobDescription.trim());
  }, [videoFile, jobDescription]);

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

    setStep('thanks');
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
          <div className="fill-column-white-sm sm:fill-column-white">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
              <section className="flex flex-col gap-5">
                <h1 className="text-3xl font-montserrat font-bold text-black leading-tight">
                  Send us a video!
                </h1>
                <p className="text-[17px] leading-8 text-black-6 font-open-sans max-w-[34rem]">
                  Answer a few questions, take a video of your
                  project, and leave the rest to us. Once we
                  receive your video, our team will provide a
                  personalized quote. If you cannot take a video,
                  no worries. Fill out the form and we will be in
                  touch shortly.
                </p>
                <div className="relative w-full overflow-hidden rounded-2xl border border-black-08 bg-white-pink-1 h-[240px] sm:h-[300px]">
                  <Image
                    src="/takingVideo.jpg"
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
          <div className="fill-column-white-sm sm:fill-column-white">
            <div className="mb-6 text-center">
              <h2 className="typography-page-title">
                Choose Your Estimate Type
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <EstimateChoiceCard
                title="Upload Job Video"
                onClick={() => onEstimateChoice('uploadVideo')}
              />
              <EstimateChoiceCard
                title="Request Live Video Estimate"
                onClick={() =>
                  onEstimateChoice('requestLiveVideoEstimate')
                }
              />
              <EstimateChoiceCard
                title="Request In-Person Estimate"
                onClick={() =>
                  onEstimateChoice('requestInPersonEstimate')
                }
              />
            </div>
          </div>
        )}

        {step === 'videoUpload' && (
          <div className="fill-column-white-sm sm:fill-column-white">
            <div className="mx-auto w-full max-w-xl">
              <div className="mb-5 text-center">
                <h2 className="typography-page-title">
                  Please give us any additional details about your
                  job
                </h2>
              </div>

              <form
                className="flex flex-col items-center gap-4"
                onSubmit={onVideoSubmit}
              >
                <div className="w-full">
                  <div className="relative h-[7.25rem] text-pink">
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
                </div>

                <label className="w-full">
                  <textarea
                    value={jobDescription}
                    onChange={(event) =>
                      setJobDescription(event.target.value)
                    }
                    placeholder="Describe your job in detail (scope, timeline, goals) *"
                    className="border border-gray-4 w-full bg-white-1 typography-text-input rounded-lg px-6 py-4 min-h-[180px]"
                    required
                  />
                </label>

                <div className="w-full">
                  <ButtonsQuoteSubmit
                    title={
                      videoSubmitPending
                        ? 'Submitting Video'
                        : 'Submit Video'
                    }
                    isDisabled={
                      !canSubmitVideo || videoSubmitPending
                    }
                  />
                </div>
              </form>
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
      </div>
    </div>
  );
}

type EstimateChoiceCardProps = {
  title: string;
  onClick: () => void;
};

function EstimateChoiceCard({
  title,
  onClick,
}: EstimateChoiceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-xl border border-black-08 bg-white p-4 transition hover:border-pink hover:shadow-08"
    >
      <h3 className="text-base font-semibold text-black min-h-[48px]">
        {title}
      </h3>
      <div className="mt-4 h-[160px] rounded-lg border border-dashed border-gray-4 bg-white-pink-1 flex items-center justify-center text-sm font-open-sans text-gray">
        Icon Placeholder
      </div>
    </button>
  );
}
