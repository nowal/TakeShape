'use client';
import Image from 'next/image';
import { GoogleAnalytics } from '@next/third-parties/google';
import { InputsFile } from '@/components/inputs/file';
import { PicOutline } from '@/components/account-settings/user/pic-outline';
import { IconsUpload } from '@/components/icons/upload';
import { cx } from 'class-variance-authority';
import { InputsText } from '@/components/inputs/text';
import { useAgentRegisterState } from '@/context/agent/register/state';
import { NotificationsInlineHighlight } from '@/components/notifications/inline/highlight';
import { ButtonsCvaButton } from '@/components/cva/button';
import { ComponentsRegisterShell } from '@/components/register/shell';

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

  const submitTitle = isSubmitting
    ? 'Signing Up...'
    : 'Sign Up';

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
        {/* <div>
          <label
            htmlFor="name"
            className="block text-md font-medium text-gray-700"
          >
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => dispatchName(e.target.value)}
            placeholder="Enter your name"
            required
            className="p-2 border rounded w-full"
          />
        </div> */}
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
        {/* <div>
          <input
            id="phoneNumber"
            value={phoneNumber}
            onChange={(event) =>
              dipatchPhoneNumber(event.target.value)
            }
            placeholder="Enter your phone number"
            required
            className="p-2 border rounded w-full"
          />
        </div> */}
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
            title="Profile Picture (optional)"
            onFile={onProfilePictureChange}
            inputProps={{
              accept: 'image/*',
            }}
            classValue={cx(
              'px-4',
              profilePicturePreview ? 'gap-6' : 'gap-2'
            )}
            isValue={Boolean(profilePicturePreview)}
            icon={{
              Leading: profilePicturePreview
                ? () => (
                    <PicOutline>
                      <Image
                        src={profilePicturePreview}
                        alt="Profile Preview"
                        className="mb-2 w-24 h-24 object-cover rounded-full"
                        width="96"
                        height="96"
                      />
                    </PicOutline>
                  )
                : IconsUpload,
            }}
          />
        </div>
        <ButtonsCvaButton
          title={submitTitle}
          type="submit"
          disabled={isSubmitting}
          intent="primary"
          size="md"
          center
        >
          {submitTitle}
        </ButtonsCvaButton>
      </form>
    </ComponentsRegisterShell>
  );
};

export default AgentSignup;
