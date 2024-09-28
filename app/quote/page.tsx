'use client';
import { GoogleAnalytics } from '@next/third-parties/google';
import { cx } from 'class-variance-authority';
import { ButtonsQuoteSubmit } from '@/components/buttons/quote/submit';
import { InputsFile } from '@/components/inputs/file';
import { InputsText } from '@/components/inputs/text';
import { QuoteInstructions } from '@/components/quote/instructions';
import { useQuote } from '@/context/quote/provider';
import { NotificationsHighlight } from '@/components/notifications/highlight';

const QuotePage = () => {
  const {
    isLoading,
    isUploading,
    title,
    dispatchTitle,
    currentStep,
    onFileUpload,
  } = useQuote();

  return (
    <div className="p-8 pt-20">
      <GoogleAnalytics gaId="G-47EYLN83WE" />

      {isLoading && currentStep === 2 && (
        <NotificationsHighlight>
          Uploading, please wait...
        </NotificationsHighlight>
        // <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-10 z-50">
        //   <div className="bg-white p-6 rounded w-21">
        //     <p className="text-center">
        //       Uploading, please wait...
        //     </p>
        //   </div>
        // </div>
      )}

      {currentStep === 1 && (
        <div className="flex flex-col items-center gap-6 lg:gap-4 xl:gap-0">
          <div className="flex flex-col items-center gap-1">
            <h2 className="typography-page-title">
              Get an Instant Painting Quote Today
            </h2>
            <h3 className="typography-page-subtitle">
              Upload a Video, Receive a Quote Within Minutes
            </h3>
          </div>
          <div className="flex flex-col items-center justify-center gap-[31px] mx-auto lg:flex-row">
            <div
              className={cx(
                'hidden xl:flex',
                'w-0 h-0 ',
                'xs:w-[21rem]'
              )}
            />
            <div className="flex flex-col items-center gap-[26px]">
              <div
                className={cx(
                  'fill-column-white',
                  'gap-2.5',
                  'xs:w-[23.875rem]'
                )}
              >
                <div className="relative w-full">
                  <div className="h-[7.25rem]">
                    <InputsFile
                      title={
                        isUploading
                          ? 'Uploading...'
                          : 'Upload your video'
                      }
                      onFile={onFileUpload}
                      inputProps={{}}
                    />
                  </div>
                </div>
                <InputsText
                  value={title}
                  onChange={(event) =>
                    dispatchTitle(event.target.value)
                  }
                  placeholder="Enter Title (e.g. Bedroom Walls)"
                />
                <ButtonsQuoteSubmit
                  title="Submit Video"
                  isDisabled
                />
              </div>
            </div>
            <div
              className={cx(
                'relative',
                'xs:w-[21rem]',
                'w-full',
                'bg-white-pink-1',
                'rounded-md'
              )}
            >
              <div className="hidden absolute w-full left-0 top-0 lg:block">
                <svg
                  width="327"
                  height="335"
                  viewBox="0 0 327 335"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.6129 16C8.6129 7.16344 15.7763 0 24.6129 0H311C319.837 0 327 7.16344 327 16V319C327 327.837 319.837 335 311 335H24.6129C15.7764 335 8.6129 327.837 8.6129 319V188.304C8.6129 185.153 7.68288 182.073 5.93945 179.449L3.59205 175.916C0.176114 170.775 0.0221229 164.128 3.19633 158.834L6.33516 153.599C7.82563 151.113 8.6129 148.269 8.6129 145.371V16Z"
                    fill="#FFF6F7"
                  />
                </svg>
              </div>
              <QuoteInstructions />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotePage;
