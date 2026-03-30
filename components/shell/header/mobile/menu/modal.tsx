import type { FC } from 'react';
import { TDivMotionProps } from '@/types/dom';
import { ComponentsModalBackground } from '@/components/modal/background';
import { ComponentsModalPosition } from '@/components/modal/position';
import { ComponentsPortalBody } from '@/components/portal/body';

type TProps = TDivMotionProps;
export const MobileMenuModal: FC<TProps> = ({
  children,
  ...props
}) => {
  return (
    <ComponentsPortalBody>
      <ComponentsModalPosition>
        <>
          <ComponentsModalBackground
            classBackgroundColor="bg-[hsl(var(--app-bg-hsl)/98%)]"
            {...props}
          />
          {children}
        </>
      </ComponentsModalPosition>
    </ComponentsPortalBody>
  );
};
