'use client';
import { ComponentsAccordianTitle } from '@/components/accordian/title';
import { ComponentsAccordianList } from '@/components/accordian/list';
import { ComponentsAccordianImage } from '@/components/accordian/image';
import { cx } from 'class-variance-authority';
import { FC } from 'react';
import { TComponentsAccordianListProps } from '@/components/accordian/types';

type TProps = TComponentsAccordianListProps & {
  title: string;
  ImageFc?: FC;
};
export const ComponentsAccordian: FC<TProps> = ({
  title,
  ImageFc = ComponentsAccordianImage,
  ...props
}) => {
  return (
    <div className="spacing-landing py-0 h-full lg:pb-12 lg:pt-0">
      <div
        className={cx(
          'flex flex-col w-full bg-white rounded-4xl h-full pb-0',
          'lg:flex-row lg:pb-20'
        )}
      >
        <ImageFc />
        <ComponentsAccordianTitle>
          {title}
        </ComponentsAccordianTitle>
        <ComponentsAccordianList {...props} />
      </div>
    </div>
  );
};
