import { cx } from 'class-variance-authority';
import { InputsFile } from '@/components/inputs/file';
import { InputsText } from '@/components/inputs/text';
import { useQuote } from '@/context/quote/provider';
import { FC } from 'react';
import { isString } from '@/utils/validation/is/string';
import {
  LOADING_ICON,
  SUCCESS_ICON,
} from '@/components/quote/constants';
import { useQuoteFakeHandler } from '@/components/quote/fake/handler';
import { useQuoteTitleFake } from '@/components/quote/fake/title';
import { IconsLoading16White } from '@/components/icons/loading/16/white';
import { ButtonsQuoteSubmit } from '@/components/buttons/quote/submit';

type TProps = { fixedTitle?: string };
export const ComponentsQuoteInput: FC<TProps> = ({
  fixedTitle,
}) => {
  const {
    isQuoteSubmitting,
    uploadStatus,
    fileName,
    quoteTitle: _quoteTitle,
    dispatchTitle,
    onFileUpload,
    onSubmit,
  } = useQuote();
  const quoteTitle = fixedTitle ?? _quoteTitle;

  const { onInit, isInit, isCompleted } =
    useQuoteFakeHandler();
  const title = useQuoteTitleFake({ isCompleted, isInit });

  const isError = uploadStatus === 'error';
  const isReady = Boolean(quoteTitle) && isString(fileName);

  const handleUpload = (file: File) => {
    onInit();
    onFileUpload(file);
  };

  const submitTitle = isQuoteSubmitting
    ? 'Submitting Video'
    : 'Submit Video';

  return (
    <div className="flex flex-col items-center gap-[26px]">
      <form
        className={cx(
          'fill-column-white',
          'gap-2.5',
          'xs:w-[23.875rem]'
        )}
        onSubmit={onSubmit}
      >
        <div className="relative w-full">
          <div
            className={cx(
              'relative h-[7.25rem]',
              isError
                ? 'text-red'
                : isCompleted
                ? 'text-green'
                : 'text-pink'
            )}
          >
            <InputsFile
              title={title}
              onFile={handleUpload}
              {...(isCompleted
                ? SUCCESS_ICON
                : isInit
                ? LOADING_ICON
                : {})}
              inputProps={{}}
            >
              {fileName && (
                <div className="absolute right-0 bottom-0 w-full truncate font-open-sans text-xs p-2 text-gray text-left">
                  <span>{fileName}</span>
                </div>
              )}
            </InputsFile>
          </div>
        </div>
        <InputsText
          value={quoteTitle}
          onChange={(event) =>
            dispatchTitle(event.target.value)
          }
          placeholder="Enter Title (e.g. Bedroom Walls) *"
        />
        <ButtonsQuoteSubmit
          title={submitTitle}
          icon={{
            Leading: isQuoteSubmitting
              ? IconsLoading16White
              : null,
          }}
          isDisabled={!isReady || isQuoteSubmitting}
        />
      </form>
    </div>
  );
};
