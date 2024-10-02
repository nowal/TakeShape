import type { FC } from 'react';
import { TPainterInfo } from '@/components/painter-card';
import Image from 'next/image';
import { IconsPhone } from '@/components/icons/phone';
import { ButtonsCvaAnchor } from '@/components/cva/anchor';
import { cx } from 'class-variance-authority';
import { TDivProps } from '@/types/dom';

type TProps = { info: TPainterInfo }  & TDivProps;
export const PainterCardInfo: FC<TProps> = ({ info, classValue, ...props }) => {
  const { phoneNumber, logoUrl, businessName } = info;

  return (
    <div
      className={cx(
        'flex flex-row gap-3',
        classValue,
      )}
      {...props}
    >
      {logoUrl && (
        <Image
          src={logoUrl}
          alt={`${businessName} Logo`}
          className="size-12 rounded-full"
          width="48"
          height="48"
        />
      )}
      <div className="flex flex-col gap-1.5">
        <h5 className="text-base font-semibold text-black">
          {businessName}
        </h5>
        <ButtonsCvaAnchor
          href={`tel:${phoneNumber}`}
          classValue="flex flex-row items-center gap-1 h-[16px]"
          title={`Call ${phoneNumber}`}
          icon={{ Leading: IconsPhone }}
        >
          <h6 className="text-gray-9 text-xs font-medium">
            {phoneNumber}
          </h6>
        </ButtonsCvaAnchor>
      </div>
    </div>
  );
};
