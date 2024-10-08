import { cx } from 'class-variance-authority';
import { ButtonsQuoteSubmit } from '@/components/buttons/quote/submit';
import { InputsFile } from '@/components/inputs/file';
import { InputsText } from '@/components/inputs/text';
import { useQuote } from '@/context/quote/provider';
import { FC } from 'react';

type TProps = {fixedTitle?:string}
export const ComponentsQuoteInput: FC<TProps> = ({fixedTitle}) => {
  const {
    isUploading,
    title,
    dispatchTitle,
    onFileUpload,
  } = useQuote();
  return (
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
          value={fixedTitle ?? title}
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
  );
};
