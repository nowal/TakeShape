'use client';
import { GoogleAnalytics } from '@next/third-parties/google';
import { InputsFile } from '@/components/inputs/file';
import { IconsUpload } from '@/components/icons/upload';
import { cx } from 'class-variance-authority';
import { InputsText } from '@/components/inputs/text';
import { useAgentRegisterState } from '@/context/agent/register/state';
import { NotificationsInlineHighlight } from '@/components/notifications/inline/highlight';
import { CvaButton } from '@/components/cva/button';
import { ComponentsRegisterShell } from '@/components/register/shell';
import { IconsLoading16White } from '@/components/icons/loading/16/white';
import { IconsError16White } from '@/components/icons/error/16/white';
import { InputsFilePic } from '@/components/inputs/file/pic';

const AgentSignup = () => {
  const {
    isSubmitting,
    profilePicturePreview,
    errorMessage,
    name,
    email,
    password,
    phoneNumber,
    onSubmit,
    dispatchPassword,
    dispatchEmail,
    dispatchName,
    dipatchPhoneNumber,
    onProfilePictureChange,
  } = useAgentRegisterState();

  const isError = Boolean(errorMessage);

  const submitTitle = isSubmitting
    ? 'Signing Up...'
    : 'Sign Up';

  const isInputValue = Boolean(profilePicturePreview);

  return (
    <ComponentsRegisterShell title="Agent Registration">
      <GoogleAnalytics gaId="G-47EYLN83WE" />
      {errorMessage && (
        <NotificationsInlineHighlight>
          {errorMessage}
        </NotificationsInlineHighlight>
      )}
      <form
        onSubmit={onSubmit}
        className="flex flex-col space-y-4"
      >
        <div>
          <InputsText
            type="email"
            value={email}
            onChange={(event) =>
              dispatchEmail(event.target.value)
            }
            placeholder="Email Address"
            required
          />
        </div>
        <div>
          <InputsText
            type="password"
            value={password}
            onChange={(event) =>
              dispatchPassword(event.target.value)
            }
            placeholder="Password"
            required
          />
        </div>
        <div>
          <InputsText
            value={name}
            onChange={(event) =>
              dispatchName(event.target.value)
            }
            placeholder="Name"
            required
          />
        </div>
        <div>
          <InputsText
            type="tel"
            value={phoneNumber}
            onChange={(event) =>
              dipatchPhoneNumber(event.target.value)
            }
            placeholder="Phone Number"
            required
          />
        </div>
        <div className="relative h-[96px]">
          <InputsFile
            title="Profile Picture"
            onFile={onProfilePictureChange}
            inputProps={{
              accept: 'image/*',
            }}
            classValue={cx(
              isInputValue ? 'gap-6' : 'gap-2'
            )}
            isValue={isInputValue}
            center={!isInputValue}
            icon={{
              Leading: profilePicturePreview
                ? () => (
                    <InputsFilePic
                      src={profilePicturePreview}
                      alt="Profile Preview"
                    />
                  )
                : IconsUpload,
            }}
          />
        </div>
        <CvaButton
          title={submitTitle}
          type="submit"
          disabled={isSubmitting}
          icon={{
            Leading: isError
              ? IconsError16White
              : isSubmitting
              ? IconsLoading16White
              : null,
          }}
          intent="primary"
          size="md"
          gap="xl"
          center
        >
          {submitTitle}
        </CvaButton>
      </form>
    </ComponentsRegisterShell>
  );
};

export default AgentSignup;
