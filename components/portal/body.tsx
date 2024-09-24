import { TChildren } from '@/types/dom';
import type { FC } from 'react';
import { createPortal } from 'react-dom';

type TProps = {
  children: TChildren;
};
export const ComponentsPortalBody: FC<TProps> = ({
  children,
}) => {
  return (
    <>
      {createPortal(
        <>{children}</>,
        document.body,
      )}
    </>
  );
};
