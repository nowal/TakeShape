import type { FC } from 'react';
import Image from 'next/image';
import { IconsPhone } from '@/components/icons/phone';
import { CvaAnchor } from '@/components/cva/anchor';
import { cx } from 'class-variance-authority';
import { TClassValueProps } from '@/types/dom';
import { TPainterData } from '@/components/painter/card/types';

type TProps = TPainterData & TClassValueProps;
export const PainterCard: FC<TProps> = ({
  classValue,
  ...info
}) => {
  const { phoneNumber, logoUrl, businessName } = info;

  return (
    <div className={cx('flex flex-row gap-3', classValue)}>
      {logoUrl && (
        <Image
          src={logoUrl}
          alt={`${businessName} Logo`}
          className="size-12 rounded-full"
          width="48"
          height="48"
          style={{objectFit: 'cover'}}
          unoptimized
        />
      )}
      <div className="flex flex-col gap-1.5">
        <h5 className="text-base font-semibold text-black">
          {businessName}
        </h5>
        <CvaAnchor
          href={`tel:${phoneNumber}`}
          classValue="flex flex-row items-center gap-1 h-[16px]"
          title={`Call ${phoneNumber}`}
          icon={{ Leading: IconsPhone }}
        >
          <h6 className="text-gray-9 text-xs font-medium">
            {phoneNumber}
          </h6>
        </CvaAnchor>
      </div>
    </div>
  );
};
