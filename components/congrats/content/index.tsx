import { ButtonsCvaAnchor } from '@/components/cva/anchor';
import { TPropsWithChildren } from '@/types/dom/main';
import type { FC } from 'react';

type TProps = TPropsWithChildren;
export const ComponentsCongratsContent: FC<TProps> = ({
  children,
}) => {
  return (
    <div className="relative flex flex-col gap-5">
      <div className="text-8xl">🎉</div>
      <div className="flex flex-col gap-2">
        <h2 className="text-base font-bold text-black px-2">
          Congratulations on accepting with:
        </h2>
        {children}
        <p className="text-gray-7 text-sm">
          Contractor will reach out within two days to
          schedule your job. If you have any questions,
          please contact us or you call your contractor
          directly.
        </p>
      </div>
      <ButtonsCvaAnchor
        title="Contact Support, Call (615) 809-6429"
        href="tel:+16158096429"
        center
      >
        <span className="text-xs text-gray-7 font-semibold">
          Contact Support
        </span>
      </ButtonsCvaAnchor>
    </div>
  );
};
