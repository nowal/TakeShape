import { cx } from 'class-variance-authority';
import { ButtonsQuoteSubmit } from '@/components/buttons/quote/submit';
import { InputsFile } from '@/components/inputs/file';
import { InputsText } from '@/components/inputs/text';
import { useQuote } from '@/context/quote/provider';
import { FC } from 'react';
import { useQuoteTitle } from '@/components/quote/title';
import { IconsTick20 } from '@/components/icons/tick/20';
import { IconsLoading } from '@/components/icons/loading';
import { isString } from '@/utils/validation/is/string';
import { LOADING_ICON, SUCCESS_ICON } from '@/components/quote/constants';

type TProps = { fixedTitle?: string };
export const ComponentsQuoteInput: FC<TProps> = ({
  fixedTitle,
}) => {
  const {
    uploadStatus,
    fileName,
    quoteTitle: _quoteTitle,
    dispatchTitle,
    onFileUpload,
    onSubmit,
  } = useQuote();
  const quoteTitle = fixedTitle ?? _quoteTitle;

  const isCompleted = uploadStatus === 'completed';
  const isError = uploadStatus === 'error';
  const fileTitle = 'Upload your video *';
  const isReady = Boolean(quoteTitle) && isString(fileName);

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
              isCompleted && 'text-green',
              isError && 'text-red'
            )}
          >
            <InputsFile
              title={fileTitle}
              onFile={onFileUpload}
              {...(isCompleted
                ? SUCCESS_ICON
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
          title="Submit Video"
          isDisabled={!isReady}
        />
      </form>
    </div>
  );
};
