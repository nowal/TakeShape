import { cx } from 'class-variance-authority';
import { ButtonsQuoteSubmit } from '@/components/buttons/quote/submit';
import { InputsFile } from '@/components/inputs/file';
import { InputsText } from '@/components/inputs/text';
import { useQuote } from '@/context/quote/provider';
import { FC } from 'react';

type TProps = { fixedTitle?: string };
export const ComponentsQuoteInput: FC<TProps> = ({
  fixedTitle,
}) => {
  const {
    isUploading,
    fileName,
    title: _title,
    dispatchTitle,
    onFileUpload,
    onSubmit,
  } = useQuote();
  const title = fixedTitle ?? _title;
  const isValue = Boolean(title);

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
          <div className="relative h-[7.25rem]">
            <InputsFile
              title={
                isUploading
                  ? 'Uploading...'
                  : 'Upload your video'
              }
              onFile={onFileUpload}
              inputProps={{}}
            >
              <div className="absolute right-0 bottom-0 w-full truncate font-open-sans text-xs p-2 text-gray">
                {fileName}
              </div>
            </InputsFile>
          </div>
        </div>
        <InputsText
          value={title}
          onChange={(event) =>
            dispatchTitle(event.target.value)
          }
          placeholder="Enter Title (e.g. Bedroom Walls) *"
        />
        <ButtonsQuoteSubmit
          title="Submit Video"
          isDisabled={!isValue}
        />
      </form>
    </div>
  );
};
