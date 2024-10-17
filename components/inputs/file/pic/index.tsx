import { FC } from 'react';
import Image, { ImageProps } from 'next/image';
import { InputsFilePicOutline } from '@/components/inputs/file/pic/outline';

type TProps = ImageProps;
export const InputsFilePic: FC<TProps> = ({
  alt,
  ...props
}) => (
  <InputsFilePicOutline>
    <Image
      className="size-16 rounded-full"
      width="64"
      height="64"
      style={{ objectFit: 'cover' }}
      alt={alt}
      {...props}
    />
  </InputsFilePicOutline>
);
