import { cx } from 'class-variance-authority';
import type { FC } from 'react';
import Image from 'next/image';
import { BENEFITS_ITEM_HEIGHT } from '@/components/landing/benefits/item/constants';

type TProps = {
  title: string;
  description: string;
  index: number;
};
export const LandingBenefitsItem: FC<TProps> = ({
  title,
  description,
  index,
}) => {
  return (
    <>
      <div
        className={cx('relative')}
        style={{
          width: '100%',
          paddingBottom: '64%',
        }}
      >
        <Image
          alt={title}
          src={`/landing/benefits/${index}.png`}
          layout="fill"
          sizes="(max-width: 768px) 100vw, 33vw"	
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className="h-7" />
      <h4 className='text-2xl font-bold text-black tight-02'>{title}</h4>
      <div className="h-3" />
      <p className='text-base font-medium text-gray-7'>{description}</p>
    </>
  );
};
