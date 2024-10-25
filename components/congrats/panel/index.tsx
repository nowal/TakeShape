'use client';
import type { FC } from 'react';
import { ComponentsPanel } from '@/components/panel';
import { TPropsWithChildren } from '@/types/dom/main';
import { ComponentsCongratsContent } from '@/components/congrats/content';
import { CvaAnchor } from '@/components/cva/anchor';

type TProps = TPropsWithChildren<{ short?: string }>;
export const ComponentsCongratsPanel: FC<TProps> = ({
  short,
  children,
}) => {
  const long =
    short ??
    'Your painter will reach out as soon as possible to schedule your job. If you have any questions, please contact us or you call your contractor directly.';
  return (
    <ComponentsPanel classValue="text-center" classWidth='w-full xs:w-[385px] lg:w-[345px]'>
      <ComponentsCongratsContent
        emoji="🎉"
        title="Congratulations on accepting with:"
        long={long}
        footer={
          <CvaAnchor
            title="Contact Support, Call (615) 809-6429"
            href="tel:+16158096429"
            center
          >
            <span className="text-xs text-gray-7 font-semibold">
              Contact Support
            </span>
          </CvaAnchor>
        }
      >
        {children}
      </ComponentsCongratsContent>
    </ComponentsPanel>
  );
};
