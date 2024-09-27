// ButtonsUpload.tsx
import React, { ChangeEvent, FC, useState } from 'react';
import { ButtonsCvaInput } from '@/components/cva/input';
import { MarchingAnts } from '@/components/inputs/marching-ants';
import { IconsUpload } from '@/components/icons/upload';

export type TButtonsUploadProps = {
  onUploadSuccess: (file: File) => void;
};

export const ButtonsUpload: FC<TButtonsUploadProps> = ({
  onUploadSuccess,
}) => {
  const [isFocus, setFocus] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileSelection = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (file) {
        onUploadSuccess(file); // Pass the file to the parent component
      }
      setUploading(false);
    } catch (error) {
      console.error(error);
    }
  };
  const title = uploading
    ? 'Uploading...'
    : 'Upload your video';

  return (
    <>
      <ButtonsCvaInput
        title={title}
        inputProps={{
          type: 'file',
          accept: 'video/*',
          onChange: handleFileSelection,
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
        }}
        style={{ display: 'none' }}
        isDisabled={uploading}
        intent="ghost-1"
        size="fill"
        rounded="lg"
        icon={{ Leading: IconsUpload }}
        layout={false}
        center={true}
      >
        <span className="typography-page-subtitle">
          {title}
        </span>
      </ButtonsCvaInput>
      <MarchingAnts isFocus={isFocus} borderRadius="8px" />
    </>
  );
};
