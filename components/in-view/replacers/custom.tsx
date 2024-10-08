import { InView, TInViewProps } from '@/components/in-view';
import { TChildren } from '@/types/dom';
import { type FC } from 'react';
import * as RDD from 'react-device-detect';

type TProps = {
  Space: FC;
  children: TChildren;
} & Omit<TInViewProps, 'children'>;
export const InViewReplacersCustom: FC<TProps> = ({
  Space,
  options,
  children,
  ...props
}) => {
  if (RDD.isMobile) {
    return <>{children}</>;
  }
  return (
    <InView
      options={{
        rootMargin: '-20px',
        triggerOnce: true,
        ...options,
      }}
      {...props}
    >
      {({ inView }) => {
        if (inView) {
          return <>{children}</>;
        }
        return <Space />;
      }}
    </InView>
  );
};
