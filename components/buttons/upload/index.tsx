import { ChangeEvent, FC, useState } from 'react';
import {
  ButtonsCvaInput,
  TButtonsCvaInputProps,
} from '@/components/cva/input';
import { MarchingAnts } from '@/components/inputs/marching-ants';
import { IconsUpload } from '@/components/icons/upload';

export type TButtonsUploadProps =
  Partial<TButtonsCvaInputProps> & {
    title: string;
    onFile(file: File): void;
  };

export const ButtonsUpload: FC<TButtonsUploadProps> = ({
  onFile,
  inputProps,
  title,
  ...props
}) => {
  const [isFocus, setFocus] = useState(false);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const file = event.target.files?.[0];
      if (file) {
        onFile(file); // Pass the file to the parent component
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <ButtonsCvaInput
        title={title}
        inputProps={{
          type: 'file',
          accept: 'video/*',
          onChange: handleChange,
          onMouseEnter: () => {
            setFocus(true);
          },
          onMouseLeave: () => {
            setFocus(false);
          },
          onPointerEnter: () => {
            setFocus(true);
          },
          onPointerLeave: () => {
            setFocus(false);
          },
          onDragEnter: () => {
            setFocus(true);
          },
          onDragOver: () => {
            setFocus(true);
          },
          onDragLeave: () => {
            setFocus(false);
          },
          onDragEnd: () => {
            setFocus(false);
          },
          onDragExit: () => {
            setFocus(false);
          },
          onDrop: () => {
            setFocus(false);
          },
          ...inputProps,
        }}
        style={{ display: 'none' }}
        intent="ghost-1"
        size="fill"
        rounded="lg"
        icon={{ Leading: IconsUpload }}
        center
        {...props}
      >
        <span className="typography-page-subtitle">
          {title}
        </span>
      </ButtonsCvaInput>
      <MarchingAnts isFocus={isFocus} borderRadius="8px" />
    </>
  );
};
