export type IntakeEmbedSettings = {
  contactIntroText: string;
  estimateChoiceSubtitles: {
    uploadVideo: string;
    requestLiveVideoEstimate: string;
    requestInPersonEstimate: string;
  };
  uploadInstructionsText: string;
  completion: {
    uploadVideoMessage: string;
    videoCallRequestedMessage: string;
    inPersonRequestedMessage: string;
    confetti: {
      uploadVideo: boolean;
      videoCallRequested: boolean;
      inPersonRequested: boolean;
    };
  };
};

export const DEFAULT_INTAKE_EMBED_SETTINGS: IntakeEmbedSettings = {
  contactIntroText:
    'We offer quick, video-based estimates. Upload a video of your job, hop on a live video call, or schedule an on-site appointment with a member of our team today!',
  estimateChoiceSubtitles: {
    uploadVideo: 'At Your Convenience',
    requestLiveVideoEstimate: 'Talk to us',
    requestInPersonEstimate: 'For more complex jobs',
  },
  uploadInstructionsText:
    'As you record, verbally tell us any relevant details about your job.\n...\nYou can specify any other information you want your customers to provide here.',
  completion: {
    uploadVideoMessage:
      'Thanks for contacting us! Someone will reach out shortly to handle your estimate!',
    videoCallRequestedMessage:
      "We can't wait to talk with you! We'll call you at your requested time from {phone}. Talk soon!",
    inPersonRequestedMessage:
      "Thanks for contacting us! We'll reach out shortly to schedule your in-person estimate.",
    confetti: {
      uploadVideo: true,
      videoCallRequested: true,
      inPersonRequested: true,
    },
  },
};

const asString = (value: unknown, fallback: string) =>
  typeof value === 'string' ? value : fallback;

const asBoolean = (value: unknown, fallback: boolean) =>
  typeof value === 'boolean' ? value : fallback;

export const normalizeIntakeEmbedSettings = (
  value: unknown
): IntakeEmbedSettings => {
  const raw =
    value && typeof value === 'object'
      ? (value as Record<string, unknown>)
      : {};
  const subtitles =
    raw.estimateChoiceSubtitles &&
    typeof raw.estimateChoiceSubtitles === 'object'
      ? (raw.estimateChoiceSubtitles as Record<
          string,
          unknown
        >)
      : {};
  const completion =
    raw.completion && typeof raw.completion === 'object'
      ? (raw.completion as Record<string, unknown>)
      : {};
  const confetti =
    completion.confetti &&
    typeof completion.confetti === 'object'
      ? (completion.confetti as Record<string, unknown>)
      : {};

  return {
    contactIntroText: asString(
      raw.contactIntroText,
      DEFAULT_INTAKE_EMBED_SETTINGS.contactIntroText
    ),
    estimateChoiceSubtitles: {
      uploadVideo: asString(
        subtitles.uploadVideo,
        DEFAULT_INTAKE_EMBED_SETTINGS.estimateChoiceSubtitles
          .uploadVideo
      ),
      requestLiveVideoEstimate: asString(
        subtitles.requestLiveVideoEstimate,
        DEFAULT_INTAKE_EMBED_SETTINGS.estimateChoiceSubtitles
          .requestLiveVideoEstimate
      ),
      requestInPersonEstimate: asString(
        subtitles.requestInPersonEstimate,
        DEFAULT_INTAKE_EMBED_SETTINGS.estimateChoiceSubtitles
          .requestInPersonEstimate
      ),
    },
    uploadInstructionsText: asString(
      raw.uploadInstructionsText,
      DEFAULT_INTAKE_EMBED_SETTINGS.uploadInstructionsText
    ),
    completion: {
      uploadVideoMessage: asString(
        completion.uploadVideoMessage,
        DEFAULT_INTAKE_EMBED_SETTINGS.completion
          .uploadVideoMessage
      ),
      videoCallRequestedMessage: asString(
        completion.videoCallRequestedMessage,
        DEFAULT_INTAKE_EMBED_SETTINGS.completion
          .videoCallRequestedMessage
      ),
      inPersonRequestedMessage: asString(
        completion.inPersonRequestedMessage,
        DEFAULT_INTAKE_EMBED_SETTINGS.completion
          .inPersonRequestedMessage
      ),
      confetti: {
        uploadVideo: asBoolean(
          confetti.uploadVideo,
          DEFAULT_INTAKE_EMBED_SETTINGS.completion.confetti
            .uploadVideo
        ),
        videoCallRequested: asBoolean(
          confetti.videoCallRequested,
          DEFAULT_INTAKE_EMBED_SETTINGS.completion.confetti
            .videoCallRequested
        ),
        inPersonRequested: asBoolean(
          confetti.inPersonRequested,
          DEFAULT_INTAKE_EMBED_SETTINGS.completion.confetti
            .inPersonRequested
        ),
      },
    },
  };
};
