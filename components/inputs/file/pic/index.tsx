import { FC } from 'react';
import Image, { ImageProps } from 'next/image';
import { InputsFilePicOutline } from '@/components/inputs/file/pic/outline';

type TProps = ImageProps & { src: string }; // Add src to TProps

export const InputsFilePic: FC<TProps> = ({
  alt,
  src, // Add src prop
  ...props
}) => (
  <InputsFilePicOutline>
    <img  // Use the standard img tag
      className="size-16 rounded-full"
      width="64"
      height="64"
      style={{ objectFit: 'cover' }}
      alt={alt}
      src={src} // Pass the src prop
    />
  </InputsFilePicOutline>
);
